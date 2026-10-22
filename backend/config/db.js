const mongoose = require('mongoose');

let memoryServer = null;

/**
 * Connects to MongoDB.
 * - MONGODB_URI set: connect to it (MongoDB Atlas in production).
 * - Not set, outside production: start an in-memory MongoDB (dev dependency
 *   `mongodb-memory-server`) so `npm run dev` works with zero setup. Data resets on restart.
 */
const connectDB = async () => {
  try {
    let uri = process.env.MONGODB_URI;

    if (!uri) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('MONGODB_URI environment variable is not set');
      }
      const { MongoMemoryServer } = require('mongodb-memory-server');
      memoryServer = await MongoMemoryServer.create();
      uri = memoryServer.getUri();
      console.log('⚠️  MONGODB_URI not set: using an in-memory MongoDB (data resets on restart)');
    }

    const conn = await mongoose.connect(uri, {
      dbName: process.env.MONGODB_DB_NAME || 'stepupbd',
      serverSelectionTimeoutMS: 15000,
    });

    console.log('✅ MongoDB Connected:', conn.connection.name);
    return conn;
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (memoryServer) await memoryServer.stop();
};

module.exports = { connectDB, disconnectDB };
