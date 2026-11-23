import re
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from tracker import create_app  # noqa: E402


@pytest.fixture
def app(tmp_path):
    return create_app({"DATA_DIR": str(tmp_path), "TESTING": True})


@pytest.fixture
def client(app):
    return app.test_client()


def csrf(client, path="/login"):
    html = client.get(path).get_data(as_text=True)
    return re.search(r'name="csrf" value="([^"]+)"', html).group(1)


@pytest.fixture
def auth(client):
    """Client that has set a password and is logged in."""
    tok = csrf(client, "/setup")
    r = client.post("/setup", data={"csrf": tok, "password": "correct horse", "password2": "correct horse"})
    assert r.status_code == 302
    return client
