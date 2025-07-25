// /scripts/load-env.ts
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local at the project root
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
