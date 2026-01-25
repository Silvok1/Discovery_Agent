import React, { useState, useEffect } from 'react';
import { SetupPage } from './components/SetupPage';
import { InterviewChat } from './components/InterviewChat';

function App() {
  const [view, setView] = useState('setup'); // setup, interview
  const [interviewToken, setInterviewToken] = useState(null);

  // Check URL for interview token
  useEffect(() => {
    const path = window.location.pathname;
    const match = path.match(/\/interview\/(.+)/);
    if (match) {
      setInterviewToken(match[1]);
      setView('interview');
    }
  }, []);

  const handleStartInterview = (token) => {
    setInterviewToken(token);
    setView('interview');
    // Update URL without reload
    window.history.pushState({}, '', `/interview/${token}`);
  };

  const handleEndInterview = () => {
    setView('setup');
    setInterviewToken(null);
    window.history.pushState({}, '', '/');
  };

  if (view === 'interview' && interviewToken) {
    return <InterviewChat token={interviewToken} onEnd={handleEndInterview} />;
  }

  return <SetupPage onStartInterview={handleStartInterview} />;
}

export default App;
