const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Response = require("../models/Response");
const Session = require("../models/Session");
const calculateMatchingScore = require("../utils/calculateMatchingScore");

// Utility: Validate ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Utility: Sort responses by questionId
const sortResponsesByQuestionId = (responses) =>
  responses.sort((a, b) =>
    a.questionId.toString().localeCompare(b.questionId.toString())
  );

// Submit answers
router.post("/", async (req, res) => {
  const { sessionId, userId, answers } = req.body;

  console.log("Received payload at backend:", {
    sessionId,
    userId,
    answers,
  });

  // Validate input
  if (!sessionId || !userId || !answers || !Array.isArray(answers)) {
    return res.status(400).json({
      success: false,
      error: "Session ID, User ID, and answers (as an array) are required.",
    });
  }

  if (!isValidObjectId(sessionId) || !isValidObjectId(userId)) {
    return res.status(400).json({
      success: false,
      error: "Invalid session ID or user ID format.",
    });
  }

  try {
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: "Session not found.",
      });
    }

    if (
      session.motherId?.toString() !== userId &&
      session.childId?.toString() !== userId
    ) {
      return res.status(403).json({
        success: false,
        error: "User is not associated with this session.",
      });
    }

    // Check for duplicate responses
    const questionIds = answers.map((a) => a.questionId);
    const existingResponses = await Response.find({
      sessionId: new mongoose.Types.ObjectId(sessionId),
      userId: new mongoose.Types.ObjectId(userId),
      questionId: { $in: questionIds.map((id) => new mongoose.Types.ObjectId(id)) },
    });

    if (existingResponses.length > 0) {
      return res.status(409).json({
        success: false,
        error: "Duplicate responses detected for one or more questions.",
      });
    }

    // Save new responses
    const responses = answers.map((answer) => ({
      sessionId: new mongoose.Types.ObjectId(sessionId),
      userId: new mongoose.Types.ObjectId(userId),
      questionId: new mongoose.Types.ObjectId(answer.questionId),
      answer: answer.answer,
    }));
    await Response.insertMany(responses);

    console.log(`Saved ${responses.length} responses for userId: ${userId}`);

    // Fetch all responses for the session
    const allResponses = await Response.find({
      sessionId: new mongoose.Types.ObjectId(sessionId),
    });

    // Filter responses by participants
    const motherResponses = sortResponsesByQuestionId(
      allResponses.filter((resp) => resp.userId.toString() === session.motherId?.toString())
    );
    const childResponses = sortResponsesByQuestionId(
      allResponses.filter((resp) => resp.userId.toString() === session.childId?.toString())
    );

    const totalQuestions = 10; // Adjust based on your question setup

    // Update completion flags
    if (motherResponses.length === totalQuestions) {
      session.motherCompleted = true;
    }
    if (childResponses.length === totalQuestions) {
      session.childCompleted = true;
    }

    // Check if both participants have completed
    if (session.motherCompleted && session.childCompleted) {
      const motherAnswers = motherResponses.map((r) => r.answer);
      const childAnswers = childResponses.map((r) => r.answer);

      // Calculate the matching score
      const matchingScore = calculateMatchingScore(motherAnswers, childAnswers);

      session.status = "completed";
      session.matchingScore = matchingScore;
      await session.save();

      console.log(`Matching score for session ${sessionId}: ${matchingScore}`);

      return res.status(200).json({
        success: true,
        message: "Both participants have completed the quiz!",
        data: {
          matchingScore,
        },
      });
    }

    // Save updated completion flags
    await session.save();

    res.status(200).json({
      success: true,
      message: "Answers submitted successfully. Waiting for the other participant.",
    });
  } catch (error) {
    console.error("Error submitting answers:", error.message);
    res.status(500).json({
      success: false,
      error: "An error occurred while submitting answers.",
    });
  }
});

module.exports = router;