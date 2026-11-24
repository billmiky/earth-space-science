import csv
import io
import json
import re
import secrets
import time
from functools import wraps
from pathlib import Path

from flask import (Blueprint, Response, abort, current_app, flash, g, redirect,
                   render_template, request, send_file, session, url_for)
from werkzeug.security import check_password_hash, generate_password_hash

from . import grading, zipgrade
from .db import get_db, get_setting, set_setting

bp = Blueprint("main", __name__)


# ---------------------------------------------------------------- auth

@bp.before_app_request
def require_login():
    open_endpoints = {"main.login", "main.setup", "static"}
    if request.endpoint in open_endpoints:
        return None
    if not get_setting("password_hash"):
        return redirect(url_for("main.setup"))
    if not session.get("auth"):
        return redirect(url_for("main.login", next=request.path))
    return None


@bp.route("/setup", methods=["GET", "POST"])
def setup():
    if get_setting("password_hash"):
        return redirect(url_for("main.login"))
    if request.method == "POST":
        pw, pw2 = request.form.get("password", ""), request.form.get("password2", "")
        if len(pw) < 10:
            flash("Use at least 10 characters.", "error")
        elif pw != pw2:
            flash("Passwords don't match.", "error")
        else:
            set_setting("password_hash", generate_password_hash(pw))
            session.clear()
            session["auth"] = True
            flash("Password set. Next: add your roster.", "ok")
            return redirect(url_for("main.students"))
    return render_template("setup.html")


@bp.route("/login", methods=["GET", "POST"])
def login():
    if not get_setting("password_hash"):
        return redirect(url_for("main.setup"))
    if request.method == "POST":
        if check_password_hash(get_setting("password_hash"), request.form.get("password", "")):
            session.clear()
            session["auth"] = True
            session.permanent = True
            nxt = request.args.get("next", "")
            return redirect(nxt if nxt.startswith("/") and not nxt.startswith("//") else url_for("main.dashboard"))
        time.sleep(1)  # slow down guessing
        flash("Wrong password.", "error")
    return render_template("login.html")


@bp.route("/logout", methods=["POST"])
def logout():
    session.clear()
    return redirect(url_for("main.login"))


@bp.route("/settings", methods=["GET", "POST"])
def settings():
    if request.method == "POST":
        if not check_password_hash(get_setting("password_hash"), request.form.get("current", "")):
            flash("Current password is wrong.", "error")
        elif len(request.form.get("new", "")) < 10:
            flash("Use at least 10 characters.", "error")
        else:
            set_setting("password_hash", generate_password_hash(request.form["new"]))
            flash("Password changed.", "ok")
    return render_template("settings.html")


# ---------------------------------------------------------------- helpers

def periods():
    return [r["period"] for r in get_db().execute(
        "SELECT DISTINCT period FROM students WHERE active = 1 AND period != '' ORDER BY period")]


def active_students(period=None):
    sql = "SELECT * FROM students WHERE active = 1"
    args = []
    if period:
        sql += " AND period = ?"
        args.append(period)
    sql += " ORDER BY period, last_name, first_name, student_code"
    return get_db().execute(sql, args).fetchall()


def display_name(s):
    name = f"{s['first_name']} {s['last_name']}".strip()
    return name or s["student_code"]


def get_assessment(aid):
    a = get_db().execute("SELECT * FROM assessments WHERE id = ?", (aid,)).fetchone()
    if a is None:
        abort(404)
    return a


def standards_list():
    return get_db().execute("SELECT * FROM standards ORDER BY sort").fetchall()


def skills_list():
    return get_db().execute("SELECT * FROM skills ORDER BY sort").fetchall()


def regents_priority():
    counts = {r["pe"]: r["n"] for r in get_db().execute(
        "SELECT pe, COUNT(*) AS n FROM items WHERE source LIKE 'Regents%' GROUP BY pe")}
    return {pe: ("High" if n >= 13 else "Medium" if n >= 9 else "Lower") for pe, n in counts.items()}, counts


