# Discovery Agent Platform - Logic & Operational Flow

**Last Updated:** January 27, 2026

---

## Platform Overview

The Discovery Agent is an **AI-powered internal interview platform** designed to conduct structured product discovery conversations with employees. The platform automates the interview process using three specialized AI agents based on Teresa Torres' continuous discovery framework, enabling product teams to gather insights about workflows, validate assumptions, and test solutions without manual interview scheduling.

**Core Purpose:** Enable continuous discovery interviews to identify automation opportunities and validate product decisions through structured, AI-driven conversations.

---

## System Architecture

### Technology Stack

**Backend:**
- **FastAPI** - Python web framework with async support
- **SQLite** - Single-file database (`interviews.db`)
- **LiteLLM** - Unified interface for LLM providers (local via Ollama or cloud via AWS Bedrock)
- **Ollama** - Local LLM server (llama3.2 model)

**Frontend:**
- **React** - Component-based UI
- **Tailwind CSS** - Utility-first styling
- **Vite** - Fast dev server
- **Web Speech API** - Browser-native voice input/output

**Admin Frontend:**
- **Next.js 16** - Full-featured admin interface
- **TypeScript** - Type-safe development
- **Shadcn/UI** - Component library

---

## Data Model & Hierarchy

### Entity Relationships

```
User (PM/Admin)
  └── Project
        └── Instance (Interview Configuration)
              ├── Participants (Individual Interviewees)
              │     └── Sessions (Active Conversations)
              │           ├── Messages (Chat History)
              │           └── Insights (Extracted Findings)
              └── Anonymous Link (Optional Public Access)
```

### Database Schema

**users** - Product managers and admins who create interviews
- `id`, `email`, `name`, `created_at`

**projects** - Organizational containers for related interviews
- `id`, `user_id`, `name`, `description`, `status`, `created_at`

**instances** - Interview configurations (the "template" for interviews)
- `id`, `user_id`, `project_id`, `name`, `agent_type`, `objective`, `questions`, `timebox_minutes`, `max_turns`, `status`, `created_at`

**participants** - Employees invited to be interviewed
- `id`, `instance_id`, `email`, `name`, `background`, `unique_token`, `status`, `created_at`

**sessions** - Active interview conversations
- `id`, `participant_id`, `started_at`, `completed_at`, `duration_seconds`, `turn_count`, `metadata`

**messages** - Individual chat messages in a session
- `id`, `session_id`, `role` (user/assistant/system), `content`, `audio_input`, `timestamp`

**insights** - Extracted findings from conversations
- `id`, `session_id`, `insight_type`, `content`, `confidence`, `extracted_at`

**anonymous_links** - Public access links for instances
- `id`, `instance_id`, `token`, `enabled`, `allow_multiple`, `max_responses`, `response_count`, `expires_at`, `full_url`, `created_at`

---

## The Three Agent Types

The platform's intelligence is structured around three specialized AI agents, each designed for a specific discovery conversation type based on Teresa Torres' Opportunity Solution Tree framework.

### 1. The Explorer (Generative Discovery)

**Purpose:** Identify opportunities by uncovering customer pain points and workflow inefficiencies.

**Torres Framework Goal:** Populate the Opportunity Solution Tree with "pains" and unmet needs.

**Conversational Strategy:**
- Open-ended probing that redirects generalizations into specific past stories
- When user says "I usually..." → redirect to "Walk me through the last time you did that, step by step"
- Focus on time spent, frequency, manual steps, and workarounds
- Probe for handoffs between systems, copy-paste tasks, and waiting periods

**Example Questions:**
- "What's a task you do regularly that feels repetitive or takes longer than it should?"
- "Walk me through the last time you did that, step by step."
- "How much time does that usually take you? How often do you do it?"
- "What tools or systems are you jumping between for that?"
- "What's the most tedious part of that process?"

