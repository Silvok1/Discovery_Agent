# Collaborative Planning Feature Design

## Overview

This feature adds a conversational planning mode where PMs can work with Claude to develop their interview plan, as an alternative to the existing quick setup wizard.

## User Flow

```
PM lands on Setup Page
         |
         v
+--------------------------------------------------+
|   "How would you like to create your interview?" |
|                                                  |
|  +-------------------+    +--------------------+ |
|  |   Quick Setup     |    |  Plan with Claude  | |
|  |   -------------   |    |  ----------------  | |
|  |   I already know  |    |   Help me think    | |
|  |   what I want to  |    |   through what     | |
|  |   explore         |    |   to explore       | |
|  +-------------------+    +--------------------+ |
+--------------------------------------------------+
         |                           |
         v                           v
  Original 3-step wizard     Planning Conversation
                                     |
                                     v
                            +------------------+
                            | Review & Confirm |
                            | - Objective      |
                            | - Key questions  |
                            | - Participant    |
                            |   profile        |
                            +------------------+
                                     |
                                     v
                            Both paths converge:
                            Add Participants
```

## Database Schema Changes

### New Table: `planning_sessions`

```sql
CREATE TABLE IF NOT EXISTS planning_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    status TEXT CHECK(status IN ('active', 'completed', 'abandoned')) DEFAULT 'active',

    -- Generated plan (populated during/after conversation)
    generated_objective TEXT,
    generated_questions JSON,
    target_participant_profile TEXT,
    key_assumptions JSON,

    -- Metadata
    turn_count INTEGER DEFAULT 0,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### New Table: `planning_messages`

```sql
CREATE TABLE IF NOT EXISTS planning_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    planning_session_id INTEGER NOT NULL,
    role TEXT CHECK(role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (planning_session_id) REFERENCES planning_sessions(id)
);
```

### Modified Table: `instances`

Add column to track how the instance was created:

```sql
ALTER TABLE instances ADD COLUMN planning_session_id INTEGER REFERENCES planning_sessions(id);
ALTER TABLE instances ADD COLUMN created_via TEXT CHECK(created_via IN ('quick_setup', 'collaborative_planning')) DEFAULT 'quick_setup';
```

## Planning Agent Design

### Goals

The Planning Agent helps PMs:
1. **Clarify the scope** - What process/workflow are they trying to understand?
2. **Surface assumptions** - What do they think they know? What needs validation?
3. **Define success** - What would a good interview reveal?
4. **Identify participants** - Who are the right people to talk to?
5. **Generate questions** - What specific things should the interviewer explore?

### Planning Agent Prompt

```
You are a research planning assistant helping a product manager prepare for
discovery interviews with internal employees. Your goal is to help them create
a focused, effective interview plan.

CONVERSATION FLOW:

1. UNDERSTAND THE CONTEXT (2-3 exchanges)
   - What area of the business are they exploring?
   - What triggered this research? (complaint, hunch, request, etc.)
   - What do they already know about this process?

2. CLARIFY THE GOAL (2-3 exchanges)
   - What decision will this research inform?
   - What would "success" look like for these interviews?
   - Are they exploring broadly or validating something specific?

3. SURFACE ASSUMPTIONS (2-3 exchanges)
   - What do they believe is true about this process?
   - What are they most uncertain about?
   - What would change their mind?

4. DEFINE PARTICIPANT CRITERIA (1-2 exchanges)
   - Who does this process regularly?
   - Should they talk to experts, novices, or both?
   - Any specific roles or teams to include/exclude?

5. GENERATE THE PLAN (final exchange)
   - Synthesize into: objective, key questions, participant profile
   - Present for review and refinement

PRINCIPLES:
- Ask ONE question at a time
- Build on their answers, don't follow a rigid script
- Push back gently if their scope is too broad
- Help them realize what they don't know
- Keep it conversational, not interrogative

