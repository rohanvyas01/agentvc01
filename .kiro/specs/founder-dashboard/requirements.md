# Requirements Document

## Introduction

The Founder Dashboard Enhancement focuses on creating a streamlined dashboard interface that serves as the central hub for founders after completing onboarding (which includes mandatory pitch deck upload). The dashboard follows the wireframe design and serves different purposes for first-time users (who proceed to AI conversation) versus returning users (who can access their session history and start new conversations). This enhancement will implement the wireframe layout and integrate with the existing system architecture for AI investor conversations.

## Requirements

### Requirement 1

**User Story:** As a founder, I want to see a simplified dashboard layout that matches the wireframe design, so that I can quickly access key information and actions without visual clutter.

#### Acceptance Criteria

1. WHEN a founder accesses the dashboard THEN the system SHALL display a clean layout with "Hello [Name]" greeting, uploaded decks section, company details panel, and session history
2. WHEN the dashboard loads THEN the system SHALL organize content in a card-based layout similar to the provided wireframe
3. WHEN displaying information THEN the system SHALL prioritize the most important actions and reduce secondary UI elements
4. WHEN a founder views the dashboard on mobile THEN the system SHALL stack sections vertically for optimal mobile experience
5. IF the current dashboard has too many competing elements THEN the system SHALL consolidate them into focused sections

### Requirement 2

**User Story:** As a founder, I want a dedicated "uploaded decks" section that shows my pitch deck (uploaded during onboarding), so that I can see the deck that will be used for AI conversations.

#### Acceptance Criteria

1. WHEN a founder views the dashboard THEN the system SHALL display an "uploaded decks" section showing the deck from onboarding
2. WHEN displaying the uploaded deck THEN the system SHALL show deck name, upload date, and processing status
3. WHEN a deck is being processed THEN the system SHALL show a clear processing indicator with estimated time
4. WHEN deck analysis is complete THEN the system SHALL display a "Ready" status indicating it's available for AI sessions
5. WHEN a founder uploads additional decks THEN the system SHALL show all decks with the primary/most recent highlighted
6. IF deck processing fails THEN the system SHALL show error status with option to re-upload or retry processing

### Requirement 3

**User Story:** As a founder, I want a compact company details section that shows key information at a glance, so that I can verify my company data without navigating away from the dashboard.

#### Acceptance Criteria

1. WHEN a founder views the dashboard THEN the system SHALL display a "company details" card showing company name, industry, and stage
2. WHEN displaying company details THEN the system SHALL show only the most essential information to avoid clutter
3. WHEN company information is incomplete THEN the system SHALL show a completion prompt within the card
4. WHEN a founder clicks on the company details card THEN the system SHALL allow inline editing or navigate to profile page
5. IF company details are updated THEN the system SHALL refresh the dashboard display immediately

### Requirement 4

**User Story:** As a founder, I want to see my session history in a clean, organized format, so that I can track my practice sessions and review past conversations.

#### Acceptance Criteria

1. WHEN a founder accesses the dashboard THEN the system SHALL display a "session history" section
2. WHEN displaying session history THEN the system SHALL show session date, investor persona, duration, and key outcomes
3. WHEN a founder clicks on a session THEN the system SHALL provide access to session transcript and feedback
4. WHEN displaying sessions THEN the system SHALL group recent sessions and provide pagination for older ones
5. IF no sessions exist THEN the system SHALL display an encouraging message about starting their first session
6. WHEN a session is completed THEN the system SHALL automatically update the history section

### Requirement 5

**User Story:** As a founder, I want a prominent "Start Session" button that guides me through prerequisites, so that I can easily begin practicing with AI investors.

#### Acceptance Criteria

1. WHEN a founder views the dashboard THEN the system SHALL display a prominent "Start Session" call-to-action
2. WHEN a founder clicks "Start Session" THEN the system SHALL check prerequisites (onboarding, deck upload, deck processing)
3. IF prerequisites are not met THEN the system SHALL guide the founder through the missing steps with clear instructions
4. WHEN all prerequisites are met THEN the system SHALL navigate to the session setup page
5. WHEN a session is in progress THEN the system SHALL update the button state to show session status
6. IF the user flow indicates next steps THEN the system SHALL adapt the button text and behavior accordingly

