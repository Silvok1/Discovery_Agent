import React from 'react';

export function VoiceButton({ isListening, isSpeaking, onPress, onRelease, disabled }) {
  return (
    <button
      className={`
        w-20 h-20 rounded-full flex items-center justify-center
        transition-all duration-200 select-none
        ${disabled ? 'bg-gray-300 cursor-not-allowed' : ''}
        ${isListening ? 'bg-red-500 recording-pulse scale-110' : ''}
        ${isSpeaking ? 'bg-green-500' : ''}
        ${!isListening && !isSpeaking && !disabled ? 'bg-blue-500 hover:bg-blue-600 active:scale-95' : ''}
      `}
      onMouseDown={onPress}
      onMouseUp={onRelease}
      onMouseLeave={onRelease}
      onTouchStart={onPress}
      onTouchEnd={onRelease}
      disabled={disabled}
    >
      {isListening ? (
        <MicOnIcon />
      ) : isSpeaking ? (
        <SpeakerIcon />
      ) : (
        <MicOffIcon />
      )}
    </button>
  );
}

function MicOnIcon() {
  return (
    <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
      <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
    </svg>
  );
}

function MicOffIcon() {
  return (
    <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" opacity="0.5" />
      <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" opacity="0.5" />
    </svg>
  );
}

function SpeakerIcon() {
  return (
    <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
    </svg>
  );
}
