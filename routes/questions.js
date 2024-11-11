const express = require("express");
const router = express.Router();
const Question = require("../models/Question");

// Allowed values for role and type
const validRoles = ["mother", "child"];
const validTypes = ["pre-question", "main-question"];

// Fetch questions by role and type
router.get("/", async (req, res) => {
    const {
        role,
        type
    } = req.query;

    // Validate input presence
    if (!role || !type) {
        return res.status(400).json({
            success: false,
            error: "Both 'role' and 'type' query parameters are required.",
        });
    }

    // Normalize and validate input
    const roleLower = role.toLowerCase();
    const typeLower = type.toLowerCase();

    if (!validRoles.includes(roleLower)) {
        return res.status(400).json({
            success: false,
            error: `Invalid role. Role must be one of: ${validRoles.join(", ")}.`,
        });
    }

    if (!validTypes.includes(typeLower)) {
        return res.status(400).json({
            success: false,
            error: `Invalid type. Type must be one of: ${validTypes.join(", ")}.`,
        });
    }

    try {
        // Fetch questions from the database
        const questions = await Question.find({
            role: roleLower,
            type: typeLower
        });

        // Respond with appropriate message if no questions are found
        res.json({
            success: true,
            message: questions.length ?
                "Questions fetched successfully." :
                "No questions found for the specified role and type.",
            questions,
        });
    } catch (error) {
        console.error("Error fetching questions:", error.message);

        res.status(500).json({
            success: false,
            error: "An unexpected error occurred while fetching questions.",
        });
    }
});

module.exports = router;