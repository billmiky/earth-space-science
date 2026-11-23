"""Reference data: NYSSLS ESS standards, skills, and the tagged item bank.

Seeding is idempotent: reference rows use INSERT OR IGNORE, so your own edits
to items are never overwritten, and the sample assessment is only created once.
"""
import csv
from pathlib import Path

STANDARDS = [
    ("HS-ESS1-1", "1", "The Sun's energy & life span", "I can use a model to explain how fusion in the Sun's core makes energy, and predict the Sun's future stages."),
    ("HS-ESS1-2", "2", "Big Bang evidence", "I can use redshift, galaxy motion, and background radiation to explain how the universe began and is expanding."),
    ("HS-ESS1-3", "1", "Stars make elements", "I can explain how stars of different mass make elements, and use the H-R diagram to describe a star's life cycle."),
    ("HS-ESS1-4", "1, 2", "Orbits & gravity", "I can use Kepler's laws and math to predict how planets, moons, asteroids, and satellites move."),
    ("HS-ESS1-5", "3", "Rock ages & plate tectonics", "I can use the ages of sea-floor and continental rocks to support the theory of plate tectonics."),
    ("HS-ESS1-6", "2", "Early Earth history", "I can use rocks, meteorites, craters, and radiometric dating to explain how Earth formed and changed early on."),
    ("HS-ESS1-7", "4, 5", "Earth-Sun-Moon system (NYS)", "I can use models of the Earth, Sun, and Moon to explain seasons, Moon phases, eclipses, and tides."),
    ("HS-ESS2-1", "3", "Landforms: inside & outside forces", "I can explain how plate motion builds features while weathering and erosion wear them down."),
    ("HS-ESS2-2", "4", "Feedbacks in Earth systems", "I can explain how a change in one Earth system causes feedbacks in others (for example, ice-albedo)."),
    ("HS-ESS2-3", "3", "Earth's interior & convection", "I can use seismic-wave evidence to model Earth's layers and explain how mantle convection moves heat."),
    ("HS-ESS2-4", "4", "Energy flow & climate change", "I can explain how changes in energy flow (orbits, Sun, volcanoes, greenhouse gases) change Earth's climate."),
    ("HS-ESS2-5", "3, 5", "Properties of water", "I can explain how water's properties drive weathering, erosion, melting, and the water cycle."),
    ("HS-ESS2-6", "4, 6", "Carbon cycle", "I can model how carbon moves among the atmosphere, oceans, rocks, and living things."),
    ("HS-ESS2-7", "2", "Life & Earth coevolved", "I can argue from evidence that life and Earth's systems changed each other over geologic time."),
    ("HS-ESS2-8", "5", "Weather & storms (NYS)", "I can use air masses, fronts, pressure, and winds to explain and predict weather and storms."),
    ("HS-ESS3-1", "3, 6", "Resources, hazards & people", "I can explain how natural resources, hazards, and climate change shape where and how people live."),
    ("HS-ESS3-2", "6", "Weighing energy/mineral solutions", "I can compare costs, benefits, and risks of different ways to get and use energy and mineral resources."),
    ("HS-ESS3-3", "6", "Sustainability models", "I can use a computer model to show how resources, population, and biodiversity affect each other."),
    ("HS-ESS3-4", "2, 6", "Evaluating tech solutions", "I can judge or improve a technology that reduces human impact, using criteria and constraints."),
    ("HS-ESS3-5", "4, 5", "Climate data & forecasts", "I can analyze climate data and model results to predict the rate and local effects of climate change."),
    ("HS-ESS3-6", "6", "Human impacts on Earth systems", "I can use a computer model or data to show how human activity changes Earth's systems."),
]

SKILLS = [
    ("SEP4", "Analyze & interpret data", "Read graphs, tables, and maps; describe trends; compare two scenarios or time periods."),
    ("SEP2", "Develop & use models", "Read, complete, label, or sequence a model (cross-section, flow diagram, H-R diagram, orbit diagram)."),
    ("SEP6", "Explain / design solutions", "Explain a cause; choose or judge a solution using criteria, constraints, and trade-offs."),
    ("SEP7", "Argue from evidence", "Pick or write the evidence that supports or refutes a claim; match claim + evidence rows."),
    ("SEP5", "Math & computation", "Calculate rate, percent change, eccentricity, or elapsed time; convert units; read values off a graph."),
    ("SEP8", "Read & evaluate information", "Pull key facts from a dense reading passage or infographic."),
    ("SEP3", "Plan investigations", "Identify variables, controls, and repeat trials (packets and labs)."),
    ("SEP1", "Ask questions / define problems", "Ask testable questions; define a problem's criteria and constraints."),
    ("ESRT", "Reference Tables fluency", "Find and use the right 2024 Reference Tables table (items flagged ESRT)."),
    ("CR", "Constructed response", "Write a complete answer: identify + explain, using numbers from the data."),
]

