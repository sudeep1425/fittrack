const dns = require('dns');
const mongoose = require('mongoose');

// Force Google DNS — local router doesn't resolve MongoDB SRV records
dns.setServers(['8.8.8.8', '8.8.4.4']);

const LOCAL_MONGO_URI = 'mongodb://127.0.0.1:27017/srpproject';

const connectDB = async () => {
  const uri = process.env.MONGO_URI || LOCAL_MONGO_URI;

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 7000,
      socketTimeoutMS: 45000,
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    return;
  } catch (err) {
    console.error(`❌ MongoDB connection error using ${uri}:`, err.message);

    if (uri !== LOCAL_MONGO_URI) {
      console.log(`➡️ Trying local MongoDB fallback at ${LOCAL_MONGO_URI}...`);
      try {
        const conn = await mongoose.connect(LOCAL_MONGO_URI, {
          serverSelectionTimeoutMS: 7000,
          socketTimeoutMS: 45000,
        });
        console.log(`✅ MongoDB connected: ${conn.connection.host}`);
        return;
      } catch (localErr) {
        console.error(`❌ Local MongoDB connection error:`, localErr.message);
      }
    }

    console.error('Please ensure MongoDB is running locally or your Atlas URI and IP whitelist are correct.');
    process.exit(1);
  }
};

module.exports = { connectDB };
