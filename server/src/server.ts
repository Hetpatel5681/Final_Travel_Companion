import app from './app';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database';

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Connect to MongoDB BEFORE starting the Express server
  await connectDatabase();

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer();
