// ~/server/middleware/auth.ts
import jwt from 'jsonwebtoken';
import { getCookie } from 'h3';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'; // Ensure this matches your jwt.ts

export default defineEventHandler(async (event) => {
  const publicRoutes = ['/api/users/login', '/api/users/register']; // Routes that don't require auth

  // Check if the current route is a public route
  if (publicRoutes.includes(event.path)) {
    return; // Allow access to public routes without authentication
  }

  const token = getCookie(event, 'auth_token');

  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized: No token provided',
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    // Attach the decoded user ID to the event context for later use in API routes
    event.context.user = { userId: decoded.userId };
  } catch (error: any) {
    // If token is expired, invalid, or malformed
    throw createError({
      statusCode: 401,
      statusMessage: `Unauthorized: ${error.message || 'Invalid token'}`,
    });
  }
});