const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const seedQuestions = require("./utils/seed"); // Import the seeding function

// Import modular routes
const userRoutes = require("./routes/users");
const questionRoutes = require("./routes/questions");
const answerRoutes = require("./routes/answers");
const sessionRoutes = require("./routes/sessions");

require("dotenv").config();

// Initialize Express
const app = express();

// Middleware to parse JSON requests
app.use(express.json());
app.use(cors()); // Enable CORS for cross-origin requests

// Connect to the database and seed questions (if necessary)
(async () => {
  try {
    await connectDB();
    console.log("Database connected successfully!");

    if (process.env.SEED_DB === "true") {
      await seedQuestions();
      console.log("Seeding completed!");
    }
  } catch (error) {
    console.error("Error during server initialization:", error.message);
    process.exit(1); // Exit process on failure
  }
})();

// Define API routes
app.use("/api/users", userRoutes); // User-related routes
app.use("/api/questions", questionRoutes); // Question-related routes
app.use("/api/answers", answerRoutes); // Answer-related routes
app.use("/api/sessions", sessionRoutes); // Session-related routes

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || "Server Error" });
});

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));