import React, { useState, useEffect } from 'react';
import { getSelectedQuestions, FollowUpQuestion } from '../../services/followUpQuestionsService';

interface QuestionPracticeModalProps {
  sessionId: string;
  isOpen: boolean;
  onClose: () => void;
  onStartNewSession?: () => void;
}

const QuestionPracticeModal: React.FC<QuestionPracticeModalProps> = ({
  sessionId,
  isOpen,
  onClose,
  onStartNewSession
}) => {
  const [questions, setQuestions] = useState<FollowUpQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadSelectedQuestions();
    }
  }, [isOpen, sessionId]);

  const loadSelectedQuestions = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: questionsError } = await getSelectedQuestions(sessionId);
      
      if (questionsError) {
        setError(questionsError);
        return;
      }

      setQuestions(data);
      setCurrentQuestionIndex(0);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleStartNewSession = () => {
    onClose();
    onStartNewSession?.();
  };

  const getCategoryName = (category: string) => {
    const categoryNames: Record<string, string> = {
      business_model: 'Business Model',
      market: 'Market & Competition',
      financials: 'Financials',
      team: 'Team & Execution',
      growth: 'Growth Strategy',
      general: 'General'
    };
    return categoryNames[category] || category;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Practice Questions
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading questions...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">Failed to load questions</p>
              <button 
                onClick={loadSelectedQuestions}
                className="text-blue-600 hover:text-blue-800"
              >
                Try again
              </button>
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">No questions selected for practice</p>
              <button
                onClick={onClose}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Go back to select questions
              </button>
            </div>
          ) : (
            <div>
              {/* Progress indicator */}
              <div className="mb-6">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
                  <span>{getCategoryName(questions[currentQuestionIndex].category)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Current question */}
              <div className="mb-8">
                <div className="mb-3">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(questions[currentQuestionIndex].difficulty)}`}>
                    {questions[currentQuestionIndex].difficulty}
                  </span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {questions[currentQuestionIndex].question}
                </h3>
                
                {/* Practice area */}
                <div className="bg-gray-50 rounded-lg p-4 min-h-[200px]">
                  <p className="text-sm text-gray-600 mb-3">
                    Take your time to think through your answer. You can practice out loud or jot down key points.
                  </p>
                  <textarea
                    placeholder="Write your thoughts or key points here..."
                    className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <button
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0}
                  className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>

                <div className="flex space-x-3">
                  {currentQuestionIndex === questions.length - 1 ? (
                    <button
                      onClick={handleStartNewSession}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                    >
                      Start New AI Session
                    </button>
                  ) : (
                    <button
                      onClick={handleNext}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                    >
                      Next Question
                    </button>
                  )}
                </div>
              </div>

              {/* Tips */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">💡 Practice Tips</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Practice answering out loud to improve your delivery</li>
                  <li>• Keep your answers concise and focused</li>
                  <li>• Use specific examples and metrics when possible</li>
                  <li>• After practicing, consider starting a new AI session to test your improvements</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionPracticeModal;