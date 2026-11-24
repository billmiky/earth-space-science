import io
import re

from conftest import csrf


def test_requires_setup_then_login(client):
    assert client.get("/").headers["Location"].endswith("/setup")
    tok = csrf(client, "/setup")
    client.post("/setup", data={"csrf": tok, "password": "correct horse", "password2": "correct horse"})
    client.post("/logout", data={"csrf": csrf(client, "/settings")})
    assert "/login" in client.get("/").headers["Location"]
    tok = csrf(client, "/login")
    assert client.post("/login", data={"csrf": tok, "password": "wrong password!"}).status_code == 200
    r = client.post("/login", data={"csrf": tok, "password": "correct horse"})
    assert r.status_code == 302 and client.get("/").status_code == 200


def test_post_without_csrf_rejected(auth):
    assert auth.post("/students", data={"student_code": "1"}).status_code == 400


def _roster(c):
    tok = csrf(c, "/students")
    csv_data = "Student ID,First Name,Last Name,Period\n1001,Ana,Diaz,3\n1002,Ben,Ng,3\n1003,Cy,Lo,5\n1004,Di,Ra,5\n"
    r = c.post("/students/import", data={"csrf": tok, "file": (io.BytesIO(csv_data.encode()), "roster.csv")},
               content_type="multipart/form-data", follow_redirects=True)
    assert "4 added" in r.get_data(as_text=True)
    return tok


def _giant_insects_id(c):
    html = c.get("/assessments").get_data(as_text=True)
    return int(re.search(r'/assessments/(\d+)">U2 Mid-Unit Task 1', html).group(1))


def _item_ids(c, aid):
    html = c.get(f"/assessments/{aid}/setup").get_data(as_text=True)
    return re.findall(r'name="pts_(\d+)"', html)


def test_full_zipgrade_workflow(auth, app):
    c = auth
    tok = _roster(c)
    aid = _giant_insects_id(c)
    ids = _item_ids(c, aid)
    assert len(ids) == 6
    # key Q1=B(2), Q2=C(3), Q3=A(1)
    form = {"csrf": tok, "name": "U2 Mid-Unit Task 1: Giant Insects", "given_on": "2026-12-01", "unit": "2", "notes": ""}
    for i, aiid in enumerate(ids):
        form[f"pts_{aiid}"] = "1"
        if i < 3:
            form[f"key_{aiid}"] = "BCA"[i]
            form[f"zg_{aiid}"] = str(i + 1)
    c.post(f"/assessments/{aid}/setup", data=form)

    # ZipGrade export: out of order, 1003 absent, an unknown ID, lowercase letter, a blank bubble
    export = ("Quiz Name,ZipGradeID,First Name,Num Correct,Stu1,PriKey1,Stu2,PriKey2,Stu3,PriKey3\n"
              "GI,1002,Ben,3,B,B,C,C,A,A\n"
              "GI,1001,Ana,1,b,B,D,C,,A\n"
              "GI,1004,Di,2,A,B,C,C,A,A\n"
              "GI,9999,Zed,0,A,B,A,C,B,A\n")
    r = c.post(f"/assessments/{aid}/import", data={"csrf": tok, "file": (io.BytesIO(export.encode()), "zg.csv")},
               content_type="multipart/form-data")
    loc = r.headers["Location"]
    html = c.get(loc).get_data(as_text=True)
    assert "3</b> students matched" in html and "9999" in html
    r = c.post(loc, data={"csrf": tok, "confirm": "1", "keep_typed": "1"}, follow_redirects=True)
    assert "Imported 9 answers for 3 students" in r.get_data(as_text=True)

    # type CR credits for 1001 (1,1,0) and 1002 (1,0,1); change 1004's Q1 by hand to B
    with app.app_context():
        from tracker.db import get_db
        db = get_db()
        sid = {r["student_code"]: r["id"] for r in db.execute("SELECT id, student_code FROM students")}
    cr_form = {"csrf": tok}
    for code, vals in (("1001", "110"), ("1002", "101")):
        for aiid, v in zip(ids[3:], vals):
            cr_form[f"r_{sid[code]}_{aiid}"] = v
    c.post(f"/assessments/{aid}/enter?only=cr", data=cr_form)
    c.post(f"/assessments/{aid}/enter", data={"csrf": tok, f"r_{sid['1004']}_{ids[0]}": "B"})

    with app.app_context():
        from tracker import grading
        from tracker.db import get_db
        db = get_db()
        m = grading.standards_mastery(db)
        # 1001: Q1 b=correct, Q2 D wrong, Q3 blank -> 0, CR 1,1,0 => 3/6
        assert m[sid["1001"]]["HS-ESS2-7"] == 3 / 6
        # 1002: 3 MC right + CR 1,0,1 => 5/6
        assert m[sid["1002"]]["HS-ESS2-7"] == 5 / 6
        # 1004: Q1 typed B (correct), Q2 C ok, Q3 A ok; no CR entered => 3/3
        assert m[sid["1004"]]["HS-ESS2-7"] == 1.0
        assert sid["1003"] not in m           # absent: not counted at all
        sk = grading.skills_mastery(db)
        # 1001 SEP7 items: Q2 (0), Q4 (1), Q5 (1), Q6 (0) => 0.5 ; CR => 2/3
        assert sk[sid["1001"]]["SEP7"] == 0.5
        assert abs(sk[sid["1001"]]["CR"] - 2 / 3) < 1e-9
        src = db.execute("SELECT source FROM responses WHERE student_id = ? AND assessment_item_id = ?",
                         (sid["1004"], int(ids[0]))).fetchone()["source"]
        assert src == "typed"

    # re-import keeps the hand-typed override
    r = c.post(f"/assessments/{aid}/import", data={"csrf": tok, "file": (io.BytesIO(export.encode()), "zg.csv")},
               content_type="multipart/form-data")
    c.post(r.headers["Location"], data={"csrf": tok, "confirm": "1", "keep_typed": "1"})
    with app.app_context():
        from tracker.db import get_db
        ans = get_db().execute("SELECT answer FROM responses WHERE student_id = ? AND assessment_item_id = ?",
                               (sid["1004"], int(ids[0]))).fetchone()["answer"]
        assert ans == "2"

    # pages render
    for path in ["/", "/?period=3", "/standards", "/skills", f"/assessments/{aid}", f"/students/{sid['1001']}",
                 "/items?pe=HS-ESS2-7", "/students", "/settings", "/export/standards.csv", "/export/responses.csv"]:
        assert c.get(path).status_code == 200, path
    assert c.get("/backup").data[:15] == b"SQLite format 3"


