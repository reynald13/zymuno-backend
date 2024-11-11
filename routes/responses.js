const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Response = require("../models/QuizResponse");
const Session = require("../models/Session");

// Middleware: Validate MongoDB ObjectId
const validateObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Submit response
router.post("/", async (req, res) => {
  try {
    const {
      sessionId,
      userId,
      questionId,
      answer
    } = req.body;

    // Validate required fields
    if (!sessionId || !userId || questionId === undefined || answer === undefined) {
      return res.status(400).json({
        success: false,
        error: "All fields (sessionId, userId, questionId, answer) are required.",
      });
    }

    // Validate MongoDB ObjectIds
    if (
      !validateObjectId(sessionId) ||
      !validateObjectId(userId) ||
      !validateObjectId(questionId)
    ) {
      return res.status(400).json({
        success: false,
        error: "Invalid MongoDB ObjectId for sessionId, userId, or questionId.",
      });
    }

    // Validate session existence
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: "Session not found. Please provide a valid sessionId.",
      });
    }

    // Prevent duplicate responses
    const existingResponse = await Response.findOne({
      sessionId,
      userId,
      questionId,
    });
    if (existingResponse) {
      return res.status(400).json({
        success: false,
        error: "Response already exists for this question and user in the session.",
      });
    }

    // Create and save the response
    const newResponse = new Response({
      sessionId,
      userId,
      questionId,
      answer,
    });
    const savedResponse = await newResponse.save();

    // Count responses for progress tracking
    const responseCount = await Response.countDocuments({
      sessionId
    });

    // Optionally, update session progress (if required)
    // Example: Update session's status or progress based on response count
    // await Session.findByIdAndUpdate(sessionId, { progress: responseCount });

    res.status(201).json({
      success: true,
      message: "Response submitted successfully.",
      data: {
        savedResponse,
        responseCount,
        sessionId,
      },
    });
  } catch (error) {
    console.error("Error saving response:", error.message);
    res.status(500).json({
      success: false,
      error: "An error occurred while saving the response. Please try again later.",
    });
  }
});

module.exports = router;