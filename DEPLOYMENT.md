# Deployment Guide

## Vercel Deployment

This app is designed to be deployed on Vercel with automatic GitHub integration.

### Prerequisites

1. **Supabase Project**: Set up a Supabase project with the required database schema
2. **TMDB API Key**: Get a read access token from The Movie Database
3. **GitHub Repository**: Code should be in a GitHub repository
4. **Vercel Account**: Connected to your GitHub account

### Environment Variables

Set these environment variables in your Vercel project settings:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
TMDB_API_READ_ACCESS_TOKEN=your_tmdb_api_read_access_token
\`\`\`

### Deployment Steps

1. **Connect Repository**
   - Go to Vercel dashboard
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Environment Variables**
   - In project settings, go to "Environment Variables"
   - Add all required variables listed above
   - Make sure they're set for Production, Preview, and Development

3. **Deploy**
   - Vercel will automatically deploy on every push to main branch
   - First deployment may take a few minutes

4. **Verify Deployment**
   - Check that the app loads at your Vercel URL
   - Test the API endpoint: `https://your-app.vercel.app/api/movies/recommendations?mood=low-energy-pleasant&limit=5`

### Database Setup

Make sure your Supabase database is properly set up:

1. **Run SQL Scripts**: Execute all scripts in the `scripts/` folder in order
2. **Seed Database**: Run the seeding script to populate with movie data
3. **Test RPC Function**: Verify the `match_movies_by_mood` function works

### Troubleshooting

**Build Failures**
- Check that all dependencies are listed in package.json
- Verify TypeScript types are correct
- Check build logs in Vercel dashboard

**API Errors**
- Verify environment variables are set correctly
- Check Supabase connection and permissions
- Review function logs in Vercel dashboard

**Database Issues**
- Ensure RLS policies allow access
- Verify the RPC function exists and has correct permissions
- Check that movie data is properly seeded

### Custom Domain

To use a custom domain:
1. Go to project settings in Vercel
2. Add your domain in the "Domains" section
3. Configure DNS records as instructed
4. SSL certificate will be automatically provisioned

### Monitoring

- Use Vercel Analytics for performance monitoring
- Check function logs for API errors
- Monitor Supabase dashboard for database performance
