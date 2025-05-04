import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  SafeAreaView, 
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
  FlatList
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';
import Timer from '../components/Timer';

// Import the questions
import medicalQuestions from '../constants/medicalQuestions';

const { width, height } = Dimensions.get('window');

// Avatar mappings
const AVATAR_IMAGES = {
  'health_potion': require('../assets/avatars/health_potion.png'),
  'medicine_bottle': require('../assets/avatars/medicine_bottle.png'),
  'pill_capsule': require('../assets/avatars/pill_capsule.png'),
  'medical_tablet': require('../assets/avatars/medical_tablet.png'),
  'digital_stethoscope': require('../assets/avatars/digital_stethoscope.png'),
  'smart_health_monitor': require('../assets/avatars/smart_health_monitor.png'),
};

const MultiplayerQuestionScreen = ({ navigation, route }) => {
  const { isMultiplayer, roomCode, players, currentPlayerIndex, category, playerScores = {} } = route.params || {};
  
  const [question, setQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [playerAnswers, setPlayerAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(30);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allAnswersSubmitted, setAllAnswersSubmitted] = useState(false);
  const [roundNumber, setRoundNumber] = useState(1);
  const [totalRounds, setTotalRounds] = useState(10);
  
  // Get a random question based on category
  useEffect(() => {
    const filteredQuestions = category
      ? medicalQuestions.filter(q => q.category === category)
      : medicalQuestions;
    
    const randomIndex = Math.floor(Math.random() * filteredQuestions.length);
    setQuestion(filteredQuestions[randomIndex]);
    
    // For gamification, set current round
    const savedRound = route.params?.roundNumber || 1;
    setRoundNumber(savedRound);
  }, [category]);
  
  // Handle when a player submits their answer
  const handleSubmitAnswer = () => {
    if (!userAnswer.trim()) {
      Alert.alert('Answer Required', 'Please enter your answer before submitting.');
      return;
    }
    
    setIsSubmitting(true);
    
    // In a real app, this would be sent to the server
    // For now, we'll simulate by adding to local state
    setTimeout(() => {
      const currentPlayer = players.find(p => p.isCurrentUser);
      const newPlayerAnswers = {...playerAnswers};
      
      // Store the user's answer with their ID
      newPlayerAnswers[currentPlayer.id] = {
        playerId: currentPlayer.id,
        playerName: currentPlayer.name,
        answer: userAnswer,
        votedBy: []
      };
      
      setPlayerAnswers(newPlayerAnswers);
      setIsSubmitting(false);
      
      // This is important to debug - log the user's answer
      console.log(`User ${currentPlayer.name} submitted answer: ${userAnswer}`);
      
      // Simulate other players submitting answers
      simulateOtherPlayersAnswers(newPlayerAnswers);
    }, 1000);
  };
  
  // Simulate other players submitting their answers
  const simulateOtherPlayersAnswers = (currentAnswers) => {
    setTimeout(() => {
      const mockAnswers = {...currentAnswers}; // Use the updated answers with user's answer
      
      // Add answer for each player who hasn't answered yet
      players.forEach(player => {
        if (!player.isCurrentUser && !mockAnswers[player.id]) {
          // Generate a plausible but incorrect answer
          const fakeAnswer = generateFakeAnswer(player.id);
          
          mockAnswers[player.id] = {
            playerId: player.id,
            playerName: player.name,
            answer: fakeAnswer,
            votedBy: []
          };
        }
      });
      
      // Add the correct answer if needed
      if (!Object.values(mockAnswers).some(a => a.answer === question.options[question.correctAnswer])) {
        mockAnswers['correct'] = {
          playerId: 'correct',
          playerName: 'Correct Answer',
          answer: question.options[question.correctAnswer],
          isCorrect: true,
          votedBy: []
        };
      }
      
      // Log all answers for debugging
      console.log('All answers being sent to voting screen:', mockAnswers);
      
      setPlayerAnswers(mockAnswers);
      setAllAnswersSubmitted(true);
      
      // Navigate to voting screen after all answers are in
      setTimeout(() => {
        navigation.navigate('MultiplayerVoting', {
          isMultiplayer: true,
          roomCode: roomCode,
          players: players,
          question: question,
          playerAnswers: mockAnswers,
          roundNumber: roundNumber,
          totalRounds: totalRounds,
          playerScores: playerScores
        });
      }, 1000);
    }, 2000);
  };
  
  // Generate a plausible but incorrect answer
  const generateFakeAnswer = (playerId) => {
    // Get an incorrect option as a fake answer
    const incorrectOptions = question.options.filter((_, index) => index !== question.correctAnswer);
    const randomIndex = Math.floor(Math.random() * incorrectOptions.length);
    return incorrectOptions[randomIndex];
  };
  
  // Handle when time is up
  const handleTimeUp = () => {
    if (!playerAnswers[players.find(p => p.isCurrentUser).id]) {
      // Submit whatever the user has typed, or a blank answer
      handleSubmitAnswer();
    }
  };
  
  // Handle dismissing the keyboard
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };
  
  if (!question) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primaryGradient.start} />
          <Text style={styles.loadingText}>Loading question...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  const currentPlayer = players.find(p => p.isCurrentUser);
  const hasSubmitted = playerAnswers[currentPlayer.id] !== undefined;
  
  // Render player avatars
  const renderPlayerAvatars = () => {
    return (
      <FlatList
        data={players}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.playerAvatarsContainer}
        renderItem={({ item }) => {
          const hasAnswered = playerAnswers[item.id] !== undefined;
          const avatarSource = item.avatar ? AVATAR_IMAGES[item.avatar] : AVATAR_IMAGES['health_potion'];
          
          return (
            <View style={styles.playerAvatarWrapper}>
              <View style={[
                styles.playerAvatar,
                hasAnswered ? styles.playerAvatarAnswered : styles.playerAvatarWaiting,
                item.isCurrentUser && styles.playerAvatarCurrent
              ]}>
                <Image 
                  source={avatarSource} 
                  style={[
                    styles.avatarImage,
                    !hasAnswered && styles.avatarImageWaiting
                  ]} 
                />
              </View>
              <Text style={styles.playerAvatarName}>{item.name}</Text>
              {hasAnswered && (
                <View style={styles.answeredIndicator}>
                  <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
                </View>
              )}
            </View>
          );
        }}
      />
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <LinearGradient
          colors={['#0047AB', '#002366']}
          style={styles.background}
        >
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.menuButton}>
              <Ionicons name="menu" size={28} color="white" />
            </TouchableOpacity>
            
            <View style={styles.roundCounter}>
              <Text style={styles.roundText}>{roundNumber}/{totalRounds}</Text>
              <Text style={styles.roundLabel}>Round</Text>
            </View>
          </View>
          
          <View style={styles.questionContainer}>
            <Text style={styles.questionCategory}>
              {question.category || 'Medical Knowledge'}
            </Text>
            <Text style={styles.questionText}>
              {question.question}
            </Text>
          </View>
          
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.inputContainer}
          >
            <TextInput
              style={styles.answerInput}
              placeholder="Type your answer..."
              placeholderTextColor="#aaa"
              value={userAnswer}
              onChangeText={setUserAnswer}
              multiline
              editable={!hasSubmitted}
            />
            
            {!hasSubmitted ? (
              <TouchableOpacity 
                style={styles.submitButton}
                onPress={handleSubmitAnswer}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={styles.submitButtonText}>Submit Answer</Text>
                )}
              </TouchableOpacity>
            ) : (
              <View style={styles.waitingContainer}>
                <Text style={styles.waitingText}>
                  Waiting for other players...
                </Text>
                <ActivityIndicator color="#FFD700" size="small" style={styles.waitingSpinner} />
              </View>
            )}
          </KeyboardAvoidingView>
          
          {/* Player avatars */}
          <View style={styles.playerAvatarsSection}>
            {renderPlayerAvatars()}
          </View>
          
          {!hasSubmitted && (
            <View style={styles.timerContainer}>
              <Timer 
                duration={30} 
                isActive={!hasSubmitted} 
                onTimeUp={handleTimeUp}
                size={70}
                strokeWidth={8} 
              />
            </View>
          )}
        </LinearGradient>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0047AB',
  },
  background: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: 'white',
    marginTop: 20,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingTop: 10,
  },
  menuButton: {
    padding: 5,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 5,
  },
  roundCounter: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
    alignItems: 'center',
  },
  roundText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  roundLabel: {
    color: 'white',
    marginLeft: 5,
    fontSize: 16,
  },
  questionContainer: {
    marginTop: 30,
    marginBottom: 20,
    alignItems: 'center',
  },
  questionCategory: {
    fontSize: 16,
    color: '#FFD700',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  questionText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    lineHeight: 30,
    textAlign: 'center',
  },
  inputContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  answerInput: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 10,
    padding: 15,
    fontSize: 18,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#FFD700',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginHorizontal: width * 0.1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  submitButtonText: {
    color: '#0047AB',
    fontSize: 18,
    fontWeight: 'bold',
  },
  waitingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  waitingText: {
    fontSize: 18,
    color: 'white',
    marginTop: 20,
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  waitingSpinner: {
    marginLeft: 10,
  },
  timerContainer: {
    position: 'absolute',
    top: 20,
    right: width / 2 - 35,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerAvatarsSection: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    paddingHorizontal: 10,
  },
  playerAvatarsContainer: {
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  playerAvatarWrapper: {
    alignItems: 'center',
    marginHorizontal: 8,
    position: 'relative',
  },
  playerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 2,
  },
  playerAvatarCurrent: {
    borderColor: '#FFD700',
    backgroundColor: 'rgba(255,215,0,0.1)',
  },
  playerAvatarWaiting: {
    borderColor: 'rgba(255,255,255,0.5)',
  },
  playerAvatarAnswered: {
    borderColor: '#4CAF50',
    backgroundColor: 'rgba(76,175,80,0.1)',
  },
  avatarImage: {
    width: 45,
    height: 45,
    resizeMode: 'contain',
  },
  avatarImageWaiting: {
    opacity: 0.4,
  },
  playerAvatarName: {
    color: 'white',
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center',
    maxWidth: 80,
  },
  answeredIndicator: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 2,
  },
});

export default MultiplayerQuestionScreen; 