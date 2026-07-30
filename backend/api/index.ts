// Vercel serverless function entry point
// Re-exports the Express app so @vercel/node can handle it
import app from '../src/server';
export default app;
