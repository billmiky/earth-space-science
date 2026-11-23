import os
import secrets
from pathlib import Path

from flask import Flask, abort, request, session

from .db import init_db
from .grading import band


def _secret_key(data_dir: Path) -> str:
    if os.environ.get("TRACKER_SECRET_KEY"):
        return os.environ["TRACKER_SECRET_KEY"]
    f = data_dir / "secret_key"
    if not f.exists():
        f.write_text(secrets.token_hex(32))
        f.chmod(0o600)
    return f.read_text().strip()


def create_app(test_config=None):
    app = Flask(__name__)
    data_dir = Path(os.environ.get("TRACKER_DATA_DIR", Path.cwd() / "data"))
    if test_config and "DATA_DIR" in test_config:
        data_dir = Path(test_config["DATA_DIR"])
    data_dir.mkdir(parents=True, exist_ok=True)
    (data_dir / "imports").mkdir(exist_ok=True)

    app.config.update(
        DATA_DIR=str(data_dir),
        DATABASE=str(data_dir / "tracker.db"),
        SECRET_KEY=_secret_key(data_dir),
        SESSION_COOKIE_HTTPONLY=True,
        SESSION_COOKIE_SAMESITE="Lax",
        SESSION_COOKIE_SECURE=os.environ.get("TRACKER_SECURE_COOKIES") == "1",
        MAX_CONTENT_LENGTH=5 * 1024 * 1024,
    )
    if test_config:
        app.config.update(test_config)

    init_db(app)

    @app.before_request
    def csrf_protect():
        if request.method == "POST":
            token = session.get("csrf")
            if not token or token != request.form.get("csrf"):
                abort(400, "Form expired. Go back, reload the page, and try again.")

    def csrf_token():
        if "csrf" not in session:
            session["csrf"] = secrets.token_urlsafe(32)
        return session["csrf"]

    def pct(v):
        return "" if v is None else f"{round(v * 100)}%"

    app.jinja_env.globals.update(csrf_token=csrf_token, band=band, pct=pct)

    from .views import bp

    app.register_blueprint(bp)
    return app
