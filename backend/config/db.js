const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // useNewUrlParser: true, // Deprecated in Mongoose 6+
      // useUnifiedTopology: true, // Deprecated in Mongoose 6+
      // useCreateIndex: true, // Deprecated in Mongoose 6+
      // useFindAndModify: false, // Deprecated in Mongoose 6+
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;