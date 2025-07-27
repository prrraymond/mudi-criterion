# Emotional Movie Recommender

An AI-powered movie recommendation system that suggests films based on your current emotional state and mood.

## Features

- **Mood-Based Recommendations**: Get movie suggestions based on your emotional quadrant (high/low energy × pleasant/unpleasant)
- **Personalized Experience**: Create a profile and track your movie preferences
- **Rich Movie Data**: Powered by The Movie Database (TMDb) API
- **User Authentication**: Secure login with Supabase Auth
- **Responsive Design**: Works seamlessly on desktop and mobile

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL database, authentication, real-time)
- **Movie Data**: The Movie Database (TMDb) API
- **Deployment**: Vercel

## Setup Instructions

### 1. Clone the Repository

\`\`\`bash
git clone <your-repo-url>
cd mood-movie-recommender
npm install
\`\`\`

### 2. Environment Variables

Create a `.env.local` file in the root directory:

\`\`\`env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# TMDb API
TMDB_API_READ_ACCESS_TOKEN=your_tmdb_read_access_token
\`\`\`

### 3. Database Setup

Run the SQL scripts in order to set up your Supabase database:

\`\`\`bash
# Run these scripts in your Supabase SQL editor
scripts/00-create-database-schema.sql
scripts/01-create-match-movies-by-mood.sql
scripts/02-create-user-actions-tables.sql
scripts/04-create-user-profiles-fixed.sql
\`\`\`

### 4. Seed the Database

\`\`\`bash
# Seed with movie data
npx tsx scripts/seed-production-quick.ts
\`\`\`

### 5. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Visit `http://localhost:3000` to see the application.

## Deployment

The app is configured for automatic deployment on Vercel when you push to the main branch.

### Environment Variables in Vercel

Add these environment variables in your Vercel dashboard:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `TMDB_API_READ_ACCESS_TOKEN`

## API Endpoints

- `GET /api/movies/recommendations` - Get mood-based movie recommendations
  - Query parameters: `mood`, `limit`, `threshold`, `exclude`

## Project Structure

\`\`\`
├── app/                    # Next.js app directory
├── components/            # React components
├── lib/                   # Utility functions and services
├── scripts/              # Database and utility scripts
└── public/               # Static assets
\`\`\`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License
