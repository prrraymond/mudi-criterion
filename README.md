# Emotional Movie Recommender

A Next.js application that recommends movies based on your current mood using AI-powered mood analysis and vector similarity search.

## Features

- **Mood-based recommendations**: Get movie suggestions based on your emotional state
- **AI-powered matching**: Uses vector embeddings to find movies that match your mood
- **User profiles**: Track your movie preferences and watch history
- **Supabase integration**: Real-time database with user authentication
- **TMDb integration**: Rich movie data and poster images

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Database**: Supabase (PostgreSQL with vector extensions)
- **Authentication**: Supabase Auth
- **Movie Data**: The Movie Database (TMDb) API
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- A Supabase account
- A TMDb API account

### Installation

1. **Clone the repository:**
   \`\`\`bash
   git clone <your-repo-url>
   cd mood-movie-recommender
   \`\`\`

2. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up environment variables:**
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`
   
   Fill in your environment variables in `.env.local`:
   \`\`\`
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   TMDB_API_READ_ACCESS_TOKEN=your_tmdb_read_access_token
   \`\`\`

4. **Set up the database:**
   
   Run the SQL scripts in your Supabase SQL editor in order:
   \`\`\`bash
   # Run these files in Supabase SQL editor:
   scripts/00-create-database-schema.sql
   scripts/01-create-match-movies-by-mood.sql
   scripts/02-create-user-actions-tables.sql
   # ... and so on
   \`\`\`

5. **Seed the database:**
   \`\`\`bash
   npx tsx scripts/seed-production-quick.ts
   \`\`\`

6. **Start the development server:**
   \`\`\`bash
   npm run dev
   \`\`\`

   Open [http://localhost:3000](http://localhost:3000) to see the application.

## Deployment

### Automatic Deployment (Recommended)

Since this repo is connected to Vercel via GitHub integration:

1. **Push your changes:**
   \`\`\`bash
   git add .
   git commit -m "Your commit message"
   git push origin main
   \`\`\`

2. **Vercel will automatically deploy** - no additional commands needed!

3. **Set environment variables in Vercel:**
   - Go to your Vercel dashboard
   - Select your project → Settings → Environment Variables
   - Add the same variables from your `.env.local`

### Manual Deployment

If you prefer manual deployment:
\`\`\`bash
vercel --prod
\`\`\`

## Project Structure

\`\`\`
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   └── page.tsx           # Main page
├── components/            # React components
├── lib/                   # Utility functions
├── scripts/               # Database and utility scripts
└── public/               # Static assets
\`\`\`

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (for server-side operations) |
| `TMDB_API_READ_ACCESS_TOKEN` | TMDb API read access token |

## API Endpoints

- `GET /api/movies/recommendations` - Get movie recommendations based on mood
  - Query parameters: `mood`, `limit`, `threshold`, `exclude`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Push to your branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.
