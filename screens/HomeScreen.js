import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Image,
  SafeAreaView,
  FlatList,
  Modal,
  TextInput,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';
import { getHighScore } from '../utils/storage';

// Import questions if available
let medicalQuestions = [];
try {
  medicalQuestions = require('../constants/medicalQuestions').default || [];
} catch (error) {
  console.log('Medical questions not loaded:', error);
}

const HomeScreen = ({ navigation }) => {
  const [highScore, setHighScore] = useState(0);
  const [showCategories, setShowCategories] = useState(false);
  const [categories, setCategories] = useState([]);
  const [showMultiplayerOptions, setShowMultiplayerOptions] = useState(false);
  const [roomCode, setRoomCode] = useState('');

  useEffect(() => {
    // Load high score when component mounts
    loadHighScore();
    
    // Extract unique categories from medical questions
    if (medicalQuestions && medicalQuestions.length > 0) {
      const uniqueCategories = [...new Set(
        medicalQuestions
          .map(q => q.category)
          .filter(Boolean) // Remove undefined/null
      )];
      
      setCategories(uniqueCategories.sort());
    }
  }, []);

  const loadHighScore = async () => {
    const score = await getHighScore();
    setHighScore(score);
  };
  
  // Handle category selection
  const handleCategorySelect = (category) => {
    setShowCategories(false);
    navigation.navigate('Game', { category });
  };
  
  // Handle creating a new multiplayer room
  const handleCreateRoom = () => {
    setShowMultiplayerOptions(false);
    navigation.navigate('Room');
  };
  
  // Handle joining an existing room
  const handleJoinRoom = () => {
    if (!roomCode.trim()) {
      Alert.alert('Room Code Required', 'Please enter a room code to join a game.');
      return;
    }
    
    setShowMultiplayerOptions(false);
    navigation.navigate('Room', { joining: true, roomCode: roomCode.toUpperCase() });
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[colors.primaryGradient.start, colors.primaryGradient.end]}
        style={styles.background}
      >
        <View style={styles.contentContainer}>
          <View style={styles.logoContainer}>
            <Text style={styles.title}>MediKalak</Text>
            <Text style={styles.subtitle}>Test Your Medical Knowledge</Text>
          </View>

          <View style={styles.scoreContainer}>
            <Text style={styles.scoreText}>High Score: {highScore}</Text>
          </View>

          <View style={styles.buttonsContainer}>
            <TouchableOpacity 
              style={styles.button}
              onPress={() => {
                // If we have categories, show category selection
                if (categories.length > 0) {
                  setShowCategories(true);
                } else {
                  // Otherwise just start the game
                  navigation.navigate('Game');
                }
              }}
            >
              <Text style={styles.buttonText}>Play Solo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.button}
              onPress={() => setShowMultiplayerOptions(true)}
            >
              <Text style={styles.buttonText}>Play with Friends</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.button}
              onPress={() => navigation.navigate('HowToPlay')}
            >
              <Text style={styles.buttonText}>How to Play</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.button}
              onPress={() => navigation.navigate('Settings')}
            >
              <Text style={styles.buttonText}>Settings</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Category Selection Modal */}
        <Modal
          visible={showCategories}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowCategories(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Category</Text>
              
              <FlatList
                data={['All Categories', ...categories]}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.categoryItem}
                    onPress={() => handleCategorySelect(item === 'All Categories' ? null : item)}
                  >
                    <Text style={styles.categoryText}>{item}</Text>
                    <Ionicons name="chevron-forward" size={20} color={colors.primaryGradient.start} />
                  </TouchableOpacity>
                )}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
              />
              
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowCategories(false)}
              >
                <Text style={styles.closeButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        
        {/* Multiplayer Options Modal */}
        <Modal
          visible={showMultiplayerOptions}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowMultiplayerOptions(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Play with Friends</Text>
              
              <TouchableOpacity
                style={styles.multiplayerOption}
                onPress={handleCreateRoom}
              >
                <Ionicons name="add-circle" size={24} color={colors.primaryGradient.start} />
                <Text style={styles.multiplayerOptionText}>Create a Room</Text>
              </TouchableOpacity>
              
              <View style={styles.separator} />
              
              <Text style={styles.modalSubtitle}>Join an Existing Room</Text>
              
              <TextInput
                style={styles.roomCodeInput}
                value={roomCode}
                onChangeText={text => setRoomCode(text.toUpperCase())}
                placeholder="Enter Room Code"
                placeholderTextColor={colors.text.secondary}
                maxLength={5}
                autoCapitalize="characters"
              />
              
              <TouchableOpacity
                style={styles.joinButton}
                onPress={handleJoinRoom}
              >
                <Text style={styles.joinButtonText}>Join Room</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowMultiplayerOptions(false)}
              >
                <Text style={styles.closeButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.text.light,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: colors.text.light,
    textAlign: 'center',
  },
  scoreContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginVertical: 20,
  },
  scoreText: {
    color: colors.text.light,
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonsContainer: {
    width: '100%',
    alignItems: 'center',
  },
  button: {
    backgroundColor: colors.background.main,
    borderRadius: 10,
    paddingVertical: 15,
    width: '80%',
    alignItems: 'center',
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    color: colors.primaryGradient.start,
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    maxHeight: '70%',
    backgroundColor: colors.background.main,
    borderRadius: 15,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    marginTop: 10,
    marginBottom: 15,
  },
  categoryItem: {
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 16,
    color: colors.text.primary,
  },
  separator: {
    height: 1,
    backgroundColor: colors.background.secondary,
    marginVertical: 5,
  },
  closeButton: {
    marginTop: 20,
    paddingVertical: 12,
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: colors.text.primary,
    fontWeight: '600',
  },
  // Multiplayer options
  multiplayerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },
  multiplayerOptionText: {
    fontSize: 16,
    color: colors.text.primary,
    marginLeft: 15,
  },
  roomCodeInput: {
    backgroundColor: colors.background.secondary,
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 15,
    textAlign: 'center',
    letterSpacing: 2,
    fontWeight: 'bold',
  },
  joinButton: {
    backgroundColor: colors.primaryGradient.start,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  joinButtonText: {
    color: colors.text.light,
    fontWeight: '600',
  }
});

export default HomeScreen;
