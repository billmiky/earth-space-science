"""Reading ZipGrade results exports.

ZipGrade's exact export headers vary by export type and version, so nothing
here is hard-coded to one layout: we guess the student-ID column and each
question's answer column, and the import screen lets you change any guess.
"""
import csv
import io
import re

ID_CANDIDATES = ["zipgradeid", "zipgradestudentid", "studentid", "externalid", "id", "idnumber", "studentnumber"]


def _norm(h):
    return re.sub(r"[^a-z0-9]", "", (h or "").lower())


def parse_csv(data: bytes):
    """Return (headers, rows) where rows are lists of strings."""
    for enc in ("utf-8-sig", "cp1252", "latin-1"):
        try:
            text = data.decode(enc)
            break
        except UnicodeDecodeError:
            continue
    sample = text[:4096]
    try:
        dialect = csv.Sniffer().sniff(sample, delimiters=",;\t")
    except csv.Error:
        dialect = csv.excel
    reader = csv.reader(io.StringIO(text), dialect)
    rows = [r for r in reader if any(c.strip() for c in r)]
    if not rows:
        return [], []
    headers = [h.strip() for h in rows[0]]
    body = [r + [""] * (len(headers) - len(r)) for r in rows[1:]]
    return headers, body


def guess_id_column(headers):
    normed = [_norm(h) for h in headers]
    for cand in ID_CANDIDATES:
        if cand in normed:
            return normed.index(cand)
    for i, h in enumerate(normed):
        if "id" in h and "quiz" not in h and "key" not in h:
            return i
    return None


def guess_question_column(headers, n):
    """Find the column holding the *student's answer* to ZipGrade question n."""
    normed = [_norm(h) for h in headers]
    for cand in (f"stu{n}", f"q{n}", f"question{n}", f"studentanswer{n}", f"answer{n}", f"{n}"):
        if cand in normed:
            return normed.index(cand)
    for i, h in enumerate(normed):  # e.g. "Q1 Response"
        if re.fullmatch(rf"(q|question){n}(response|answer|resp|stu)", h):
            return i
    return None


def clean_id(v):
    """'1004', '1004.0', ' 1004 ' -> '1004' so numeric IDs match however they were saved."""
    s = str(v or "").strip()
    if re.fullmatch(r"\d+\.0+", s):
        s = s.split(".")[0]
    return s
