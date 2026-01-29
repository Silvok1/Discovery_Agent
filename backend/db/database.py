"""Database connection and utilities."""
import aiosqlite
import json
from pathlib import Path
from typing import Optional
import secrets

DB_PATH = Path(__file__).parent.parent.parent / "interviews.db"


async def get_db():
    """Get database connection."""
    db = await aiosqlite.connect(DB_PATH)
    db.row_factory = aiosqlite.Row
    return db


# User operations
async def create_user(email: str, name: Optional[str] = None) -> dict:
    db = await get_db()
    cursor = await db.execute(
        "INSERT INTO users (email, name) VALUES (?, ?)",
        (email, name)
    )
    await db.commit()
    user_id = cursor.lastrowid
    await db.close()
    return {"id": user_id, "email": email, "name": name}


async def get_user_by_email(email: str) -> Optional[dict]:
    db = await get_db()
    cursor = await db.execute("SELECT * FROM users WHERE email = ?", (email,))
    row = await cursor.fetchone()
    await db.close()
    return dict(row) if row else None


async def get_or_create_user(email: str, name: Optional[str] = None) -> dict:
    user = await get_user_by_email(email)
    if user:
        return user
    return await create_user(email, name)


# Project operations
async def create_project(user_id: int, name: str, description: Optional[str] = None) -> dict:
    db = await get_db()
    cursor = await db.execute(
        """INSERT INTO projects (user_id, name, description, status)
           VALUES (?, ?, ?, 'draft')""",
        (user_id, name, description)
    )
    await db.commit()
    project_id = cursor.lastrowid
    cursor = await db.execute("SELECT * FROM projects WHERE id = ?", (project_id,))
    row = await cursor.fetchone()
    await db.close()
    return dict(row)


async def get_project(project_id: int) -> Optional[dict]:
    db = await get_db()
    cursor = await db.execute("SELECT * FROM projects WHERE id = ?", (project_id,))
    row = await cursor.fetchone()
    await db.close()
    return dict(row) if row else None


async def get_user_projects(user_id: int) -> list:
    db = await get_db()
    cursor = await db.execute(
        "SELECT * FROM projects WHERE user_id = ? ORDER BY created_at DESC",
        (user_id,)
    )
    rows = await cursor.fetchall()
    await db.close()
    return [dict(row) for row in rows]


async def update_project(project_id: int, **kwargs) -> Optional[dict]:
    db = await get_db()
    # Build SET clause dynamically
    set_parts = []
    values = []
    for key, value in kwargs.items():
        if value is not None:
            set_parts.append(f"{key} = ?")
            values.append(value)

    if set_parts:
        set_parts.append("updated_at = CURRENT_TIMESTAMP")
        values.append(project_id)
        query = f"UPDATE projects SET {', '.join(set_parts)} WHERE id = ?"
        await db.execute(query, values)
        await db.commit()

    cursor = await db.execute("SELECT * FROM projects WHERE id = ?", (project_id,))
    row = await cursor.fetchone()
    await db.close()
    return dict(row) if row else None


async def get_project_instances(project_id: int) -> list:
    db = await get_db()
    cursor = await db.execute(
        "SELECT * FROM instances WHERE project_id = ? ORDER BY created_at DESC",
        (project_id,)
    )
    rows = await cursor.fetchall()
    await db.close()
    result = []
    for row in rows:
        data = dict(row)
        if data.get("questions"):
            data["questions"] = json.loads(data["questions"])
        result.append(data)
    return result


# Instance operations
async def create_instance(
    user_id: int,
    name: str,
    agent_type: str,
    project_id: Optional[int] = None,
    objective: Optional[str] = None,
    questions: Optional[list] = None,
    timebox_minutes: int = 30,
    max_turns: int = 20
) -> dict:
    db = await get_db()
    cursor = await db.execute(
        """INSERT INTO instances
           (project_id, user_id, name, agent_type, objective, questions, timebox_minutes, max_turns, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'draft')""",
        (project_id, user_id, name, agent_type, objective, json.dumps(questions) if questions else None, timebox_minutes, max_turns)
    )
    await db.commit()
    instance_id = cursor.lastrowid
    cursor = await db.execute("SELECT * FROM instances WHERE id = ?", (instance_id,))
    row = await cursor.fetchone()
    await db.close()
    data = dict(row)
    if data.get("questions"):
        data["questions"] = json.loads(data["questions"])
    return data


