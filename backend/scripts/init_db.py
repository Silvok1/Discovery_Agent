"""Initialize the SQLite database with schema."""
import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent.parent.parent / "interviews.db"

SCHEMA = """
-- Users (PMs at your company)
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projects (container for interview instances)
CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT CHECK(status IN ('draft', 'active', 'closed', 'archived')) DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Interview Instances (belong to a project)
CREATE TABLE IF NOT EXISTS instances (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER,
    user_id INTEGER,
    name TEXT NOT NULL,
    agent_type TEXT CHECK(agent_type IN ('explorer')) DEFAULT 'explorer',
    objective TEXT,
    questions JSON,
    timebox_minutes INTEGER DEFAULT 30,
    max_turns INTEGER DEFAULT 20,
    status TEXT CHECK(status IN ('draft', 'active', 'closed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Anonymous link settings per instance
CREATE TABLE IF NOT EXISTS anonymous_links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    instance_id INTEGER UNIQUE NOT NULL,
    enabled INTEGER DEFAULT 1,
    url TEXT NOT NULL,
    allow_multiple INTEGER DEFAULT 0,
    max_responses INTEGER,
    current_responses INTEGER DEFAULT 0,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (instance_id) REFERENCES instances(id)
);

-- Participants
CREATE TABLE IF NOT EXISTS participants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    instance_id INTEGER,
    email TEXT NOT NULL,
    name TEXT,
    background TEXT,
    unique_token TEXT UNIQUE NOT NULL,
    status TEXT CHECK(status IN ('invited', 'started', 'completed', 'abandoned')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (instance_id) REFERENCES instances(id)
);

-- Interview Sessions
CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    participant_id INTEGER,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    duration_seconds INTEGER,
    turn_count INTEGER DEFAULT 0,
    metadata JSON,
    FOREIGN KEY (participant_id) REFERENCES participants(id)
);

-- Conversation Messages
CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER,
    role TEXT CHECK(role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    audio_input BOOLEAN DEFAULT FALSE,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions(id)
);

-- Extracted Insights (for synthesis)
CREATE TABLE IF NOT EXISTS insights (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER,
    insight_type TEXT,
    content TEXT,
    confidence REAL,
    extracted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions(id)
);
"""


def init_database():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.executescript(SCHEMA)
    conn.commit()
    conn.close()
    print(f"Database initialized at {DB_PATH}")


if __name__ == "__main__":
    init_database()
