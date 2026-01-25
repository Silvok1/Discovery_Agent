"""Base agent class for interview agents."""
from typing import Optional
from .prompts import EXPLORER_PROMPT, INQUISITOR_PROMPT, VALIDATOR_PROMPT


class BaseAgent:
    """Base class for interview agents."""

    def __init__(self, agent_type: str, context: dict):
        self.agent_type = agent_type
        self.context = context
        self.conversation_history = []
        self.system_prompt = self._get_system_prompt()
        self.turn_count = 0
        self.max_turns = context.get("max_turns", 20)

    def _get_system_prompt(self) -> str:
        prompts = {
            "explorer": EXPLORER_PROMPT,
            "inquisitor": INQUISITOR_PROMPT,
            "validator": VALIDATOR_PROMPT,
        }
        template = prompts.get(self.agent_type, EXPLORER_PROMPT)
        return template.format(**self.context)

    def chat(self, user_message: str) -> str:
        if not self._check_guardrails(user_message):
            return "I can't discuss that topic. Let's continue with the interview."

        self.turn_count += 1
        return self._generate_response(user_message)

    def _check_guardrails(self, message: str) -> bool:
        if self.turn_count >= self.max_turns:
            return False
        return True

    def _generate_response(self, user_message: str) -> str:
        raise NotImplementedError("Implement with LLM provider")

    def get_conversation_history(self) -> list:
        return self.conversation_history