def test_create_assessment_from_bank_and_new_items(auth):
    c = auth
    tok = csrf(c, "/assessments")
    r = c.post("/assessments", data={"csrf": tok, "name": "Orbits quiz", "given_on": "", "unit": "1",
                                     "items": "Jun2025-Q4\nMC | HS-ESS1-4 | SEP5 | 1 | eccentricity\nCR | HS-ESS1-4 | SEP7 | 2 | explain"})
    assert r.status_code == 302 and "/setup" in r.headers["Location"]
    html = c.get(r.headers["Location"]).get_data(as_text=True)
    assert html.count('name="key_') == 2 and "eccentricity" in html
    bad = c.post("/assessments", data={"csrf": tok, "name": "x", "items": "nonsense line"})
    assert "not an item ID" in bad.get_data(as_text=True)


def test_item_bank_seeded(app):
    with app.app_context():
        from tracker.db import get_db
        n = get_db().execute("SELECT COUNT(*) FROM items WHERE source LIKE 'Regents%'").fetchone()[0]
        assert n == 250


def test_bubbled_written_scores(auth, app):
    c = auth
    tok = _roster(c)
    aid = _giant_insects_id(c)
    ids = _item_ids(c, aid)
    form = {"csrf": tok, "name": "GI", "given_on": "", "unit": "2", "notes": ""}
    for i, aiid in enumerate(ids):
        form[f"pts_{aiid}"] = "1"
        form[f"zg_{aiid}"] = str(i + 1)          # all six on the ZipGrade sheet
        if i < 3:
            form[f"key_{aiid}"] = "BCA"[i]
    c.post(f"/assessments/{aid}/setup", data=form)
    export = ("ZipGradeID,Stu1,Stu2,Stu3,Stu4,Stu5,Stu6\n"
              "1001,B,C,A,A,B,A\n"      # all MC right; written 1,0,1
              "1002,B,D,A,B,,A\n")      # Q5 not bubbled yet -> skipped
    r = c.post(f"/assessments/{aid}/import", data={"csrf": tok, "file": (io.BytesIO(export.encode()), "zg.csv")},
               content_type="multipart/form-data")
    html = c.get(r.headers["Location"]).get_data(as_text=True)
    assert "score bubble" in html and "1 pt" in html
    c.post(r.headers["Location"], data={"csrf": tok, "confirm": "1", "keep_typed": "1"})
    with app.app_context():
        from tracker import grading
        from tracker.db import get_db
        db = get_db()
        sid = {r["student_code"]: r["id"] for r in db.execute("SELECT id, student_code FROM students")}
        m = grading.standards_mastery(db)
        assert m[sid["1001"]]["HS-ESS2-7"] == 5 / 6
        assert m[sid["1002"]]["HS-ESS2-7"] == 3 / 5   # Q2 wrong, Q4 B=0, Q5 skipped
        assert grading.skills_mastery(db)[sid["1001"]]["CR"] == 2 / 3


def test_jupiter_score_column(auth, app):
    c = auth
    tok = _roster(c)   # 1001 Ana Diaz (3), 1002 Ben Ng (3), 1003 Cy Lo (5), 1004 Di Ra (5)
    aid = _giant_insects_id(c)
    ids = _item_ids(c, aid)
    form = {"csrf": tok, "name": "GI", "given_on": "", "unit": "2", "notes": ""}
    for i, aiid in enumerate(ids):
        form[f"pts_{aiid}"] = "1"
        if i < 3:
            form[f"key_{aiid}"] = "BCA"[i]
            form[f"zg_{aiid}"] = str(i + 1)
    c.post(f"/assessments/{aid}/setup", data=form)
    with app.app_context():
        from tracker.db import get_db
        sid = {r["student_code"]: r["id"] for r in get_db().execute("SELECT id, student_code FROM students")}
    entry = {"csrf": tok}
    for code, answers in (("1001", "BCA110"), ("1002", "AAD000"), ("1004", "BC")):  # 1003 absent; 1004 partial
        for aiid, v in zip(ids, answers):
            entry[f"r_{sid[code]}_{aiid}"] = v
    c.post(f"/assessments/{aid}/enter", data=entry)

    html = c.get(f"/assessments/{aid}/jupiter?order=last").get_data(as_text=True)
    text = re.search(r'id="jp-scores"[^>]*>([^<]*)</textarea>', html).group(1)
    # last-name order: Diaz(1001)=5, Lo(1003)=absent, Ng(1002)=0, Ra(1004)=2
    assert text.split("\n") == ["5", "", "0", "2"]
    assert "absent" in html and "question(s) not entered" in html

    html = c.get(f"/assessments/{aid}/jupiter?order=id&value=percent&period=3").get_data(as_text=True)
    text = re.search(r'id="jp-scores"[^>]*>([^<]*)</textarea>', html).group(1)
    assert text.split("\n") == ["83", "0"]     # 1001 = 5/6, 1002 = 0/6
