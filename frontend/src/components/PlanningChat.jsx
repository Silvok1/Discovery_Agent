import React, { useState, useRef, useEffect } from 'react';

export function PlanningChat({
  messages,
  isLoading,
  error,
  planReady,
  draftPlan,
  onSendMessage,
  onFinalize,
  onBack,
  onEditPlan,
}) {
  const [input, setInput] = useState('');
  const [showPlanEditor, setShowPlanEditor] = useState(false);
  const [editedPlan, setEditedPlan] = useState(null);
  const [instanceName, setInstanceName] = useState('');
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize edited plan when draft plan arrives
  useEffect(() => {
    if (draftPlan && !editedPlan) {
      setEditedPlan({ ...draftPlan });
    }
  }, [draftPlan, editedPlan]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    onSendMessage(input.trim());
    setInput('');
  };

  const handleFinalize = () => {
    if (!instanceName.trim()) {
      alert('Please enter a name for your interview');
      return;
    }
    onFinalize(instanceName, editedPlan);
  };

  const handleQuestionChange = (index, value) => {
    const newQuestions = [...editedPlan.questions];
    newQuestions[index] = value;
    setEditedPlan({ ...editedPlan, questions: newQuestions });
    onEditPlan?.({ ...editedPlan, questions: newQuestions });
  };

  const handleAddQuestion = () => {
    setEditedPlan({
      ...editedPlan,
      questions: [...editedPlan.questions, ''],
    });
  };

  const handleRemoveQuestion = (index) => {
    const newQuestions = editedPlan.questions.filter((_, i) => i !== index);
    setEditedPlan({ ...editedPlan, questions: newQuestions });
    onEditPlan?.({ ...editedPlan, questions: newQuestions });
  };

  return (
    <div className="flex flex-col h-full max-h-[80vh]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h2 className="font-semibold text-gray-800">Plan Your Interview</h2>
            <p className="text-sm text-gray-500">Chat with Claude to design your interview</p>
          </div>
        </div>
        {planReady && (
          <button
            onClick={() => setShowPlanEditor(!showPlanEditor)}
            className="px-4 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
          >
            {showPlanEditor ? 'Hide Plan' : 'View Plan'}
          </button>
        )}
      </div>

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Chat area */}
        <div className={`flex flex-col ${showPlanEditor ? 'w-1/2' : 'w-full'} transition-all`}>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white shadow-sm border'
                  }`}
                >
                  <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white shadow-sm border px-4 py-3 rounded-2xl">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <form onSubmit={handleSubmit} className="p-4 bg-white border-t">
            {error && (
              <div className="mb-3 px-3 py-2 bg-red-100 text-red-700 text-sm rounded-lg">
                {error}
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                disabled={isLoading}
                className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 transition-colors"
              >
                Send
              </button>
            </div>
          </form>
        </div>

        {/* Plan editor panel */}
        {showPlanEditor && editedPlan && (
          <div className="w-1/2 border-l bg-white overflow-y-auto p-4">
            <h3 className="font-semibold text-gray-800 mb-4">Your Interview Plan</h3>

            {/* Instance Name */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Interview Name *
              </label>
              <input
                type="text"
                value={instanceName}
                onChange={(e) => setInstanceName(e.target.value)}
                placeholder="e.g., Invoice Processing Discovery"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Objective */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Objective
              </label>
              <textarea
                value={editedPlan.objective}
                onChange={(e) => {
                  setEditedPlan({ ...editedPlan, objective: e.target.value });
                  onEditPlan?.({ ...editedPlan, objective: e.target.value });
                }}
                rows={3}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>

            {/* Questions */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Key Questions to Explore
              </label>
              <div className="space-y-2">
                {editedPlan.questions.map((q, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-gray-400 text-sm pt-2">{i + 1}.</span>
                    <input
                      type="text"
                      value={q}
                      onChange={(e) => handleQuestionChange(i, e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                    <button
                      onClick={() => handleRemoveQuestion(i)}
                      className="text-red-500 hover:text-red-700 px-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={handleAddQuestion}
                className="mt-2 text-sm text-blue-500 hover:text-blue-700"
              >
                + Add question
              </button>
            </div>

            {/* Participant Profile */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Participants
              </label>
              <textarea
                value={editedPlan.participant_profile}
                onChange={(e) => {
                  setEditedPlan({ ...editedPlan, participant_profile: e.target.value });
                  onEditPlan?.({ ...editedPlan, participant_profile: e.target.value });
                }}
                rows={2}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>

            {/* Assumptions */}
            {editedPlan.assumptions && editedPlan.assumptions.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Key Assumptions to Test
                </label>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  {editedPlan.assumptions.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Finalize button */}
            <button
              onClick={handleFinalize}
              disabled={isLoading || !instanceName.trim()}
              className="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 font-medium transition-colors"
            >
              {isLoading ? 'Creating...' : 'Create Interview with This Plan'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