WHAT TO AVOID:
- Accepting vague goals ("I want to understand the process better")
- Letting scope creep ("while we're at it, let's also explore...")
- Leading them to predetermined conclusions
- Making assumptions about their domain

OUTPUT FORMAT:
When ready to finalize, present the plan in this structure:

---
## Interview Plan

**Objective:** [1-2 sentence description of what we're trying to learn]

**Key Questions to Explore:**
1. [Question focused on understanding the current process]
2. [Question focused on pain points/friction]
3. [Question focused on workarounds/adaptations]
4. [Question focused on impact/frequency]

**Target Participants:**
[Description of who to interview and why]

**Key Assumptions to Test:**
- [Assumption 1]
- [Assumption 2]
---

Ask if they want to modify anything before finalizing.
```

## API Endpoints

### Start Planning Session
```
POST /api/planning/start
Request: { user_email: string }
Response: {
    planning_session_id: int,
    opening_message: string
}
```

### Chat with Planning Agent
```
POST /api/planning/{planning_session_id}/chat
Request: { message: string }
Response: {
    response: string,
    turn_count: int,
    plan_ready: boolean,
    draft_plan?: {
        objective: string,
        questions: string[],
        participant_profile: string,
        assumptions: string[]
    }
}
```

### Finalize Plan and Create Instance
```
POST /api/planning/{planning_session_id}/finalize
Request: {
    name: string,  // Instance name
    objective?: string,  // Override if PM edited
    questions?: string[],  // Override if PM edited
}
Response: {
    instance_id: int,
    instance: Instance
}
```

### Get Planning Session (for resuming)
```
GET /api/planning/{planning_session_id}
Response: {
    planning_session: PlanningSession,
    messages: PlanningMessage[]
}
```

### List User's Planning Sessions
```
GET /api/planning?user_email={email}
Response: {
    planning_sessions: PlanningSession[]
}
```

## Frontend Components

### SetupChoice.jsx
The initial choice screen between Quick Setup and Plan with Claude.

### PlanningChat.jsx
Chat interface for the planning conversation. Similar to InterviewChat but:
- No voice input (planning is typically done at desk)
- Shows "draft plan" panel when agent generates one
- "Finalize Plan" button when ready
- Option to edit generated plan before finalizing

### usePlanningChat.js
Hook for managing planning session state:
- `startPlanningSession(email)`
- `sendMessage(message)`
- `finalizePlan(name, overrides)`
- `planningSession`, `messages`, `draftPlan`, `isLoading`

## State Flow

```
1. PM clicks "Plan with Claude"
   -> POST /api/planning/start
   -> Store planning_session_id
   -> Display opening message

2. PM sends messages
   -> POST /api/planning/{id}/chat
   -> Agent responds, conversation continues
   -> When agent presents plan, response includes plan_ready: true

3. PM reviews draft plan
   -> Can edit objective, questions in UI
   -> Clicks "Finalize"

4. Finalize plan
   -> POST /api/planning/{id}/finalize
   -> Creates instance with planning_session_id reference
   -> Redirects to "Add Participants" step
```

## Plan Detection Logic

The Planning Agent includes a structured plan in its response when ready. The backend detects this by looking for the "## Interview Plan" markdown header and parses the plan into structured fields.

Alternatively, we can have the agent output JSON in a specific format when ready:

```json
{
    "plan_ready": true,
    "objective": "...",
    "questions": ["...", "..."],
    "participant_profile": "...",
    "assumptions": ["...", "..."]
}
```

## Saved Plans / Templates

Planning sessions are saved automatically. PMs can:
- Resume an incomplete planning session
- View the conversation that led to a plan (from instance detail page)
- Use a completed plan as inspiration for a new one (future feature)

## Migration Path

1. Add new tables (no breaking changes)
2. Add `planning_session_id` and `created_via` columns to instances
3. Deploy backend changes
4. Deploy frontend with choice screen
5. Existing instances continue to work (created_via defaults to 'quick_setup')
