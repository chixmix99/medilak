import AsyncStorage from '@react-native-async-storage/async-storage';

// Keys for storage
const STORAGE_KEYS = {
  HIGH_SCORE: 'medikalak_high_score',
  SETTINGS: 'medikalak_settings',
  RECENT_SCORES: 'medikalak_recent_scores',
};

// Save high score
export const saveHighScore = async (score) => {
  try {
    const currentHighScore = await getHighScore();
    if (score > currentHighScore) {
      await AsyncStorage.setItem(STORAGE_KEYS.HIGH_SCORE, score.toString());
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error saving high score:', error);
    return false;
  }
};

// Get high score
export const getHighScore = async () => {
  try {
    const highScore = await AsyncStorage.getItem(STORAGE_KEYS.HIGH_SCORE);
    return highScore ? parseInt(highScore) : 0;
  } catch (error) {
    console.error('Error getting high score:', error);
    return 0;
  }
};

// Save recent score
export const saveRecentScore = async (score) => {
  try {
    const recentScores = await getRecentScores();
    const updatedScores = [score, ...recentScores.slice(0, 9)]; // Keep only 10 recent scores
    await AsyncStorage.setItem(STORAGE_KEYS.RECENT_SCORES, JSON.stringify(updatedScores));
  } catch (error) {
    console.error('Error saving recent score:', error);
  }
};

// Get recent scores
export const getRecentScores = async () => {
  try {
    const scores = await AsyncStorage.getItem(STORAGE_KEYS.RECENT_SCORES);
    return scores ? JSON.parse(scores) : [];
  } catch (error) {
    console.error('Error getting recent scores:', error);
    return [];
  }
};

// Save settings
export const saveSettings = async (settings) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings:', error);
  }
};

// Get settings
export const getSettings = async () => {
  try {
    const settings = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
    return settings 
      ? JSON.parse(settings) 
      : {
          soundEnabled: true,
          notificationsEnabled: true,
          darkMode: false,
        };
  } catch (error) {
    console.error('Error getting settings:', error);
    return {
      soundEnabled: true,
      notificationsEnabled: true,
      darkMode: false,
    };
  }
};

// Reset all progress
export const resetProgress = async () => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.HIGH_SCORE,
      STORAGE_KEYS.RECENT_SCORES,
    ]);
    return true;
  } catch (error) {
    console.error('Error resetting progress:', error);
    return false;
  }
};
