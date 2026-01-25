import React from 'react';

export function ChatMessage({ message }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={isUser ? 'chat-bubble-user' : 'chat-bubble-assistant'}>
        {message.content}
      </div>
    </div>
  );
}
