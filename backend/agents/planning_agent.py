"""Planning Agent for collaborative interview planning with PMs."""
import os
import re
import json
from typing import Optional
from .prompts import PLANNING_PROMPT


class PlanningAgent:
    """Agent that helps PMs plan their discovery interviews through conversation."""

    FALLBACK_RESPONSES = [
        "Tell me more about what triggered your interest in this area.",
        "What do you already know about how this process works today?",
        "If these interviews go well, what decision will you be able to make?",
        "Who are the people that do this work most frequently?",
        "What's your biggest uncertainty about this process?",
        "What would surprise you to learn from these interviews?",
        "Is there a specific pain point you've heard about, or are you exploring broadly?",
        "How urgent is understanding this? What's driving the timeline?",
        "Have you talked to anyone about this informally already? What did you learn?",
        "What assumptions do you have that you'd want to validate?",
    ]

    # Marker that indicates the agent has presented a plan
    PLAN_MARKER = "## Interview Plan"

    def __init__(
        self,
        model: Optional[str] = None,
        api_base: Optional[str] = None
    ):
        self.conversation_history = []
        self.turn_count = 0
        self.plan_presented = False
        self.draft_plan = None

        # LLM configuration
        self.model = model or os.getenv("LLM_MODEL", "ollama/llama3.2")
        self.api_base = api_base or os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
        self.use_mock = os.getenv("USE_MOCK_LLM", "false").lower() == "true"

        self.system_prompt = PLANNING_PROMPT

    def get_opening_message(self) -> str:
        """Generate the opening message for the planning conversation."""
        return (
            "Hi! I'm here to help you plan your discovery interviews. "
            "Tell me a bit about what you're hoping to explore - what process or workflow "
            "are you curious about, and what prompted you to look into it?"
        )

    def _get_fallback_response(self, user_message: str) -> str:
        """Get a contextual fallback response when LLM is unavailable."""
        import random
        used = [msg["content"] for msg in self.conversation_history if msg["role"] == "assistant"]
        available = [r for r in self.FALLBACK_RESPONSES if r not in used]

        if not available:
            available = self.FALLBACK_RESPONSES

        return random.choice(available)

    def _call_llm_sync(self, messages: list) -> Optional[str]:
        """Call the LLM synchronously and return the response."""
        try:
            from litellm import completion

            response = completion(
                model=self.model,
                messages=messages,
                api_base=self.api_base,
                temperature=0.7,
                max_tokens=1000,  # Longer for plan generation
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"LLM call failed: {e}")
            return None

    def _parse_plan_from_response(self, response: str) -> Optional[dict]:
        """Extract structured plan from the agent's response if present."""
        if self.PLAN_MARKER not in response:
            return None

        try:
            plan = {
                "objective": "",
                "questions": [],
                "participant_profile": "",
                "assumptions": []
            }

            # Extract objective
            obj_match = re.search(r'\*\*Objective:\*\*\s*(.+?)(?=\n\n|\n\*\*)', response, re.DOTALL)
            if obj_match:
                plan["objective"] = obj_match.group(1).strip()

            # Extract questions
            questions_match = re.search(
                r'\*\*Key Questions to Explore:\*\*\s*\n((?:\d+\..+\n?)+)',
                response,
                re.DOTALL
            )
            if questions_match:
                questions_text = questions_match.group(1)
                questions = re.findall(r'\d+\.\s*(.+?)(?=\n\d+\.|\n\n|\n\*\*|$)', questions_text, re.DOTALL)
                plan["questions"] = [q.strip() for q in questions if q.strip()]

            # Extract participant profile
            participant_match = re.search(
                r'\*\*Target Participants:\*\*\s*\n?(.+?)(?=\n\n\*\*|\n---|\Z)',
                response,
                re.DOTALL
            )
            if participant_match:
                plan["participant_profile"] = participant_match.group(1).strip()

            # Extract assumptions
            assumptions_match = re.search(
                r'\*\*Key Assumptions to Test:\*\*\s*\n((?:-\s*.+\n?)+)',
                response,
                re.DOTALL
            )
            if assumptions_match:
                assumptions_text = assumptions_match.group(1)
                assumptions = re.findall(r'-\s*(.+?)(?=\n-|\n\n|$)', assumptions_text, re.DOTALL)
                plan["assumptions"] = [a.strip() for a in assumptions if a.strip()]

            # Validate we got meaningful content
            if plan["objective"] and plan["questions"]:
                return plan
            return None

        except Exception as e:
            print(f"Failed to parse plan: {e}")
            return None

    async def chat(self, user_message: str) -> tuple[str, bool, Optional[dict]]:
        """
        Process a user message and return agent response.

        Returns:
            tuple: (response_text, plan_ready, draft_plan)
        """
        # Add user message to history
        self.conversation_history.append({
            "role": "user",
            "content": user_message
        })

        assistant_message = None

        # Try LLM first if not in mock mode
        if not self.use_mock:
            messages = [
                {"role": "system", "content": self.system_prompt},
                *self.conversation_history
            ]
            assistant_message = self._call_llm_sync(messages)

        # Fallback to predefined responses if LLM fails or mock mode
        if assistant_message is None:
            assistant_message = self._get_fallback_response(user_message)

        # Check if plan is present in response
        draft_plan = self._parse_plan_from_response(assistant_message)
        plan_ready = draft_plan is not None

        if plan_ready:
            self.plan_presented = True
            self.draft_plan = draft_plan

        # Add to history
        self.conversation_history.append({
            "role": "assistant",
            "content": assistant_message
        })

        self.turn_count += 1
        return assistant_message, plan_ready, draft_plan

    def get_current_plan(self) -> Optional[dict]:
        """Get the current draft plan if one has been presented."""
        return self.draft_plan

    def get_conversation_summary(self) -> dict:
        """Get a summary of the planning conversation."""
        return {
            "turn_count": self.turn_count,
            "messages": len(self.conversation_history),
            "plan_presented": self.plan_presented,
            "has_draft_plan": self.draft_plan is not None,
        }
