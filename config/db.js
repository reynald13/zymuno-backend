require("dotenv").config();
const mongoose = require("mongoose");

const connectDB = async (retries = 5, delay = 5000) => {
    while (retries) {
        try {
            const conn = await mongoose.connect(process.env.DB_URI);
            console.log(`MongoDB Connected: ${conn.connection.host}`);
            break; // Exit loop if connection is successful
        } catch (error) {
            console.error(`Error: ${error.message}`);
            retries -= 1;
            console.log(`Retries left: ${retries}`);
            if (!retries) process.exit(1); // Exit on final failure
            await new Promise((res) => setTimeout(res, delay)); // Wait before retrying
        }
    }
};

module.exports = connectDB;