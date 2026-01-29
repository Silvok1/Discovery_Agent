import React, { useState } from 'react';
import { PlanningChat } from './PlanningChat';
import { usePlanningChat } from '../hooks/usePlanningChat';

const API_BASE = '/api';

export function SetupPage({ onStartInterview }) {
  // Setup mode: 'choice', 'quick', 'planning', 'invite', 'ready'
  const [mode, setMode] = useState('choice');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form state
  const [userEmail, setUserEmail] = useState('');
  const [instanceName, setInstanceName] = useState('');
  const [objective, setObjective] = useState('');

  const [participantEmail, setParticipantEmail] = useState('');
  const [participantName, setParticipantName] = useState('');
  const [participantBackground, setParticipantBackground] = useState('');

  const [instanceId, setInstanceId] = useState(null);
  const [interviewToken, setInterviewToken] = useState(null);

  // Planning chat hook
  const {
    messages,
    isLoading: planningLoading,
    error: planningError,
    planReady,
    draftPlan,
    startPlanningSession,
    sendMessage,
    finalizePlan,
    reset: resetPlanning,
    setDraftPlan,
  } = usePlanningChat();

  // Handle quick setup flow (original)
  const handleCreateInstance = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Create user if needed
      await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail }),
      });

      // Create instance (always explorer)
      const instanceRes = await fetch(`${API_BASE}/instances?user_email=${encodeURIComponent(userEmail)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: instanceName,
          agent_type: 'explorer',
          objective: objective,
        }),
      });

      if (!instanceRes.ok) throw new Error('Failed to create interview');

      const instance = await instanceRes.json();
      setInstanceId(instance.id);

      // Activate instance
      await fetch(`${API_BASE}/instances/${instance.id}/activate`, {
        method: 'POST',
      });

      setMode('invite');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle starting planning mode
  const handleStartPlanning = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      await startPlanningSession(userEmail);
      setMode('planning');
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle finalizing the plan and creating instance
  const handleFinalizePlan = async (name, editedPlan) => {
    try {
      const result = await finalizePlan(name, editedPlan || {});
      setInstanceId(result.instance_id);
      setInstanceName(name);

      // Activate instance
      await fetch(`${API_BASE}/instances/${result.instance_id}/activate`, {
        method: 'POST',
      });

      setMode('invite');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddParticipant = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/instances/${instanceId}/participants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: participantEmail,
          name: participantName,
          background: participantBackground,
        }),
      });

      if (!res.ok) throw new Error('Failed to add participant');

      const participant = await res.json();
      setInterviewToken(participant.unique_token);
      setMode('ready');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMode('choice');
    setInstanceId(null);
    setInterviewToken(null);
    setInstanceName('');
    setObjective('');
    setParticipantEmail('');
    setParticipantName('');
    setParticipantBackground('');
    resetPlanning();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header - only show on non-planning modes */}
        {mode !== 'planning' && (
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Process Discovery Platform
            </h1>
            <p className="text-gray-600">
              Conduct structured interviews to understand workflows and identify automation opportunities
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-3 rounded-lg mb-6 max-w-2xl mx-auto">
            {error}
          </div>
        )}

        {/* Choice Screen */}
        {mode === 'choice' && (
          <div className="max-w-2xl mx-auto">
            <form onSubmit={(e) => e.preventDefault()} className="bg-white rounded-xl shadow-lg p-8 mb-6">
              <h2 className="text-xl font-semibold mb-6">Get Started</h2>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Email
                </label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="pm@company.com"
                />
              </div>
            </form>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Quick Setup Card */}
              <button
                onClick={() => userEmail ? setMode('quick') : setError('Please enter your email first')}
                className="bg-white rounded-xl shadow-lg p-6 text-left hover:shadow-xl transition-shadow border-2 border-transparent hover:border-blue-200"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Quick Setup</h3>
                <p className="text-gray-600 text-sm">
                  I know what process I want to explore. Let me set up the interview directly.
                </p>
              </button>

              {/* Plan with Claude Card */}
              <button
                onClick={handleStartPlanning}
                disabled={!userEmail || planningLoading}
                className="bg-white rounded-xl shadow-lg p-6 text-left hover:shadow-xl transition-shadow border-2 border-transparent hover:border-purple-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Plan with Claude</h3>
                <p className="text-gray-600 text-sm">
                  Help me think through what to explore. I'll chat with Claude to design my interview plan.
                </p>
              </button>
            </div>
          </div>
        )}

        {/* Quick Setup Form */}
        {mode === 'quick' && (
          <form onSubmit={handleCreateInstance} className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Quick Setup</h2>
              <button
                type="button"
                onClick={() => setMode('choice')}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Interview Name
              </label>
              <input
                type="text"
                value={instanceName}
                onChange={(e) => setInstanceName(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Invoice Processing Discovery"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                What process are we exploring?
              </label>
              <textarea
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., How the team handles monthly expense reports, including approval workflows and data entry..."
              />
              <p className="text-sm text-gray-500 mt-1">
                Describe the workflow or process area you want to understand better
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 font-medium transition-colors"
            >
              {isLoading ? 'Creating...' : 'Create Interview'}
            </button>
          </form>
        )}

        {/* Planning Chat Mode */}
        {mode === 'planning' && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-4xl mx-auto" style={{ height: '80vh' }}>
            <PlanningChat
              messages={messages}
              isLoading={planningLoading}
              error={planningError}
              planReady={planReady}
              draftPlan={draftPlan}
              onSendMessage={sendMessage}
              onFinalize={handleFinalizePlan}
              onBack={() => setMode('choice')}
              onEditPlan={setDraftPlan}
            />
          </div>
        )}

        {/* Invite Participant Step */}
        {mode === 'invite' && (
          <form onSubmit={handleAddParticipant} className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold mb-6">Add Participant</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Participant Email
              </label>
              <input
                type="email"
                value={participantEmail}
                onChange={(e) => setParticipantEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="colleague@company.com"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Participant Name
              </label>
              <input
                type="text"
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Jane Doe"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role/Team (Optional)
              </label>
              <textarea
                value={participantBackground}
                onChange={(e) => setParticipantBackground(e.target.value)}
                rows={2}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Finance team, handles AP/AR, 3 years in role..."
              />
              <p className="text-sm text-gray-500 mt-1">
                This helps the interviewer ask better questions
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 font-medium transition-colors"
            >
              {isLoading ? 'Adding...' : 'Add Participant & Generate Link'}
            </button>
          </form>
        )}

        {/* Ready Step */}
        {mode === 'ready' && (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">Interview Ready!</h2>
            <p className="text-gray-600 mb-6">
              Share the link with your participant or start the interview now.
            </p>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-500 mb-2">Interview Link:</p>
              <code className="text-sm text-blue-600 break-all">
                {window.location.origin}/interview/{interviewToken}
              </code>
            </div>

            <button
              onClick={() => onStartInterview(interviewToken)}
              className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium transition-colors"
            >
              Start Interview Now
            </button>

            <button
              onClick={handleReset}
              className="w-full py-3 mt-3 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Create Another Interview
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
