import { connectDB } from '~/server/utils/db';
import { Transaction, User } from '~/server/models';
import { z } from 'zod';

export const transactionSchema = z.object({
  amount: z.number().positive('Amount must be a positive number'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().optional(),
  type: z.enum(['INCOME', 'EXPENSE']),
  userId: z.string().length(24, 'Invalid user ID format'),  // expecting a 24-char hex string
  createdAt: z.string().optional(), // ISO date string if you want to accept it on input
});


export default defineEventHandler(async (event) => {
  try {
    await connectDB();
    const body = await readBody(event);

    const parsed = transactionSchema.safeParse(body);
    if (!parsed.success) {
      const errorMessages = parsed.error.issues.map(issue => issue.message).join(', ');
      throw createError({ statusCode: 400, statusMessage: `Validation error: ${errorMessages}` });
    }

    const transaction = new Transaction(parsed.data);
    await transaction.save();

    // ✅ Update user's balance
    const user = await User.findById(parsed.data.userId);
    if (!user) {
      throw createError({ statusCode: 404, statusMessage: 'User not found' });
    }

    const amount = parsed.data.amount;
    const isIncome = parsed.data.type === 'INCOME';

    // Increase or decrease balance
    user.balance += isIncome ? amount : -amount;
    user.transactions.push(transaction._id); // Optional: track transaction IDs
    await user.save();

    return {
      message: 'Transaction saved and balance updated',
      transaction,
      balance: user.balance, // Optional: return updated balance
    };
  } catch (error) {
    console.error('Error saving transaction:', error);
    return sendError(event, createError({
      statusCode: 500,
      statusMessage: 'Failed to save transaction'
    }));
  }
});
