import { supabase } from '../lib/supabase';

export interface FollowUpQuestion {
  id: string;
  session_id: string;
  question_text: string;
  category: 'business_model' | 'market' | 'financials' | 'team' | 'product' | 'competition' | 'general';
  difficulty_level: 'easy' | 'medium' | 'hard';
  context?: string;
  suggested_talking_points?: string[];
  created_at: string;
  is_practiced?: boolean;
  practiced_at?: string;
}

export interface QuestionGenerationRequest {
  session_id: string;
  analysis_id: string;
  custom_focus_areas?: string[];
}

export interface QuestionPracticeSession {
  id: string;
  user_id: string;
  original_session_id: string;
  question_ids: string[];
  status: 'created' | 'active' | 'completed' | 'failed';
  created_at: string;
  completed_at?: string;
}

export interface QuestionServiceError {
  code: string;
  message: string;
  details?: any;
}

/**
 * Get follow-up questions for a specific session
 */
export async function getSessionFollowUpQuestions(sessionId: string): Promise<{
  data: FollowUpQuestion[];
  error?: QuestionServiceError;
}> {
  try {
    // First check if questions exist in the analysis table
    const { data: analysis, error: analysisError } = await supabase
      .from('conversation_analysis')
      .select('follow_up_questions')
      .eq('session_id', sessionId)
      .single();

    if (analysisError) {
      if (analysisError.code === 'PGRST116') {
        // No analysis found yet
        return { data: [] };
      }

      console.error('Error fetching session analysis for questions:', analysisError);
      return {
        data: [],
        error: {
          code: 'ANALYSIS_FETCH_FAILED',
          message: 'Failed to fetch session analysis',
          details: analysisError
        }
      };
    }

    // If analysis exists and has follow_up_questions, return them
    if (analysis?.follow_up_questions && Array.isArray(analysis.follow_up_questions)) {
      return { data: analysis.follow_up_questions };
    }

    // No questions found
    return { data: [] };

  } catch (error) {
    console.error('Unexpected error in getSessionFollowUpQuestions:', error);
    return {
      data: [],
      error: {
        code: 'UNEXPECTED_ERROR',
        message: 'An unexpected error occurred while fetching questions',
        details: error
      }
    };
  }
}

/**
 * Generate follow-up questions for a session using AI analysis
 */
export async function generateFollowUpQuestions(request: QuestionGenerationRequest): Promise<{
  data: FollowUpQuestion[];
  error?: QuestionServiceError;
}> {
  try {
    // Call the Edge Function to generate questions
    const { data, error } = await supabase.functions.invoke('generate-followup-questions', {
      body: request
    });

    if (error) {
      console.error('Error generating follow-up questions:', error);
      return {
        data: [],
        error: {
          code: 'GENERATION_FAILED',
          message: 'Failed to generate follow-up questions',
          details: error
        }
      };
    }

    return { data: data.questions || [] };

  } catch (error) {
    console.error('Unexpected error in generateFollowUpQuestions:', error);
    return {
      data: [],
      error: {
        code: 'UNEXPECTED_ERROR',
        message: 'An unexpected error occurred while generating questions',
        details: error
      }
    };
  }
}

/**
 * Mark a question as practiced
 */
export async function markQuestionPracticed(questionId: string): Promise<{
  success: boolean;
  error?: QuestionServiceError;
}> {
  try {
    const { error } = await supabase
      .from('conversation_analysis')
      .update({
        follow_up_questions: supabase.rpc('mark_question_practiced', {
          question_id: questionId,
          practiced_at: new Date().toISOString()
        })
      });

    if (error) {
      console.error('Error marking question as practiced:', error);
      return {
        success: false,
        error: {
          code: 'UPDATE_FAILED',
          message: 'Failed to mark question as practiced',
          details: error
        }
      };
    }

    return { success: true };

  } catch (error) {
    console.error('Unexpected error in markQuestionPracticed:', error);
    return {
      success: false,
      error: {
        code: 'UNEXPECTED_ERROR',
        message: 'An unexpected error occurred while updating question',
        details: error
      }
    };
  }
}