# ---------------------------------------------------------------- dashboard & grids

@bp.route("/")
def dashboard():
    period = request.args.get("period") or None
    db = get_db()
    stds = standards_list()
    grid = grading.standards_mastery(db, period)
    summ = grading.summarize(grid, [s["code"] for s in stds])
    skl = skills_list()
    sgrid = grading.skills_mastery(db, period)
    ssumm = grading.summarize(sgrid, [s["code"] for s in skl])
    studs = {s["id"]: s for s in active_students(period)}
    reteach = []
    for s in stds:
        low = sorted((display_name(studs[sid]), d[s["code"]]) for sid, d in grid.items()
                     if sid in studs and d.get(s["code"]) is not None and d[s["code"]] < 0.5)
        if low:
            reteach.append((s, low))
    prio, _ = regents_priority()
    counts = {
        "students": len(studs),
        "assessments": db.execute("SELECT COUNT(*) FROM assessments").fetchone()[0],
        "responses": db.execute("SELECT COUNT(*) FROM responses").fetchone()[0],
    }
    return render_template("dashboard.html", stds=stds, summ=summ, skl=skl, ssumm=ssumm, reteach=reteach,
                           prio=prio, counts=counts, periods=periods(), period=period)


@bp.route("/standards")
def standards_grid():
    period = request.args.get("period") or None
    stds = standards_list()
    grid = grading.standards_mastery(get_db(), period)
    keys = [s["code"] for s in stds]
    return render_template("grid.html", title="Standards mastery", cols=[(s["code"], s["code"].replace("HS-", ""), s["topic"]) for s in stds],
                           students=active_students(period), grid=grid, summ=grading.summarize(grid, keys),
                           periods=periods(), period=period, endpoint="main.standards_grid", display_name=display_name)


@bp.route("/skills")
def skills_grid():
    period = request.args.get("period") or None
    skl = skills_list()
    grid = grading.skills_mastery(get_db(), period)
    keys = [s["code"] for s in skl]
    return render_template("grid.html", title="Skills mastery", cols=[(s["code"], s["code"], s["name"]) for s in skl],
                           students=active_students(period), grid=grid, summ=grading.summarize(grid, keys),
                           periods=periods(), period=period, endpoint="main.skills_grid", display_name=display_name)


# ---------------------------------------------------------------- students

@bp.route("/students", methods=["GET", "POST"])
def students():
    db = get_db()
    if request.method == "POST":
        code = zipgrade.clean_id(request.form.get("student_code"))
        if not code:
            flash("Student ID is required.", "error")
        else:
            try:
                db.execute("INSERT INTO students (student_code, first_name, last_name, period) VALUES (?, ?, ?, ?)",
                           (code, request.form.get("first_name", "").strip(), request.form.get("last_name", "").strip(),
                            request.form.get("period", "").strip()))
                db.commit()
                flash(f"Added {code}.", "ok")
            except Exception:
                flash(f"ID {code} already exists.", "error")
        return redirect(url_for("main.students"))
    show_all = request.args.get("all") == "1"
    rows = db.execute("SELECT * FROM students " + ("" if show_all else "WHERE active = 1 ") +
                      "ORDER BY period, last_name, first_name, student_code").fetchall()
    return render_template("students.html", students=rows, show_all=show_all)


