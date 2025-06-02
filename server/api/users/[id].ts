import { User, Transaction } from '~/server/models';
import { connectDB } from '~/server/utils/db';
import { Types } from 'mongoose';

export default defineEventHandler(async (event) => {
  await connectDB();

  const requestedUserId = event.context.params?.id;

  // --- Authorization Check ---
  // Ensure the user is authenticated via the auth middleware
  if (!event.context.user || !event.context.user.userId) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  const authenticatedUserId = event.context.user.userId;

  // Ensure the authenticated user is requesting their own data
  if (authenticatedUserId !== requestedUserId) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden: You can only access your own data' });
  }
  // --- End Authorization Check ---


  if (!requestedUserId || !Types.ObjectId.isValid(requestedUserId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid user ID format' });
  }

  // Verify user exists and select only necessary fields
  const user = await User.findById(requestedUserId).select('_id name email').lean();
  if (!user) {
    throw createError({ statusCode: 404, statusMessage: 'User not found' });
  }

  // Get all transactions for this user, sorted by newest first
  const transactions = await Transaction.find({ userId: requestedUserId }).sort({ createdAt: -1 }).lean();

  // Calculate income and expenses
  const income = transactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);

  const expense = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = income - expense;

  // Return latest 8 transactions for recentTransactions
  const recentTransactions = transactions.slice(0, 8);

  return {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
    },
    balance,
    income,
    expense,
    recentTransactions,
    // transactions, // you can remove this if you don't want to send all transactions here
  };
});