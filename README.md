# 🚀 AgentVC - AI Investor Pitch Practice Platform

AgentVC is a video persona-based platform where founders practice their investor pitches with an AI investor (Rohan Vyas) and receive detailed feedback to improve their fundraising success.

## ✨ Features

- **🎬 AI Video Persona**: Practice with Rohan Vyas, an experienced AI investor
- **🎤 Voice Recording**: Record your pitch responses with browser audio capture
- **📝 Speech-to-Text**: Automatic transcription using OpenAI Whisper
- **📊 Session Tracking**: Complete conversation history and progress tracking
- **🔄 Conversation Flow**: Structured pitch practice with intro → pitch → feedback
- **📱 Responsive Design**: Works on desktop and mobile devices

## 🚀 Quick Start

### 1. Clone and Install
```bash
git clone <repository-url>
cd agentvc01
npm install
```

### 2. Environment Setup
```bash
# Copy environment template
cp .env.example .env.local

# Add your API keys to .env.local:
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
```

### 3. Database Setup
```bash
# If using Supabase cloud:
supabase db push

# If using local Supabase:
supabase start
supabase db reset
```

### 4. Start Development
```bash
npm run dev
```

### 5. Test the Platform
1. Visit `http://localhost:3000`
2. Sign up for an account
3. Complete onboarding
4. Click "Start AI Interview" on dashboard
5. Practice your pitch!

## 🏗️ Architecture

### Core Components
- **Landing Page**: Marketing page with hero video and features
- **Authentication**: Supabase Auth with sign up/sign in
- **Dashboard**: Session history and pitch practice entry point
- **Conversation Interface**: Video persona + audio recording
- **Database**: Complete session and transcript storage

### Tech Stack
- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Supabase (Database + Auth + Edge Functions)
- **Speech-to-Text**: OpenAI Whisper API
- **Text-to-Speech**: Resemble AI Chatterbox (zero-shot voice cloning)
- **Video Generation**: HunyuanVideo-Avatar (open-source lip-sync)
- **Orchestration**: Docker services for video pipeline
- **Deployment**: Vercel/Netlify ready

## 📁 Project Structure

```
agentvc01/
├── src/
│   ├── components/
│   │   ├── SimpleAIConversation.tsx    # Main conversation interface
│   │   ├── ConversationButton.tsx      # Start conversation button
│   │   └── ConversationSessionHistory.tsx # Session history
│   ├── pages/
│   │   ├── LandingPage.tsx            # Marketing landing page
│   │   ├── WorkingDashboard.tsx       # Main dashboard
│   │   ├── ConversationPage.tsx       # Conversation interface
│   │   └── SetupSessionPage.tsx       # Session setup
│   └── services/
│       ├── conversationFlowService.ts  # Session management
│       └── conversationScript.ts      # Conversation scripts
├── supabase/
│   ├── functions/
│   │   ├── create-conversation-session/ # Session creation
│   │   ├── transcribe-audio/           # Speech-to-text
│   │   └── analyze-conversation/       # Pitch analysis (framework)
│   └── migrations/                     # Database schema
├── docker/                            # Video generation services (optional)
├── scripts/                           # Setup and generation scripts
└── assets/                           # Video and audio assets
```

## 🔄 How It Works

### Conversation Flow
1. **User clicks "Start AI Interview"**
2. **Session created** in Supabase database
3. **AI Introduction**: Video/fallback of Rohan introducing AgentVC
4. **Founder Introduction**: User records self-introduction
5. **Pitch Request**: AI asks for the full startup pitch
6. **Pitch Recording**: User records complete pitch presentation
7. **Wrap-up**: AI thanks user and explains next steps
8. **Analysis**: Shows "Analysis in Progress" status

### Data Captured
- Complete conversation transcript
- Founder introduction (speech-to-text)
- Full pitch transcript (speech-to-text)
- Session metadata and timing
- Company information from onboarding

## 🎬 Video Persona System (Optional)

The platform includes a complete open-source video generation pipeline:

### Technology Stack
| Function | Tool/Library | Notes |
|----------|-------------|-------|
| Speech-to-Text | OpenAI Whisper API | Free tier or self-hosted |
| Text-to-Speech | Resemble AI Chatterbox | Zero-shot voice cloning, MIT license |
| Talking Head Video | HunyuanVideo-Avatar | Open-source, local GPU |
| Orchestration & DB | Supabase | Free tier, storage, RLS security |
| File Storage | Supabase Storage | PDF, audio, video |

### Quick Setup
```bash
# Start video generation services
node scripts/start-video-services.js

# Test the pipeline
node scripts/test-video-pipeline.js
```

### Create Your AI Persona
1. **Record base video**: 2-3 minutes of natural talking
2. **Generate persona videos**: AI creates 4 conversation segments
3. **Replace fallback UI**: Videos play instead of static content

This pipeline meets your requirements with zero subscription costs, full API-key integration, and a modular architecture that can be extended later.

See `VIDEO_SETUP_GUIDE.md` for detailed instructions.

## 🧪 Testing

### Test Current Implementation
```bash
# Start the app
npm run dev

# Test complete flow:
1. Sign up at http://localhost:3000
2. Complete onboarding
3. Go to dashboard
4. Click "Start AI Interview"
5. Test conversation flow
6. Check database for saved transcripts
```

### Test Video Pipeline (Optional)
```bash
# Test video generation services
node scripts/test-video-pipeline.js

# Check individual services
curl http://localhost:8000/health  # TTS service
curl http://localhost:8001/health  # Video generation
curl http://localhost:8002/health  # Orchestration
```

## 🔧 Configuration

### Required Environment Variables
```bash
# Supabase (Required)
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI (Required for speech-to-text)
OPENAI_API_KEY=your_openai_api_key

# Optional for video generation
RESEMBLE_API_KEY=your_resemble_api_key
```

### Database Schema
The platform uses these main tables:
- `conversation_sessions`: Session data and metadata
- `conversation_transcripts`: Complete conversation logs
- `profiles`: User information and preferences

## 🚨 Troubleshooting

### Common Issues

**Video not playing on landing page**
- Expected behavior - placeholder shows until video is recorded
- See video generation guide to create actual content

**Conversation not starting**
- Check Supabase connection and authentication
- Verify environment variables are set
- Check browser console for errors

**Audio recording fails**
- Ensure HTTPS (required for microphone access)
- Check browser permissions
- Test in different browsers

**Speech-to-text not working**
- Verify OpenAI API key and credits
- Check network connectivity
- Monitor browser network tab

### Debug Commands
```bash
# Check Supabase status
supabase status

# View logs
supabase logs

# Test API endpoints
curl -X POST http://localhost:54321/functions/v1/create-conversation-session
```

## 📈 Roadmap

### Phase 1: Core Platform ✅
- Landing page and authentication
- Conversation flow with fallback UI
- Audio recording and transcription
- Session management and history

### Phase 2: Video Persona 🔄
- AI-generated video personas
- Dynamic script generation
- Voice cloning integration

### Phase 3: AI Analysis 📋
- Pitch analysis using AI
- Feedback generation
- Scoring and recommendations
- Email notifications

### Phase 4: Advanced Features 🚀
- Multiple investor personas
- Industry-specific questions
- Team collaboration
- Advanced analytics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For setup help or questions:
1. Check `AGENTVC_SETUP_GUIDE.md` for detailed instructions
2. Review troubleshooting section above
3. Check browser console and Supabase logs
4. Test individual components in isolation

---

**Ready to help founders raise capital faster with AI-powered pitch practice!** 🚀