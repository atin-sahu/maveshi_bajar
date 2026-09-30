import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

let lastDbError: string | null = null;

export function getDbStatus() {
  const uri = process.env.MONGODB_URI;
  const isConnected = !!(cached.conn && cached.conn.connection.readyState === 1);
  return {
    connected: isConnected,
    uriConfigured: !!uri,
    error: isConnected ? null : lastDbError,
  };
}

export async function connectToDatabase(): Promise<typeof mongoose | null> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    lastDbError = "MONGODB_URI environment variable is not defined";
    return null;
  }

  if (cached.conn && cached.conn.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    };

    cached.promise = mongoose
      .connect(uri, opts)
      .then((m) => {
        lastDbError = null;
        return m;
      })
      .catch((err) => {
        lastDbError = err.message || "Failed to connect to MongoDB";
        console.warn("[MongoDB] Connection error, using demo fallback:", err.message);
        cached.promise = null;
        return null as unknown as typeof mongoose;
      });
  }

  try {
    cached.conn = await cached.promise;
    if (cached.conn && cached.conn.connection.readyState !== 1) {
      cached.conn = null;
      cached.promise = null;
      return null;
    }
  } catch (e: unknown) {
    lastDbError = e instanceof Error ? e.message : "Unknown connection error";
    cached.promise = null;
    return null;
  }

  return cached.conn;
}
