import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local")
}

interface Cached {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

let cached: Cached = (global as any).mongoose

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null }
}

export async function connectDB() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      family: 4,
    }

    console.log("Connecting to MongoDB...")

    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      console.log("User MongoDB connected successfully")
      return mongoose
    })
  }

  try {
    cached.conn = await cached.promise

    // Log database info for debugging if connection is established
    if (mongoose.connection && mongoose.connection.readyState === 1 && mongoose.connection.db) {
      const dbName = mongoose.connection.db.databaseName
      console.log(`Connected to database: ${dbName}`)

      try {
        // List collections for debugging
        const collections = await mongoose.connection.db.listCollections().toArray()
        console.log(
          "Available collections:",
          collections.map((c) => c.name),
        )
      } catch (listError) {
        console.error("Error listing collections:", listError instanceof Error ? listError.message : "Unknown error")
      }
    }

    return cached.conn
  } catch (e) {
    cached.promise = null
    console.error("Error connecting to MongoDB:", e instanceof Error ? e.message : "Unknown error")
    throw e
  }
}

