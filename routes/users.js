const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../models/User");
const Session = require("../models/Session");

// Store user data
router.post("/", async (req, res) => {
  const {
    name,
    phone,
    email,
    domicile,
    role
  } = req.body;

  if (!name || !phone || !email || !domicile || !role) {
    return res.status(400).json({
      error: "All fields are required."
    });
  }

  // Validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\d{10,15}$/;
  const validRoles = ["Mother", "Child"];

  if (!emailRegex.test(email)) {
    return res.status(400).json({
      error: "Invalid email format."
    });
  }

  if (!phoneRegex.test(phone)) {
    return res.status(400).json({
      error: "Invalid phone number."
    });
  }

  if (!validRoles.includes(role)) {
    return res.status(400).json({
      error: "Invalid role."
    });
  }

  try {
    // Check for duplicate email
    const existingUser = await User.findOne({
      email
    });
    if (existingUser) {
      return res.status(400).json({
        error: "Email already exists."
      });
    }

    // Create a new user
    const user = new User({
      name,
      phone,
      email,
      domicile,
      role
    });
    await user.save();

    // Check for an existing session with the opposite role
    let session;

    if (role === "Mother") {
      // Check for a session with a child but no mother
      session = await Session.findOne({
        childId: {
          $ne: null
        },
        motherId: null
      });
      if (session) {
        session.motherId = user._id; // Link the mother to the session
      }
    } else if (role === "Child") {
      // Check for a session with a mother but no child
      session = await Session.findOne({
        motherId: {
          $ne: null
        },
        childId: null
      });
      if (session) {
        session.childId = user._id; // Link the child to the session
      }
    }

    if (session) {
      // Save the updated session
      await session.save();
      return res.status(200).json({
        message: "User created and session updated successfully!",
        user,
        sessionId: session._id,
      });
    }

    // If no session exists, create a new one
    const newSession = new Session({
      motherId: role === "Mother" ? user._id : null,
      childId: role === "Child" ? user._id : null,
    });
    await newSession.save();

    res.status(201).json({
      message: "User created and new session started successfully!",
      user,
      sessionId: newSession._id,
    });
  } catch (error) {
    console.error("Error storing user data or creating session:", error.message);
    res.status(500).json({
      error: "Failed to store user data or create session."
    });
  }
});

module.exports = router;