async def get_instance(instance_id: int) -> Optional[dict]:
    db = await get_db()
    cursor = await db.execute("SELECT * FROM instances WHERE id = ?", (instance_id,))
    row = await cursor.fetchone()
    await db.close()
    if row:
        data = dict(row)
        if data.get("questions"):
            data["questions"] = json.loads(data["questions"])
        return data
    return None


async def get_user_instances(user_id: int) -> list:
    db = await get_db()
    cursor = await db.execute("SELECT * FROM instances WHERE user_id = ? ORDER BY created_at DESC", (user_id,))
    rows = await cursor.fetchall()
    await db.close()
    return [dict(row) for row in rows]


async def update_instance_status(instance_id: int, status: str):
    db = await get_db()
    await db.execute("UPDATE instances SET status = ? WHERE id = ?", (status, instance_id))
    await db.commit()
    await db.close()


# Participant operations
async def create_participant(
    instance_id: int,
    email: str,
    name: Optional[str] = None,
    background: Optional[str] = None
) -> dict:
    token = secrets.token_urlsafe(32)
    db = await get_db()
    cursor = await db.execute(
        """INSERT INTO participants (instance_id, email, name, background, unique_token, status)
           VALUES (?, ?, ?, ?, ?, 'invited')""",
        (instance_id, email, name, background, token)
    )
    await db.commit()
    participant_id = cursor.lastrowid
    await db.close()
    return {"id": participant_id, "email": email, "unique_token": token, "status": "invited"}


async def get_participant_by_token(token: str) -> Optional[dict]:
    db = await get_db()
    cursor = await db.execute("SELECT * FROM participants WHERE unique_token = ?", (token,))
    row = await cursor.fetchone()
    await db.close()
    return dict(row) if row else None


async def update_participant_status(participant_id: int, status: str):
    db = await get_db()
    await db.execute("UPDATE participants SET status = ? WHERE id = ?", (status, participant_id))
    await db.commit()
    await db.close()


# Session operations
async def create_session(participant_id: int) -> dict:
    db = await get_db()
    cursor = await db.execute(
        "INSERT INTO sessions (participant_id) VALUES (?)",
        (participant_id,)
    )
    await db.commit()
    session_id = cursor.lastrowid
    await db.close()
    return {"id": session_id, "participant_id": participant_id, "turn_count": 0}


async def get_session(session_id: int) -> Optional[dict]:
    db = await get_db()
    cursor = await db.execute("SELECT * FROM sessions WHERE id = ?", (session_id,))
    row = await cursor.fetchone()
    await db.close()
    return dict(row) if row else None


async def increment_turn_count(session_id: int) -> int:
    db = await get_db()
    await db.execute("UPDATE sessions SET turn_count = turn_count + 1 WHERE id = ?", (session_id,))
    await db.commit()
    cursor = await db.execute("SELECT turn_count FROM sessions WHERE id = ?", (session_id,))
    row = await cursor.fetchone()
    await db.close()
    return row["turn_count"]


async def complete_session(session_id: int, duration_seconds: int):
    db = await get_db()
    await db.execute(
        "UPDATE sessions SET completed_at = CURRENT_TIMESTAMP, duration_seconds = ? WHERE id = ?",
        (duration_seconds, session_id)
    )
    await db.commit()
    await db.close()


# Message operations
async def add_message(session_id: int, role: str, content: str, audio_input: bool = False) -> dict:
    db = await get_db()
    cursor = await db.execute(
        "INSERT INTO messages (session_id, role, content, audio_input) VALUES (?, ?, ?, ?)",
        (session_id, role, content, audio_input)
    )
    await db.commit()
    message_id = cursor.lastrowid
    await db.close()
    return {"id": message_id, "role": role, "content": content}


async def get_session_messages(session_id: int) -> list:
    db = await get_db()
    cursor = await db.execute(
        "SELECT * FROM messages WHERE session_id = ? ORDER BY timestamp",
        (session_id,)
    )
    rows = await cursor.fetchall()
    await db.close()
    return [dict(row) for row in rows]


