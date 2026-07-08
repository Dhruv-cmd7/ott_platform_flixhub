const mongoose = require('mongoose');

mongoose.set('bufferCommands', false);

let listenersRegistered = false;
let ongoingConnectionPromise = null;

const registerConnectionListeners = () => {
  if (listenersRegistered) return;

  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected');
  });

  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err.message);
  });

  listenersRegistered = true;
};

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (ongoingConnectionPromise) {
    return ongoingConnectionPromise;
  }

  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/ott_platform';

  ongoingConnectionPromise = mongoose
    .connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    })
    .then(() => {
      registerConnectionListeners();
      return mongoose.connection;
    })
    .catch((error) => {
      console.error(`Database Connection Error: ${error.message}`);
      throw error;
    })
    .finally(() => {
      ongoingConnectionPromise = null;
    });

  return ongoingConnectionPromise;
};

module.exports = connectDB;
