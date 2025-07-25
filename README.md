# Mudi Criterions

An emotional movie recommendation platform that helps users discover films based on their current mood and emotional state.

## Features

- **Mood-Based Recommendations**: Uses a sophisticated mood meter to understand your emotional state
- **Personalized Experience**: Tracks your viewing history and preferences
- **Social Features**: Share your movie feelings with the global community
- **Streaming Integration**: Find where to watch recommended movies
- **User Profiles**: Create and customize your movie lover profile

## Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Database**: Supabase (PostgreSQL with vector search)
- **Authentication**: Supabase Auth (Google OAuth + Email)
- **Movie Data**: The Movie Database (TMDb) API
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- TMDb API key

### Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/yourusername/mudi-criterions.git
cd mudi-criterions
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables:
\`\`\`bash
cp .env.example .env.local
\`\`\`

4. Fill in your environment variables in \`.env.local\`

5. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

## Environment Variables

Create a \`.env.local\` file with the following variables:

\`\`\`
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
TMDB_API_READ_ACCESS_TOKEN=your_tmdb_api_token
\`\`\`

## Database Setup

1. Create a new Supabase project
2. Run the SQL scripts in the \`scripts/\` folder in order:
   - \`00-create-database-schema.sql\`
   - \`01-create-match-movies-by-mood.sql\`
   - \`02-create-user-actions-tables.sql\`
   - And so on...

3. Seed the database with movie data:
\`\`\`bash
npx tsx scripts/seed-db.ts
\`\`\`

## Deployment

This project is designed to be deployed on Vercel with automatic deployments from GitHub.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details.
