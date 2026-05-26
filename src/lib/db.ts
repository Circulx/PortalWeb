import mongoose, { type Connection } from "mongoose"

// Use PROFILE_DB as primary (same as profile database for consistency)
// Fallback to MONGODB_URI if PROFILE_DB is not set
const MONGODB_URI1 =
  process.env.PROFILE_DB ||
  process.env.MONGODB_URI ||
  "mongodb+srv://productcirc:Ranjesh12345@cluster0.c0jfv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

// Use PROFILE_DB for production database as well
const MONGODB_URI2 =
  process.env.PROFILE_DB ||
  process.env.PROD_DB ||
  process.env.MONGODB_URI ||
  "mongodb+srv://productcirc:Ranjesh12345@cluster0.c0jfv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

interface CachedConnections {
  conn1: Connection | null
  promise1: Promise<Connection> | null
  conn2: Connection | null
  promise2: Promise<Connection> | null
}

const globalWithMongo = global as typeof globalThis & {
  mongoConnections?: CachedConnections
}

const cached: CachedConnections = globalWithMongo.mongoConnections || {
  conn1: null,
  promise1: null,
  conn2: null,
  promise2: null,
}

export async function connectDB1(): Promise<Connection> {
  if (cached.conn1) return cached.conn1

  if (!cached.promise1) {
    cached.promise1 = mongoose
      .createConnection(MONGODB_URI1, {
        serverSelectionTimeoutMS: 30000,
        socketTimeoutMS: 45000,
      })
      .asPromise()
      .then((conn) => {
        console.log("MongoDB 1 connected successfully")
        return conn
      })
      .catch((error) => {
        console.error("MongoDB 1 connection error:", error)
        throw error
      })
  }

  try {
    cached.conn1 = await cached.promise1
  } catch (e) {
    cached.promise1 = null
    throw e
  }

  return cached.conn1
}

export async function connectDB2(): Promise<Connection> {
  if (cached.conn2) return cached.conn2

  if (!cached.promise2) {
    cached.promise2 = mongoose
      .createConnection(MONGODB_URI2, {
        serverSelectionTimeoutMS: 30000,
        socketTimeoutMS: 45000,
      })
      .asPromise()
      .then((conn) => {
        console.log("MongoDB 2 connected successfully")
        return conn
      })
      .catch((error) => {
        console.error("MongoDB 2 connection error:", error)
        throw error
      })
  }

  try {
    cached.conn2 = await cached.promise2
  } catch (e) {
    cached.promise2 = null
    throw e
  }

  return cached.conn2
}

// Store in global scope for HMR (Hot Module Replacement)
if (process.env.NODE_ENV !== "production") {
  globalWithMongo.mongoConnections = cached
}
