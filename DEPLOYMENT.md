# Deployment Guide

## Prerequisites

1. **Supabase Project**: Set up a Supabase project with the required database schema
2. **TMDb API Key**: Get a read access token from The Movie Database
3. **Vercel Account**: For deployment

## Environment Variables

Set these in your Vercel dashboard under Settings → Environment Variables:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
TMDB_API_READ_ACCESS_TOKEN=your_tmdb_read_access_token
\`\`\`

## Database Setup

1. Run the SQL scripts in your Supabase SQL editor:
   - `scripts/00-create-database-schema.sql`
   - `scripts/01-create-match-movies-by-mood.sql`
   - `scripts/02-create-user-actions-tables.sql`
   - `scripts/04-create-user-profiles-fixed.sql`

2. Seed the database:
   \`\`\`bash
   npx tsx scripts/seed-production-quick.ts
   \`\`\`

## Deployment

The app automatically deploys to Vercel when you push to the main branch.

## Testing

After deployment, test the API:

\`\`\`bash
npx tsx scripts/test-actual-api.ts
\`\`\`

## Troubleshooting

- Check Vercel function logs for errors
- Verify all environment variables are set
- Ensure database is properly seeded
- Test RPC functions directly in Supabase
