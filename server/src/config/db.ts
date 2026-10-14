import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { config } from './env';

let mongodInstance: MongoMemoryServer | null = null;

export const connectDB = async (): Promise<void> => {
  try {
    if (config.useInMemoryDb === 'true') {
      console.log('📦 Starting in-memory MongoDB server as configured...');
      mongodInstance = await MongoMemoryServer.create();
      const memoryUri = mongodInstance.getUri();
      await mongoose.connect(memoryUri);
      console.log(`✅ In-memory MongoDB connected: ${memoryUri}`);
      return;
    }

    // Try connecting to primary URI with a 4-second timeout
    try {
      console.log(`⏳ Attempting connection to MongoDB at: ${config.mongodbUri}...`);
      await mongoose.connect(config.mongodbUri, {
        serverSelectionTimeoutMS: 4000,
      });
      console.log(`✅ MongoDB connected successfully: ${config.mongodbUri}`);
    } catch (connErr: any) {
      if (config.useInMemoryDb === 'auto' || config.useInMemoryDb === 'true') {
        console.warn(`⚠️ Could not connect to external MongoDB: ${connErr.message}`);
        console.log('🔄 Auto-switching to embedded MongoDB Memory Server for zero-friction demo execution...');
        mongodInstance = await MongoMemoryServer.create();
        const memoryUri = mongodInstance.getUri();
        await mongoose.connect(memoryUri);
        console.log(`✅ Embedded MongoDB engine active at: ${memoryUri}`);
      } else {
        throw connErr;
      }
    }
  } catch (error: any) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    if (mongodInstance) {
      await mongodInstance.stop();
    }
  } catch (err) {
    console.error('Error disconnecting MongoDB:', err);
  }
};
