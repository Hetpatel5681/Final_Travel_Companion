import mongoose from 'mongoose';

export const connectDatabase = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      throw new Error("MONGODB_URI environment variable is not defined");
    }

    await mongoose.connect(mongoURI);
    console.log("✓ MongoDB Connected Successfully");

    // Handle graceful shutdown on SIGINT
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log("MongoDB connection closed through app termination (SIGINT)");
      process.exit(0);
    });
    
  } catch (error) {
    console.error("✗ MongoDB Connection Failed", error);
    process.exit(1);
  }
};
