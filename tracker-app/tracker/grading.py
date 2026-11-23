"""Scoring and mastery calculations."""
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


def assessment_items(db, assessment_id):
    return db.execute(
        "SELECT ai.*, i.fmt, i.pe, i.sep, i.esrt, i.description "
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


def _rollup(db, key_sql, period=None):
    sql = f"SELECT r.student_id AS sid, {key_sql} AS k, SUM(r.points) AS earned, SUM(ai.points) AS possible {_GRADED}"
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
    """{student_id: {PE: fraction}}"""
    return _rollup(db, "i.pe", period)


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
