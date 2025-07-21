// Set Vercel environment flag
process.env.VERCEL = '1';

// Import and export the Express app for Vercel
export { default } from '../dist/index.js';
