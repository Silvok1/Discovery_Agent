"""LLM-powered agent implementation using LiteLLM."""
import os
import random
from typing import Optional
from .prompts import EXPLORER_PROMPT


class LLMAgent:
    """Agent that uses LiteLLM for conversation."""

    # Fallback responses for internal workflow discovery
    FALLBACK_RESPONSES = [
        "Walk me through the last time you did that, step by step.",
        "How much time does that usually take you? How often do you do it?",
        "What tools or systems are you jumping between for that?",
        "Is there any copy-paste or manual data entry involved?",
        "What's the most tedious part of that process?",
        "Have you found any workarounds to make it faster?",
        "Who else touches this process? Any handoffs or waiting?",
        "What triggers this task? An email, a ticket, a deadline?",
        "When was the last time something went wrong with this process?",
        "What do you do when that happens?",
    ]

    def __init__(
        self,
        agent_type: str,
        context: dict,
        model: Optional[str] = None,
        api_base: Optional[str] = None
    ):
        self.agent_type = "explorer"  # Always explorer now
        self.context = context
        self.conversation_history = []
        self.turn_count = 0
        self.max_turns = context.get("max_turns", 20)

        # LLM configuration
        self.model = model or os.getenv("LLM_MODEL", "ollama/llama3.2")
        self.api_base = api_base or os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
        self.use_mock = os.getenv("USE_MOCK_LLM", "false").lower() == "true"

        # Build system prompt
        self.system_prompt = self._build_system_prompt()

        # Track if LLM is available
        self._llm_available = None

    def _build_system_prompt(self) -> str:
        """Build the system prompt with context variables."""
        # Fill in context variables with defaults for missing keys
        context_with_defaults = {
            "participant_name": self.context.get("participant_name", "Participant"),
            "participant_background": self.context.get("participant_background", "Not provided"),
            "objective": self.context.get("objective", "General process discovery"),
            "timebox_minutes": self.context.get("timebox_minutes", 10),
        }

        return EXPLORER_PROMPT.format(**context_with_defaults)

    def _check_guardrails(self, message: str) -> tuple[bool, Optional[str]]:
        """Check if the message passes guardrails."""
        if self.turn_count >= self.max_turns:
            return False, "We've reached the end of our conversation. Thank you for your time and valuable insights!"

        prohibited = ["password", "credit card", "social security"]
        message_lower = message.lower()
        for term in prohibited:
            if term in message_lower:
                return False, "I can't discuss that topic. Let's continue with the interview."

        return True, None

    def get_opening_message(self) -> str:
        """Generate an opening message for the conversation."""
        objective = self.context.get('objective', 'your daily workflows')
        return f"Hey! Thanks for chatting with me. I'm trying to understand how your team handles {objective} so we can find opportunities to make things easier. To kick things off - what's a task you do regularly that feels repetitive or takes longer than it should?"

    def _get_fallback_response(self, user_message: str) -> str:
        """Get a contextual fallback response when LLM is unavailable."""
        # Try to pick a response that hasn't been used recently
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
                max_tokens=500,
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"LLM call failed: {e}")
            return None

    async def chat(self, user_message: str) -> str:
        """Process a user message and return agent response."""
        # Check guardrails
        passed, guardrail_response = self._check_guardrails(user_message)
        if not passed:
            return guardrail_response

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

        # Add to history
        self.conversation_history.append({
            "role": "assistant",
            "content": assistant_message
        })

        self.turn_count += 1
        return assistant_message

    def get_conversation_summary(self) -> dict:
        """Get a summary of the conversation."""
        return {
            "agent_type": self.agent_type,
            "turn_count": self.turn_count,
            "messages": len(self.conversation_history),
            "max_turns": self.max_turns,
        }
