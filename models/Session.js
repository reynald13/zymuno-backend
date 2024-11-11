const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
    motherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: function () {
            return !this.childId; // motherId is required if childId is not present
        },
    },
    childId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: function () {
            return !this.motherId; // childId is required if motherId is not present
        },
    },
    motherCompleted: {
        type: Boolean,
        default: false, // Tracks if mother has completed the quiz
    },
    childCompleted: {
        type: Boolean,
        default: false, // Tracks if child has completed the quiz
    },
    matchingScore: {
        type: Number,
        default: null, // Stores matching score after completion
    },
    status: {
        type: String,
        enum: ["in-progress", "completed", "canceled"],
        default: "in-progress", // Quiz session status
    },
    responses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Response", // Links to responses
    }, ],
}, {
    timestamps: true, // Automatically add createdAt and updatedAt
});

// Indexes to optimize queries
sessionSchema.index({
    motherId: 1
});
sessionSchema.index({
    childId: 1
});
sessionSchema.index({
        motherId: 1,
        childId: 1
    }, {
        unique: true
    } // Ensure one session per mother-child pair
);

// Pre-save hook to validate session logic
sessionSchema.pre("save", function (next) {
    if (!this.motherId && !this.childId) {
        return next(new Error("A session must have either a motherId or childId."));
    }
    next();
});

// Static method: Get active session by userId
sessionSchema.statics.findActiveSession = async function (userId) {
    return this.findOne({
        $or: [{
            motherId: userId
        }, {
            childId: userId
        }],
        status: "in-progress",
    }).populate("responses");
};

// Instance method: Check if session is completed
sessionSchema.methods.isCompleted = function () {
    return this.motherCompleted && this.childCompleted;
};

module.exports = mongoose.model("Session", sessionSchema);