# Insight operations
async def add_insight(session_id: int, insight_type: str, content: str, confidence: float = 1.0):
    db = await get_db()
    await db.execute(
        "INSERT INTO insights (session_id, insight_type, content, confidence) VALUES (?, ?, ?, ?)",
        (session_id, insight_type, content, confidence)
    )
    await db.commit()
    await db.close()


async def get_session_insights(session_id: int) -> list:
    db = await get_db()
    cursor = await db.execute(
        "SELECT * FROM insights WHERE session_id = ? ORDER BY extracted_at",
        (session_id,)
    )
    rows = await cursor.fetchall()
    await db.close()
    return [dict(row) for row in rows]


# Anonymous link operations
async def get_anonymous_link(instance_id: int) -> Optional[dict]:
    db = await get_db()
    cursor = await db.execute(
        "SELECT * FROM anonymous_links WHERE instance_id = ?",
        (instance_id,)
    )
    row = await cursor.fetchone()
    await db.close()
    if row:
        data = dict(row)
        # Convert SQLite integers to booleans
        data["enabled"] = bool(data.get("enabled", 1))
        data["allow_multiple"] = bool(data.get("allow_multiple", 0))
        return data
    return None


async def create_anonymous_link(instance_id: int, base_url: str) -> dict:
    """Create anonymous link settings for an instance."""
    # Generate a unique URL using the instance ID
    url = f"{base_url}/interview/anon-{secrets.token_urlsafe(16)}"
    db = await get_db()
    cursor = await db.execute(
        """INSERT INTO anonymous_links (instance_id, url, enabled)
           VALUES (?, ?, 1)""",
        (instance_id, url)
    )
    await db.commit()
    link_id = cursor.lastrowid
    cursor = await db.execute("SELECT * FROM anonymous_links WHERE id = ?", (link_id,))
    row = await cursor.fetchone()
    await db.close()
    data = dict(row)
    data["enabled"] = bool(data.get("enabled", 1))
    data["allow_multiple"] = bool(data.get("allow_multiple", 0))
    return data


async def update_anonymous_link(instance_id: int, **kwargs) -> Optional[dict]:
    """Update anonymous link settings."""
    db = await get_db()
    set_parts = []
    values = []
    for key, value in kwargs.items():
        if value is not None:
            # Convert booleans to integers for SQLite
            if isinstance(value, bool):
                value = 1 if value else 0
            set_parts.append(f"{key} = ?")
            values.append(value)

    if set_parts:
        values.append(instance_id)
        query = f"UPDATE anonymous_links SET {', '.join(set_parts)} WHERE instance_id = ?"
        await db.execute(query, values)
        await db.commit()

    cursor = await db.execute("SELECT * FROM anonymous_links WHERE instance_id = ?", (instance_id,))
    row = await cursor.fetchone()
    await db.close()
    if row:
        data = dict(row)
        data["enabled"] = bool(data.get("enabled", 1))
        data["allow_multiple"] = bool(data.get("allow_multiple", 0))
        return data
    return None


async def get_or_create_anonymous_link(instance_id: int, base_url: str) -> dict:
    """Get existing anonymous link or create one."""
    link = await get_anonymous_link(instance_id)
    if link:
        return link
    return await create_anonymous_link(instance_id, base_url)


async def update_instance(instance_id: int, **kwargs) -> Optional[dict]:
    """Update an instance."""
    db = await get_db()
    set_parts = []
    values = []
    for key, value in kwargs.items():
        if value is not None:
            if key == "questions":
                value = json.dumps(value)
            set_parts.append(f"{key} = ?")
            values.append(value)

    if set_parts:
        values.append(instance_id)
        query = f"UPDATE instances SET {', '.join(set_parts)} WHERE id = ?"
        await db.execute(query, values)
        await db.commit()

    cursor = await db.execute("SELECT * FROM instances WHERE id = ?", (instance_id,))
    row = await cursor.fetchone()
    await db.close()
    if row:
        data = dict(row)
        if data.get("questions"):
            data["questions"] = json.loads(data["questions"])
        return data
    return None


async def get_instance_participants(instance_id: int) -> list:
    """Get all participants for an instance."""
    db = await get_db()
    cursor = await db.execute(
        "SELECT * FROM participants WHERE instance_id = ? ORDER BY created_at DESC",
        (instance_id,)
    )
    rows = await cursor.fetchall()
    await db.close()
    return [dict(row) for row in rows]
