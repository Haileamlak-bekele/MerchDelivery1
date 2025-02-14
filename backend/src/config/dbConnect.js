import mongoose from "mongoose";

const dbConnect = async () => {
  try {
    if (!process.env.MONGODB_URL) {
      throw new Error("MONGODB_URL is not defined in environment variables.");
    }

    await mongoose.connect(process.env.MONGODB_URL);

    console.log('Database Connected Successfully');
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
};

export default dbConnect;
