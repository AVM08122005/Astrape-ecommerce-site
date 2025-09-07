// lib/mongoose.js
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || '';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI or MONGO_URI environment variable in .env.local');
}

let cached = global._mongooseCache || { conn: null, promise: null };

async function dbConnect() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((m) => m);
  }

  try {
    cached.conn = await cached.promise;
    global._mongooseCache = cached;
    return cached.conn;
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
}

export default dbConnect;