**Guardrails:**
- Avoid leading questions
- Don't suggest solutions
- Focus on past behavior, not hypotheticals
- Redirect opinions to concrete stories

### 2. The Inquisitor (Assumption Testing)

**Purpose:** De-risk the roadmap by validating "leap of faith" assumptions before building.

**Torres Framework Goal:** Test whether users actually have the problem you think they have.

**Conversational Strategy:**
- Hypothesis testing through behavioral questioning
- Ask about past behaviors that would validate/invalidate assumptions
- Look for disconfirming evidence: "Have you ever NOT done [expected behavior]?"
- Quantify pain: frequency, recency, intensity, error rate

**Example Questions:**
- "When was the last time you had to do this manually? Walk me through it."
- "How often does this come up in a typical week?"
- "What's the most annoying part - the time, the repetition, or something else?"
- "Have you tried any tools or shortcuts to speed this up?"
- "On a scale of 1-10, how much does this slow you down?"

**Guardrails:**
- Don't ask "would you use this?" (unreliable)
- Focus on revealed preferences (what they did) not stated intentions (what they say they'd do)
- Ask about current workarounds and past attempts
- Distinguish between "nice to have" and "this is killing my productivity"

### 3. The Validator (Solution Testing)

**Purpose:** Test solutions to ensure the proposed feature actually solves the identified opportunity.

**Torres Framework Goal:** Validate that the solution works for real user scenarios.

**Conversational Strategy:**
- Task-based simulation - walk through using the solution
- Anchor on a specific past pain point the user experienced
- Describe the solution in concrete terms
- Probe for gaps, confusion, missing functionality

**Example Questions:**
- "If this automation existed, how would you kick it off?"
- "What info would you need to give it to get started?"
- "What would you do with the output once it's done?"
- "Would this fit into how you work now, or would you need to change things?"
- "What would you still need to handle manually?"

**Guardrails:**
- Keep scenarios concrete and grounded in real past experiences
- Watch for user confusion or hesitation
- Don't explain away problems - note them for the PM
- Note when user expects different behavior than designed

---

## Interview Operational Flow

### Phase 1: Interview Setup (Admin/PM)

**Step 1: Create Project** (Optional)
- PM creates a project container for related interviews
- Endpoint: `POST /api/projects`
- Data: `name`, `description`, `user_email`

**Step 2: Create Interview Instance**
- PM defines the interview configuration
- Endpoint: `POST /api/instances`
- Required Data:
  - `name` - Interview title (e.g., "Workflow Discovery - Sales Team")
  - `agent_type` - `explorer`, `inquisitor`, or `validator`
  - `objective` - Research goal (e.g., "Understand lead qualification process")
  - `questions` - List of topics to cover
  - `timebox_minutes` - Interview duration limit (default: 30)
  - `max_turns` - Maximum conversation exchanges (default: 20)
  - `project_id` - (Optional) Parent project

**Step 3: Add Participants**
- PM adds employees to interview
- Endpoint: `POST /api/instances/{instance_id}/participants`
- Data: `email`, `name`, `background` (optional context about the participant)
- System generates unique token for each participant

**Step 4: Activate Instance**
- PM activates the instance to allow interviews to start
- Endpoint: `POST /api/instances/{instance_id}/activate`
- Status changes from `draft` → `active`

**Step 5: Distribute Interview Links**
- Each participant receives unique link: `http://[domain]/interview/{unique_token}`
- Alternative: Create anonymous link for public access
  - Endpoint: `GET /api/instances/{instance_id}/anonymous-link`
  - Configurable: `enabled`, `allow_multiple`, `max_responses`, `expires_at`

---

### Phase 2: Interview Execution (Participant)

**Step 1: Participant Accesses Interview**
- Participant clicks unique link or anonymous link
- Frontend: `GET /api/interview/{token}`
- Returns: `participant` details and `instance` configuration
- Participant status: `invited` → `started`

**Step 2: Session Initialization**
- Frontend calls: `POST /api/interview/{token}/start`
- Backend creates:
  - New `session` record in database
  - `LLMAgent` instance in memory with appropriate agent type
  - Agent context populated with:
    - `participant_background`
    - `objective`
    - `questions`
    - `max_turns`
- Agent generates opening message based on agent type
- Opening message stored in database
- Returns: `session_id`, `opening_message`, `agent_type`

**Step 3: Conversation Loop**

For each user message:

1. **User Input**
   - Participant types message or uses voice input (Web Speech API)
   - Frontend sends: `POST /api/sessions/{session_id}/chat`
   - Payload: `{ "message": "...", "audio_input": true/false }`

2. **Message Storage**
   - User message stored in `messages` table with role `user`

3. **Guardrail Check**
   - Agent checks conversation constraints:
     - Turn count < `max_turns`
     - No prohibited topics (passwords, credit cards, SSN)
   - If violated, returns guardrail message and may end session

4. **LLM Processing**
   - Agent builds message context:
     ```python
     messages = [
       {"role": "system", "content": system_prompt},
       ...conversation_history
     ]
     ```
   - Calls LLM via LiteLLM:
     - **Development:** Ollama local model (`ollama/llama3.2`)
     - **Production:** AWS Bedrock (`bedrock/anthropic.claude-v2`)
   - LLM parameters: `temperature=0.7`, `max_tokens=500`

5. **Fallback Handling**
   - If LLM unavailable or fails, agent uses predefined contextual responses
   - Fallback responses tailored to agent type
   - Ensures interview continues even without LLM

6. **Response Storage**
   - Agent response stored in `messages` table with role `assistant`
   - Conversation history updated in agent's memory
   - Turn count incremented

7. **Frontend Display**
   - Response returned to frontend
   - Text-to-speech speaks response (Web Speech API)
   - Message displayed in chat interface

**Step 4: Session Completion**

Triggered when:
- Participant clicks "End Interview"
- Max turns reached
- Timebox exceeded (frontend timer)

Actions:
- Frontend calls: `POST /api/sessions/{session_id}/end`
- Backend:
  - Calculates session duration
  - Updates session: `completed_at`, `duration_seconds`
  - Updates participant status: `started` → `completed`
  - Removes agent from active memory
  - Returns: `status`, `turn_count`

---

### Phase 3: Insight Extraction (Post-Interview)

**Current Status:** Schema ready, extraction logic not yet implemented

**Planned Flow:**
1. After session completion, run insight extraction
2. LLM analyzes conversation transcript
3. Extracts structured insights:
   - **Pain points** - Specific workflow inefficiencies
   - **Quotes** - Verbatim user statements
   - **Assumption results** - Validated/invalidated hypotheses
   - **Usability issues** - Confusion or missing functionality
4. Store in `insights` table with confidence scores
5. Available via: `GET /api/sessions/{session_id}/insights`

---

## Agent Intelligence Architecture

### System Prompt Construction

Each agent type has a specialized system prompt that defines:
- **Role and objective**
- **Conversational rules** (what to ask, how to redirect)
- **Context variables** (participant background, research objective, questions)
- **Guardrails** (prohibited behaviors, focus areas)

Example context injection:
```python
context = {
    "participant_background": "Sales Manager with 5 years experience",
    "objective": "Understand lead qualification workflow",
    "questions": ["How do you prioritize leads?", "What tools do you use?"],
    "max_turns": 20
}

system_prompt = EXPLORER_PROMPT.format(**context)
```

### Conversation Memory

- **In-Memory Storage:** Active sessions stored in `active_sessions` dict
- **Conversation History:** List of `{"role": "user/assistant", "content": "..."}`
- **Persistence:** All messages stored in database for later analysis
- **Session Cleanup:** Agent removed from memory when session ends

### LLM Integration via LiteLLM

**Development Mode:**
```python
from litellm import completion

response = completion(
    model="ollama/llama3.2",
    messages=[...],
    api_base="http://localhost:11434",
    temperature=0.7,
    max_tokens=500
)
```

**Production Mode:**
```python
response = completion(
    model="bedrock/anthropic.claude-v2",
    messages=[...],
    api_base="https://company-aws-endpoint.com",
    api_key=os.getenv("AWS_API_KEY")
)
```

### Fallback Response System

When LLM unavailable:
1. Agent detects connection failure or timeout
2. Selects contextual fallback response based on agent type
3. Avoids repeating recently used responses
4. Maintains conversation flow without interruption

Example fallback responses (Explorer):
- "Walk me through the last time you did that, step by step."
- "How much time does that usually take you? How often do you do it?"
- "What tools or systems are you jumping between for that?"

---

## Voice Interface Architecture

### Speech-to-Text (Input)

**Technology:** Web Speech API (`webkitSpeechRecognition`)

**Flow:**
1. User clicks microphone button
2. Browser starts recording
3. Audio sent to browser's speech recognition service
4. Transcript returned to frontend
5. Transcript sent to backend as chat message

**Configuration:**
```javascript
recognition.continuous = false;  // Single utterance
recognition.interimResults = false;  // Final results only
recognition.lang = 'en-US';
```

### Text-to-Speech (Output)

**Technology:** Web Speech API (`SpeechSynthesis`)

**Flow:**
1. Agent response received from backend
2. Frontend creates speech utterance
3. Browser speaks response
4. Visual indicator shows speaking state

**Configuration:**
```javascript
utterance.rate = 1.0;  // Normal speed
utterance.pitch = 1.0;  // Normal pitch
```

---

## Interview Distribution Methods

### 1. Individual Participant Links

- **Use Case:** Targeted interviews with specific employees
- **Flow:**
  1. PM adds participants with email addresses
  2. Each participant gets unique token
  3. Link format: `http://[domain]/interview/{unique_token}`
  4. Token tied to specific participant record
  5. Tracks individual completion status

### 2. Anonymous Public Links

- **Use Case:** Open surveys, broader feedback collection
- **Flow:**
  1. PM creates anonymous link for instance
  2. Link format: `http://[domain]/interview/anon/{anonymous_token}`
  3. Configurable settings:
     - `enabled` - Link active/inactive
     - `allow_multiple` - Same person can respond multiple times
     - `max_responses` - Limit total responses
     - `expires_at` - Link expiration date
  4. Each response creates new participant record
  5. Tracks aggregate response count

---

## Status Tracking & Lifecycle

### Instance Status
- `draft` - Being configured, not yet active
- `active` - Accepting interviews
- `closed` - No longer accepting interviews

### Participant Status
- `invited` - Link sent, not yet started
- `started` - Interview in progress
- `completed` - Interview finished
- `abandoned` - Started but not completed

### Session Lifecycle
1. **Created:** `started_at` timestamp set
2. **Active:** Messages exchanged, turn count incremented
3. **Completed:** `completed_at` timestamp set, duration calculated
4. **Archived:** Agent removed from memory, data persisted

---

## Key Design Decisions

### 1. In-Memory Agent Storage
- **Rationale:** Fast access during active conversations
- **Trade-off:** Sessions lost on server restart
- **Mitigation:** All messages persisted to database, can reconstruct conversation

### 2. Synchronous LLM Calls
- **Rationale:** Simpler implementation, acceptable latency for conversation
- **Trade-off:** Request blocks until LLM responds
- **Future:** Could implement async streaming for faster perceived response

### 3. Fallback Response System
- **Rationale:** Ensures interview continues even without LLM
- **Trade-off:** Less intelligent responses, but maintains conversation flow
- **Benefit:** Development without Ollama running, resilience to LLM failures

### 4. SQLite Database
- **Rationale:** Zero-config, portable, sufficient for internal tool
- **Trade-off:** Not suitable for high concurrency
- **Benefit:** Single file, easy to transfer between environments

### 5. Web Speech API
- **Rationale:** No backend audio processing needed
- **Trade-off:** Browser-dependent, requires user permission
- **Benefit:** Native browser support, no additional infrastructure

---

## Security & Privacy Considerations

### Token-Based Access
- Unique tokens generated using `secrets.token_urlsafe(32)`
- No authentication required for participants (frictionless access)
- Tokens are unguessable and single-use per participant

### Guardrails
- Prohibited topics: passwords, credit cards, social security numbers
- Turn limits prevent runaway conversations
- Timebox limits prevent excessive resource usage

### Data Storage
- All conversations stored in local SQLite database
- No external data transmission (except to LLM provider)
- Participant email addresses stored for tracking, not for authentication

---

## API Endpoint Reference

### Project Management
- `GET /api/projects?user_email={email}` - List user's projects
- `POST /api/projects` - Create project
- `GET /api/projects/{id}` - Get project details
- `PATCH /api/projects/{id}` - Update project
- `GET /api/projects/{id}/instances` - Get project's instances

### Instance Management
- `POST /api/instances` - Create interview instance
- `GET /api/instances/{id}` - Get instance details
- `PATCH /api/instances/{id}` - Update instance
- `POST /api/instances/{id}/activate` - Activate instance
- `GET /api/instances/{id}/participants` - List participants

### Participant Management
- `POST /api/instances/{id}/participants` - Add participant
- `GET /api/interview/{token}` - Get interview by token

### Anonymous Links
- `GET /api/instances/{id}/anonymous-link` - Get/create anonymous link
- `PATCH /api/instances/{id}/anonymous-link` - Update link settings

### Interview Sessions
- `POST /api/interview/{token}/start` - Start interview session
- `POST /api/sessions/{id}/chat` - Send message, get response
- `POST /api/sessions/{id}/end` - End session
- `GET /api/sessions/{id}/messages` - Get conversation history
- `GET /api/sessions/{id}/insights` - Get extracted insights

---

## Future Enhancements

### Planned Features
- **Insight Extraction:** Automated analysis of conversations to extract themes, pain points, and quotes
- **Admin Dashboard:** View all interviews, completion rates, and aggregated insights
- **Email Integration:** Automated interview invitations via SendGrid
- **Export Functionality:** Download transcripts as JSON/CSV
- **Analytics:** Completion rates, average duration, response quality metrics

### Potential Improvements
- **Streaming Responses:** Real-time LLM output for faster perceived response
- **Multi-Language Support:** Internationalization for global teams
- **Custom Question Templates:** Pre-built question sets per agent type
- **Slack Integration:** Notifications and interview triggers
- **Advanced Insight Extraction:** Sentiment analysis, theme clustering, opportunity scoring

---

## Deployment Architecture

### Development Environment
- Backend: `uvicorn backend.main:app --reload --port 8000`
- Frontend: `npm run dev` (Vite dev server, port 5173)
- Admin Frontend: `npm run dev` (Next.js, port 3000)
- Ollama: `http://localhost:11434`

### Production Environment (Planned)
- Backend: FastAPI on company server
- Frontend: Static build deployed to CDN or company intranet
- LLM: AWS Bedrock endpoint via LiteLLM
- Database: SQLite file on server (or migrate to PostgreSQL for scale)

---

## Summary

The Discovery Agent platform automates continuous discovery interviews through three specialized AI agents (Explorer, Inquisitor, Validator), each designed for specific stages of the product discovery process. The platform handles the entire interview lifecycle from configuration to execution to insight extraction, enabling product teams to gather structured feedback from employees without manual interview scheduling. The voice-first interface and intelligent fallback system ensure a smooth interview experience, while the flexible distribution methods (individual links and anonymous links) support various research scenarios.
