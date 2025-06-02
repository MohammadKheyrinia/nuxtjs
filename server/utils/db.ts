import mongoose from 'mongoose';
const config = useRuntimeConfig();

export const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return;

  try {
    await mongoose.connect(config.mongodburi, {
      dbName: 'finance-app', // Replace with your database name
    });
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    throw err;
  }
};
