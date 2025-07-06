# AgentVC Backend - Atomic User Creation

This backend implements a 100% atomic user creation system using Node.js and Supabase.

## Key Features

### 🔒 Atomic User Creation
- **Database Triggers**: Automatically creates user profile when auth user is created
- **Transaction Safety**: If profile creation fails, user creation is rolled back
- **Zero Partial States**: No orphaned users or profiles

### 🛡️ Security
- Row Level Security (RLS) enabled
- JWT token authentication
- Input validation with Joi
- Helmet.js security headers
- CORS protection

### 📊 Complete API
- User signup/login/logout
- Profile management
- File upload for pitch decks
- Dashboard data

## Setup Instructions

### 1. Environment Variables
Copy `.env.example` to `.env` and fill in your Supabase credentials:

```bash
cp .env.example .env
```

### 2. Install Dependencies
```bash
cd server
npm install
```

### 3. Database Setup
The migration file `supabase/migrations/create_atomic_user_system.sql` contains:
- Updated table schemas
- Database trigger for atomic user creation
- RLS policies
- Helper functions

Apply this migration to your Supabase project.

### 4. Supabase Storage Setup
Create a storage bucket named `pitch-decks` in your Supabase project:
1. Go to Storage in Supabase dashboard
2. Create new bucket: `pitch-decks`
3. Set it to private (RLS will handle access)

### 5. Start the Server
```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Atomic user creation
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Dashboard
- `GET /api/dashboard` - Get user dashboard data
- `PUT /api/dashboard/profile` - Update user profile

### File Upload
- `POST /api/upload/deck` - Upload pitch deck
- `GET /api/upload/decks` - Get user's pitch decks
- `DELETE /api/upload/deck/:id` - Delete pitch deck

### Health Check
- `GET /health` - Server health status

## How Atomic Creation Works

1. **Frontend calls** `POST /api/auth/signup` with user data
2. **Backend calls** `supabase.auth.signUp()` with metadata
3. **Database trigger** automatically fires when user is created
4. **Trigger function** creates profile using metadata
5. **If profile fails**, entire transaction rolls back (no user created)
6. **If successful**, both user and profile exist atomically

## Error Handling

The system handles various failure scenarios:
- Invalid input data (400 Bad Request)
- Authentication failures (401 Unauthorized)
- Profile creation failures (500 Internal Server Error with rollback)
- File upload failures (with cleanup)
- Database connection issues

## Testing the Atomic Behavior

To test that the system is truly atomic:

1. **Valid signup**: Should create both user and profile
2. **Invalid profile data**: Should create neither user nor profile
3. **Database constraint violations**: Should rollback user creation

## Production Considerations

- Set up proper environment variables
- Configure CORS for your domain
- Set up monitoring and logging
- Consider rate limiting
- Set up backup strategies
- Monitor database performance

## Database Schema

### profiles table
- `id` (UUID, PK, FK to auth.users.id)
- `user_id` (UUID, FK to auth.users.id)
- `founder_name`, `email`, `startup_name` (required)
- `one_liner_pitch`, `industry`, `business_model` (required)
- `funding_round`, `raise_amount`, `use_of_funds` (required)
- `linkedin_profile`, `website` (optional)
- `created_at`, `updated_at` (timestamps)

### pitch_decks table
- `id` (UUID, PK)
- `user_id` (UUID, FK to auth.users.id)
- `file_name`, `storage_path` (required)
- `file_size` (bigint)
- `extracted_text` (optional)
- `created_at` (timestamp)