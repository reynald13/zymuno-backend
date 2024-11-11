const express = require("express");
const mongoose = require("mongoose");
const Session = require("../models/Session");
const router = express.Router();

// Middleware: Validate MongoDB ObjectId
const validateObjectId = (req, res, next) => {
  const id = req.params.sessionId || req.params.userId;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      error: "Invalid ID format."
    });
  }
  next();
};

// Start or update a session
router.post("/start", async (req, res) => {
  const {
    motherId,
    childId
  } = req.body;

  if (!motherId && !childId) {
    return res.status(400).json({
      success: false,
      error: "Either Mother ID or Child ID is required.",
    });
  }

  try {
    let session;

    if (motherId) {
      session = await Session.findOne({
        motherId
      });
    } else if (childId) {
      session = await Session.findOne({
        childId
      });
    }

    if (session) {
      const updatedSession = await Session.findByIdAndUpdate(
        session._id, {
          $set: {
            motherId: motherId || session.motherId,
            childId: childId || session.childId,
          },
        }, {
          new: true
        }
      );

      return res.status(200).json({
        success: true,
        message: "Session updated successfully.",
        sessionId: updatedSession._id,
        session: updatedSession,
      });
    }

    const newSession = await Session.create({
      motherId: motherId || null,
      childId: childId || null,
    });

    res.status(201).json({
      success: true,
      message: "Session created successfully.",
      sessionId: newSession._id,
      session: newSession,
    });
  } catch (error) {
    console.error("Error starting session:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to start session."
    });
  }
});

// Fetch session details
router.get("/:sessionId", validateObjectId, async (req, res) => {
  try {
    const session = await Session.findById(req.params.sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: "Session not found."
      });
    }
    res.json({
      success: true,
      session
    });
  } catch (error) {
    console.error("Error fetching session details:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to fetch session."
    });
  }
});

// Fetch session results (matching score)
router.get("/results/:sessionId", validateObjectId, async (req, res) => {
  try {
    const session = await Session.findById(req.params.sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: "Session not found."
      });
    }

    if (session.matchingScore === null) {
      return res.status(200).json({
        success: true,
        message: "Matching score not yet computed.",
      });
    }

    res.json({
      success: true,
      matchingScore: session.matchingScore
    });
  } catch (error) {
    console.error("Error fetching session results:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to fetch session results."
    });
  }
});

// Fetch active session for a user
router.get("/active/:userId", validateObjectId, async (req, res) => {
  try {
    const session = await Session.findOne({
      $or: [{
        motherId: req.params.userId
      }, {
        childId: req.params.userId
      }],
      status: "in-progress",
    });
    if (!session) {
      return res.status(404).json({
        success: false,
        error: "No active session found."
      });
    }
    res.json({
      success: true,
      session
    });
  } catch (error) {
    console.error("Error fetching active session:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to fetch active session."
    });
  }
});

// Mark session as completed
router.put("/:sessionId/complete", validateObjectId, async (req, res) => {
  const {
    role
  } = req.body;

  if (!["mother", "child"].includes(role)) {
    return res.status(400).json({
      success: false,
      error: "Role must be either 'mother' or 'child'.",
    });
  }

  try {
    const session = await Session.findById(req.params.sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: "Session not found."
      });
    }

    if (role === "mother") session.motherCompleted = true;
    if (role === "child") session.childCompleted = true;

    if (session.motherCompleted && session.childCompleted) {
      session.status = "completed";
    }

    await session.save();
    res.json({
      success: true,
      session
    });
  } catch (error) {
    console.error("Error completing session:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to complete session."
    });
  }
});

module.exports = router;