### Requirement 6

**User Story:** As a founder, I want the dashboard to integrate seamlessly with the existing user flow system, so that I receive appropriate guidance based on my progress.

#### Acceptance Criteria

1. WHEN a founder is in the onboarding phase THEN the system SHALL prioritize onboarding completion prompts
2. WHEN a founder hasn't met the AI investor THEN the system SHALL prominently display the agent introduction option
3. WHEN a founder needs to upload a deck THEN the system SHALL highlight the upload functionality
4. WHEN a founder's deck is processing THEN the system SHALL show processing status and estimated completion time
5. WHEN all prerequisites are complete THEN the system SHALL emphasize the Q&A session availability
6. IF the user flow state changes THEN the system SHALL update the dashboard layout and priorities accordingly

### Requirement 7

**User Story:** As a founder, I want quick access to key actions without navigating through multiple pages, so that I can efficiently manage my investor preparation workflow.

#### Acceptance Criteria

1. WHEN a founder views the dashboard THEN the system SHALL provide quick action buttons for common tasks
2. WHEN displaying quick actions THEN the system SHALL include "Meet Rohan Again", "Upload New Deck", and "Start Q&A Session"
3. WHEN a founder clicks a quick action THEN the system SHALL either perform the action inline or navigate to the appropriate page
4. WHEN quick actions are not available THEN the system SHALL disable or hide them with appropriate messaging
5. IF the founder's state changes THEN the system SHALL update available quick actions dynamically

### Requirement 8

**User Story:** As a first-time user, I want the dashboard to guide me directly to start my first AI conversation, so that I can immediately begin practicing after completing onboarding.

#### Acceptance Criteria

1. WHEN a first-time user accesses the dashboard after onboarding THEN the system SHALL prominently display "Talk to AI" or "Start Session" as the primary call-to-action
2. WHEN a first-time user clicks "Talk to AI" THEN the system SHALL initiate the investor persona selection and conversation flow
3. WHEN a first-time user has not yet had an AI conversation THEN the system SHALL prioritize this action over other dashboard elements
4. IF a first-time user's pitch deck is still processing THEN the system SHALL show processing status and estimated time until AI conversation is available
5. WHEN a first-time user completes their first AI conversation THEN the system SHALL update their status to returning user

### Requirement 9

**User Story:** As a returning user, I want the dashboard to show my session history and provide easy access to start new conversations, so that I can track my progress and continue practicing.

#### Acceptance Criteria

1. WHEN a returning user accesses the dashboard THEN the system SHALL display their session history prominently
2. WHEN displaying session history THEN the system SHALL show previous AI conversations with dates, investor personas, and key outcomes
3. WHEN a returning user wants to start a new session THEN the system SHALL provide clear "Start New Session" functionality
4. WHEN displaying the dashboard for returning users THEN the system SHALL balance session history with new session options
5. IF a returning user has multiple pitch decks THEN the system SHALL allow them to select which deck to use for new sessions

### Requirement 10

**User Story:** As a founder, I want to select an AI investor persona before starting my conversation, so that I can practice with different types of investors based on my needs.

#### Acceptance Criteria

1. WHEN a founder clicks "Talk to AI" THEN the system SHALL display available investor personas (as shown in SetupSessionPage)
2. WHEN displaying investor personas THEN the system SHALL show persona details including name, specialty, experience, and conversation style
3. WHEN a founder selects a persona THEN the system SHALL store the selection and prepare for Tavus conversation initialization
4. WHEN a persona is selected THEN the system SHALL validate that the founder's pitch deck is processed and ready
5. IF the pitch deck is not ready THEN the system SHALL prevent conversation start and show appropriate messaging
6. WHEN persona selection is complete THEN the system SHALL proceed to Tavus conversation setup

### Requirement 11

**User Story:** As a founder, I want the system to create a Tavus conversation session with my selected persona, so that I can have a realistic video conversation with an AI investor.

#### Acceptance Criteria

