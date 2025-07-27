# Mood Movie Recommender

An AI-powered movie recommendation app that suggests films based on your current emotional state.

## Features

- **Mood-based recommendations**: Get movie suggestions based on your energy level and emotional state
- **Personalized experience**: Create a profile and track your viewing history
- **Smart filtering**: Exclude movies you've already seen
- **Rich movie data**: Powered by TMDB API with detailed movie information

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Database**: Supabase (PostgreSQL with vector similarity search)
- **Authentication**: Supabase Auth
- **Movie Data**: The Movie Database (TMDB) API
- **Deployment**: Vercel

## Setup

1. **Clone the repository**
   \`\`\`bash
   git clone <your-repo-url>
   cd mood-movie-recommender
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up environment variables**
   
   Copy `.env.example` to `.env.local` and fill in your credentials:
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`

   Required environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (for server-side operations)
   - `TMDB_API_READ_ACCESS_TOKEN`: Your TMDB API read access token

4. **Set up the database**
   
   Run the SQL scripts in order to create the database schema:
   \`\`\`bash
   # Create the basic schema
   npx tsx scripts/00-create-database-schema.sql
   
   # Create the mood matching function
   npx tsx scripts/01-create-match-movies-by-mood.sql
   
   # Create user tables
   npx tsx scripts/02-create-user-actions-tables.sql
   \`\`\`

5. **Seed the database**
   \`\`\`bash
   npx tsx scripts/seed-production-quick.ts
   \`\`\`

6. **Run the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

## Environment Variables

Create a `.env.local` file with the following variables:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
TMDB_API_READ_ACCESS_TOKEN=your_tmdb_api_token
\`\`\`

## Deployment

This app is configured for deployment on Vercel:

1. **Connect your GitHub repository to Vercel**
2. **Add environment variables in Vercel dashboard**
3. **Deploy automatically on push to main branch**

Make sure to add all environment variables in your Vercel project settings.

## API Endpoints

- `GET /api/movies/recommendations` - Get movie recommendations based on mood
  - Query parameters:
    - `mood`: One of `high-energy-pleasant`, `high-energy-unpleasant`, `low-energy-pleasant`, `low-energy-unpleasant`
    - `limit`: Number of recommendations (1-50, default: 20)
    - `threshold`: Similarity threshold (0.01-1.0, default: 0.6)
    - `exclude`: Comma-separated list of movie IDs to exclude

## Database Schema

The app uses several key tables:
- `movies`: Core movie data from TMDB
- `movie_mood_vectors`: Vector embeddings for mood-based similarity search
- `user_profiles`: User preferences and settings
- `user_movie_actions`: User interactions (watched, liked, etc.)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details
