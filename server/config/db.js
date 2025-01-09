const mongoose = require('mongoose');
//Imports and configures the dotenv package
//which loads environment variables from a .env file into process.env.
require('dotenv').config();
const connectDB = async () => {
    try {
        const connect = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/art_homepage', {
            useNewUrlParser: true, // Enables the new URL string parser
            useUnifiedTopology: true //Enables the new Server Discovery and Monitoring engine
        });
        console.log(`MongoDB Connected: ${connect.connection.host}`);
    } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1); //The 1 indicates an error exit code (any non-zero number indicates an error)

    }
}
module.exports = connectDB;