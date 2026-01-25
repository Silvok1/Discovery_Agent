"""API routes for the interview platform."""
from fastapi import APIRouter, HTTPException
from typing import Optional
from ..db import database as db
from ..db.models import (
    UserCreate, InstanceCreate, ParticipantCreate,
    ChatRequest, ChatResponse
)
from ..agents.llm_agent import LLMAgent

router = APIRouter()

# In-memory session storage for active agents
active_sessions: dict[int, LLMAgent] = {}


# User endpoints
@router.post("/users")
async def create_user(user: UserCreate):
    """Create or get a user."""
    result = await db.get_or_create_user(user.email, user.name)
    return result


@router.get("/users/{email}")
async def get_user(email: str):
    """Get user by email."""
    user = await db.get_user_by_email(email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


# Instance endpoints
@router.post("/instances")
async def create_instance(instance: InstanceCreate, user_email: str):
    """Create a new interview instance."""
    user = await db.get_or_create_user(user_email)
    result = await db.create_instance(
        user_id=user["id"],
        name=instance.name,
        agent_type=instance.agent_type,
        objective=instance.objective,
        questions=instance.questions,
        timebox_minutes=instance.timebox_minutes,
        max_turns=instance.max_turns
    )
    return result


@router.get("/instances/{instance_id}")
async def get_instance(instance_id: int):
    """Get instance details."""
    instance = await db.get_instance(instance_id)
    if not instance:
        raise HTTPException(status_code=404, detail="Instance not found")
    return instance


@router.get("/users/{email}/instances")
async def get_user_instances(email: str):
    """Get all instances for a user."""
    user = await db.get_user_by_email(email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    instances = await db.get_user_instances(user["id"])
    return instances


@router.post("/instances/{instance_id}/activate")
async def activate_instance(instance_id: int):
    """Activate an instance for interviews."""
    instance = await db.get_instance(instance_id)
    if not instance:
        raise HTTPException(status_code=404, detail="Instance not found")
    await db.update_instance_status(instance_id, "active")
    return {"status": "active"}


# Participant endpoints
@router.post("/instances/{instance_id}/participants")
async def add_participant(instance_id: int, participant: ParticipantCreate):
    """Add a participant to an instance."""
    instance = await db.get_instance(instance_id)
    if not instance:
        raise HTTPException(status_code=404, detail="Instance not found")

    result = await db.create_participant(
        instance_id=instance_id,
        email=participant.email,
        name=participant.name,
        background=participant.background
    )
    return result


@router.get("/interview/{token}")
async def get_interview_by_token(token: str):
    """Get interview details by participant token."""
    participant = await db.get_participant_by_token(token)
    if not participant:
        raise HTTPException(status_code=404, detail="Invalid interview token")

    instance = await db.get_instance(participant["instance_id"])
    return {
        "participant": participant,
        "instance": instance
    }


# Session/Chat endpoints
@router.post("/interview/{token}/start")
async def start_interview(token: str):
    """Start an interview session."""
    participant = await db.get_participant_by_token(token)
    if not participant:
        raise HTTPException(status_code=404, detail="Invalid interview token")

    instance = await db.get_instance(participant["instance_id"])
    if instance["status"] != "active":
        raise HTTPException(status_code=400, detail="Interview is not active")

    # Create session
    session = await db.create_session(participant["id"])
    await db.update_participant_status(participant["id"], "started")

    # Create agent
    context = {
        "participant_background": participant.get("background", ""),
        "objective": instance.get("objective", ""),
        "questions": instance.get("questions", []),
        "assumption": instance.get("objective", ""),  # For inquisitor
        "solution_description": instance.get("objective", ""),  # For validator
        "past_pain_point": "",
        "max_turns": instance.get("max_turns", 20),
    }

    agent = LLMAgent(
        agent_type=instance["agent_type"],
        context=context
    )

    # Store agent in memory
    active_sessions[session["id"]] = agent

    # Get opening message
    opening = agent.get_opening_message()
    await db.add_message(session["id"], "assistant", opening)

    return {
        "session_id": session["id"],
        "opening_message": opening,
        "agent_type": instance["agent_type"]
    }


@router.post("/sessions/{session_id}/chat")
async def chat(session_id: int, request: ChatRequest) -> ChatResponse:
    """Send a message in an interview session."""
    session = await db.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    agent = active_sessions.get(session_id)
    if not agent:
        raise HTTPException(status_code=400, detail="Session expired. Please start a new interview.")

    # Store user message
    await db.add_message(session_id, "user", request.message, request.audio_input)

    # Get agent response
    response = await agent.chat(request.message)

    # Store agent response
    await db.add_message(session_id, "assistant", response)

    # Update turn count
    turn_count = await db.increment_turn_count(session_id)

    return ChatResponse(
        response=response,
        turn_count=turn_count,
        session_id=session_id
    )


@router.post("/sessions/{session_id}/end")
async def end_session(session_id: int):
    """End an interview session."""
    session = await db.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Calculate duration
    messages = await db.get_session_messages(session_id)
    duration = 0
    if len(messages) >= 2:
        # Rough duration estimate based on message count
        duration = len(messages) * 30  # ~30 seconds per exchange

    await db.complete_session(session_id, duration)

    # Get participant and update status
    participant = await db.get_participant_by_token(session.get("participant_id", ""))
    if participant:
        await db.update_participant_status(participant["id"], "completed")

    # Clean up agent
    if session_id in active_sessions:
        del active_sessions[session_id]

    return {"status": "completed", "turn_count": session["turn_count"]}


@router.get("/sessions/{session_id}/messages")
async def get_messages(session_id: int):
    """Get all messages for a session."""
    messages = await db.get_session_messages(session_id)
    return messages


@router.get("/sessions/{session_id}/insights")
async def get_insights(session_id: int):
    """Get extracted insights for a session."""
    insights = await db.get_session_insights(session_id)
    return insights
