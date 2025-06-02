// /server/api/users/logout.ts
import { setCookie } from 'h3';

export default defineEventHandler(async (event) => {
  // Clear the cookie
  setCookie(event, 'auth_token', '', {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0, // Set maxAge to 0 to immediately expire the cookie
  });

  return {
    message: 'Logout successful',
  };
});