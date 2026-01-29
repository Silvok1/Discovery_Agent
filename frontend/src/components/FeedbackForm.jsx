import React, { useState } from 'react';

export function FeedbackForm({ onSubmit, onSkip }) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showFeedbackBox = rating === 1 || rating === 2;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return;

    setIsSubmitting(true);
    try {
      await onSubmit?.({ rating, feedback: showFeedbackBox ? feedback : null });
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarIcon = ({ filled, hovered }) => (
    <svg
      className={`w-8 h-8 transition-colors ${
        filled
          ? 'text-yellow-400 fill-yellow-400'
          : hovered
          ? 'text-yellow-300 fill-yellow-300'
          : 'text-gray-300'
      }`}
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
      />
    </svg>
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
        <h2 className="text-xl font-semibold text-gray-800 text-center mb-2">
          How was your experience?
        </h2>
        <p className="text-gray-500 text-center mb-6">
          Your feedback helps us improve the interview process.
        </p>

        <form onSubmit={handleSubmit}>
          {/* Star Rating */}
          <div className="flex justify-center gap-2 mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="p-1 focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded"
                aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
              >
                <StarIcon
                  filled={star <= rating}
                  hovered={star <= hoveredRating && star > rating}
                />
              </button>
            ))}
          </div>

          {/* Rating Labels */}
          {rating > 0 && (
            <p className="text-center text-sm text-gray-600 mb-4">
              {rating === 1 && 'Poor'}
              {rating === 2 && 'Fair'}
              {rating === 3 && 'Good'}
              {rating === 4 && 'Very Good'}
              {rating === 5 && 'Excellent'}
            </p>
          )}

          {/* Feedback Text Box (shows for 1 or 2 stars) */}
          {showFeedbackBox && (
            <div className="mb-6">
              <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-2">
                How can we improve?
              </label>
              <textarea
                id="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none"
                placeholder="Please tell us what could have been better..."
              />
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onSkip}
              className="flex-1 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Skip
            </button>
            <button
              type="submit"
              disabled={rating === 0 || isSubmitting}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                rating === 0 || isSubmitting
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-teal-600 text-white hover:bg-teal-700'
              }`}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
