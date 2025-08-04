import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { conversationFlowService } from '../services/conversationFlowService';
import { supabase } from '../lib/supabase';

interface ConversationButtonProps {
  className?: string;
  children?: React.ReactNode;
  companyData?: {
    company_name?: string;
    company_description?: string;
    funding_stage?: string;
    industry?: string;
    pitch_deck_url?: string;
  };
}

export const ConversationButton: React.FC<ConversationButtonProps> = ({ 
  className = '', 
  children = 'Start AI Interview',
  companyData
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleStartConversation = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Check authentication first
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        setError('❌ Please log in first to start a conversation');
        return;
      }
      
      // Create conversation session using new service
      const result = await conversationFlowService.createConversationSession(user.id, companyData);
      
      if (!result) {
        throw new Error('Failed to create conversation session');
      }
      
      // Navigate to conversation page
      navigate(`/conversation/${result.session_id}`);
      
    } catch (err) {
      let errorMessage = 'Unknown error';
      if (err instanceof Error) {
        errorMessage = err.message;
        
        // Provide helpful error messages
        if (errorMessage.includes('User not authenticated')) {
          errorMessage = 'Please log in first to start a conversation';
        } else if (errorMessage.includes('Failed to create session')) {
          errorMessage = 'Database error - please try again';
        }
      }
      
      setError(`❌ ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleStartConversation}
        disabled={isLoading}
        className={`w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        {isLoading ? 'Starting...' : children}
      </button>
      
      {error && (
        <div className={`text-sm p-2 rounded ${error.includes('✅') ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
          {error}
        </div>
      )}
    </div>
  );
};