@bp.route("/students/import", methods=["POST"])
def students_import():
    f = request.files.get("file")
    if not f:
        flash("Choose a CSV file.", "error")
        return redirect(url_for("main.students"))
    headers, rows = zipgrade.parse_csv(f.read())
    norm = [re.sub(r"[^a-z0-9]", "", h.lower()) for h in headers]

    def col(*names):
        for n in names:
            if n in norm:
                return norm.index(n)
        return None

    ci = col("studentid", "zipgradeid", "id", "studentcode", "code", "externalid", "osis")
    cf = col("firstname", "first", "givenname")
    cl = col("lastname", "last", "surname", "familyname")
    cp = col("period", "class", "classes", "section", "course")
    if ci is None:
        flash("Couldn't find a student ID column. Name it 'Student ID'.", "error")
        return redirect(url_for("main.students"))
    db = get_db()
    added = updated = 0
    for r in rows:
        code = zipgrade.clean_id(r[ci])
        if not code:
            continue
        vals = {"first_name": r[cf].strip() if cf is not None else None,
                "last_name": r[cl].strip() if cl is not None else None,
                "period": r[cp].strip() if cp is not None else None}
        existing = db.execute("SELECT id FROM students WHERE student_code = ?", (code,)).fetchone()
        if existing:
            sets = {k: v for k, v in vals.items() if v is not None}
            if sets:
                db.execute(f"UPDATE students SET {', '.join(k + ' = ?' for k in sets)}, active = 1 WHERE id = ?",
                           (*sets.values(), existing["id"]))
            updated += 1
        else:
            db.execute("INSERT INTO students (student_code, first_name, last_name, period) VALUES (?, ?, ?, ?)",
                       (code, vals["first_name"] or "", vals["last_name"] or "", vals["period"] or ""))
            added += 1
    db.commit()
    flash(f"Roster import: {added} added, {updated} updated.", "ok")
    return redirect(url_for("main.students"))


@bp.route("/students/<int:sid>")
def student_report(sid):
    db = get_db()
    s = db.execute("SELECT * FROM students WHERE id = ?", (sid,)).fetchone() or abort(404)
    stds, skl = standards_list(), skills_list()
    mine = grading.standards_mastery(db).get(sid, {})
    cls = grading.summarize(grading.standards_mastery(db), [x["code"] for x in stds])
    mine_sk = grading.skills_mastery(db).get(sid, {})
    cls_sk = grading.summarize(grading.skills_mastery(db), [x["code"] for x in skl])
    history = db.execute(
        "SELECT a.id, a.name, a.given_on, SUM(r.points) AS earned, SUM(CASE WHEN r.points IS NOT NULL THEN ai.points END) AS possible, "
        "COUNT(r.answer) AS answered "
        "FROM assessments a JOIN assessment_items ai ON ai.assessment_id = a.id "
        "JOIN responses r ON r.assessment_item_id = ai.id AND r.student_id = ? "
        "GROUP BY a.id ORDER BY a.given_on, a.id", (sid,)).fetchall()
    prio, _ = regents_priority()
    return render_template("student.html", s=s, name=display_name(s), stds=stds, skl=skl, mine=mine, cls=cls,
                           mine_sk=mine_sk, cls_sk=cls_sk, history=history, prio=prio)


@bp.route("/students/<int:sid>/edit", methods=["POST"])
def student_edit(sid):
    db = get_db()
    if request.form.get("action") == "deactivate":
        db.execute("UPDATE students SET active = 0 WHERE id = ?", (sid,))
        flash("Student hidden from grids (scores kept).", "ok")
    elif request.form.get("action") == "activate":
        db.execute("UPDATE students SET active = 1 WHERE id = ?", (sid,))
    else:
        db.execute("UPDATE students SET first_name = ?, last_name = ?, period = ? WHERE id = ?",
                   (request.form.get("first_name", "").strip(), request.form.get("last_name", "").strip(),
                    request.form.get("period", "").strip(), sid))
        flash("Saved.", "ok")
    db.commit()
    return redirect(request.form.get("back") or url_for("main.students"))


# ---------------------------------------------------------------- item bank

