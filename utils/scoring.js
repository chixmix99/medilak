// Scoring system for the MediKalak game

// Constants
const MAX_TIME_PER_QUESTION = 15; // 15 seconds per question
const BASE_POINTS = 100;
const TIME_BONUS_FACTOR = 10; // Points per second remaining

/**
 * Calculate score for a single question
 * @param {boolean} isCorrect - Whether the answer was correct
 * @param {number} timeRemaining - Time remaining in seconds (0-15)
 * @returns {number} - Points earned
 */
export const calculateQuestionScore = (isCorrect, timeRemaining) => {
  if (!isCorrect) return 0;
  
  // Ensure timeRemaining is within valid range
  const validTimeRemaining = Math.max(0, Math.min(timeRemaining, MAX_TIME_PER_QUESTION));
  
  // Base points for correct answer + time bonus
  return BASE_POINTS + Math.floor(validTimeRemaining * TIME_BONUS_FACTOR);
};

/**
 * Calculate performance rating based on percentage score
 * @param {number} score - Total score
 * @param {number} maxPossibleScore - Maximum possible score
 * @returns {string} - Performance rating
 */
export const calculatePerformanceRating = (score, maxPossibleScore) => {
  const percentage = (score / maxPossibleScore) * 100;
  
  if (percentage >= 90) return 'Excellent';
  if (percentage >= 75) return 'Great';
  if (percentage >= 60) return 'Good';
  if (percentage >= 45) return 'Fair';
  return 'Needs Improvement';
};

/**
 * Get feedback message based on performance rating
 * @param {string} rating - Performance rating
 * @returns {string} - Feedback message
 */
export const getFeedbackMessage = (rating) => {
  switch (rating) {
    case 'Excellent':
      return 'Outstanding! Your medical knowledge is exceptional!';
    case 'Great':
      return 'Very good! You have a strong grasp of medical concepts.';
    case 'Good':
      return 'Good job! Your medical knowledge is solid.';
    case 'Fair':
      return 'Nice effort! Keep studying to improve your medical knowledge.';
    case 'Needs Improvement':
      return 'Keep practicing! Medical knowledge takes time to build.';
    default:
      return 'Thanks for playing MediKalak!';
  }
};
