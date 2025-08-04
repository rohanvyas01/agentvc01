import { supabase } from '../lib/supabase';

export interface FollowUpQuestion {
  id: string;
  session_id: string;
  question: string;
  category: 'business_model' | 'market' | 'financials' | 'team' | 'competition' | 'growth' | 'general';
  difficulty: 'easy' | 'medium' | 'hard';
  is_selected: boolean;
  created_at: string;
}

export interface QuestionCategory {
  id: string;
  name: string;
  description: string;
  questions: string[];
}

// Generic follow-up questions organized by category
const GENERIC_QUESTIONS: QuestionCategory[] = [
  {
    id: 'business_model',
    name: 'Business Model',
    description: 'Questions about your revenue streams and business operations',
    questions: [
      'How do you plan to monetize your product in the first year?',
      'What are your key revenue streams and which is most important?',
      'How does your pricing strategy compare to competitors?',
      'What are your unit economics and path to profitability?',
      'How scalable is your business model?'
    ]
  },
  {
    id: 'market',
    name: 'Market & Competition',
    description: 'Questions about your target market and competitive landscape',
    questions: [
      'What is your total addressable market size?',
      'Who are your main competitors and how do you differentiate?',
      'What market trends are driving demand for your solution?',
      'How do you plan to acquire your first 1000 customers?',
      'What barriers to entry exist in your market?'
    ]
  },
  {
    id: 'financials',
    name: 'Financials',
    description: 'Questions about your financial projections and funding needs',
    questions: [
      'What are your revenue projections for the next 3 years?',
      'How much funding do you need and what will you use it for?',
      'What are your key financial metrics and milestones?',
      'When do you expect to reach break-even?',
      'What are your biggest financial risks?'
    ]
  },
  {
    id: 'team',
    name: 'Team & Execution',
    description: 'Questions about your team and execution capabilities',
    questions: [
      'What key hires do you need to make in the next 12 months?',
      'How does your team\'s background prepare you for this challenge?',
      'What are the biggest execution risks you face?',
      'How do you plan to scale your team as you grow?',
      'What domain expertise does your team bring?'
    ]
  },
  {
    id: 'growth',
    name: 'Growth Strategy',
    description: 'Questions about your growth plans and customer acquisition',
    questions: [
      'What is your customer acquisition strategy?',
      'How do you plan to scale your marketing efforts?',
      'What partnerships could accelerate your growth?',
      'How do you measure product-market fit?',
      'What are your key growth metrics?'
    ]
  },
  {
    id: 'general',
    name: 'General',
    description: 'General questions about your startup and vision',
    questions: [
      'What is your long-term vision for the company?',
      'What would success look like in 5 years?',
      'What keeps you up at night about your business?',
      'How do you handle setbacks and challenges?',
      'What advice would you give to other founders in your space?'
    ]
  }
];

/**
 * Generate follow-up questions for a completed session
 */
