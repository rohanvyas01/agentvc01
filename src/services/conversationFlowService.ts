import { supabase } from '../lib/supabase';

export interface ConversationSession {
  id: string;
  user_id: string;
  founder_name: string;
  status: 'greeting' | 'introduction' | 'questions' | 'analysis' | 'completed';
  current_question_index: number;
  responses: ConversationResponse[];
  started_at: string;
  completed_at?: string;
}

export interface ConversationResponse {
  question: string;
  answer_text: string;
  answer_audio_url?: string;
  timestamp: string;
}

export interface ConversationScript {
  greeting: string;
  introduction: string;
  questions: string[];
  transition_to_analysis: string;
  goodbye: string;
}

class ConversationFlowService {
  private defaultScript: ConversationScript = {
    greeting: "Hi {founder_name}! Welcome to AgentVC. I'm excited to hear about your startup today. How are you doing?",
    
    introduction: "Great! Let me quickly tell you about AgentVC. We're an AI-powered platform that helps founders practice their pitches with realistic investor scenarios. I'll be asking you a few questions about your startup today, just like a real investor would. This will help us analyze your pitch and provide valuable feedback. Are you ready to get started?",
    
    questions: [
      "Tell me about your startup. What problem are you solving?",
      "Who is your target market and how big is the opportunity?",
      "What makes your solution unique compared to existing alternatives?",
      "How do you plan to make money? What's your business model?",
      "Tell me about your team. What makes you the right people to solve this problem?",
      "What traction have you gained so far?",
      "How much funding are you looking to raise and what will you use it for?",
      "What are the biggest risks or challenges you foresee?"
    ],
    
    transition_to_analysis: "Thank you for those great answers, {founder_name}. I have everything I need to provide you with comprehensive feedback.",
    
    goodbye: "Our AI analysis has begun and you'll receive your detailed report in a couple of hours. You can check the progress on your dashboard, and feel free to retry this pitch anytime you'd like. The more you practice, the better you'll get! Thanks for using AgentVC, and good luck with your fundraising journey!"
  };

  /**
   * Get founder information from Supabase
   */
  async getFounderInfo(userId: string): Promise<{ name: string; company?: string } | null> {
    try {
      // Try to get from user profile first
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, first_name')
        .eq('id', userId)
        .single();

      if (profile?.full_name || profile?.first_name) {
        return { name: profile.full_name || profile.first_name };
      }

      // Fallback to company info
      const { data: company } = await supabase
        .from('companies')
        .select('founder_name, name')
        .eq('user_id', userId)
        .single();

      if (company?.founder_name) {
        return { 
          name: company.founder_name,
          company: company.name 
        };
      }

      // Last resort - use email
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        const name = user.email.split('@')[0].replace(/[._]/g, ' ');
        return { name: this.capitalizeWords(name) };
      }

      return { name: 'Founder' }; // Generic fallback

    } catch (error) {
      console.error('Error fetching founder info:', error);
      return { name: 'Founder' };
    }
  }

  /**
   * Create a new conversation session (Tavus-free)
   */
  async createConversationSession(userId: string, companyData?: {
    company_name?: string;
    company_description?: string;
    funding_stage?: string;
    industry?: string;
    pitch_deck_url?: string;
  }): Promise<{ session_id: string; founder_name: string } | null> {
    try {
      // Call the new edge function
      const { data, error } = await supabase.functions.invoke('create-conversation-session', {
        body: {
          user_id: userId,
          ...companyData
        }
      });

      if (error) {
        console.error('Error creating conversation session:', error);
        return null;
      }

      return {
        session_id: data.session_id,
        founder_name: data.founder_name
      };

    } catch (error) {
      console.error('Error creating conversation session:', error);
      return null;
    }
  }

  /**
   * Get personalized script for the conversation
   */
  getPersonalizedScript(founderName: string): ConversationScript {
    return {
      greeting: this.defaultScript.greeting.replace('{founder_name}', founderName),
      introduction: this.defaultScript.introduction,
      questions: [...this.defaultScript.questions],
      transition_to_analysis: this.defaultScript.transition_to_analysis.replace('{founder_name}', founderName),
      goodbye: this.defaultScript.goodbye
    };
  }

  /**
   * Save conversation response
   */
  async saveConversationResponse(
    sessionId: string, 
    question: string, 
    answerText: string, 
    audioUrl?: string
  ): Promise<boolean> {
    try {
      const response: ConversationResponse = {
        question,
        answer_text: answerText,
        answer_audio_url: audioUrl,
        timestamp: new Date().toISOString()
      };

      // Get current session
      const { data: session, error: fetchError } = await supabase
        .from('conversation_sessions')
        .select('responses')
        .eq('id', sessionId)
        .single();

      if (fetchError) {
        console.error('Error fetching session:', fetchError);
        return false;
      }

      const updatedResponses = [...(session.responses || []), response];

      const { error: updateError } = await supabase
        .from('conversation_sessions')
        .update({ responses: updatedResponses })
        .eq('id', sessionId);

      if (updateError) {
        console.error('Error saving response:', updateError);
        return false;
      }

      return true;

    } catch (error) {
      console.error('Error saving conversation response:', error);
      return false;
    }
  }

  /**
   * Update session status
   */
  async updateSessionStatus(
    sessionId: string, 
    status: ConversationSession['status'],
    questionIndex?: number
  ): Promise<boolean> {
    try {
      const updateData: any = { status };
      
      if (questionIndex !== undefined) {
        updateData.current_question_index = questionIndex;
      }
      
      if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('conversation_sessions')
        .update(updateData)
        .eq('id', sessionId);

      if (error) {
        console.error('Error updating session status:', error);
        return false;
      }

      return true;

    } catch (error) {
      console.error('Error updating session status:', error);
      return false;
    }
  }

  /**
   * Get session by ID
   */
  async getSession(sessionId: string): Promise<ConversationSession | null> {
    try {
      const { data, error } = await supabase
        .from('conversation_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (error) {
        console.error('Error fetching session:', error);
        return null;
      }

      return data;

    } catch (error) {
      console.error('Error fetching session:', error);
      return null;
    }
  }

  /**
   * Trigger analysis process
   */
  async triggerAnalysis(sessionId: string): Promise<boolean> {
    try {
      // Call edge function to start analysis
      const { data, error } = await supabase.functions.invoke('analyze-conversation', {
        body: { session_id: sessionId }
      });

      if (error) {
        console.error('Error triggering analysis:', error);
        return false;
      }

      return data.success || false;

    } catch (error) {
      console.error('Error triggering analysis:', error);
      return false;
    }
  }

  /**
   * Helper function to capitalize words
   */
  private capitalizeWords(str: string): string {
    return str.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
}

export const conversationFlowService = new ConversationFlowService();