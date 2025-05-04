import React from 'react';
import { 
  StyleSheet, 
  TouchableOpacity, 
  Text, 
  Animated 
} from 'react-native';
import colors from '../constants/colors';

const AnswerButton = ({ 
  option, 
  index, 
  onPress, 
  disabled, 
  selectedIndex, 
  correctIndex 
}) => {
  // Determine button state for styling
  const isSelected = selectedIndex === index;
  const isCorrect = correctIndex === index;
  const isIncorrect = isSelected && selectedIndex !== correctIndex && correctIndex !== null;
  const showResult = correctIndex !== null;

  // Determine button color based on state
  const getButtonStyle = () => {
    if (!showResult) {
      return [styles.button, isSelected && styles.selectedButton];
    }
    
    if (isCorrect) {
      return [styles.button, styles.correctButton];
    }
    
    if (isIncorrect) {
      return [styles.button, styles.incorrectButton];
    }
    
    return [styles.button];
  };

  // Determine text color based on state
  const getTextStyle = () => {
    if (!showResult) {
      return [styles.optionText, isSelected && styles.selectedText];
    }
    
    if (isCorrect || isIncorrect) {
      return [styles.optionText, styles.resultText];
    }
    
    return [styles.optionText];
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={() => onPress(index)}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={styles.optionIndex}>{String.fromCharCode(65 + index)}</Text>
      <Text style={getTextStyle()}>{option}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.background.main,
    borderRadius: 10,
    padding: 15,
    marginVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  selectedButton: {
    backgroundColor: '#E3F2FD',
    borderColor: colors.primaryGradient.start,
  },
  correctButton: {
    backgroundColor: colors.feedback.correct,
    borderColor: colors.feedback.correct,
  },
  incorrectButton: {
    backgroundColor: colors.feedback.incorrect,
    borderColor: colors.feedback.incorrect,
  },
  optionIndex: {
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 10,
    width: 25,
    textAlign: 'center',
    borderRadius: 15,
    padding: 3,
    backgroundColor: '#F0F0F0',
    overflow: 'hidden',
  },
  optionText: {
    fontSize: 16,
    flex: 1,
    color: colors.text.primary,
  },
  selectedText: {
    color: colors.primaryGradient.start,
    fontWeight: 'bold',
  },
  resultText: {
    color: colors.text.light,
    fontWeight: 'bold',
  },
});

export default AnswerButton;
