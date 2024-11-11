// backend/controllers/sessionController.js
const Session = require('../models/Session');
const Response = require('../models/Response');

// Function to complete the quiz for the current user in the session
exports.completeQuiz = async (req, res) => {
    const {
        sessionId
    } = req.params;
    const {
        userId
    } = req.body;

    try {
        // Find the session
        const session = await Session.findById(sessionId);
        if (!session) {
            return res.status(404).json({
                error: 'Session not found'
            });
        }

        // Update session based on role
        if (session.motherId.equals(userId)) {
            session.motherCompleted = true;
        } else if (session.childId.equals(userId)) {
            session.childCompleted = true;
        } else {
            return res.status(400).json({
                error: 'User not part of this session'
            });
        }

        await session.save();

        // Check if both users have completed the quiz
        if (session.motherCompleted && session.childCompleted) {
            // Fetch responses for both mother and child
            const motherResponses = await Response.find({
                userId: session.motherId
            });
            const childResponses = await Response.find({
                userId: session.childId
            });

            // Calculate matching score
            let matches = 0;
            const totalQuestions = motherResponses.length;

            motherResponses.forEach((motherResponse) => {
                // Find the corresponding child response by adding 10 to the mother's questionId
                const correspondingChildResponse = childResponses.find(
                    (resp) => resp.questionId === motherResponse.questionId + 10
                );

                // Compare answers only if a corresponding child response is found
                if (correspondingChildResponse && correspondingChildResponse.answer === motherResponse.answer) {
                    matches += 1;
                }
            });

            const matchingScore = (matches / totalQuestions) * 100;

            // Store matching score in session
            session.matchingScore = matchingScore;
            await session.save();

            res.json({
                message: 'Quiz completed and score calculated',
                matchingScore
            });
        } else {
            res.json({
                message: 'Quiz marked complete for user. Waiting for other participant.'
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Server error'
        });
    }
};