# Unit 2 Mid-Unit Formative Task 1 (New Visions), tagged per its Alignment Guide.
# Answer keys are intentionally NOT stored here (this code is public); enter them in the app.
GIANT_INSECTS = [
    ("U2MU1-Q1", 1, "HS-ESS2-7", "SEP4", "MC", "Choose the row describing how continent movement changed O2 levels (PLD 1)"),
    ("U2MU1-Q2", 2, "HS-ESS2-7", "SEP7", "MC", "Choose terms that complete an argument for insect size change (PLD 4)"),
    ("U2MU1-Q3", 3, "HS-ESS2-7", "SEP2", "MC", "Use continent-position model to explain change to insect habitat (PLD 1)"),
    ("U2MU1-Q4", 4, "HS-ESS2-7", "SEP7", "CR", "Claim + reasoning: continent movement feedback on O2 (PLD 4)"),
    ("U2MU1-Q5", 5, "HS-ESS2-7", "SEP7", "CR", "Use Table 2 data as evidence that O2 decline shrank insects (PLD 3)"),
    ("U2MU1-Q6", 6, "HS-ESS2-7", "SEP7", "CR", "Evaluate predation argument for coevolution; name what it leaves out (PLD 5)"),
]

REGENTS_CSV = Path(__file__).parent / "seed_data" / "regents-item-map.csv"


def _regents_rows():
    with open(REGENTS_CSV, newline="", encoding="utf-8") as f:
        for r in csv.DictReader(f):
            exam = r["exam"]
            yield (
                r["item_id"], f"Regents {exam[:3]} {exam[3:]}", int(r["q"]), r["cluster_title"],
                r["pe"], r["pe2"], r["sep"], r["ccc"], r["format"], float(r["credits"] or 1),
                r["esrt"], r["esrt_table"], r["what_students_do"],
            )


def seed(db):
    db.executemany(
        "INSERT OR IGNORE INTO standards (code, units, topic, ican, sort) VALUES (?, ?, ?, ?, ?)",
        [(c, u, t, i, n) for n, (c, u, t, i) in enumerate(STANDARDS)],
    )
    db.executemany(
        "INSERT OR IGNORE INTO skills (code, name, description, sort) VALUES (?, ?, ?, ?)",
        [(c, nm, d, n) for n, (c, nm, d) in enumerate(SKILLS)],
    )
    db.executemany(
        "INSERT OR IGNORE INTO items (id, source, q, cluster, pe, pe2, sep, ccc, fmt, points, esrt, esrt_table, description) "
        "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        list(_regents_rows()),
    )
    db.executemany(
        "INSERT OR IGNORE INTO items (id, source, q, cluster, pe, sep, ccc, fmt, points, description) "
        "VALUES (?, 'U2 Mid-Unit Task 1', ?, 'Giant Insects', ?, ?, 'STAB', ?, 1, ?)",
        GIANT_INSECTS,
    )
    seeded = db.execute("SELECT value FROM settings WHERE key = 'seeded_giant_insects'").fetchone()
    if not seeded:
        cur = db.execute(
            "INSERT INTO assessments (name, unit, notes) VALUES (?, ?, ?)",
            ("U2 Mid-Unit Task 1: Giant Insects", "2",
             "New Visions formative task. Enter the MC key from the Rating Guide before grading."),
        )
        aid = cur.lastrowid
        zg = 0
        for item_id, q, _pe, _sep, fmt, _d in GIANT_INSECTS:
            if fmt == "MC":
                zg += 1
            db.execute(
                "INSERT INTO assessment_items (assessment_id, position, item_id, points, zg_question) "
                "VALUES (?, ?, ?, 1, ?)",
                (aid, q, item_id, zg if fmt == "MC" else None),
            )
        db.execute("INSERT INTO settings (key, value) VALUES ('seeded_giant_insects', '1')")
    db.commit()
