"""Pydantic models for the API."""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr


# User models
class UserCreate(BaseModel):
    email: EmailStr
    name: Optional[str] = None


class User(BaseModel):
    id: int
    email: str
    name: Optional[str]
    created_at: datetime


# Project models
class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None


class Project(BaseModel):
    id: int
    user_id: int
    name: str
    description: Optional[str]
    status: str
    created_at: datetime
    updated_at: datetime


# Instance models
class InstanceCreate(BaseModel):
    project_id: int
    name: str
    agent_type: str = "explorer"  # Only 'explorer' is supported
    objective: Optional[str] = None
    questions: Optional[list[str]] = None
    timebox_minutes: int = 10  # Default 10 minutes for discovery interviews
    max_turns: int = 20


class InstanceUpdate(BaseModel):
    name: Optional[str] = None
    agent_type: Optional[str] = None
    objective: Optional[str] = None
    questions: Optional[list[str]] = None
    timebox_minutes: Optional[int] = None
    max_turns: Optional[int] = None


class Instance(BaseModel):
    id: int
    project_id: Optional[int]
    user_id: int
    name: str
    agent_type: str
    objective: Optional[str]
    questions: Optional[list[str]]
    timebox_minutes: int
    max_turns: int
    status: str
    created_at: datetime


# Anonymous Link models
class AnonymousLinkSettings(BaseModel):
    id: int
    instance_id: int
    enabled: bool
    url: str
    allow_multiple: bool
    max_responses: Optional[int]
    current_responses: int
    expires_at: Optional[datetime]
    created_at: datetime


class AnonymousLinkUpdate(BaseModel):
    enabled: Optional[bool] = None
    allow_multiple: Optional[bool] = None
    max_responses: Optional[int] = None
    expires_at: Optional[datetime] = None


# Participant models
class ParticipantCreate(BaseModel):
    email: EmailStr
    name: Optional[str] = None
    background: Optional[str] = None


class Participant(BaseModel):
    id: int
    instance_id: int
    email: str
    name: Optional[str]
    background: Optional[str]
    unique_token: str
    status: str
    created_at: datetime


# Session models
class Session(BaseModel):
    id: int
    participant_id: int
    started_at: datetime
    completed_at: Optional[datetime]
    duration_seconds: Optional[int]
    turn_count: int


# Message models
class MessageCreate(BaseModel):
    content: str
    audio_input: bool = False


class Message(BaseModel):
    id: int
    session_id: int
    role: str
    content: str
    audio_input: bool
    timestamp: datetime


# Chat models
class ChatRequest(BaseModel):
    message: str
    audio_input: bool = False


class ChatResponse(BaseModel):
    response: str
    turn_count: int
    session_id: int


# Insight models
class Insight(BaseModel):
    id: int
    session_id: int
    insight_type: str
    content: str
    confidence: float
    extracted_at: datetime