export async function generateFollowUpQuestions(sessionId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if questions already exist for this session
    const { data: existingQuestions, error: checkError } = await supabase
      .from('follow_up_questions')
      .select('id')
      .eq('session_id', sessionId)
      .limit(1);

    if (checkError) {
      console.error('Error checking existing questions:', checkError);
      return { success: false, error: checkError.message };
    }

    if (existingQuestions && existingQuestions.length > 0) {
      return { success: true };
    }

    // Generate questions by selecting 2-3 random questions from each category
    const questionsToInsert: Omit<FollowUpQuestion, 'id' | 'created_at'>[] = [];

    GENERIC_QUESTIONS.forEach(category => {
      // Shuffle questions and take 2-3 random ones
      const shuffledQuestions = [...category.questions].sort(() => Math.random() - 0.5);
      const selectedQuestions = shuffledQuestions.slice(0, Math.floor(Math.random() * 2) + 2); // 2-3 questions

      selectedQuestions.forEach((question, index) => {
        questionsToInsert.push({
          session_id: sessionId,
          question,
          category: category.id as FollowUpQuestion['category'],
          difficulty: index === 0 ? 'easy' : index === 1 ? 'medium' : 'hard',
          is_selected: false
        });
      });
    });

    // Insert questions into database
    const { error: insertError } = await supabase
      .from('follow_up_questions')
      .insert(questionsToInsert);

    if (insertError) {
      console.error('Error inserting follow-up questions:', insertError);
      return { success: false, error: insertError.message };
    }

    return { success: true };

  } catch (error) {
    console.error('Error in generateFollowUpQuestions:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

/**
 * Get follow-up questions for a session
 */
export async function getFollowUpQuestions(sessionId: string): Promise<{ 
  data: FollowUpQuestion[]; 
  error?: string 
}> {
  try {
    const { data, error } = await supabase
      .from('follow_up_questions')
      .select('*')
      .eq('session_id', sessionId)
      .order('category', { ascending: true })
      .order('difficulty', { ascending: true });

    if (error) {
      console.error('Error fetching follow-up questions:', error);
      return { data: [], error: error.message };
    }

    return { data: data || [] };

  } catch (error) {
    console.error('Error in getFollowUpQuestions:', error);
    return { 
      data: [], 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

/**
 * Get questions grouped by category
 */
export async function getQuestionsByCategory(sessionId: string): Promise<{
  data: Record<string, FollowUpQuestion[]>;
  error?: string;
}> {
  try {
    const { data, error } = await getFollowUpQuestions(sessionId);
    
    if (error) {
      return { data: {}, error };
    }

    // Group questions by category
    const groupedQuestions = data.reduce((acc, question) => {
      if (!acc[question.category]) {
        acc[question.category] = [];
      }
      acc[question.category].push(question);
      return acc;
    }, {} as Record<string, FollowUpQuestion[]>);

    return { data: groupedQuestions };

  } catch (error) {
    console.error('Error in getQuestionsByCategory:', error);
    return { 
      data: {}, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

/**
 * Select/deselect questions for practice
 */
export async function toggleQuestionSelection(questionId: string, isSelected: boolean): Promise<{ 
  success: boolean; 
  error?: string 
}> {
  try {
    const { error } = await supabase
      .from('follow_up_questions')
      .update({ is_selected: isSelected })
      .eq('id', questionId);

    if (error) {
      console.error('Error updating question selection:', error);
      return { success: false, error: error.message };
    }

    return { success: true };

  } catch (error) {
    console.error('Error in toggleQuestionSelection:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

/**
 * Get selected questions for a session
 */
export async function getSelectedQuestions(sessionId: string): Promise<{ 
  data: FollowUpQuestion[]; 
  error?: string 
}> {
  try {
    const { data, error } = await supabase
      .from('follow_up_questions')
      .select('*')
      .eq('session_id', sessionId)
      .eq('is_selected', true)
      .order('category', { ascending: true });

    if (error) {
      console.error('Error fetching selected questions:', error);
      return { data: [], error: error.message };
    }

    return { data: data || [] };

  } catch (error) {
    console.error('Error in getSelectedQuestions:', error);
    return { 
      data: [], 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

/**
 * Get question categories with metadata
 */
export function getQuestionCategories(): QuestionCategory[] {
  return GENERIC_QUESTIONS;
}

/**
 * Create a practice session with selected questions
 */
export async function createPracticeSession(
  sessionId: string, 
  selectedQuestionIds: string[]
): Promise<{ 
  success: boolean; 
  practiceSessionId?: string; 
  error?: string 
}> {
  try {
    // For now, we'll just mark the questions as selected
    // In a future version, this could create a separate practice session
    const { error } = await supabase
      .from('follow_up_questions')
      .update({ is_selected: true })
      .in('id', selectedQuestionIds);

    if (error) {
      console.error('Error creating practice session:', error);
      return { success: false, error: error.message };
    }

    // Return the original session ID as practice session ID for now
    return { success: true, practiceSessionId: sessionId };

  } catch (error) {
    console.error('Error in createPracticeSession:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}