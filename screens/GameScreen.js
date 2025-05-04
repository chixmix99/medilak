import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  SafeAreaView, 
  TouchableOpacity,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

// Import components
import Timer from '../components/Timer';
import AnswerButton from '../components/AnswerButton';

// Import utilities and constants
import questions from '../constants/questions'; // Original questions as fallback
import medicalQuestions from '../constants/medicalQuestions'; // USMLE questions 
import colors from '../constants/colors';
import { calculateQuestionScore } from '../utils/scoring';

const GameScreen = ({ navigation, route }) => {
  // Get category from route params if available
  const { category } = route.params || {};
  
  // Choose question set based on availability and category
  const getQuestionSet = () => {
    // If we have USMLE questions and they're loaded, use them
    if (medicalQuestions && medicalQuestions.length > 0) {
      // If a category is specified, filter by category
      if (category) {
        const filteredQuestions = medicalQuestions.filter(q => 
          q.category.toLowerCase().includes(category.toLowerCase())
        );
        
        // If we have enough filtered questions, use them
        if (filteredQuestions.length >= 5) {
          return filteredQuestions;
        }
      }
      // Otherwise use all USMLE questions
      return medicalQuestions;
    }
    
    // Fallback to original questions if USMLE questions aren't available
    return questions;
  };
  
  // Get the question set
  const questionSet = getQuestionSet();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const [timerActive, setTimerActive] = useState(true);
  
  const currentQuestion = questionSet[currentQuestionIndex];
  
  // Reset state for new question
  const resetQuestion = () => {
    setSelectedAnswer(null);
    setCorrectAnswer(null);
    setTimeLeft(15);
    setTimerActive(true);
  };
  
  // Handle answer selection
  const handleAnswerSelect = (index) => {
    if (selectedAnswer !== null) return; // Prevent multiple selections
    
    setSelectedAnswer(index);
    setTimerActive(false);
    setCorrectAnswer(currentQuestion.correctAnswer);
    
    // Calculate score if answer is correct
    if (index === currentQuestion.correctAnswer) {
      const questionScore = calculateQuestionScore(true, timeLeft);
      setScore(prevScore => prevScore + questionScore);
    }
    
    // Wait before moving to next question
    setTimeout(() => {
      if (currentQuestionIndex < questionSet.length - 1) {
        setCurrentQuestionIndex(prevIndex => prevIndex + 1);
        resetQuestion();
      } else {
        // Game over - navigate to results
        navigation.replace('Results', {
          score,
          totalQuestions: questionSet.length,
        });
      }
    }, 1500);
  };
  
  // Handle when time is up
  const handleTimeUp = () => {
    if (selectedAnswer === null) {
      setSelectedAnswer(-1); // No answer selected
      setCorrectAnswer(currentQuestion.correctAnswer);
      
      // Wait before moving to next question
      setTimeout(() => {
        if (currentQuestionIndex < questionSet.length - 1) {
          setCurrentQuestionIndex(prevIndex => prevIndex + 1);
          resetQuestion();
        } else {
          // Game over - navigate to results
          navigation.replace('Results', {
            score,
            totalQuestions: questionSet.length,
          });
        }
      }, 1500);
    }
  };
  
  // Get category or difficulty display text
  const getCategoryText = () => {
    if (currentQuestion.category) {
      return currentQuestion.category;
    } else if (currentQuestion.difficulty) {
      return `Difficulty: ${currentQuestion.difficulty}`;
    }
    return 'Medical Knowledge';
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[colors.primaryGradient.start, colors.primaryGradient.end]}
        style={styles.header}
      >
        <View style={styles.topBar}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => {
              Alert.alert(
                'Exit Game',
                'Are you sure you want to exit? Your progress will be lost.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Exit', style: 'destructive', onPress: () => navigation.navigate('Home') }
                ]
              );
            }}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          
          <View style={styles.progressIndicator}>
            <Text style={styles.progressText}>
              Question {currentQuestionIndex + 1}/{questionSet.length}
            </Text>
          </View>
          
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreText}>{score}</Text>
          </View>
        </View>
        
        <Timer 
          duration={15} 
          isActive={timerActive} 
          onTimeUp={handleTimeUp} 
        />
      </LinearGradient>
      
      <View style={styles.content}>
        <View style={styles.questionContainer}>
          <Text style={styles.questionCategory}>
            {getCategoryText()}
          </Text>
          <Text style={styles.questionText}>
            {currentQuestion.question}
          </Text>
        </View>
        
        <View style={styles.answersContainer}>
          {currentQuestion.options.map((option, index) => (
            <AnswerButton
              key={index}
              option={option}
              index={index}
              onPress={handleAnswerSelect}
              disabled={selectedAnswer !== null}
              selectedIndex={selectedAnswer}
              correctIndex={correctAnswer}
            />
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  backButton: {
    padding: 5,
  },
  progressIndicator: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
  },
  progressText: {
    color: colors.text.light,
    fontWeight: 'bold',
  },
  scoreContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
  },
  scoreText: {
    color: colors.text.light,
    fontWeight: 'bold',
    fontSize: 16,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  questionContainer: {
    marginVertical: 20,
  },
  questionCategory: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 8,
  },
  questionText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text.primary,
    lineHeight: 28,
  },
  answersContainer: {
    marginTop: 10,
  },
});

export default GameScreen;
