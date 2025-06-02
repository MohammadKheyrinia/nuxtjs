// ~/server/utils/jwt.ts
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'; // Replace with an env variable in production

export function generateToken(userId: string) {
  return jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: '7d', // Valid for 7 days
  });
}