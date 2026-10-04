import { MongoClient, Db, MongoClientOptions } from 'mongodb';

const options: MongoClientOptions = {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
  retryWrites: true,
  w: 'majority' as const,
  tls: true,
  tlsAllowInvalidCertificates: false,
};

let clientPromise: Promise<MongoClient> | null = null;

function getMongoUri(): string {
  const configuredUri = process.env.MONGODB_URI?.trim();
  if (configuredUri) {
    return configuredUri;
  }

  const configuredPassword = process.env.MONGODB_PASSWORD?.trim();
  if (configuredPassword) {
    const password = encodeURIComponent(configuredPassword);
    return `mongodb+srv://crowncoastalmongodb:${password}@crowncoastal.ucopr7e.mongodb.net/?appName=CrownCoastal`;
  }

  throw new Error('MONGODB_URI or MONGODB_PASSWORD environment variable is required');
}

function getMongoClientPromise(): Promise<MongoClient> {
  if (clientPromise) {
    return clientPromise;
  }

  const client = new MongoClient(getMongoUri(), options);

  if (process.env.NODE_ENV === 'development') {
    const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

    if (!globalWithMongo._mongoClientPromise) {
      globalWithMongo._mongoClientPromise = client.connect();
    }
    clientPromise = globalWithMongo._mongoClientPromise;
  } else {
    clientPromise = client.connect();
  }

  return clientPromise;
}

export async function getMongoDb(): Promise<Db> {
  try {
    const client = await getMongoClientPromise();
    return client.db(process.env.MONGODB_DB_NAME || 'crowncoastal');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw new Error('Failed to connect to MongoDB. Please check your connection string.');
  }
}


