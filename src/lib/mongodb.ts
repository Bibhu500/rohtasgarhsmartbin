import { MongoClient, Collection, Db } from "mongodb";
import { BinReading } from "@/types/bin";

const uri = process.env.MONGODB_URI;
const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
};

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

export function isMongoConfigured(): boolean {
  return Boolean(uri && uri.trim().length > 0);
}

/**
 * Cached global MongoDB client promise.
 * Safe for Next.js serverless functions on Vercel: reuses the client connection
 * across warm lambda invocations and avoids exhausting MongoDB connection pools.
 */
export function getMongoClientPromise(): Promise<MongoClient> {
  if (!uri) {
    throw new Error(
      "Please define the MONGODB_URI environment variable inside .env / .env.local"
    );
  }

  if (!global._mongoClientPromise) {
    const client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  return global._mongoClientPromise;
}

export async function getDatabase(dbName?: string): Promise<Db> {
  const client = await getMongoClientPromise();
  return client.db(dbName || process.env.MONGODB_DB || "smartdustbin");
}

export async function getBinReadingsCollection(): Promise<Collection<BinReading>> {
  const db = await getDatabase();
  return db.collection<BinReading>("bin_readings");
}
