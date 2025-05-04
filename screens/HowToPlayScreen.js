import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';

const InstructionStep = ({ number, title, description }) => (
  <View style={styles.instructionStep}>
    <View style={styles.stepNumberContainer}>
      <Text style={styles.stepNumber}>{number}</Text>
    </View>
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>{title}</Text>
      <Text style={styles.stepDescription}>{description}</Text>
    </View>
  </View>
);

const HowToPlayScreen = ({ navigation }) => {
  const [showMultiplayer, setShowMultiplayer] = useState(false);
  
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[colors.primaryGradient.start, colors.primaryGradient.end]}
        style={styles.header}
      >
        <View style={styles.topBar}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>How To Play</Text>
          <View style={{ width: 24 }} /> {/* Empty view for balanced header */}
        </View>
        
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, !showMultiplayer && styles.activeTab]}
            onPress={() => setShowMultiplayer(false)}
          >
            <Text style={[styles.tabText, !showMultiplayer && styles.activeTabText]}>
              Solo Mode
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, showMultiplayer && styles.activeTab]}
            onPress={() => setShowMultiplayer(true)}
          >
            <Text style={[styles.tabText, showMultiplayer && styles.activeTabText]}>
              Multiplayer
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {!showMultiplayer ? (
          <>
            <Text style={styles.introText}>
              MediKalak is a medical knowledge quiz game to test and improve your understanding of medical concepts.
            </Text>
            
            <View style={styles.instructionsContainer}>
              <InstructionStep 
                number="1"
                title="Answer Medical Questions"
                description="Each question has four possible answers. Select the one you believe is correct."
              />
              
              <InstructionStep 
                number="2"
                title="Beat the Timer"
                description="You have 15 seconds to answer each question. The faster you answer, the more points you earn."
              />
              
              <InstructionStep 
                number="3"
                title="Score Points"
                description="Correct answers earn 100 base points plus bonus points for remaining time (max 250 points per question)."
              />
              
              <InstructionStep 
                number="4"
                title="Track Your Progress"
                description="Your high scores are saved so you can track improvement over time."
              />
              
              <InstructionStep 
                number="5"
                title="Learn and Improve"
                description="Each question includes an explanation to help you learn from your mistakes."
              />
            </View>
            
            <View style={styles.tipsContainer}>
              <Text style={styles.tipsTitle}>Tips for Success</Text>
              
              <View style={styles.tipItem}>
                <Ionicons name="flash" size={20} color={colors.primaryGradient.start} style={styles.tipIcon} />
                <Text style={styles.tipText}>Answer quickly for more points, but accuracy matters most.</Text>
              </View>
              
              <View style={styles.tipItem}>
                <Ionicons name="time" size={20} color={colors.primaryGradient.start} style={styles.tipIcon} />
                <Text style={styles.tipText}>Watch the timer! If it runs out, you'll miss the question.</Text>
              </View>
              
              <View style={styles.tipItem}>
                <Ionicons name="school" size={20} color={colors.primaryGradient.start} style={styles.tipIcon} />
                <Text style={styles.tipText}>Read the explanations to improve your medical knowledge.</Text>
              </View>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.introText}>
              In multiplayer mode, play with friends to test your knowledge and try to fool each other with convincing answers!
            </Text>
            
            <View style={styles.instructionsContainer}>
              <InstructionStep 
                number="1"
                title="Create or Join a Room"
                description="Host a game by creating a room, or join a friend's room using their room code."
              />
              
              <InstructionStep 
                number="2"
                title="Choose Categories"
                description="Players take turns selecting the category for each round."
              />
              
              <InstructionStep 
                number="3"
                title="Submit Your Answer"
                description="When shown a question, each player types in an answer. Try to be convincing but incorrect to trick other players!"
              />
              
              <InstructionStep 
                number="4"
                title="Vote on Answers"
                description="All answers (including the correct one) are shown to everyone. Vote for the answer you think is correct."
              />
              
              <InstructionStep 
                number="5"
                title="Earn Points"
                description="Score 100 points for each player who voted for your answer, and 200 points if you voted for the correct answer."
              />
            </View>
            
            <View style={styles.tipsContainer}>
              <Text style={styles.tipsTitle}>Multiplayer Tips</Text>
              
              <View style={styles.tipItem}>
                <Ionicons name="bulb" size={20} color={colors.primaryGradient.start} style={styles.tipIcon} />
                <Text style={styles.tipText}>Be creative with your fake answers! Make them sound plausible but wrong.</Text>
              </View>
              
              <View style={styles.tipItem}>
                <Ionicons name="people" size={20} color={colors.primaryGradient.start} style={styles.tipIcon} />
                <Text style={styles.tipText}>The more players in the game, the more fun and challenging it becomes!</Text>
              </View>
              
              <View style={styles.tipItem}>
                <Ionicons name="trophy" size={20} color={colors.primaryGradient.start} style={styles.tipIcon} />
                <Text style={styles.tipText}>Balance between fooling others and identifying the correct answer for maximum points.</Text>
              </View>
            </View>
          </>
        )}
        
        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate(showMultiplayer ? 'Room' : 'Game')}
        >
          <Text style={styles.buttonText}>
            {showMultiplayer ? 'Start Multiplayer Game' : 'Start Playing Solo'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
  header: {
    paddingTop: 10,
    paddingBottom: 15,
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.light,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(255, 255, 255, 0.3)',
  },
  activeTab: {
    borderBottomColor: colors.text.light,
  },
  tabText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '600',
  },
  activeTabText: {
    color: colors.text.light,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  introText: {
    fontSize: 16,
    color: colors.text.primary,
    lineHeight: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  instructionsContainer: {
    marginBottom: 30,
  },
  instructionStep: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  stepNumberContainer: {
    backgroundColor: colors.primaryGradient.start,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
    marginTop: 3,
  },
  stepNumber: {
    color: colors.text.light,
    fontWeight: 'bold',
    fontSize: 16,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 5,
  },
  stepDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  tipsContainer: {
    backgroundColor: colors.background.secondary,
    borderRadius: 15,
    padding: 20,
    marginBottom: 25,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 15,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tipIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  button: {
    backgroundColor: colors.primaryGradient.start,
    borderRadius: 15,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  buttonText: {
    color: colors.text.light,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HowToPlayScreen;
