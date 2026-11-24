PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS settings (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

-- The student's code is the ID they bubble on ZipGrade sheets.
-- Names are optional so the tracker can run on codes only.
CREATE TABLE IF NOT EXISTS students (
    id           INTEGER PRIMARY KEY,
    student_code TEXT NOT NULL UNIQUE,
    first_name   TEXT NOT NULL DEFAULT '',
    last_name    TEXT NOT NULL DEFAULT '',
    period       TEXT NOT NULL DEFAULT '',
    active       INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS standards (
    code  TEXT PRIMARY KEY,          -- e.g. HS-ESS2-7
    units TEXT NOT NULL,
    topic TEXT NOT NULL,
    ican  TEXT NOT NULL,
    sort  INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS skills (
    code        TEXT PRIMARY KEY,    -- SEP1..SEP8, ESRT, CR
    name        TEXT NOT NULL,
    description TEXT NOT NULL,
    sort        INTEGER NOT NULL
);

-- Item bank: every question ever tagged (past Regents + your own).
CREATE TABLE IF NOT EXISTS items (
    id          TEXT PRIMARY KEY,    -- e.g. Jun2025-Q17, U2MU1-Q4
    source      TEXT NOT NULL DEFAULT '',
    q           INTEGER,
    cluster     TEXT NOT NULL DEFAULT '',
    pe          TEXT NOT NULL DEFAULT '',
    pe2         TEXT NOT NULL DEFAULT '',
    sep         TEXT NOT NULL DEFAULT '',
    ccc         TEXT NOT NULL DEFAULT '',
    fmt         TEXT NOT NULL DEFAULT 'MC' CHECK (fmt IN ('MC', 'CR')),
    points      REAL NOT NULL DEFAULT 1,
    esrt        TEXT NOT NULL DEFAULT 'N',
    esrt_table  TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT ''
);

-- Every standard a question counts toward (items.pe is the first/primary one).
CREATE TABLE IF NOT EXISTS item_standards (
    item_id TEXT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    pe      TEXT NOT NULL,
    PRIMARY KEY (item_id, pe)
);

CREATE TABLE IF NOT EXISTS assessments (
    id       INTEGER PRIMARY KEY,
    name     TEXT NOT NULL,
    given_on TEXT NOT NULL DEFAULT '',
    unit     TEXT NOT NULL DEFAULT '',
    notes    TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS assessment_items (
    id            INTEGER PRIMARY KEY,
    assessment_id INTEGER NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    position      INTEGER NOT NULL,          -- question number on this test
    item_id       TEXT NOT NULL REFERENCES items(id),
    points        REAL NOT NULL DEFAULT 1,
    answer_key    TEXT NOT NULL DEFAULT '',  -- MC only, stored as 1-5
    zg_question   INTEGER,                   -- question number on the ZipGrade quiz (MC only)
    UNIQUE (assessment_id, position)
);

-- One row per student per question they took. No row = absent / not taken.
-- points NULL = not gradable yet (e.g. MC answer recorded before the key was entered).
CREATE TABLE IF NOT EXISTS responses (
    assessment_item_id INTEGER NOT NULL REFERENCES assessment_items(id) ON DELETE CASCADE,
    student_id         INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    answer             TEXT NOT NULL DEFAULT '',
    points             REAL,
    source             TEXT NOT NULL DEFAULT 'typed',   -- typed | zipgrade
    updated            TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (assessment_item_id, student_id)
);
