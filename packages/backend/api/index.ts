/**
 * Vercel Serverless Function entry point.
 *
 * Vercel routes all requests to /api/* through this handler.
 * The Hono app handles path-based routing internally.
 */
import { handle } from '@hono/node-server/vercel';
import app, { seedAdmin } from '../src/app';

// Seed admin user on cold start (runs once per function instance)
seedAdmin();

// Export the Vercel-compatible handler
export default handle(app);
