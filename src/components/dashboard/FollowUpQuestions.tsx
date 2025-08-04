import React, { useState, useEffect } from 'react';
import { 
  getFollowUpQuestions, 
  getQuestionsByCategory, 
  toggleQuestionSelection,
  getSelectedQuestions,
  createPracticeSession,
  FollowUpQuestion,
  getQuestionCategories
} from '../../services/followUpQuestionsService';

interface FollowUpQuestionsProps {
  sessionId: string;
  onStartPractice?: (practiceSessionId: string) => void;
}

const FollowUpQuestions: React.FC<FollowUpQuestionsProps> = ({ 
  sessionId, 
  onStartPractice 
}) => {
  const [questions, setQuestions] = useState<Record<string, FollowUpQuestion[]>>({});
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const questionCategories = getQuestionCategories();

  useEffect(() => {
    loadQuestions();
  }, [sessionId]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: questionsError } = await getQuestionsByCategory(sessionId);
      
      if (questionsError) {
        setError(questionsError);
        return;
      }

      setQuestions(data);

      // Load selected questions
      const { data: selected, error: selectedError } = await getSelectedQuestions(sessionId);
      if (!selectedError) {
        setSelectedQuestions(selected.map(q => q.id));
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionToggle = async (questionId: string, isSelected: boolean) => {
    try {
      const { success, error } = await toggleQuestionSelection(questionId, isSelected);
      
      if (success) {
        if (isSelected) {
          setSelectedQuestions(prev => [...prev, questionId]);
        } else {
          setSelectedQuestions(prev => prev.filter(id => id !== questionId));
        }
      } else {
        console.error('Failed to toggle question selection:', error);
      }
    } catch (err) {
      console.error('Error toggling question selection:', err);
    }
  };

  const handleStartPractice = async () => {
    if (selectedQuestions.length === 0) {
      alert('Please select at least one question to practice with.');
      return;
    }

    try {
      const { success, practiceSessionId, error } = await createPracticeSession(
        sessionId, 
        selectedQuestions
      );

      if (success && practiceSessionId) {
        onStartPractice?.(practiceSessionId);
      } else {
        console.error('Failed to create practice session:', error);
        alert('Failed to start practice session. Please try again.');
      }
    } catch (err) {
      console.error('Error starting practice session:', err);
      alert('Failed to start practice session. Please try again.');
    }
  };

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const getCategoryInfo = (categoryId: string) => {
    return questionCategories.find(cat => cat.id === categoryId);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="glass-dark rounded-lg border border-slate-700/30 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-4 bg-slate-700 rounded w-full"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-dark rounded-lg border border-slate-700/30 p-6">
        <div className="text-center text-red-400">
          <p>Failed to load follow-up questions</p>
          <button 
            onClick={loadQuestions}
            className="mt-2 text-sm text-indigo-400 hover:text-indigo-300"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const totalQuestions = Object.values(questions).flat().length;

  if (totalQuestions === 0) {
    return (
      <div className="glass-dark rounded-lg border border-slate-700/30 p-6">
        <h3 className="text-lg font-semibold text-white mb-2">
          Follow-up Questions
        </h3>
        <p className="text-slate-300">
          No follow-up questions available yet. Questions will be generated after your conversation analysis is complete.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-dark rounded-lg border border-slate-700/30 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">
          Follow-up Questions
        </h3>
        <span className="text-sm text-slate-400">
          {selectedQuestions.length} of {totalQuestions} selected
        </span>
      </div>

      <p className="text-slate-300 mb-6">
        Practice with these questions to improve your pitch. Select the ones you'd like to focus on.
      </p>

      <div className="space-y-4">
        {Object.entries(questions).map(([categoryId, categoryQuestions]) => {
          const categoryInfo = getCategoryInfo(categoryId);
          const isExpanded = expandedCategories.has(categoryId);
          
          return (
            <div key={categoryId} className="border border-slate-600/30 rounded-lg">
              <button
                onClick={() => toggleCategory(categoryId)}
                className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-slate-700/30"
              >
                <div>
                  <h4 className="font-medium text-white">
                    {categoryInfo?.name || categoryId}
                  </h4>
                  <p className="text-sm text-slate-400">
                    {categoryInfo?.description}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-slate-400">
                    {categoryQuestions.length} questions
                  </span>
                  <svg
                    className={`w-5 h-5 text-slate-400 transform transition-transform ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 space-y-3">
                  {categoryQuestions.map((question) => (
                    <div key={question.id} className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        id={question.id}
                        checked={selectedQuestions.includes(question.id)}
                        onChange={(e) => handleQuestionToggle(question.id, e.target.checked)}
                        className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-600 rounded bg-slate-700"
                      />
                      <div className="flex-1">
                        <label 
                          htmlFor={question.id}
                          className="text-sm text-slate-300 cursor-pointer"
                        >
                          {question.question}
                        </label>
                        <div className="mt-1">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
                            {question.difficulty}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedQuestions.length > 0 && (
        <div className="mt-6 pt-4 border-t border-slate-600/30">
          <button
            onClick={handleStartPractice}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Start Practice Session ({selectedQuestions.length} questions)
          </button>
        </div>
      )}
    </div>
  );
};

export default FollowUpQuestions;