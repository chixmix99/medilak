import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
  TouchableWithoutFeedback,
  Keyboard,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// Score constants for better readability
const SCORE_CORRECT_ANSWER = 500;  // Points for voting for correct answer
const SCORE_TRICKED_PLAYER = 300;  // Points per player tricked by your answer

const MultiplayerResultsScreen = ({ navigation, route }) => {
  const { 
    roomCode, 
    players, 
    question, 
    displayAnswers, 
    votingResults,
    playerScores,
    roundNumber,
    totalRounds 
  } = route.params || {};

  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.9));
  const [showExplanation, setShowExplanation] = useState(false);
  const [scoreChanges, setScoreChanges] = useState({});
  
  const currentPlayer = players.find(p => p.isCurrentUser);
  
  // Get correct answer object
  const correctAnswer = question.options[question.correctAnswer];
  
  // Sort players by score for leaderboard
  const sortedPlayers = [...players].sort((a, b) => 
    (playerScores[b.id] || 0) - (playerScores[a.id] || 0)
  );
  
  useEffect(() => {
    // Calculate score changes for this round
    calculateScoreChanges();
    
    // Animate entrance of results
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true
      })
    ]).start();
  }, []);

  // Determine who voted for which answer
  const getVotersForAnswer = (answerId) => {
    return votingResults[answerId] || [];
  };
  
  // Get player names who voted for an answer
  const getVoterNames = (voterIds) => {
    return voterIds.map(id => {
      const voter = players.find(p => p.id === id);
      return voter ? voter.name : '';
    }).filter(Boolean).join(', ');
  };
  
  // Determine if an answer was contributed by the current player
  const isCurrentUserAnswer = (answer) => {
    if (!answer || !answer.contributors) return false;
    const currentPlayer = players.find(p => p.isCurrentUser);
    return answer.contributors.some(c => c.id === currentPlayer?.id);
  };
  
  // Render each player's score in the leaderboard
  const renderPlayerScore = ({ item, index }) => {
    const score = playerScores[item.id] || 0;
    const isCurrentUser = item.isCurrentUser;
    const playerChange = scoreChanges[item.id] || { total: 0, details: [] };
    
    // Determine medal icon based on position
    let medalIcon = null;
    if (index === 0) {
      medalIcon = "trophy";
    } else if (index === 1) {
      medalIcon = "medal";
    } else if (index === 2) {
      medalIcon = "ribbon";
    }
    
    return (
      <TouchableOpacity 
        style={[
          styles.playerScoreCard,
          index === 0 && styles.firstPlaceCard,
          isCurrentUser && styles.currentUserCard
        ]}
        onPress={() => handleShowScoreDetails(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.rankContainer}>
          {medalIcon ? (
            <Ionicons name={medalIcon} size={24} color={index === 0 ? "#FFD700" : index === 1 ? "#C0C0C0" : "#CD7F32"} />
          ) : (
            <Text style={styles.rankText}>{index + 1}</Text>
          )}
        </View>
        
        <Text style={styles.playerNameText}>
          {item.name} {isCurrentUser && '(You)'}
        </Text>
        
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>{score}</Text>
          {playerChange.total !== 0 && (
            <View style={styles.changeContainer}>
              <Text style={[
                styles.scoreChange,
                playerChange.total > 0 ? styles.positiveChange : styles.negativeChange
              ]}>
                {playerChange.total > 0 ? '+' : ''}{playerChange.total}
              </Text>
              
              {playerChange.details.length > 0 && (
                <Ionicons 
                  name="information-circle-outline" 
                  size={16} 
                  color="#FFD700" 
                  style={styles.infoIcon}
                />
              )}
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };
  
  const handleContinue = () => {
    if (roundNumber >= totalRounds) {
      // Game over, go to final results
      navigation.navigate('Home', {
        playerScores: playerScores
      });
    } else {
      // Go to next round
      navigation.navigate('MultiplayerQuestion', {
        roomCode,
        players,
        roundNumber: roundNumber + 1,
        totalRounds,
        playerScores
      });
    }
  };

  // Handle dismissing the keyboard
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  // Calculate which answer is the most popular
  const findMostPopularAnswer = () => {
    let maxVotes = 0;
    let mostPopularAnswerId = null;
    
    Object.entries(votingResults).forEach(([answerId, voters]) => {
      if (voters.length > maxVotes) {
        maxVotes = voters.length;
        mostPopularAnswerId = answerId;
      }
    });
    
    return displayAnswers.find(a => a.id === mostPopularAnswerId);
  };

  // Find the correct answer from the list
  const correctAnswerFromList = displayAnswers.find(a => a.isCorrect);
  const mostPopularAnswer = findMostPopularAnswer();
  
  // Get formatted player score display
  const getScoreDisplay = (playerId) => {
    const score = playerScores[playerId] || 0;
    return score.toLocaleString();
  };

  // Calculate and store score changes from this round
  const calculateScoreChanges = () => {
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
    if (correctAnswerId && votingResults[correctAnswerId]) {
      votingResults[correctAnswerId].forEach(voterId => {
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
        const votes = votingResults[answerId] || [];
        
        // For each contributor to this answer
        if (answer.contributors && Array.isArray(answer.contributors)) {
          answer.contributors.forEach(contributor => {
            if (!contributor || !contributor.id) return;
            
            // Count votes excluding contributors
            const votesExcludingContributors = votes.filter(
              voterId => !answer.contributors.some(c => c && c.id === voterId)
            );
            
            const trickedPoints = votesExcludingContributors.length * SCORE_TRICKED_PLAYER;
            
            if (trickedPoints > 0 && changes[contributor.id]) {
              changes[contributor.id].trickedOthers += trickedPoints;
              changes[contributor.id].total += trickedPoints;
              
              const playerNames = votesExcludingContributors.map(id => {
                const player = players.find(p => p.id === id);
                return player ? player.name : 'Unknown';
              }).join(', ');
              
              changes[contributor.id].details.push({
                type: 'tricked',
                text: `Tricked ${votesExcludingContributors.length} player(s): ${playerNames}`,
                points: trickedPoints
              });
            }
          });
        }
      }
    });
    
    setScoreChanges(changes);
  };

  // Handle showing detailed score breakdown for a player
  const handleShowScoreDetails = (playerId) => {
    const playerChange = scoreChanges[playerId];
    if (!playerChange || playerChange.total === 0) return;
    
    const player = players.find(p => p.id === playerId);
    const playerName = player ? player.name : 'Player';
    
    // Create a formatted message for the alert
    let message = `${playerName}'s points this round:\n`;
    
    if (playerChange.correctVote > 0) {
      message += `\n• Voted for correct answer: +${playerChange.correctVote}`;
    }
    
    if (playerChange.trickedOthers > 0) {
      message += `\n• Tricked other players: +${playerChange.trickedOthers}`;
    }
    
    // Add detailed breakdown
    if (playerChange.details.length > 0) {
      message += "\n\nDetailed breakdown:";
      playerChange.details.forEach(detail => {
        message += `\n• ${detail.text}: ${detail.points > 0 ? '+' : ''}${detail.points}`;
      });
    }
    
    message += `\n\nTotal this round: ${playerChange.total > 0 ? '+' : ''}${playerChange.total}`;
    
    Alert.alert(
      `Score Breakdown - ${playerName}`,
      message,
      [{ text: "Close" }]
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
          
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <Animated.View style={{
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }}>
              <View style={styles.resultsHeader}>
                <Text style={styles.resultsHeaderText}>Results</Text>
              </View>
              
              <View style={styles.questionContainer}>
                <Text style={styles.questionCategory}>
                  {question.category || 'Medical Knowledge'}
                </Text>
                <Text style={styles.questionText}>
                  {question.question}
                </Text>
              </View>
              
              <View style={styles.correctAnswerContainer}>
                <Text style={styles.resultsSectionTitle}>Correct Answer</Text>
                <View style={styles.correctAnswerCard}>
                  <View style={styles.correctAnswerContent}>
                    <Text style={styles.correctAnswerText}>{correctAnswerFromList.text}</Text>
                    <Ionicons name="checkmark-circle" size={24} color="#4CAF50" style={styles.correctIcon} />
                  </View>
                  <View style={styles.correctAnswerBadge}>
                    <Ionicons name="ribbon" size={16} color="#4CAF50" />
                    <Text style={styles.correctAnswerBadgeText}>Correct</Text>
                  </View>
                </View>
                
                {question.explanation && (
                  <View style={styles.explanationCard}>
                    <Text style={styles.explanationTitle}>Explanation:</Text>
                    <Text style={styles.explanationText}>{question.explanation}</Text>
                  </View>
                )}
              </View>
              
              <View style={styles.playerAnswersContainer}>
                <Text style={styles.resultsSectionTitle}>Answer Breakdown</Text>
                
                {displayAnswers && displayAnswers.map((answer, index) => {
                  if (answer.isCorrect) return null; // Skip correct answer as we already displayed it
                  
                  const voters = getVotersForAnswer(answer.id);
                  const voterNames = getVoterNames(voters);
                  const isUserAnswer = isCurrentUserAnswer(answer);
                  const isMostPopular = answer.id === mostPopularAnswer?.id;
                  const contributorNames = answer.contributors?.map(c => c.name).join(', ') || '';
                  
                  return (
                    <View key={answer.id} style={[
                      styles.playerAnswerCard,
                      isUserAnswer && styles.currentUserAnswerCard,
                      isMostPopular && !answer.isCorrect && styles.popularAnswerCard
                    ]}>
                      <View style={styles.answerHeader}>
                        <Text style={styles.playerAnswerName}>
                          {isUserAnswer ? 'Your answer' : 
                           contributorNames ? `From: ${contributorNames}` : 
                           'System answer'}
                        </Text>
                        
                        {isMostPopular && !answer.isCorrect && (
                          <View style={styles.popularBadge}>
                            <Ionicons name="star" size={16} color="#FF9800" />
                            <Text style={styles.popularBadgeText}>Most Popular</Text>
                          </View>
                        )}
                      </View>
                      
                      <Text style={styles.playerAnswerText}>{answer.text}</Text>
                      
                      {voters.length > 0 && (
                        <View style={styles.votersContainer}>
                          <View style={styles.voteCountContainer}>
                            <Ionicons name="thumbs-up" size={18} color="#0047AB" />
                            <Text style={styles.votersLabel}>
                              {voters.length} {voters.length === 1 ? 'vote' : 'votes'}
                            </Text>
                          </View>
                          
                          {voterNames && (
                            <Text style={styles.votersList}>
                              From: {voterNames}
                            </Text>
                          )}
                        </View>
                      )}
                    </View>
                  );
                })}
                
                {(!displayAnswers || displayAnswers.length === 0) && (
                  <Text style={styles.noAnswersText}>No player answers submitted</Text>
                )}
              </View>
              
              <View style={styles.leaderboardContainer}>
                <Text style={styles.resultsSectionTitle}>Leaderboard</Text>
                <FlatList
                  data={sortedPlayers}
                  renderItem={renderPlayerScore}
                  keyExtractor={item => item.id}
                  scrollEnabled={false}
                />
                <View style={styles.scoringInfo}>
                  <Text style={styles.scoringInfoText}>
                    <Text style={styles.scoringHighlight}>Voting for correct answer:</Text> +{SCORE_CORRECT_ANSWER} points
                  </Text>
                  <Text style={styles.scoringInfoText}>
                    <Text style={styles.scoringHighlight}>Tricking another player:</Text> +{SCORE_TRICKED_PLAYER} points per player
                  </Text>
                  <Text style={styles.scoringInfoSubtext}>
                    Tap on a player to see their score breakdown
                  </Text>
                </View>
              </View>
            </Animated.View>
          </ScrollView>
          
          <TouchableOpacity 
            style={styles.continueButton}
            onPress={handleContinue}
          >
            <Text style={styles.continueButtonText}>
              {roundNumber >= totalRounds ? 'Final Results' : 'Next Round'}
            </Text>
            <Ionicons 
              name={roundNumber >= totalRounds ? "trophy" : "arrow-forward"} 
              size={20} 
              color="#0047AB" 
              style={styles.continueButtonIcon}
            />
          </TouchableOpacity>
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
  content: {
    flex: 1,
    marginBottom: 15,
  },
  resultsHeader: {
    alignItems: 'center',
    marginBottom: 15,
  },
  resultsHeaderText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFD700',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  questionContainer: {
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
  resultsSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 10,
  },
  correctAnswerContainer: {
    marginBottom: 20,
  },
  correctAnswerCard: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  correctAnswerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  correctAnswerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#004D40',
    flex: 1,
  },
  correctIcon: {
    marginLeft: 10,
  },
  correctAnswerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76,175,80,0.15)',
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginTop: 10,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  correctAnswerBadgeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginLeft: 5,
  },
  explanationCard: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 10,
    padding: 15,
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0047AB',
    marginBottom: 5,
  },
  explanationText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  playerAnswersContainer: {
    marginBottom: 20,
  },
  playerAnswerCard: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    borderLeftWidth: 0,
  },
  currentUserAnswerCard: {
    borderWidth: 1,
    borderColor: '#0047AB',
    backgroundColor: 'rgba(0,71,171,0.05)',
  },
  answerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  playerAnswerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0047AB',
    flex: 1,
  },
  playerAnswerText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
    fontWeight: '500',
  },
  noAnswersText: {
    textAlign: 'center',
    color: 'white',
    fontStyle: 'italic',
    marginTop: 10,
  },
  votersContainer: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    padding: 10,
    borderRadius: 8,
  },
  votersLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#555',
  },
  votersList: {
    fontSize: 14,
    color: '#666',
    marginTop: 3,
  },
  leaderboardContainer: {
    marginBottom: 20,
  },
  playerScoreCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 8,
    alignItems: 'center',
  },
  firstPlaceCard: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  currentUserCard: {
    borderWidth: 1,
    borderColor: '#0047AB',
  },
  rankContainer: {
    width: 30,
    alignItems: 'center',
  },
  rankText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  playerNameText: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0047AB',
    marginLeft: 10,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0047AB',
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 5,
  },
  scoreChange: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0047AB',
  },
  positiveChange: {
    color: '#4CAF50',
  },
  negativeChange: {
    color: '#FF5733',
  },
  infoIcon: {
    marginLeft: 5,
  },
  continueButton: {
    backgroundColor: '#FFD700',
    borderRadius: 10,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
  continueButtonText: {
    color: '#0047AB',
    fontSize: 18,
    fontWeight: 'bold',
  },
  continueButtonIcon: {
    marginLeft: 10,
  },
  scoringInfo: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 10,
    padding: 12,
    marginTop: 10,
  },
  scoringInfoText: {
    color: 'white',
    fontSize: 14,
    marginBottom: 5,
  },
  scoringHighlight: {
    color: '#FFD700',
    fontWeight: 'bold',
  },
  scoringInfoSubtext: {
    color: '#BBB',
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 5,
    textAlign: 'center',
  },
  popularAnswerCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
    backgroundColor: 'rgba(255,152,0,0.05)',
  },
  popularBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,152,0,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF9800',
  },
  popularBadgeText: {
    color: '#FF9800',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 3,
  },
  voteCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default MultiplayerResultsScreen; 