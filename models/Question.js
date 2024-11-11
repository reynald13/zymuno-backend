const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
    role: {
      type: String,
      enum: ["mother", "child"], // Allowed roles
      required: true,
    },
    question: {
      type: String,
      required: true,
      trim: true, // Trims leading/trailing whitespace
    },
    type: {
      type: String,
      enum: ["pre-question", "main-question"], // Allowed question types
      required: true,
    },
    options: {
      type: [Boolean],
      required: true,
      default: [true, false],
      validate: {
        validator: (options) =>
          options.length === 2 && options.includes(true) && options.includes(false),
        message: "Options must only contain [true, false]",
      },
    },
  }, {
    timestamps: true
  } // Automatically add createdAt and updatedAt
);

// Add an index for faster querying based on role and type
questionSchema.index({
  role: 1,
  type: 1
});

module.exports = mongoose.model("Question", questionSchema);