@bp.route("/items")
def items():
    db = get_db()
    q = request.args.get("q", "").strip()
    pe = request.args.get("pe", "")
    source = request.args.get("source", "")
    sql, args = "SELECT * FROM items WHERE 1=1", []
    if q:
        sql += " AND (id LIKE ? OR description LIKE ? OR cluster LIKE ?)"
        args += [f"%{q}%"] * 3
    if pe:
        sql += " AND pe = ?"
        args.append(pe)
    if source:
        sql += " AND source = ?"
        args.append(source)
    sql += " ORDER BY source, q"
    rows = db.execute(sql, args).fetchall()
    sources = [r[0] for r in db.execute("SELECT DISTINCT source FROM items ORDER BY source")]
    return render_template("items.html", items=rows, stds=standards_list(), sources=sources, q=q, pe=pe, source=source)


# ---------------------------------------------------------------- assessments

ITEM_LINE = re.compile(r"^\s*(MC|CR)\s*\|\s*(HS-ESS\d-\d)\s*\|\s*(SEP\d)\s*\|\s*([\d.]+)\s*(?:\|\s*(.*))?$", re.I)


@bp.route("/assessments", methods=["GET", "POST"])
def assessments():
    db = get_db()
    if request.method == "POST":
        name = request.form.get("name", "").strip()
        lines = [ln.strip() for ln in request.form.get("items", "").splitlines() if ln.strip()]
        if not name or not lines:
            flash("Give the assessment a name and at least one question.", "error")
            return render_template("assessments.html", rows=_assessment_rows(), form=request.form)
        parsed, errors = [], []
        for n, ln in enumerate(lines, 1):
            m = ITEM_LINE.match(ln)
            if m:
                parsed.append(("new", m))
            elif db.execute("SELECT 1 FROM items WHERE id = ?", (ln,)).fetchone():
                parsed.append(("bank", ln))
            else:
                errors.append(f"Line {n}: '{ln}' is not an item ID or 'MC | HS-ESS2-7 | SEP4 | 1 | description'")
        if errors:
            for e in errors:
                flash(e, "error")
            return render_template("assessments.html", rows=_assessment_rows(), form=request.form)
        aid = db.execute("INSERT INTO assessments (name, given_on, unit, notes) VALUES (?, ?, ?, ?)",
                         (name, request.form.get("given_on", ""), request.form.get("unit", ""),
                          request.form.get("notes", ""))).lastrowid
        zg = 0
        for pos, (kind, val) in enumerate(parsed, 1):
            if kind == "new":
                fmt, pe, sep, pts, desc = val.group(1).upper(), val.group(2).upper(), val.group(3).upper(), float(val.group(4)), val.group(5) or ""
                item_id = f"A{aid}-Q{pos}"
                db.execute("INSERT INTO items (id, source, q, pe, sep, fmt, points, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                           (item_id, name, pos, pe, sep, fmt, pts, desc))
            else:
                item_id = val
                it = db.execute("SELECT fmt, points FROM items WHERE id = ?", (item_id,)).fetchone()
                fmt, pts = it["fmt"], it["points"]
            if fmt == "MC":
                zg += 1
            db.execute("INSERT INTO assessment_items (assessment_id, position, item_id, points, zg_question) VALUES (?, ?, ?, ?, ?)",
                       (aid, pos, item_id, pts, zg if fmt == "MC" else None))
        db.commit()
        flash("Assessment created. Enter the answer key next.", "ok")
        return redirect(url_for("main.assessment_setup", aid=aid))
    return render_template("assessments.html", rows=_assessment_rows(), form={})


def _assessment_rows():
    return get_db().execute(
        "SELECT a.*, COUNT(DISTINCT ai.id) AS n_items, COUNT(DISTINCT r.student_id) AS n_students, "
        "SUM(CASE WHEN i.fmt = 'MC' AND ai.answer_key = '' THEN 1 ELSE 0 END) AS missing_keys "
        "FROM assessments a LEFT JOIN assessment_items ai ON ai.assessment_id = a.id "
        "LEFT JOIN items i ON i.id = ai.item_id "
        "LEFT JOIN responses r ON r.assessment_item_id = ai.id "
        "GROUP BY a.id ORDER BY a.given_on DESC, a.id DESC").fetchall()


@bp.route("/assessments/<int:aid>")
def assessment(aid):
    db = get_db()
    a = get_assessment(aid)
    its = grading.assessment_items(db, aid)
    period = request.args.get("period") or None
    studs = active_students(period)
    resp = {}
    for r in db.execute(
        "SELECT r.* FROM responses r JOIN assessment_items ai ON ai.id = r.assessment_item_id WHERE ai.assessment_id = ?", (aid,)):
        resp[(r["student_id"], r["assessment_item_id"])] = r
    # item analysis
    analysis = []
    sid_set = {s["id"] for s in studs}
    for it in its:
        rs = [r for (sid, aiid), r in resp.items() if aiid == it["id"] and sid in sid_set]
        graded = [r for r in rs if r["points"] is not None]
        counts = {c: sum(r["answer"] == c for r in rs) for c in "1234"} if it["fmt"] == "MC" else {}
        counts["blank"] = sum(r["answer"] == "" for r in rs) if it["fmt"] == "MC" else 0
        analysis.append({
            "it": it, "n": len(rs), "counts": counts,
            "pct": (sum(r["points"] for r in graded) / (len(graded) * it["points"])) if graded else None,
        })
    rows = []
    for s in studs:
        cells = [resp.get((s["id"], it["id"])) for it in its]
        taken = [c for c in cells if c is not None]
        graded = [(c, it) for c, it in zip(cells, its) if c is not None and c["points"] is not None]
        earned = sum(c["points"] for c, _ in graded)
        possible = sum(it["points"] for _, it in graded)
        rows.append({"s": s, "cells": cells, "taken": bool(taken), "earned": earned,
                     "possible": possible, "pct": earned / possible if possible else None})
    missing_keys = [it["position"] for it in its if it["fmt"] == "MC" and not it["answer_key"]]
    return render_template("assessment.html", a=a, its=its, rows=rows, analysis=analysis, missing_keys=missing_keys,
                           periods=periods(), period=period, display_name=display_name)


JUPITER_ORDERS = {
    "last": ("Last name, first name", lambda s: (s["last_name"].lower(), s["first_name"].lower(), s["student_code"])),
    "first": ("First name, last name", lambda s: (s["first_name"].lower(), s["last_name"].lower(), s["student_code"])),
    "id": ("Student ID", lambda s: (len(s["student_code"]), s["student_code"])),
}


@bp.route("/assessments/<int:aid>/jupiter")
def assessment_jupiter(aid):
    """One score per line, in roster order, ready to paste into Excel / Jupiter."""
    db = get_db()
    a = get_assessment(aid)
    its = grading.assessment_items(db, aid)
    period = request.args.get("period") or None
    order = request.args.get("order", "last")
    if order not in JUPITER_ORDERS:
        order = "last"
    value = request.args.get("value", "points")
    if value not in ("points", "percent"):
        value = "points"
    studs = sorted(active_students(period), key=JUPITER_ORDERS[order][1])
    resp = {}
    for r in db.execute(
        "SELECT r.* FROM responses r JOIN assessment_items ai ON ai.id = r.assessment_item_id WHERE ai.assessment_id = ?", (aid,)):
        resp[(r["student_id"], r["assessment_item_id"])] = r
    total_possible = sum(it["points"] for it in its)
    rows, ungraded = [], 0
    for s in studs:
        cells = [resp.get((s["id"], it["id"])) for it in its]
        taken = [c for c in cells if c is not None]
        if not taken:
            rows.append((s, "", "absent / not entered"))
            continue
        if any(c["points"] is None for c in taken):
            ungraded += 1
        earned = sum(c["points"] for c in taken if c["points"] is not None)
        # Score out of the whole test: unanswered questions count as 0 for the gradebook.
        missing = sum(c is None for c in cells)
        note = f"{missing} question(s) not entered" if missing else ""
        if value == "percent":
            score = f"{round(100 * earned / total_possible)}" if total_possible else ""
        else:
            score = f"{earned:g}"
        rows.append((s, score, note))
    scores_text = "\n".join(r[1] for r in rows)
    return render_template("jupiter.html", a=a, rows=rows, scores_text=scores_text, total_possible=total_possible,
                           ungraded=ungraded, periods=periods(), period=period, order=order, value=value,
                           orders={k: v[0] for k, v in JUPITER_ORDERS.items()}, display_name=display_name)


@bp.route("/assessments/<int:aid>/setup", methods=["GET", "POST"])
def assessment_setup(aid):
    db = get_db()
    a = get_assessment(aid)
    its = grading.assessment_items(db, aid)
    if request.method == "POST":
        db.execute("UPDATE assessments SET name = ?, given_on = ?, unit = ?, notes = ? WHERE id = ?",
                   (request.form.get("name", a["name"]).strip() or a["name"], request.form.get("given_on", ""),
                    request.form.get("unit", ""), request.form.get("notes", ""), aid))
        for it in its:
            key = grading.normalize_choice(request.form.get(f"key_{it['id']}", "")) if it["fmt"] == "MC" else ""
            if key and key not in "12345":
                flash(f"Q{it['position']}: key must be 1-5 or A-E.", "error")
                key = it["answer_key"]
            try:
                pts = float(request.form.get(f"pts_{it['id']}", it["points"]))
            except ValueError:
                pts = it["points"]
            zgq = request.form.get(f"zg_{it['id']}", "").strip()
            zgq = int(zgq) if zgq.isdigit() else None
            db.execute("UPDATE assessment_items SET answer_key = ?, points = ?, zg_question = ? WHERE id = ?",
                       (key, pts, zgq, it["id"]))
        for it in grading.assessment_items(db, aid):
            grading.regrade_item(db, it)
        db.commit()
        flash("Saved and regraded.", "ok")
        return redirect(url_for("main.assessment", aid=aid))
    return render_template("assessment_setup.html", a=a, its=its)


@bp.route("/assessments/<int:aid>/delete", methods=["POST"])
def assessment_delete(aid):
    db = get_db()
    get_assessment(aid)
    if request.form.get("confirm") != "DELETE":
        flash("Type DELETE to confirm.", "error")
        return redirect(url_for("main.assessment_setup", aid=aid))
    db.execute("DELETE FROM assessments WHERE id = ?", (aid,))
    db.commit()
    flash("Assessment and its scores deleted.", "ok")
    return redirect(url_for("main.assessments"))


@bp.route("/assessments/<int:aid>/enter", methods=["GET", "POST"])
def assessment_enter(aid):
    """Typed entry. ?only=cr shows just the written-answer columns."""
    db = get_db()
    a = get_assessment(aid)
    its = grading.assessment_items(db, aid)
    only = request.args.get("only", "")
    shown = [it for it in its if it["fmt"] == "CR"] if only == "cr" else its
    period = request.args.get("period") or None
    studs = active_students(period)
    if request.method == "POST":
        n = 0
        for s in studs:
            for it in shown:
                field = f"r_{s['id']}_{it['id']}"
                if field not in request.form:
                    continue
                raw = request.form[field].strip()
                existing = db.execute("SELECT answer, source FROM responses WHERE assessment_item_id = ? AND student_id = ?",
                                      (it["id"], s["id"])).fetchone()
                # Empty cell = no answer recorded (absent / not entered yet).
                if raw == "":
                    if existing is not None:
                        db.execute("DELETE FROM responses WHERE assessment_item_id = ? AND student_id = ?", (it["id"], s["id"]))
                    continue
                # "-" = student was present but left an MC question blank (scores 0).
                answer = "" if raw == "-" else raw
                shown_val = "-" if existing is not None and existing["answer"] == "" else (existing["answer"] if existing else None)
                if existing is not None and shown_val == raw:
                    continue  # unchanged: keep its source (e.g. zipgrade)
                grading.save_response(db, it, s["id"], answer, "typed")
                n += 1
        db.commit()
        flash(f"Saved {n} answers.", "ok")
        return redirect(url_for("main.assessment", aid=aid, period=period or ""))
    resp = {(r["student_id"], r["assessment_item_id"]): r for r in db.execute(
        "SELECT r.* FROM responses r JOIN assessment_items ai ON ai.id = r.assessment_item_id WHERE ai.assessment_id = ?", (aid,))}
    return render_template("enter.html", a=a, its=shown, studs=studs, resp=resp, only=only,
                           periods=periods(), period=period, display_name=display_name)


# ---------------------------------------------------------------- ZipGrade import

def _import_path(token):
    if not re.fullmatch(r"[A-Za-z0-9_-]{20,}", token or ""):
        abort(400)
    return Path(current_app.config["DATA_DIR"]) / "imports" / f"{token}.json"


@bp.route("/assessments/<int:aid>/import", methods=["GET", "POST"])
def assessment_import(aid):
    db = get_db()
    a = get_assessment(aid)
    its = grading.assessment_items(db, aid)
    mc = [it for it in its if it["fmt"] == "MC" or it["zg_question"]]
    if request.method == "GET":
        return render_template("import_upload.html", a=a, mc=mc)
    f = request.files.get("file")
    if not f or not f.filename:
        flash("Choose the CSV you exported from ZipGrade.", "error")
        return redirect(url_for("main.assessment_import", aid=aid))
    headers, rows = zipgrade.parse_csv(f.read())
    if not headers or not rows:
        flash("That file looks empty.", "error")
        return redirect(url_for("main.assessment_import", aid=aid))
    token = secrets.token_urlsafe(24)
    _import_path(token).write_text(json.dumps({"aid": aid, "headers": headers, "rows": rows}))
    return redirect(url_for("main.import_map", aid=aid, token=token))


@bp.route("/assessments/<int:aid>/import/<token>", methods=["GET", "POST"])
def import_map(aid, token):
    db = get_db()
    a = get_assessment(aid)
    path = _import_path(token)
    if not path.exists():
        flash("That upload expired. Upload the file again.", "error")
        return redirect(url_for("main.assessment_import", aid=aid))
    data = json.loads(path.read_text())
    if data["aid"] != aid:
        abort(400)
    headers, rows = data["headers"], data["rows"]
    its = grading.assessment_items(db, aid)
    # MC questions, plus written questions you score by bubbling on the ZipGrade sheet
    mc = [it for it in its if it["fmt"] == "MC" or it["zg_question"]]

    def chosen(name, guess):
        v = request.values.get(name)
        if v is None:
            return guess
        return int(v) if v.lstrip("-").isdigit() and int(v) >= 0 else None

    id_col = chosen("id_col", zipgrade.guess_id_column(headers))
    qcols = {it["id"]: chosen(f"q_{it['id']}", zipgrade.guess_question_column(headers, it["zg_question"]) if it["zg_question"] else None)
             for it in mc}
    by_code = {s["student_code"]: s for s in db.execute("SELECT * FROM students")}
    matched, unmatched = [], []
    if id_col is not None:
        for r in rows:
            code = zipgrade.clean_id(r[id_col])
            if not code:
                continue
            (matched if code in by_code else unmatched).append((code, r))

    if request.method == "POST" and request.form.get("confirm") == "1":
        if id_col is None or not any(c is not None for c in qcols.values()):
            flash("Pick the student-ID column and at least one question column.", "error")
        else:
            keep_typed = request.form.get("keep_typed") == "1"
            n = 0
            for code, r in matched:
                sid = by_code[code]["id"]
                for it in mc:
                    c = qcols[it["id"]]
                    if c is None:
                        continue
                    if keep_typed:
                        ex = db.execute("SELECT source FROM responses WHERE assessment_item_id = ? AND student_id = ?",
                                        (it["id"], sid)).fetchone()
                        if ex and ex["source"] == "typed":
                            continue
                    if it["fmt"] == "CR":
                        credit = grading.cr_from_bubble(r[c], it["points"])
                        if credit is None:
                            continue  # not bubbled = not scored yet
                        grading.save_response(db, it, sid, f"{credit:g}", "zipgrade")
                    else:
                        grading.save_response(db, it, sid, r[c], "zipgrade")
                    n += 1
            db.commit()
            path.unlink(missing_ok=True)
            msg = f"Imported {n} answers for {len(matched)} students."
            if unmatched:
                msg += f" {len(unmatched)} IDs weren't on your roster: {', '.join(c for c, _ in unmatched[:15])}"
            flash(msg, "ok" if not unmatched else "warn")
            return redirect(url_for("main.assessment", aid=aid))

    preview = []
    for code, r in matched[:8]:
        s = by_code[code]
        cells = []
        for it in mc:
            c = qcols[it["id"]]
            if c is None:
                cells.append("—")
            elif it["fmt"] == "CR":
                credit = grading.cr_from_bubble(r[c], it["points"])
                cells.append("" if credit is None else f"{credit:g} pt")
            else:
                cells.append(grading.normalize_choice(r[c]))
        preview.append((code, display_name(s), cells))
    return render_template("import_map.html", a=a, token=token, headers=headers, mc=mc, id_col=id_col, qcols=qcols,
                           matched=matched, unmatched=unmatched, preview=preview, n_rows=len(rows))


# ---------------------------------------------------------------- export & backup

def _csv_response(name, header, rows):
    buf = io.StringIO()
    w = csv.writer(buf)
    w.writerow(header)
    w.writerows(rows)
    return Response(buf.getvalue(), mimetype="text/csv",
                    headers={"Content-Disposition": f"attachment; filename={name}"})


@bp.route("/export/standards.csv")
def export_standards():
    stds = standards_list()
    grid = grading.standards_mastery(get_db())
    rows = [[s["student_code"], s["first_name"], s["last_name"], s["period"]] +
            [round(grid.get(s["id"], {}).get(x["code"], 0) * 100) if x["code"] in grid.get(s["id"], {}) else "" for x in stds]
            for s in active_students()]
    return _csv_response("standards-mastery.csv", ["student_id", "first", "last", "period"] + [x["code"] for x in stds], rows)


@bp.route("/export/responses.csv")
def export_responses():
    rows = get_db().execute(
        "SELECT s.student_code, s.period, a.name, ai.position, ai.item_id, i.pe, i.sep, i.fmt, r.answer, r.points, ai.points, r.source "
        "FROM responses r JOIN students s ON s.id = r.student_id JOIN assessment_items ai ON ai.id = r.assessment_item_id "
        "JOIN assessments a ON a.id = ai.assessment_id JOIN items i ON i.id = ai.item_id "
        "ORDER BY a.id, s.student_code, ai.position").fetchall()
    return _csv_response("all-responses.csv", ["student_id", "period", "assessment", "q", "item_id", "pe", "skill", "format",
                                               "answer", "points", "possible", "source"], [list(r) for r in rows])


@bp.route("/backup")
def backup():
    import sqlite3
    import tempfile
    tmp = tempfile.NamedTemporaryFile(suffix=".db", delete=False, dir=current_app.config["DATA_DIR"])
    tmp.close()
    src = sqlite3.connect(current_app.config["DATABASE"])
    dst = sqlite3.connect(tmp.name)
    src.backup(dst)
    src.close()
    dst.close()
    data = Path(tmp.name).read_bytes()
    Path(tmp.name).unlink()
    return send_file(io.BytesIO(data), as_attachment=True, download_name=f"tracker-backup-{time.strftime('%Y%m%d')}.db",
                     mimetype="application/octet-stream")
