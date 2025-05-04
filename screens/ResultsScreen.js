import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  SafeAreaView, 
  TouchableOpacity,
  Image,
  ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import colors from '../constants/colors';
import { calculatePerformanceRating, getFeedbackMessage } from '../utils/scoring';
import { saveHighScore, saveRecentScore } from '../utils/storage';

const ResultsScreen = ({ route, navigation }) => {
  const { score, totalQuestions, lastQuestionIndex, explanation } = route.params || { 
    score: 0, 
    totalQuestions: 5,
    lastQuestionIndex: null,
    explanation: null
  };
  
  const maxPossibleScore = totalQuestions * 250; // Max is 100 + (15 * 10) = 250 per question
  const percentage = Math.round((score / maxPossibleScore) * 100);
  const performanceRating = calculatePerformanceRating(score, maxPossibleScore);
  const feedbackMessage = getFeedbackMessage(performanceRating);
  
  useEffect(() => {
    // Save score to storage
    saveHighScore(score);
    saveRecentScore({
      score,
      date: new Date().toISOString(),
      percentage,
      rating: performanceRating
    });
  }, [score, percentage, performanceRating]);
  
  // Get appropriate image based on performance
  const getResultImage = () => {
    switch (performanceRating) {
      case 'Excellent':
        return '🎉'; // Would be an actual image in a real app
      case 'Great':
        return '🥇';
      case 'Good':
        return '👍';
      case 'Fair':
        return '🙂';
      default:
        return '📚';
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[colors.primaryGradient.start, colors.primaryGradient.end]}
        style={styles.background}
      >
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
          <View style={styles.content}>
            <Text style={styles.title}>Quiz Completed!</Text>
            
            <View style={styles.resultCard}>
              <Text style={styles.emoji}>{getResultImage()}</Text>
              <Text style={styles.ratingText}>{performanceRating}</Text>
              <Text style={styles.feedbackText}>{feedbackMessage}</Text>
              
              <View style={styles.scoreInfoContainer}>
                <View style={styles.scoreItem}>
                  <Text style={styles.scoreLabel}>Score</Text>
                  <Text style={styles.scoreValue}>{score}</Text>
                </View>
                
                <View style={styles.divider} />
                
                <View style={styles.scoreItem}>
                  <Text style={styles.scoreLabel}>Percentage</Text>
                  <Text style={styles.scoreValue}>{percentage}%</Text>
                </View>
              </View>
            </View>
            
            {explanation && (
              <View style={styles.explanationCard}>
                <Text style={styles.explanationTitle}>Did You Know?</Text>
                <Text style={styles.explanationText}>{explanation}</Text>
              </View>
            )}
            
            <View style={styles.buttonsContainer}>
              <TouchableOpacity
                style={[styles.button, styles.playAgainButton]}
                onPress={() => navigation.replace('Game')}
              >
                <Ionicons name="refresh" size={20} color={colors.text.light} />
                <Text style={styles.playAgainButtonText}>Play Again</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate('Home')}
              >
                <Ionicons name="home" size={20} color={colors.primaryGradient.start} />
                <Text style={styles.buttonText}>Home</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text.light,
    marginBottom: 30,
    textAlign: 'center',
  },
  resultCard: {
    backgroundColor: colors.background.main,
    borderRadius: 20,
    padding: 20,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  emoji: {
    fontSize: 80,
    marginBottom: 15,
  },
  ratingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 10,
  },
  feedbackText: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  scoreInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    backgroundColor: colors.background.secondary,
    borderRadius: 15,
    padding: 15,
    marginTop: 10,
  },
  scoreItem: {
    alignItems: 'center',
    flex: 1,
  },
  divider: {
    width: 1,
    backgroundColor: '#DDDDDD',
    marginHorizontal: 15,
  },
  scoreLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 5,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primaryGradient.start,
  },
  explanationCard: {
    backgroundColor: colors.background.main,
    borderRadius: 20,
    padding: 20,
    width: '100%',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  explanationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 10,
  },
  explanationText: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.text.secondary,
  },
  buttonsContainer: {
    width: '100%',
    marginTop: 30,
  },
  button: {
    backgroundColor: colors.background.main,
    borderRadius: 15,
    paddingVertical: 15,
    alignItems: 'center',
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  playAgainButton: {
    backgroundColor: colors.primaryGradient.start,
  },
  buttonText: {
    color: colors.primaryGradient.start,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  playAgainButtonText: {
    color: colors.text.light,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default ResultsScreen;
