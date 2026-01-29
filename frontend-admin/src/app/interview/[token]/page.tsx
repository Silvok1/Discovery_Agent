'use client';

import { use, useEffect, useState, useRef, useCallback } from 'react';
import { Send, Mic, MicOff, Paperclip, X, FileText, Image, AlertCircle } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Fun loading messages that rotate while waiting for AI response
const THINKING_MESSAGES = [
  "Thinking about your response...",
  "Processing your insights...",
  "Considering your perspective...",
  "Analyzing what you shared...",
  "Reflecting on your answer...",
  "Formulating a follow-up...",
  "Connecting the dots...",
  "Exploring your workflow...",
];

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Attachment {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'other';
  file: File;
}

export default function InterviewPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [turnCount, setTurnCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [thinkingMessage, setThinkingMessage] = useState(THINKING_MESSAGES[0]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Voice input state
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Attachment state
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [showAttachmentWarning, setShowAttachmentWarning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check for Web Speech API support
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        setVoiceSupported(true);
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event) => {
          let finalTranscript = '';
          let interimTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }

          if (finalTranscript) {
            setInput(prev => prev + finalTranscript);
          }
        };

        recognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
  }, []);

  // Rotate thinking messages while loading
  useEffect(() => {
    if (!isLoading) return;

    const interval = setInterval(() => {
      setThinkingMessage(prev => {
        const currentIndex = THINKING_MESSAGES.indexOf(prev);
        const nextIndex = (currentIndex + 1) % THINKING_MESSAGES.length;
        return THINKING_MESSAGES[nextIndex];
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isLoading]);

  // Start session on mount
  useEffect(() => {
    const startSession = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/interview/${token}/start`, {
          method: 'POST',
        });

        if (!response.ok) {
          throw new Error('Failed to start interview');
        }

        const data = await response.json();
        setSessionId(data.session_id);
        setMessages([{ role: 'assistant', content: data.opening_message }]);
      } catch (err) {
        setError('Failed to start interview. Please check that the token is valid.');
        console.error(err);
      }
    };

    startSession();
  }, [token]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleVoice = useCallback(() => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  }, [isListening]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newAttachments: Attachment[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const type = file.type.startsWith('image/') ? 'image' :
                   file.type === 'application/pdf' ? 'pdf' : 'other';

      newAttachments.push({
        id: `${Date.now()}-${i}`,
        name: file.name,
        type,
        file,
      });
    }

    setAttachments(prev => [...prev, ...newAttachments]);
    setShowAttachmentWarning(true);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
    if (attachments.length <= 1) {
      setShowAttachmentWarning(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || !sessionId || isLoading) return;

    // Stop voice if active
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const userMessage = input.trim();

    // Add attachment context to message if present
    let messageWithContext = userMessage;
    if (attachments.length > 0) {
      const attachmentNames = attachments.map(a => a.name).join(', ');
      messageWithContext = `[User attached: ${attachmentNames}]\n\n${userMessage}`;
    }

    setInput('');
    setAttachments([]);
    setShowAttachmentWarning(false);
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);
    setThinkingMessage(THINKING_MESSAGES[0]);

    try {
      const response = await fetch(`${API_BASE}/api/sessions/${sessionId}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageWithContext,
          audio_input: false,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      setTurnCount(data.turn_count);
    } catch (err) {
      setError('Failed to send message');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndInterview = async () => {
    if (!sessionId) return;

    try {
      await fetch(`${API_BASE}/api/sessions/${sessionId}/end`, {
        method: 'POST',
      });
      window.close();
    } catch (err) {
      console.error('Failed to end session:', err);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Discovery Interview</h1>
          <p className="text-sm text-gray-500">Turn {turnCount}</p>
        </div>
        <button
          onClick={handleEndInterview}
          className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
        >
          End Interview
        </button>
      </header>

      {/* Voice tip banner */}
      {voiceSupported && turnCount === 0 && messages.length > 0 && (
        <div className="bg-blue-50 border-b border-blue-100 px-6 py-3 flex items-center gap-3">
          <Mic className="h-5 w-5 text-blue-600" />
          <p className="text-sm text-blue-700">
            <strong>Tip:</strong> Click the microphone button to speak your responses. Voice input is faster and more natural!
          </p>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-2xl rounded-lg px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-brand-teal text-white'
                  : 'bg-white text-gray-800 border border-gray-200'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 flex items-center gap-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150" />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-300" />
              </div>
              <span className="text-sm text-gray-500 italic">{thinkingMessage}</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Attachment warning */}
      {showAttachmentWarning && (
        <div className="bg-amber-50 border-t border-amber-200 px-6 py-3 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-700">
            <strong>Note:</strong> The AI can see that you attached files and their names, but cannot read their contents.
            Please describe any relevant information from the documents in your message.
          </div>
          <button
            type="button"
            onClick={() => setShowAttachmentWarning(false)}
            className="text-amber-600 hover:text-amber-800"
            title="Dismiss warning"
            aria-label="Dismiss warning"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Attachments preview */}
      {attachments.length > 0 && (
        <div className="bg-gray-50 border-t px-6 py-2 flex gap-2 flex-wrap">
          {attachments.map(attachment => (
            <div
              key={attachment.id}
              className="flex items-center gap-2 bg-white border rounded-lg px-3 py-1.5 text-sm"
            >
              {attachment.type === 'image' ? (
                <Image className="h-4 w-4 text-gray-500" />
              ) : (
                <FileText className="h-4 w-4 text-gray-500" />
              )}
              <span className="text-gray-700 max-w-[150px] truncate">{attachment.name}</span>
              <button
                type="button"
                onClick={() => removeAttachment(attachment.id)}
                className="text-gray-400 hover:text-gray-600"
                title={`Remove ${attachment.name}`}
                aria-label={`Remove ${attachment.name}`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="bg-white border-t px-6 py-4">
        <form onSubmit={handleSend} className="flex gap-3">
          {/* Attachment button */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf,.doc,.docx,.txt"
            onChange={handleFileSelect}
            className="hidden"
            aria-label="Attach files"
            title="Attach files"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading || !sessionId}
            className="flex items-center justify-center w-12 h-12 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Attach files"
          >
            <Paperclip className="h-5 w-5" />
          </button>

          {/* Text input */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isListening ? "Listening... speak now" : "Type or click mic to speak..."}
              disabled={isLoading || !sessionId}
              className={`w-full rounded-lg border px-4 py-3 pr-12 focus:outline-none focus:ring-1 disabled:bg-gray-100 ${
                isListening
                  ? 'border-red-400 focus:border-red-500 focus:ring-red-500 bg-red-50'
                  : 'border-gray-300 focus:border-brand-teal focus:ring-brand-teal'
              }`}
            />
            {/* Voice button inside input */}
            {voiceSupported && (
              <button
                type="button"
                onClick={toggleVoice}
                disabled={isLoading || !sessionId}
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors ${
                  isListening
                    ? 'bg-red-100 text-red-600 hover:bg-red-200'
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
                title={isListening ? "Stop listening" : "Start voice input"}
              >
                {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </button>
            )}
          </div>

          {/* Send button */}
          <button
            type="submit"
            disabled={isLoading || !sessionId || !input.trim()}
            className="flex items-center gap-2 rounded-lg bg-brand-teal px-6 py-3 text-white hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="h-5 w-5" />
            Send
          </button>
        </form>

        {/* Voice hint */}
        {voiceSupported && !isListening && (
          <p className="text-xs text-gray-400 mt-2 text-center">
            Press the mic button to use voice input (recommended for faster responses)
          </p>
        )}
      </div>
    </div>
  );
}

// Add type declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}
