#!/bin/bash
echo "🔧 Pulling Vercel environment variables and debugging..."

# Pull environment variables from Vercel
echo "1. Pulling environment variables from Vercel..."
vercel env pull .env.local

# Check if the pull was successful
if [ ! -f .env.local ]; then
    echo "❌ Failed to pull environment variables"
    echo "Make sure you're logged into Vercel: vercel login"
    echo "And that you're in the right project directory"
    exit 1
fi

echo "✅ Environment variables pulled to .env.local"

# Now run the debug script
echo "2. Running debug script..."
npx tsx scripts/debug-api-issue.ts

echo "3. Testing your deployed API..."
echo "Update the baseUrl in scripts/test-deployed-api.ts with your actual Vercel URL"
