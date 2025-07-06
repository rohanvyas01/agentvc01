# AgentVC - Secure Supabase Backend

A complete React application with secure Supabase backend for AgentVC, the world's first AI investor that helps founders practice their pitch and raise capital faster.

## 🚀 Features

### Frontend
- **Landing Page**: Beautiful, responsive landing page showcasing AgentVC
- **Authentication**: Secure atomic sign-up and login system
- **PDF Processing**: Upload and analyze pitch decks with text extraction and OCR
- **Dashboard**: User profile management and pitch deck library
- **Modern UI**: Built with React, TypeScript, Tailwind CSS, and Framer Motion

### Backend (Supabase)
- **Atomic User Creation**: Zero partial states - user and profile created together or not at all
- **Row Level Security**: Strict data isolation between users
- **Secure File Storage**: Private user folders with access control
- **Real-time Updates**: Automatic data synchronization
- **Comprehensive API**: RPC functions for all operations

## 🛡️ Security Features

### Atomic Sign-up Process
- Single transaction creates both auth user and profile
- If either fails, entire transaction rolls back
- Zero orphaned users or incomplete profiles
- Uses `SECURITY DEFINER` RPC function for atomic operations

### Data Protection
- **Row Level Security (RLS)** enabled on all tables
- Users can only access their own data
- Comprehensive security policies for all operations
- Storage policies prevent cross-user file access

### File Security
- Private storage bucket with user-specific folders
- Each user can only access files in their own folder
- Secure signed URLs for file downloads
- Automatic cleanup on file deletion

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Animations**: Framer Motion for smooth interactions
- **PDF Processing**: PDF.js + Tesseract.js for text extraction and OCR
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Routing**: React Router DOM

### Backend
- **Database**: Supabase PostgreSQL with RLS
- **Authentication**: Supabase Auth with atomic user creation
- **Storage**: Supabase Storage with security policies
- **API**: Supabase RPC functions for secure operations
- **Real-time**: Supabase real-time subscriptions

## 📦 Installation

### 1. Clone and Install
```bash
git clone <repository-url>
cd agentvc
npm install
```

### 2. Supabase Setup

#### Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be fully initialized

#### Run Database Migration
1. Install Supabase CLI: `npm install -g supabase`
2. Login: `supabase login`
3. Link project: `supabase link --project-ref your-project-ref`
4. Run migration: `supabase db push`

Alternatively, copy and run the SQL from `supabase/migrations/create_secure_backend.sql` in your Supabase SQL editor.

#### Create Storage Bucket
1. Go to Storage in your Supabase dashboard
2. Create a new bucket named `pitch-decks`
3. Set it to **Private** (not public)
4. The migration already includes the necessary storage policies

### 3. Environment Configuration
```bash
cp .env.example .env
```

Add your Supabase credentials to `.env`:
```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Start Development
```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── AudioRecorder.tsx
│   ├── AuthModal.tsx    # Secure authentication modal
│   ├── Header.tsx
│   ├── PitchDeckViewer.tsx
│   └── VideoPlayer.tsx
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication state management
├── lib/               # Library configurations
│   └── supabase.ts    # Supabase client and types
├── pages/             # Page components
│   └── LandingPage.tsx
├── services/          # API and service layers
│   ├── api.ts         # API service with Supabase integration
│   ├── pdfParser.ts   # PDF processing service
│   └── supabaseService.ts # Secure Supabase operations
├── App.tsx            # Main app component
├── main.tsx          # App entry point
└── index.css         # Global styles

supabase/
└── migrations/
    └── create_secure_backend.sql # Complete backend setup
```

## 🔐 Backend Architecture

### Database Schema

#### Profiles Table
- Complete user and company information
- Linked to `auth.users` with CASCADE delete
- Input validation with CHECK constraints
- Automatic timestamp management

#### Pitch Decks Table
- File metadata and extracted content
- Processing status tracking
- File size and type validation
- User isolation through foreign keys

### Security Implementation

#### Atomic User Creation
```sql
-- RPC function ensures atomicity
CREATE OR REPLACE FUNCTION handle_new_user_and_profile(...)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER -- Critical for auth.users access
```

#### Row Level Security Policies
```sql
-- Users can only access their own data
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
```

#### Storage Security
```sql
-- Users can only access their own folder
CREATE POLICY "Users can upload to own folder"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'pitch-decks' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
```

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Database Development
- `supabase start` - Start local Supabase
- `supabase db reset` - Reset local database
- `supabase db push` - Push migrations to remote
- `supabase gen types typescript` - Generate TypeScript types

## 🚀 Deployment

### Frontend Deployment
1. Build the application: `npm run build`
2. Deploy the `dist` folder to your hosting provider (Vercel, Netlify, etc.)

### Backend Deployment
The Supabase backend is automatically deployed and managed. Just ensure:
1. All migrations are applied
2. Storage bucket is created
3. Environment variables are set in your hosting provider

## 🔒 Security Best Practices

### Authentication
- Atomic user creation prevents partial states
- Password validation and hashing handled by Supabase
- Session management with automatic token refresh
- Secure logout with token invalidation

### Data Access
- Row Level Security enforces user isolation
- All database operations go through RPC functions
- Input validation at database level
- Comprehensive error handling

### File Storage
- Private bucket with user-specific folders
- Signed URLs for secure file access
- Automatic file cleanup on deletion
- File type and size validation

## 📊 Monitoring and Logging

### Built-in Monitoring
- Supabase provides built-in monitoring and analytics
- Real-time database performance metrics
- Authentication and API usage statistics
- Error tracking and logging

### Custom Logging
- Security events logged through RPC functions
- User actions tracked for audit purposes
- Error handling with detailed logging
- Performance monitoring for file operations

## 🤝 Contributing

This is a private project. Please contact the development team for contribution guidelines.

## 📄 License

This project is proprietary software for AgentVC.

---

## 🆘 Troubleshooting

### Common Issues

**"Supabase is not configured" error:**
- Ensure `.env` file has correct Supabase URL and anon key
- Restart development server after adding environment variables

**Migration errors:**
- Ensure you have the latest Supabase CLI
- Check that your project is properly linked
- Verify database permissions

**File upload failures:**
- Check that `pitch-decks` bucket exists and is private
- Verify storage policies are applied
- Ensure user is authenticated

**Authentication issues:**
- Verify migration created the atomic signup function
- Check that RLS policies are enabled
- Ensure auth.users table has proper permissions

### Getting Help

1. Check the Supabase dashboard for error logs
2. Review the browser console for client-side errors
3. Verify all environment variables are set correctly
4. Ensure the database migration completed successfully