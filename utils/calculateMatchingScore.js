const calculateMatchingScore = (motherAnswers, childAnswers) => {
  if (!Array.isArray(motherAnswers) || !Array.isArray(childAnswers)) {
    throw new Error("Both inputs must be arrays.");
  }

  if (motherAnswers.length !== childAnswers.length) {
    throw new Error("Answer arrays must be of the same length.");
  }

  const matches = motherAnswers.reduce(
    (count, answer, index) => count + (answer === childAnswers[index] ? 1 : 0),
    0
  );

  return (matches / motherAnswers.length) * 100;
};

module.exports = calculateMatchingScore;