// Dashboard-specific types and interfaces
import { Session, ConversationAnalysis, ConversationTranscript, PitchDeck, Company, Profile } from '../lib/supabase';

// Dashboard state and component types
export interface DashboardState {
  user: any | null;
  profile: Profile | null;
  company: Company | null;
  pitchDecks: PitchDeck[];
  sessions: Session[];
  loading: boolean;
  error: string | null;
  isFirstTimeUser: boolean;
}

// Component prop interfaces
export interface WelcomeSectionProps {
  userName: string;
  companyName: string;
  isFirstTime: boolean;
}

export interface UploadedDecksProps {
  decks: PitchDeck[];
  onViewDeck: (deckId: string) => void;
  onUploadNew: () => void;
}

export interface DeckStatus {
  id: string;
  name: string;
  uploadDate: string;
  status: 'processing' | 'processed' | 'failed';
  processingProgress?: number;
}

export interface CompanyDetailsProps {
  company: Company;
  profile: Profile;
  onEdit: () => void;
}

export interface CompanyInfo {
  name: string;
  industry: string;
  stage: string;
  oneLiner: string;
  completionPercentage: number;
}

export interface SessionHistoryProps {
  sessions: Session[];
  onViewSession: (sessionId: string) => void;
  onStartNew: () => void;
}

export interface SessionSummary {
  id: string;
  date: string;
  investorPersona: string;
  duration: number;
  status: 'completed' | 'failed';
  keyOutcomes: string[];
}

export interface TalkToAIProps {
  isFirstTime: boolean;
  hasProcessedDeck: boolean;
  onStartConversation: () => void;
}

export interface ConversationSetup {
  sessionId: string;
  selectedPersona: InvestorPersona;
  pitchDeckId: string;
  tavusConversationUrl: string;
}

export interface PersonaSelectionProps {
  personas?: InvestorPersona[];
  onSelect: (persona: InvestorPersona) => void;
  selectedPersona?: InvestorPersona;
}

export interface InvestorPersona {
  id: string;
  name: string;
  description: string;
  specialty: string;
  experience: string;
  conversationStyle: string;
  focusAreas: string[];
  avatarUrl: string;
}

export interface LiveConversationProps {
  sessionId: string;
  conversationUrl: string;
  persona: InvestorPersona;
  onConversationEnd: (sessionId: string) => void;
}

// Error handling types
export interface APIError {
  code: string;
  message: string;
  details?: any;
}

export interface ConversationErrorHandler {
  onTavusConnectionFailed: (sessionId: string) => void;
  onTranscriptionFailed: (sessionId: string) => void;
  onAnalysisFailed: (sessionId: string) => void;
  onReportGenerationFailed: (sessionId: string) => void;
}

// Extended session type with related data
export interface SessionWithDetails extends Session {
  pitch_deck?: PitchDeck;
  company?: Company;
  transcripts?: ConversationTranscript[];
  analysis?: ConversationAnalysis;
  report?: any;
}

// Dashboard section visibility and state
export interface DashboardSectionState {
  showWelcome: boolean;
  showUploadedDecks: boolean;
  showCompanyDetails: boolean;
  showSessionHistory: boolean;
  showQuickActions: boolean;
  showTalkToAI: boolean;
}

// Quick actions configuration
export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  action: () => void;
  disabled?: boolean;
  tooltip?: string;
}

// Real-time update types
export interface RealtimeUpdate {
  type: 'session_update' | 'transcript_update' | 'analysis_complete' | 'report_ready';
  sessionId: string;
  data: any;
}

// Dashboard loading states
export interface LoadingStates {
  profile: boolean;
  company: boolean;
  pitchDecks: boolean;
  sessions: boolean;
  initialLoad: boolean;
}

export type { Session };
