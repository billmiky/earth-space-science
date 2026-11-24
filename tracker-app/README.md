# ESS Tracker (self-hosted)

A small web app for tracking Earth & Space Sciences students on **standards** (NYSSLS PEs) and **skills** (science practices, Reference Tables, written answers). It's built around **ZipGrade**: ZipGrade prints the bubble sheets and scans them with your phone, and this app grades, stores, and reports.

- Single user, password protected, runs on a home server.
- All data lives in one SQLite file (`data/tracker.db`). **Nothing student-related is ever committed to git.**
- Comes loaded with the 21 ESS standards, 10 skills, all 250 items from the June 2025–Aug 2026 Regents (tagged), and Unit 2 Mid-Unit Task 1 (*Giant Insects*).

> **Privacy.** Student records are covered by FERPA and NY Education Law 2-d. Check your school's rules before storing names here. The app works fine with **student IDs only**, since names are optional. Keep it off the open internet (see *Reaching it from your phone* below), and treat backups as student data.

## Install on your home server

### Option A: Docker (recommended)

```bash
git clone https://github.com/billmiky/earth-space-science.git
cd earth-space-science/tracker-app
docker compose up -d --build
```

Open `http://<server>:8000`. The first visit asks you to set a password. Data is stored in `tracker-app/data/` on the server.

By default the port is bound to `127.0.0.1` (the server itself only). To use it from other devices on your home network, change the `ports:` line in `docker-compose.yml` to `"8000:8000"`.

### Option B: plain Python (3.10+)

```bash
cd earth-space-science/tracker-app
python3 -m venv .venv && . .venv/bin/activate
pip install -r requirements.txt
TRACKER_DATA_DIR=./data gunicorn -b 0.0.0.0:8000 "tracker:create_app()"
```

### Reaching it from your phone

Don't port-forward it to the internet. The simplest safe options:

- **Same Wi-Fi:** use `http://<server-LAN-IP>:8000`.
- **Away from home:** install [Tailscale](https://tailscale.com) on the server and your phone, then use the server's Tailscale address. Only your own devices can reach it.

If you put it behind HTTPS (Tailscale Serve, Caddy, nginx…), set `TRACKER_SECURE_COOKIES=1`.

## Your first test: Giant Insects with ZipGrade

1. **Roster.** Go to **Students** and import a CSV with a `Student ID` column, plus optional `First Name`, `Last Name`, and `Period` columns. Use the **same IDs students bubble on ZipGrade sheets.** The simplest way is to import the same list into your ZipGrade class.
2. **Answer key.** Go to **Assessments**, open *U2 Mid-Unit Task 1*, then **Answer key & settings**. Type the MC key from the Rating Guide. The key is not stored in this public code.
3. **In ZipGrade:** make a quiz with **only the 3 MC questions**, print the answer sheets, give the test, and scan with your phone.
4. **Export** the quiz results from ZipGrade as a CSV and get the file to your phone or computer.
5. In the app: open the assessment, click **📷 Import ZipGrade results**, and upload the CSV.
   - The preview shows which column it used for IDs and for each question, how many students matched, and any IDs not on your roster (usually a mis-bubbled ID).
   - If a column guess is wrong, pick the right one and press **Update preview**, then **Import**.
6. **✏️ Enter written-answer scores:** type 0/1 for Q4–Q6. **Enter moves down** the column, so you can grade a stack of papers in order.
7. Check the **Dashboard**, **Standards**, **Skills**, and each student's printable report.

### Bubbling written-answer scores on the ZipGrade sheet

You can skip typing written scores by bubbling them on each student's sheet:

1. **In the app, Answer key & settings:** give each written question a ZipGrade # (Giant Insects: Q4 → 4, Q5 → 5, Q6 → 6).
2. **In ZipGrade:** make the quiz 6 questions long. Key for Q4–Q6: **A**. ZipGrade's own score will be off, but that doesn't matter because the app does the grading.
3. **Tell students to leave 4–6 blank.**
4. **After hand-grading,** bubble each student's sheet:
   - A = full credit, B = one point less, C = two less, and so on.
   - For a 1-point question, **A = right, B = wrong**.
   - Leave it blank if you haven't scored it yet; blank bubbles are skipped, never counted as 0.
5. Scan and import as usual. The preview shows those columns as points.

### Rules the app follows

| Situation | What happens |
|---|---|
| Student not in the ZipGrade export, no typed answers | Absent: not counted at all (no zero) |
| In the export but a bubble left blank | 0 for that question |
| MC answer saved before the key was entered | Stored, shown with `?`, graded automatically when you add the key |
| You change the key later | Everything is regraded |
| You typed an answer, then re-import ZipGrade | Your typed answer is kept (checkbox on the import screen) |
| Typed entry: empty cell / `-` | Empty = no answer recorded; `-` = present but left the MC blank |

Mastery = points earned ÷ points possible, **only on questions the student actually took**. Colors: red < 50%, yellow 50–74%, green ≥ 75%.

## Getting scores into Jupiter

Open an assessment and click **📋 Copy scores for Jupiter**:

1. Pick the **period** and the **order** that matches your Jupiter roster (last name, first name, or student ID), and choose **points** or **percent**.
2. Check the list on screen. Every student's name is beside their score, so you can confirm the order matches Jupiter.
3. Click **Copy score column**. Only the scores are copied, one per line, and absent students are blank lines so the rows stay aligned. Paste into Excel starting at the first student's cell.

Questions a student has no answer for count as 0 in this total, and the page notes how many. Enter any missing written scores first.

## Making new assessments

**Assessments → New assessment.** List the questions in test order, one per line:

```
Jun2026-Q14                                  ← any item-bank ID (see "Item bank")
MC | HS-ESS1-4 | SEP5 | 1 | calculate eccentricity
CR | HS-ESS1-4 | SEP7 | 2 | explain Kepler's 2nd law
```

New MC questions are numbered for ZipGrade in order, skipping written questions. You can change the numbers under **Answer key & settings**.

## About ZipGrade's export format

ZipGrade's documentation wasn't reachable when this was built, so the importer doesn't assume one layout:
- **Student ID column:** it looks for `ZipGradeID`, then `Student ID`, `External Id`, and similar names.
- **Each question's answer column:** it looks for `Stu1`, `Q1`, `Question 1`, and similar names.

You confirm or correct the columns on the preview screen every time. Answers can be letters (A–E, any case) or numbers. If the preview shows only 0s and 1s, you've picked a score column. Pick the student-answer column instead.

## Backups and updates

- **Settings → Download full backup** saves the whole database, which includes student data. Or copy `data/tracker.db` while the app is stopped.
- **To update the app:** `git pull`, then `docker compose up -d --build`. Your data folder is untouched.

## Development

```bash
pip install -r requirements.txt pytest
python -m pytest -q
```

Code: `tracker/views.py` (pages), `tracker/grading.py` (scoring and mastery), `tracker/zipgrade.py` (CSV reading), `tracker/seed.py` (standards, skills, item bank), and `tracker/schema.sql`.
