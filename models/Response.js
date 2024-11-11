// backend/models/Response.js
const mongoose = require("mongoose");

const responseSchema = new mongoose.Schema({
    sessionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Session",
        required: true,
    }, // Links to the session
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    }, // Links to the user
    questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
        required: true,
    }, // Links to the question
    answer: {
        type: Boolean,
        required: true, // Ensures the answer is always provided
    }, // True for "Benar" and False for "Salah"
}, {
    timestamps: true, // Automatically add createdAt and updatedAt
});

// Indexing to optimize queries
responseSchema.index({
    sessionId: 1,
    userId: 1
}); // Optimize queries for session-user combinations
responseSchema.index({
    sessionId: 1,
    questionId: 1
}); // Optimize queries for session-question combinations

// Pre-save hook for validation
responseSchema.pre("save", function (next) {
    if (typeof this.answer !== "boolean") {
        return next(new Error("Answer must be a boolean value."));
    }
    next();
});

// Static method for bulk insert with validation
responseSchema.statics.bulkInsertResponses = async function (responsesArray) {
    // Validate that all responses have the required structure
    const isValid = responsesArray.every(
        (resp) =>
        resp.sessionId &&
        resp.userId &&
        resp.questionId &&
        typeof resp.answer === "boolean"
    );

    if (!isValid) {
        throw new Error("Invalid response structure in bulk insert.");
    }

    return await this.insertMany(responsesArray);
};

module.exports = mongoose.model("Response", responseSchema);