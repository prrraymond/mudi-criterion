# Production Deployment Guide

## Pre-Deployment Checklist

1. **Verify local setup works:**
   \`\`\`bash
   npm run dev
   # Test at http://localhost:3000
   \`\`\`

2. **Check production database:**
   \`\`\`bash
   npx tsx scripts/verify-production-ready.ts
   \`\`\`

3. **Seed production database if needed:**
   \`\`\`bash
   npx tsx scripts/seed-production-quick.ts
   \`\`\`

## Deploy to Vercel (GitHub Integration)

Since your GitHub repo is connected to Vercel:

1. **Push to GitHub:**
   \`\`\`bash
   git add .
   git commit -m "Ready for production deployment"
   git push origin main
   \`\`\`

2. **Vercel automatically deploys** - that's it! 🎉

3. **Add Environment Variables in Vercel Dashboard:**
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Select your project → Settings → Environment Variables
   - Add these variables:
   \`\`\`
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   TMDB_API_READ_ACCESS_TOKEN=your_tmdb_token
   \`\`\`

## Post-Deployment Testing

1. **Test the deployed app:**
   - Visit your Vercel URL
   - Go through the mood selection flow
   - Verify movie recommendations appear

2. **Test API directly:**
   \`\`\`bash
   curl "https://your-app.vercel.app/api/movies/recommendations?mood=low-energy-pleasant&limit=3&threshold=0.3"
   \`\`\`

## Troubleshooting

If recommendations don't work in production:

1. **Check Vercel logs:**
   - Go to Vercel dashboard → Functions tab
   - Check API route logs

2. **Verify database access:**
   \`\`\`bash
   # Update VERCEL_URL in test script
   npx tsx scripts/test-api-endpoint.ts
   \`\`\`

3. **Check RLS permissions:**
   \`\`\`sql
   -- Run in Supabase SQL editor
   SELECT COUNT(*) FROM public.movies;
   SELECT COUNT(*) FROM public.movie_mood_vectors;
   \`\`\`

## Success Criteria

✅ Local development works  
✅ Database has movies and vectors  
✅ RPC function works with service role key  
✅ Environment variables configured in Vercel  
✅ Pushed to GitHub (auto-deploys to Vercel)  
✅ Production app shows movie recommendations
