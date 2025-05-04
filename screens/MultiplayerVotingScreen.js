import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Dimensions,
  Animated,
  TouchableWithoutFeedback,
  Keyboard,
  Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Timer from '../components/Timer';

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

// Minimum number of answer options to display
const MIN_ANSWER_OPTIONS = 4;

// Score constants for better readability and consistency
const SCORE_CORRECT_ANSWER = 500;  // Points for voting for correct answer
const SCORE_TRICKED_PLAYER = 300;  // Points per player tricked by your answer

const MultiplayerVotingScreen = ({ navigation, route }) => {
  const { 
    isMultiplayer, 
    roomCode, 
    players, 
    question, 
    playerAnswers,
    roundNumber,
    totalRounds,
    playerScores = {}
  } = route.params || {};

  const [selectedAnswerId, setSelectedAnswerId] = useState(null);
  const [votingComplete, setVotingComplete] = useState(false);
  const [votingResults, setVotingResults] = useState({});
  const [fadeAnim] = useState(new Animated.Value(0));
  const [displayAnswers, setDisplayAnswers] = useState([]);
  const [scoreChanges, setScoreChanges] = useState({});
  
  const currentPlayer = players.find(p => p.isCurrentUser);

  // Process answers on initial load
  useEffect(() => {
    prepareAnswersForDisplay();
    
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true
    }).start();
  }, []);

  // Handle dismissing the keyboard if any is showing
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  // Prepare the list of answers to display
  const prepareAnswersForDisplay = () => {
    // Step 1: Get all player answers and remove duplicates
    let answersMap = new Map();
    
    // Process player answers and track which players gave each answer
    Object.values(playerAnswers).forEach(answer => {
      // Skip the "correct" placeholder answer (we'll add it manually later)
      if (answer.playerId === 'correct') return;
      
      const answerText = answer.answer;
      
      if (answersMap.has(answerText)) {
        // If this answer already exists, add this player to contributors
        const existingAnswer = answersMap.get(answerText);
        existingAnswer.contributors.push({
          id: answer.playerId,
          name: answer.playerName
        });
      } else {
        // Otherwise create a new entry
        answersMap.set(answerText, {
          id: answer.playerId, // Use first player's ID
          text: answerText,
          contributors: [{
            id: answer.playerId,
            name: answer.playerName
          }],
          isCorrect: false,
          isPlayerAnswer: true
        });
      }
    });
    
    // Convert to array
    let uniqueAnswers = Array.from(answersMap.values());
    
    // Step 2: Add the correct answer if it's not already included
    const correctAnswerText = question.options[question.correctAnswer];
    const correctAnswerIncluded = uniqueAnswers.some(a => a.text === correctAnswerText);
    
    if (!correctAnswerIncluded) {
      uniqueAnswers.push({
        id: 'correct',
        text: correctAnswerText,
        contributors: [],
        isCorrect: true,
        isPlayerAnswer: false
      });
    } else {
      // Mark the existing answer as correct
      uniqueAnswers = uniqueAnswers.map(answer => 
        answer.text === correctAnswerText 
          ? { ...answer, isCorrect: true }
          : answer
      );
    }
    
    // Step 3: If we don't have enough options, add fake answers from other incorrect options
    if (uniqueAnswers.length < MIN_ANSWER_OPTIONS) {
      const additionalAnswersNeeded = MIN_ANSWER_OPTIONS - uniqueAnswers.length;
      const existingAnswerTexts = new Set(uniqueAnswers.map(a => a.text));
      
      // Generate additional fake answers from the remaining options
      const availableOptions = question.options
        .filter((opt, idx) => idx !== question.correctAnswer && !existingAnswerTexts.has(opt));
      
      if (availableOptions.length > 0) {
        // Shuffle the available options
        const shuffled = [...availableOptions].sort(() => 0.5 - Math.random());
        
        // Take as many as we need (or as many as are available)
        const additionalOptions = shuffled.slice(0, additionalAnswersNeeded);
        
        // Add these as system-generated answers
        additionalOptions.forEach((optionText, index) => {
          uniqueAnswers.push({
            id: `system_${index}`,
            text: optionText,
            contributors: [],
            isCorrect: false,
            isPlayerAnswer: false,
            isSystemGenerated: true
          });
        });
      }
    }
    
    // Shuffle the answers
    const shuffledAnswers = [...uniqueAnswers].sort(() => 0.5 - Math.random());
    
    setDisplayAnswers(shuffledAnswers);
  };

  // Handle when a player selects an answer to vote for
  const handleVote = (answerId) => {
    // Allow voting for any answer, including their own
    setSelectedAnswerId(answerId);
    
    // In a real app, this would be sent to the server
    setTimeout(() => {
      simulateVotingResults(answerId);
    }, 1000);
  };

  // Simulate voting results
  const simulateVotingResults = (selectedId) => {
    const results = {};
    
    // Initialize results structure
    displayAnswers.forEach(answer => {
      results[answer.id] = [];
    });
    
    // Add current player's vote
    results[selectedId].push(currentPlayer.id);
    
    // Simulate other players voting
    players.forEach(player => {
      if (!player.isCurrentUser) {
        // Determine which answer this player contributed to, if any
        const contributedToAnswerId = displayAnswers.find(answer => 
          answer.contributors.some(c => c.id === player.id)
        )?.id;
        
        // Players can potentially vote for their own answers in this version
        // but we'll make the AI players more likely to vote for the correct answer
        const eligibleAnswerIds = displayAnswers.map(a => a.id);
        
        if (eligibleAnswerIds.length > 0) {
          // Bias toward correct answer (50% chance)
          const correctAnswer = displayAnswers.find(a => a.isCorrect);
          const votesForCorrect = Math.random() > 0.5;
          
          let targetId;
          if (votesForCorrect && correctAnswer) {
            targetId = correctAnswer.id;
          } else {
            // Otherwise random choice from eligible answers
            const randomIndex = Math.floor(Math.random() * eligibleAnswerIds.length);
            targetId = eligibleAnswerIds[randomIndex];
          }
          
          results[targetId].push(player.id);
        }
      }
    });
    
    setVotingResults(results);
    setVotingComplete(true);
    
    // Calculate score changes
    const changes = calculateScoreChanges(results);
    setScoreChanges(changes);
    
    // Navigate to results after showing the voting results
    setTimeout(() => {
      // Calculate scores based on voting
      const updatedPlayerScores = {};
      
      // Initialize scores
      players.forEach(p => {
        updatedPlayerScores[p.id] = (playerScores?.[p.id] || 0) + (changes[p.id]?.total || 0);
      });
      
      // Navigate to results
      navigation.navigate('MultiplayerResults', {
        roomCode,
        players,
        question,
        displayAnswers,
        votingResults: results,
        playerScores: updatedPlayerScores,
        scoreChanges: changes,
        roundNumber,
        totalRounds
      });
    }, 3000);
  };
  
  // Calculate score changes for each player
  const calculateScoreChanges = (results) => {
    const changes = {};
    
    // Initialize with 0 change for each player
    players.forEach(p => {
      changes[p.id] = {
        total: 0,
        correctVote: 0,
        trickedOthers: 0,
        details: []
      };
    });
    
    // Calculate score changes for correct answers
    const correctAnswerId = displayAnswers.find(a => a.isCorrect)?.id;
    if (correctAnswerId && results[correctAnswerId]) {
      results[correctAnswerId].forEach(voterId => {
        if (changes[voterId]) {
          changes[voterId].correctVote = SCORE_CORRECT_ANSWER;
          changes[voterId].total += SCORE_CORRECT_ANSWER;
          changes[voterId].details.push({
            type: 'correct',
            text: `Voted for correct answer`,
            points: SCORE_CORRECT_ANSWER
          });
        }
      });
    }
    
    // Calculate score changes for tricking other players
    displayAnswers.forEach(answer => {
      if (!answer.isCorrect && answer.isPlayerAnswer && !answer.isSystemGenerated) {
        const answerId = answer.id;
        const votes = results[answerId] || [];
        
        // For each contributor to this answer
        if (answer.contributors && Array.isArray(answer.contributors)) {
          answer.contributors.forEach(contributor => {
            if (!contributor || !contributor.id) return;
            
            // Count votes excluding contributors
            const votesExcludingContributors = votes.filter(
              voterId => !answer.contributors.some(c => c && c.id === voterId)
            ).length;
            
            const trickedPoints = votesExcludingContributors * SCORE_TRICKED_PLAYER;
            
            if (trickedPoints > 0 && changes[contributor.id]) {
              changes[contributor.id].trickedOthers += trickedPoints;
              changes[contributor.id].total += trickedPoints;
              
              const playerNames = votes
                .filter(voterId => 
                  !answer.contributors.some(c => c && c.id === voterId)
                )
                .map(id => {
                  const player = players.find(p => p.id === id);
                  return player ? player.name : 'Unknown';
                }).join(', ');
              
              changes[contributor.id].details.push({
                type: 'tricked',
                text: `Tricked ${votesExcludingContributors} player(s): ${playerNames}`,
                points: trickedPoints
              });
            }
          });
        }
      }
    });
    
    return changes;
  };

  // Handle when voting time is up
  const handleTimeUp = () => {
    if (!selectedAnswerId) {
      // If time is up and no selection made, pick a random answer
      if (displayAnswers.length > 0) {
        const randomIndex = Math.floor(Math.random() * displayAnswers.length);
        handleVote(displayAnswers[randomIndex].id);
      }
    }
  };

  // Render each answer option for voting
  const renderAnswerItem = ({ item }) => {
    const answerId = item.id;
    const isSelected = selectedAnswerId === answerId;
    const isCorrectAnswer = item.isCorrect;
    const votesReceived = votingResults[answerId]?.length || 0;
    
    return (
      <TouchableOpacity
        style={[
          styles.answerCard,
          isSelected && styles.selectedAnswer,
          votingComplete && isCorrectAnswer && styles.correctAnswer,
        ]}
        onPress={() => !votingComplete && handleVote(answerId)}
        disabled={votingComplete}
        activeOpacity={0.8}
      >
        <View style={styles.answerContent}>
          <Text style={styles.answerText}>{item.text}</Text>
          
          {votingComplete && (
            <View style={styles.votingResultsContainer}>
              {isCorrectAnswer && (
                <Text style={styles.authorText}>
                  Correct answer
                </Text>
              )}
              
              <View style={styles.votesContainer}>
                <Ionicons name="thumbs-up" size={20} color="#FFD700" />
                <Text style={styles.votesText}>{votesReceived} {votesReceived === 1 ? 'vote' : 'votes'}</Text>
              </View>
            </View>
          )}
        </View>
        
        {isSelected && !votingComplete && (
          <View style={styles.selectedIndicator}>
            <Ionicons name="checkmark-circle" size={24} color="#FFD700" />
          </View>
        )}
        
        {votingComplete && isCorrectAnswer && (
          <View style={styles.correctIndicator}>
            <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // Render player avatars with voting status
  const renderPlayerAvatars = () => {
    return (
      <FlatList
        data={players}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.playerAvatarsContainer}
        renderItem={({ item }) => {
          const hasVoted = votingComplete && Object.values(votingResults).some(voters => 
            voters.includes(item.id)
          );
          
          const playerVote = votingComplete ? 
            Object.entries(votingResults).find(([_, voters]) => 
              voters.includes(item.id)
            )?.[0] : null;
            
          const votedForCorrectAnswer = playerVote && 
            displayAnswers.find(a => a.id === playerVote)?.isCorrect;
            
          const avatarSource = item.avatar ? 
            AVATAR_IMAGES[item.avatar] : 
            AVATAR_IMAGES['health_potion'];
          
          return (
            <View style={styles.playerAvatarWrapper}>
              <View style={[
                styles.playerAvatar,
                hasVoted && votedForCorrectAnswer && styles.playerAvatarCorrect,
                hasVoted && !votedForCorrectAnswer && styles.playerAvatarIncorrect,
                !hasVoted && styles.playerAvatarWaiting,
                item.isCurrentUser && styles.playerAvatarCurrent
              ]}>
                <Image 
                  source={avatarSource} 
                  style={[
                    styles.avatarImage,
                    !hasVoted && !votingComplete && styles.avatarImageWaiting
                  ]} 
                />
              </View>
              <Text style={styles.playerAvatarName}>{item.name}</Text>
              {hasVoted && (
                <View style={[
                  styles.votedIndicator,
                  votedForCorrectAnswer ? styles.votedCorrectIndicator : styles.votedIncorrectIndicator
                ]}>
                  <Ionicons 
                    name={votedForCorrectAnswer ? "checkmark-circle" : "close-circle"} 
                    size={18} 
                    color={votedForCorrectAnswer ? "#4CAF50" : "#F44336"} 
                  />
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
          
          <View style={styles.votingPromptContainer}>
            <Text style={styles.votingPrompt}>
              {votingComplete 
                ? 'Voting Results' 
                : 'Choose the correct answer'}
            </Text>
            {!votingComplete && (
              <Text style={styles.votingSubtitle}>
                Vote for what you think is correct! +{SCORE_CORRECT_ANSWER} points for correct votes, and you get +{SCORE_TRICKED_PLAYER} points for each player who votes for your answer.
              </Text>
            )}
          </View>
          
          <Animated.View style={[styles.answersContainer, { opacity: fadeAnim }]}>
            <FlatList
              data={displayAnswers}
              renderItem={renderAnswerItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.answersList}
              showsVerticalScrollIndicator={false}
            />
          </Animated.View>
          
          {!votingComplete && (
            <View style={styles.timerContainer}>
              <Timer 
                duration={20} 
                isActive={!votingComplete} 
                onTimeUp={handleTimeUp}
                size={70}
                strokeWidth={8} 
              />
            </View>
          )}
          
          {/* Player avatars */}
          <View style={styles.playerAvatarsSection}>
            {renderPlayerAvatars()}
          </View>
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
    marginTop: 10,
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
  votingPromptContainer: {
    marginVertical: 15,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  votingPrompt: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
    textAlign: 'center',
  },
  votingSubtitle: {
    fontSize: 14,
    color: '#FFD700',
    textAlign: 'center',
    maxWidth: width * 0.9,
    lineHeight: 20,
  },
  answersContainer: {
    flex: 1,
  },
  answersList: {
    paddingBottom: 20,
  },
  answerCard: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 10,
    marginBottom: 15,
    padding: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedAnswer: {
    borderWidth: 2,
    borderColor: '#FFD700',
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
  correctAnswer: {
    borderWidth: 2,
    borderColor: '#4CAF50',
    backgroundColor: 'rgba(76,175,80,0.1)',
  },
  answerContent: {
    flex: 1,
  },
  answerText: {
    fontSize: 18,
    color: '#0047AB',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  votingResultsContainer: {
    marginTop: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  authorText: {
    fontSize: 14,
    color: '#555',
    fontStyle: 'italic',
  },
  votesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  votesText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#555',
    fontWeight: 'bold',
  },
  selectedIndicator: {
    width: 30,
    alignItems: 'center',
  },
  correctIndicator: {
    width: 30,
    alignItems: 'center',
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
  playerAvatarCorrect: {
    borderColor: '#4CAF50',
    backgroundColor: 'rgba(76,175,80,0.1)',
  },
  playerAvatarIncorrect: {
    borderColor: '#F44336',
    backgroundColor: 'rgba(244,67,54,0.1)',
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
  votedIndicator: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 2,
  },
  votedCorrectIndicator: {
    backgroundColor: 'rgba(76,175,80,0.2)',
    borderColor: '#4CAF50',
    borderWidth: 1,
  },
  votedIncorrectIndicator: {
    backgroundColor: 'rgba(244,67,54,0.2)',
    borderColor: '#F44336',
    borderWidth: 1,
  },
});

export default MultiplayerVotingScreen; 