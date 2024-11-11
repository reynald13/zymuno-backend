;
const mongoose = require("mongoose");
const Question = require("../models/Question"); // Adjust path if models are in a subfolder

// Mother Questions
const MotherQuestions = [{
        role: "mother",
        question: "Ibu suka baju bewarna terang daripada gelap.",
        type: "pre-question",
        options: [true, false]
    },
    {
        role: "mother",
        question: "Ibu lebih memilih belanja online daripada belanja langsung.",
        type: "pre-question",
        options: [true, false]
    },
    {
        role: "mother",
        question: "Ibu lebih suka liburan di pantai daripada gunung.",
        type: "pre-question",
        options: [true, false]
    },
    {
        role: "mother",
        question: "Ibu lebih suka main TikTok daripada Instagram.",
        type: "pre-question",
        options: [true, false]
    },
    {
        role: "mother",
        question: "Kalo lagi ga enak badan, Ibu sering pendam sendiri.",
        type: "pre-question",
        options: [true, false]
    },
    {
        role: "mother",
        question: "Saat ada masalah, orang yang diceritakan adalah ibu.",
        type: "main-question",
        options: [true, false]
    },
    {
        role: "mother",
        question: "Anak lebih suka liburan di luar negeri daripada dalam negeri.",
        type: "main-question",
        options: [true, false]
    },
    {
        role: "mother",
        question: "Saat sakit, orang pertama yang dicari anak adalah Ibu.",
        type: "main-question",
        options: [true, false]
    },
    {
        role: "mother",
        question: "Anak lebih suka cemilan asin daripada manis.",
        type: "main-question",
        options: [true, false]
    },
    {
        role: "mother",
        question: "Anak lebih suka berolahraga dengan teman daripada keluarga.",
        type: "main-question",
        options: [true, false]
    },
];

// Child Questions
const ChildQuestions = [{
        role: "child",
        question: "Saat ada masalah, orang yang pertama diceritakan adalah Ibu.",
        type: "pre-question",
        options: [true, false]
    },
    {
        role: "child",
        question: "Anak lebih suka liburan di luar negeri daripada dalam negeri.",
        type: "pre-question",
        options: [true, false]
    },
    {
        role: "child",
        question: "Saat sakit, orang pertama yang dicari anak adalah Ibu.",
        type: "pre-question",
        options: [true, false]
    },
    {
        role: "child",
        question: "Anak lebih suka cemilan asin daripada manis.",
        type: "pre-question",
        options: [true, false]
    },
    {
        role: "child",
        question: "Anak lebih suka berolahraga dengan teman daripada keluarga.",
        type: "pre-question",
        options: [true, false]
    },
    {
        role: "child",
        question: "Ibu suka baju bewarna terang daripada gelap.",
        type: "main-question",
        options: [true, false]
    },
    {
        role: "child",
        question: "Ibu lebih memilih belanja online daripada belanja langsung.",
        type: "main-question",
        options: [true, false]
    },
    {
        role: "child",
        question: "Ibu lebih suka liburan di pantai daripada gunung.",
        type: "main-question",
        options: [true, false]
    },
    {
        role: "child",
        question: "Ibu lebih suka main TikTok daripada Instagram.",
        type: "main-question",
        options: [true, false]
    },
    {
        role: "child",
        question: "Kalo lagi ga enak badan, Ibu sering pendam sendiri.",
        type: "main-question",
        options: [true, false]
    },
];

// Combine all questions
const allQuestions = [...MotherQuestions, ...ChildQuestions];

// Seed questions
const seedQuestions = async () => {
    try {
        const existingQuestions = await Question.countDocuments();
        if (existingQuestions > 0) {
            console.log("Questions already exist. Skipping seeding.");
            return;
        }
        await Question.insertMany(allQuestions);
        console.log("Questions seeded successfully!");
    } catch (error) {
        console.error("Error seeding questions:", error.message);
    }
};

module.exports = seedQuestions;