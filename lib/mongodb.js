import mongoose from 'mongoose';

const connectToDatabase = async () => {
  
  if (mongoose.connection.readyState >= 1) {
    // If a connection is already established, do nothing
    console.log("MongoDB connection already established");
    return;
  }

  // Connect to MongoDB only if not already connected
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};

export default connectToDatabase;