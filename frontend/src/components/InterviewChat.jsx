import React, { useEffect, useRef } from 'react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { VoiceButton } from './VoiceButton';
import { useChat } from '../hooks/useChat';
import { useVoice } from '../hooks/useVoice';

export function InterviewChat({ token, onEnd }) {
  const messagesEndRef = useRef(null);
  const {
    messages,
    isLoading,
    turnCount,
    error,
    startSession,
    sendMessage,
    endSession,
  } = useChat();

  const {
    isListening,
    isSpeaking,
    transcript,
    isSupported,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    setTranscript,
  } = useVoice();

  // Start session on mount
  useEffect(() => {
    startSession(token).then((data) => {
      if (data?.opening_message) {
        speak(data.opening_message);
      }
    }).catch(console.error);
  }, [token]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle voice transcript
  useEffect(() => {
    if (transcript && !isListening) {
      handleSend(transcript, true);
      setTranscript('');
    }
  }, [isListening]);

  const handleSend = async (content, audioInput = false) => {
    try {
      const response = await sendMessage(content, audioInput);
      if (response && isSupported) {
        speak(response);
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const handleVoicePress = () => {
    stopSpeaking();
    startListening();
  };

  const handleVoiceRelease = () => {
    stopListening();
  };

  const handleEndInterview = async () => {
    await endSession();
    onEnd?.();
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Discovery Interview</h1>
          <p className="text-sm text-gray-500">Turn {turnCount}</p>
        </div>
        <button
          onClick={handleEndInterview}
          className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          End Interview
        </button>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded-lg mb-4">
            {error}
          </div>
        )}
        {messages.map((message, index) => (
          <ChatMessage key={index} message={message} />
        ))}
        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="chat-bubble-assistant">
              <span className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </span>
            </div>
          </div>
        )}
        {isListening && transcript && (
          <div className="flex justify-end mb-4">
            <div className="chat-bubble-user opacity-60">
              {transcript}...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="bg-white border-t px-6 py-4">
        <div className="flex items-center gap-4">
          {isSupported && (
            <VoiceButton
              isListening={isListening}
              isSpeaking={isSpeaking}
              onPress={handleVoicePress}
              onRelease={handleVoiceRelease}
              disabled={isLoading}
            />
          )}
          <div className="flex-1">
            <ChatInput
              onSend={(text) => handleSend(text, false)}
              disabled={isLoading || isListening}
              placeholder={isListening ? "Listening..." : "Type or hold mic to speak..."}
            />
          </div>
        </div>
        {isSupported && (
          <p className="text-center text-xs text-gray-400 mt-2">
            Hold the mic button to speak, or type your response
          </p>
        )}
      </div>
    </div>
  );
}
