import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env vars
dotenv.config({ path: join(__dirname, '../.env') });

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      console.error('❌ ERROR: MONGODB_URI is not defined in .env file!');
      console.error('📝 Please create a .env file in the backend folder with:');
      console.error('   MONGODB_URI=mongodb://localhost:27017/transportdb');
      console.error('   (or use MongoDB Atlas connection string)');
      process.exit(1);
    }

    const conn = await mongoose.connect(mongoURI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error('💡 Make sure MongoDB is running or check your connection string');
    process.exit(1);
  }
};

export default connectDB;

