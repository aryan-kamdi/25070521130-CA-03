const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/flexi_movies';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`\n====================================================`);
    console.log(`🍃 [MongoDB] Connected: ${conn.connection.host}/${conn.connection.name}`);
    console.log(`====================================================\n`);
  } catch (error) {
    console.error(`\n⚠️  [MongoDB Warning] Could not connect to MongoDB at: ${uri}`);
    console.error(`   Reason: ${error.message}`);
    console.error(`   👉 Please start your local MongoDB service and ensure MongoDB Compass can connect to:`);
    console.error(`      mongodb://127.0.0.1:27017`);
    console.error(`   Once MongoDB is running, run: npm run seed\n`);
  }
};

// Monitor ongoing connection events
mongoose.connection.on('disconnected', () => {
  console.log('⚠️  [MongoDB] Disconnected from database.');
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ [MongoDB] Reconnected to database.');
});

module.exports = connectDB;

