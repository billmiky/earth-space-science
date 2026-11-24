"""Scoring and mastery calculations."""
import re
from collections import defaultdict

LETTERS = "ABCDE"


def normalize_choice(raw):
    """Turn a bubbled/typed MC answer into '1'..'5'.

    'B', 'b', '2', '2.0' -> '2'; '' -> '' (left blank); anything else is kept
    upper-cased (e.g. 'AB' for a double bubble), which never matches a key.
    """
    s = str(raw if raw is not None else "").strip().upper()
    if s == "":
        return ""
    if len(s) == 1 and s in LETTERS:
        return str(LETTERS.index(s) + 1)
    try:
        f = float(s)
        if f.is_integer() and 1 <= f <= 5:
            return str(int(f))
    except ValueError:
        pass
    return s


def score(fmt, answer, key, points):
    """Return points earned, or None if it can't be graded yet."""
    if fmt == "MC":
        if not key:
            return None
        return float(points) if answer != "" and answer == key else 0.0
    # CR: the answer *is* the credit you gave
    if answer == "":
        return None
    try:
        v = float(answer)
    except ValueError:
        return None
    return max(0.0, min(float(points), v))


def cr_from_bubble(raw, points):
    """Credit for a written answer you scored by bubbling on the ZipGrade sheet.

    A = full credit, B = one point less, C = two less, ... (never below 0).
    For a 1-point question: A = 1, B = 0. Blank / unreadable = None (not scored).
    """
    c = normalize_choice(raw)
    if c not in ("1", "2", "3", "4", "5"):
        return None
    return max(0.0, float(points) - (int(c) - 1))


def save_response(db, ai, student_id, raw, source):
    """Insert/update one response. `ai` is an assessment_items row joined with items.fmt."""
    raw = "" if raw is None else str(raw).strip()
    answer = normalize_choice(raw) if ai["fmt"] == "MC" else raw
    pts = score(ai["fmt"], answer, ai["answer_key"], ai["points"])
    db.execute(
        "INSERT INTO responses (assessment_item_id, student_id, answer, points, source, updated) "
        "VALUES (?, ?, ?, ?, ?, datetime('now')) "
        "ON CONFLICT(assessment_item_id, student_id) DO UPDATE SET "
        "answer = excluded.answer, points = excluded.points, source = excluded.source, updated = excluded.updated",
        (ai["id"], student_id, answer, pts, source),
    )


def regrade_item(db, ai):
    for r in db.execute(
        "SELECT student_id, answer FROM responses WHERE assessment_item_id = ?", (ai["id"],)
    ).fetchall():
        db.execute(
            "UPDATE responses SET points = ? WHERE assessment_item_id = ? AND student_id = ?",
            (score(ai["fmt"], r["answer"], ai["answer_key"], ai["points"]), ai["id"], r["student_id"]),
        )


# All of a question's standards as "HS-ESS2-7, HS-ESS2-2" (primary first). Needs items aliased as i.
PES_SQL = ("(SELECT GROUP_CONCAT(pe, ', ') FROM (SELECT st.pe FROM item_standards st "
           "WHERE st.item_id = i.id ORDER BY st.pe = i.pe DESC, st.pe))")


def parse_standards(text, valid):
    """'HS-ESS2-7, ess2-2 HS-ESS2-7' -> (['HS-ESS2-7', 'HS-ESS2-2'], []) ; unknown codes go in the 2nd list."""
    codes, bad = [], []
    for tok in re.split(r"[\s,;/]+", text or ""):
        if not tok:
            continue
        t = tok.upper()
        if not t.startswith("HS-"):
            t = "HS-" + t
        if t not in valid:
            bad.append(tok)
        elif t not in codes:
            codes.append(t)
    return codes, bad


def set_item_standards(db, item_id, codes):
    """Replace a question's standards. The first code becomes its primary standard."""
    db.execute("DELETE FROM item_standards WHERE item_id = ?", (item_id,))
    db.executemany("INSERT INTO item_standards (item_id, pe) VALUES (?, ?)", [(item_id, c) for c in codes])
    db.execute("UPDATE items SET pe = ? WHERE id = ?", (codes[0], item_id))


def assessment_items(db, assessment_id):
    return db.execute(
        "SELECT ai.*, i.fmt, i.pe, i.sep, i.esrt, i.description, " + PES_SQL + " AS pes "
        "FROM assessment_items ai JOIN items i ON i.id = ai.item_id "
        "WHERE ai.assessment_id = ? ORDER BY ai.position",
        (assessment_id,),
    ).fetchall()


# ---------- mastery ----------

_GRADED = (
    "FROM responses r "
    "JOIN assessment_items ai ON ai.id = r.assessment_item_id "
    "JOIN items i ON i.id = ai.item_id "
    "JOIN students s ON s.id = r.student_id "
    "WHERE r.points IS NOT NULL AND s.active = 1"
)


def _rollup(db, key_sql, period=None, join=""):
    graded = _GRADED.replace("WHERE", join + " WHERE", 1) if join else _GRADED
    sql = f"SELECT r.student_id AS sid, {key_sql} AS k, SUM(r.points) AS earned, SUM(ai.points) AS possible {graded}"
    args = []
    if period:
        sql += " AND s.period = ?"
        args.append(period)
    sql += " GROUP BY sid, k"
    out = defaultdict(dict)
    for row in db.execute(sql, args):
        if row["k"] and row["possible"]:
            out[row["sid"]][row["k"]] = row["earned"] / row["possible"]
    return out


def standards_mastery(db, period=None):
    """{student_id: {PE: fraction}}. A question tagged with several standards counts fully toward each."""
    return _rollup(db, "st.pe", period, join="JOIN item_standards st ON st.item_id = i.id")


def skills_mastery(db, period=None):
    """{student_id: {SEPx|ESRT|CR: fraction}}"""
    out = _rollup(db, "i.sep", period)
    for extra_key, cond in (("ESRT", "i.esrt = 'Y'"), ("CR", "i.fmt = 'CR'")):
        for sid, d in _rollup(db, f"CASE WHEN {cond} THEN '{extra_key}' END", period).items():
            out[sid].update(d)
    return out


def summarize(grid, keys):
    """Class average, # below 50%, # assessed for each key."""
    summary = {}
    for k in keys:
        vals = [d[k] for d in grid.values() if k in d]
        summary[k] = {
            "avg": sum(vals) / len(vals) if vals else None,
            "below": sum(v < 0.5 for v in vals),
            "n": len(vals),
        }
    return summary


def band(v):
    if v is None:
        return "none"
    return "low" if v < 0.5 else ("mid" if v < 0.75 else "high")
