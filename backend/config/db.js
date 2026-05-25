const mongoose = require('mongoose');

/**
 * Connect to MongoDB with retry logic.
 * Retries up to 5 times with a 5-second delay between attempts.
 */
const connectDB = async () => {
  const MAX_RETRIES = 5;
  const RETRY_DELAY_MS = 5000;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI);
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      break; // success — exit retry loop
    } catch (error) {
      console.error(
        `❌ MongoDB connection attempt ${attempt}/${MAX_RETRIES} failed: ${error.message}`
      );

      if (attempt === MAX_RETRIES) {
        console.error('🛑 All MongoDB connection attempts exhausted. Exiting.');
        process.exit(1);
      }

      console.log(`⏳ Retrying in ${RETRY_DELAY_MS / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    }
  }

  // ── Connection event listeners ──────────────────────────────────────
  mongoose.connection.on('connected', () => {
    console.log('📡 Mongoose connected to the database');
  });

  mongoose.connection.on('error', (err) => {
    console.error(`📡 Mongoose connection error: ${err.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('📡 Mongoose disconnected from the database');
  });
};

module.exports = connectDB;
