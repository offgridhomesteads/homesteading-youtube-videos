// Vercel serverless function that loads the Express app
import('../dist/index.js').then(module => {
  module.default || module;
}).catch(err => {
  console.error('Failed to load Express app:', err);
});

// Re-export the Express app for Vercel
export { default } from '../dist/index.js';