1. WHEN a founder confirms persona selection THEN the system SHALL create a session record in Supabase with user_id, deck_id, and tavus_persona_id
2. WHEN creating the session THEN the system SHALL call Tavus API to initialize a conversation with the selected persona characteristics
3. WHEN Tavus conversation is created THEN the system SHALL store the conversation URL and session details in Supabase
4. WHEN the Tavus session is ready THEN the system SHALL redirect the founder to the live conversation interface
5. IF Tavus API fails THEN the system SHALL update session status to 'failed' and display error message to founder
6. WHEN conversation starts THEN the system SHALL update session status to 'active' in Supabase

### Requirement 12

**User Story:** As a founder, I want my conversation with the AI investor to be transcribed in real-time, so that the system can analyze my responses and provide feedback.

#### Acceptance Criteria

1. WHEN a Tavus conversation is active THEN the system SHALL receive real-time webhooks with conversation transcription
2. WHEN receiving transcription webhooks THEN the system SHALL store transcript segments in Supabase with timestamps
3. WHEN storing transcripts THEN the system SHALL associate them with the correct session_id and identify speaker (founder vs AI investor)
4. WHEN conversation continues THEN the system SHALL continuously update the transcript in real-time
5. IF webhook delivery fails THEN the system SHALL implement retry logic and error handling
6. WHEN conversation ends THEN the system SHALL mark the transcript as complete and trigger analysis

### Requirement 13

**User Story:** As a founder, I want the system to analyze my conversation using Gemini AI, so that I can receive intelligent feedback on my pitch performance.

#### Acceptance Criteria

1. WHEN a conversation transcript is complete THEN the system SHALL send relevant segments to Gemini API for analysis
2. WHEN calling Gemini THEN the system SHALL include founder's pitch deck data and company information for context
3. WHEN Gemini analysis is complete THEN the system SHALL store analysis results in Supabase linked to the session
4. WHEN analyzing conversation THEN the system SHALL generate insights on pitch effectiveness, areas for improvement, and investor concerns
5. IF Gemini API fails THEN the system SHALL retry analysis and log errors for manual review
6. WHEN analysis is stored THEN the system SHALL trigger question generation for follow-up

### Requirement 14

**User Story:** As a founder, I want the system to generate follow-up questions based on my conversation, so that I can continue practicing with targeted scenarios.

#### Acceptance Criteria

1. WHEN Gemini analysis is complete THEN the system SHALL generate relevant follow-up questions based on conversation gaps
2. WHEN generating questions THEN the system SHALL consider the founder's responses and areas needing improvement
3. WHEN questions are generated THEN the system SHALL store them in Supabase and make them available for future sessions
4. WHEN questions are ready THEN the system SHALL optionally present them to the founder for immediate follow-up practice
5. IF question generation fails THEN the system SHALL still provide basic conversation analysis without follow-up questions
6. WHEN questions are presented THEN the system SHALL allow the founder to select which questions to practice

### Requirement 15

**User Story:** As a founder, I want to receive a comprehensive report of my conversation session, so that I can review my performance and track improvement over time.

#### Acceptance Criteria

1. WHEN conversation analysis is complete THEN the system SHALL generate a final report with transcript, analysis, and recommendations
2. WHEN generating the report THEN the system SHALL include conversation summary, key strengths, areas for improvement, and suggested next steps
3. WHEN the report is ready THEN the system SHALL email it to the founder and store it in Supabase
4. WHEN displaying the report THEN the system SHALL make it accessible through the dashboard session history
5. IF email delivery fails THEN the system SHALL still make the report available through the dashboard
6. WHEN report is generated THEN the system SHALL update session status to 'completed' and refresh dashboard

### Requirement 16

**User Story:** As a founder, I want the dashboard to load quickly and handle errors gracefully, so that I have a reliable experience when accessing my information.

#### Acceptance Criteria

1. WHEN a founder accesses the dashboard THEN the system SHALL load core information within 3 seconds
2. WHEN data is loading THEN the system SHALL display appropriate loading indicators for each section
3. WHEN network errors occur THEN the system SHALL display user-friendly error messages with retry options
4. WHEN some data fails to load THEN the system SHALL still display available information and indicate what's missing
5. IF the founder is not properly authenticated THEN the system SHALL redirect to the appropriate authentication flow
6. WHEN data updates successfully THEN the system SHALL provide visual feedback confirming the changes