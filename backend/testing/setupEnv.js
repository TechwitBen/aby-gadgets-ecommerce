// Load environment variables from .env.test before any test file imports
require('dotenv').config({ path: '.env.test' });

// Optional: provide fallback dummy values if file is missing
process.env.GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'dummy-id-for-testing';
process.env.GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'dummy-secret-for-testing';