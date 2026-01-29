"""API routes for the interview platform."""
from fastapi import APIRouter, HTTPException, Request
from typing import Optional
from ..db import database as db
from ..db.models import (
    UserCreate, InstanceCreate, InstanceUpdate, ParticipantCreate,
    ChatRequest, ChatResponse, ProjectCreate, ProjectUpdate, AnonymousLinkUpdate,
    PlanningSessionCreate, PlanningChatRequest, PlanningChatResponse,
    PlanningFinalizeRequest, DraftPlan
)
from ..agents.llm_agent import LLMAgent
from ..agents.planning_agent import PlanningAgent

router = APIRouter()

# In-memory session storage for active agents
active_sessions: dict[int, LLMAgent] = {}
active_planning_sessions: dict[int, PlanningAgent] = {}


# Project endpoints
@router.get("/projects")
async def get_projects(user_email: str):
    """Get all projects for a user."""
    user = await db.get_user_by_email(user_email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    projects = await db.get_user_projects(user["id"])
    return projects


@router.post("/projects")
async def create_project(project: ProjectCreate, user_email: str):
    """Create a new project."""
    user = await db.get_or_create_user(user_email)
    result = await db.create_project(
        user_id=user["id"],
        name=project.name,
        description=project.description
    )
    return result


@router.get("/projects/{project_id}")
async def get_project(project_id: int):
    """Get project details."""
    project = await db.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.patch("/projects/{project_id}")
async def update_project(project_id: int, project: ProjectUpdate):
    """Update a project."""
    existing = await db.get_project(project_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Project not found")
    result = await db.update_project(
        project_id,
        name=project.name,
        description=project.description,
        status=project.status
    )
    return result


@router.get("/projects/{project_id}/instances")
async def get_project_instances(project_id: int):
    """Get all instances for a project."""
    project = await db.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    instances = await db.get_project_instances(project_id)
    return instances


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
    # Verify project exists if provided
    if instance.project_id:
        project = await db.get_project(instance.project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
    result = await db.create_instance(
        user_id=user["id"],
        project_id=instance.project_id,
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


@router.patch("/instances/{instance_id}")
async def update_instance(instance_id: int, instance: InstanceUpdate):
    """Update an interview instance."""
    existing = await db.get_instance(instance_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Instance not found")
    result = await db.update_instance(
        instance_id,
        name=instance.name,
        agent_type=instance.agent_type,
        objective=instance.objective,
        questions=instance.questions,
        timebox_minutes=instance.timebox_minutes,
        max_turns=instance.max_turns
    )
    return result


@router.get("/instances/{instance_id}/participants")
async def get_instance_participants(instance_id: int):
    """Get all participants for an instance."""
    instance = await db.get_instance(instance_id)
    if not instance:
        raise HTTPException(status_code=404, detail="Instance not found")
    participants = await db.get_instance_participants(instance_id)
    return participants


# Anonymous link endpoints
@router.get("/instances/{instance_id}/anonymous-link")
async def get_anonymous_link(instance_id: int, request: Request):
    """Get anonymous link settings for an instance."""
    instance = await db.get_instance(instance_id)
    if not instance:
        raise HTTPException(status_code=404, detail="Instance not found")
    # Get or create link with base URL from request
    base_url = str(request.base_url).rstrip("/")
    link = await db.get_or_create_anonymous_link(instance_id, base_url)
    return link


@router.patch("/instances/{instance_id}/anonymous-link")
async def update_anonymous_link(instance_id: int, link_update: AnonymousLinkUpdate):
    """Update anonymous link settings."""
    instance = await db.get_instance(instance_id)
    if not instance:
        raise HTTPException(status_code=404, detail="Instance not found")
    result = await db.update_anonymous_link(
        instance_id,
        enabled=link_update.enabled,
        allow_multiple=link_update.allow_multiple,
        max_responses=link_update.max_responses,
        expires_at=link_update.expires_at
    )
    if not result:
        raise HTTPException(status_code=404, detail="Anonymous link not found")
    return result


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

    # Create agent context for Explorer
    context = {
        "participant_name": participant.get("name", "Participant"),
        "participant_background": participant.get("background", ""),
        "objective": instance.get("objective", ""),
        "timebox_minutes": instance.get("timebox_minutes", 10),
        "max_turns": instance.get("max_turns", 20),
    }

    agent = LLMAgent(
        agent_type="explorer",  # Always Explorer
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
        "agent_type": "explorer"
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


# =============================================================================
# Planning Session Endpoints (Collaborative Planning with Claude)
# =============================================================================

@router.post("/planning/start")
async def start_planning_session(request: PlanningSessionCreate):
    """Start a new collaborative planning session."""
    # Get or create user
    user = await db.get_or_create_user(request.user_email)

    # Create planning session
    session = await db.create_planning_session(user["id"])

    # Create planning agent
    agent = PlanningAgent()
    active_planning_sessions[session["id"]] = agent

    # Get opening message
    opening = agent.get_opening_message()
    await db.add_planning_message(session["id"], "assistant", opening)

    return {
        "planning_session_id": session["id"],
        "opening_message": opening
    }


@router.post("/planning/{planning_session_id}/chat")
async def planning_chat(planning_session_id: int, request: PlanningChatRequest) -> PlanningChatResponse:
    """Send a message in a planning session."""
    session = await db.get_planning_session(planning_session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Planning session not found")

    if session["status"] != "active":
        raise HTTPException(status_code=400, detail="Planning session is not active")

    agent = active_planning_sessions.get(planning_session_id)
    if not agent:
        raise HTTPException(status_code=400, detail="Planning session expired. Please start a new session.")

    # Store user message
    await db.add_planning_message(planning_session_id, "user", request.message)

    # Get agent response (returns tuple: response, plan_ready, draft_plan)
    response, plan_ready, draft_plan = await agent.chat(request.message)

    # Store agent response
    await db.add_planning_message(planning_session_id, "assistant", response)

    # Update turn count
    turn_count = await db.increment_planning_turn_count(planning_session_id)

    # If plan is ready, store it in the session
    if plan_ready and draft_plan:
        await db.update_planning_session(
            planning_session_id,
            generated_objective=draft_plan.get("objective"),
            generated_questions=draft_plan.get("questions"),
            target_participant_profile=draft_plan.get("participant_profile"),
            key_assumptions=draft_plan.get("assumptions")
        )

    return PlanningChatResponse(
        response=response,
        turn_count=turn_count,
        plan_ready=plan_ready,
        draft_plan=DraftPlan(**draft_plan) if draft_plan else None
    )


@router.post("/planning/{planning_session_id}/finalize")
async def finalize_planning_session(planning_session_id: int, request: PlanningFinalizeRequest):
    """Finalize a planning session and create an interview instance."""
    session = await db.get_planning_session(planning_session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Planning session not found")

    # Use provided values or fall back to generated ones
    objective = request.objective or session.get("generated_objective", "")
    questions = request.questions or session.get("generated_questions", [])

    if not objective:
        raise HTTPException(status_code=400, detail="No objective available. Please complete the planning conversation first.")

    # Mark planning session as completed
    plan = {
        "objective": objective,
        "questions": questions,
        "participant_profile": request.participant_profile or session.get("target_participant_profile"),
        "assumptions": session.get("key_assumptions", [])
    }
    await db.complete_planning_session(planning_session_id, plan)

    # Create the instance
    instance = await db.create_instance_from_planning(
        user_id=session["user_id"],
        planning_session_id=planning_session_id,
        name=request.name,
        objective=objective,
        questions=questions
    )

    # Clean up agent from memory
    if planning_session_id in active_planning_sessions:
        del active_planning_sessions[planning_session_id]

    return {
        "instance_id": instance["id"],
        "instance": instance
    }


@router.get("/planning/{planning_session_id}")
async def get_planning_session(planning_session_id: int):
    """Get a planning session with its messages."""
    session = await db.get_planning_session(planning_session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Planning session not found")

    messages = await db.get_planning_messages(planning_session_id)

    return {
        "planning_session": session,
        "messages": messages
    }


@router.get("/planning")
async def get_user_planning_sessions(user_email: str):
    """Get all planning sessions for a user."""
    user = await db.get_user_by_email(user_email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    sessions = await db.get_user_planning_sessions(user["id"])
    return sessions


@router.post("/planning/{planning_session_id}/resume")
async def resume_planning_session(planning_session_id: int):
    """Resume an active planning session."""
    session = await db.get_planning_session(planning_session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Planning session not found")

    if session["status"] != "active":
        raise HTTPException(status_code=400, detail="Planning session is not active")

    # Check if agent already exists in memory
    if planning_session_id in active_planning_sessions:
        agent = active_planning_sessions[planning_session_id]
    else:
        # Recreate agent and rebuild conversation history
        agent = PlanningAgent()
        messages = await db.get_planning_messages(planning_session_id)

        for msg in messages:
            if msg["role"] == "user":
                agent.conversation_history.append({
                    "role": "user",
                    "content": msg["content"]
                })
            elif msg["role"] == "assistant":
                agent.conversation_history.append({
                    "role": "assistant",
                    "content": msg["content"]
                })
                # Check if this message contains a plan
                draft_plan = agent._parse_plan_from_response(msg["content"])
                if draft_plan:
                    agent.plan_presented = True
                    agent.draft_plan = draft_plan

        agent.turn_count = session["turn_count"]
        active_planning_sessions[planning_session_id] = agent

    # Get the messages to return
    messages = await db.get_planning_messages(planning_session_id)

    return {
        "planning_session": session,
        "messages": messages,
        "plan_ready": agent.plan_presented,
        "draft_plan": agent.draft_plan
    }
