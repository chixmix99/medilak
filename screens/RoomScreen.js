import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  SafeAreaView, 
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  ActivityIndicator,
  Image,
  Modal
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '../constants/colors';

const { width, height } = Dimensions.get('window');

// Available avatars
const AVATARS = [
  { id: 'health_potion', image: require('../assets/avatars/health_potion.png') },
  { id: 'medicine_bottle', image: require('../assets/avatars/medicine_bottle.png') },
  { id: 'pill_capsule', image: require('../assets/avatars/pill_capsule.png') },
  { id: 'medical_tablet', image: require('../assets/avatars/medical_tablet.png') },
  { id: 'digital_stethoscope', image: require('../assets/avatars/digital_stethoscope.png') },
  { id: 'smart_health_monitor', image: require('../assets/avatars/smart_health_monitor.png') },
];

// Generate a random 6-character room code
const generateRoomCode = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

// Simulated room data - in a real app, this would come from a server
const MOCK_PLAYERS = [
  { id: '1', name: 'Host (You)', isHost: true, isCurrentUser: true, isReady: true },
  { id: '2', name: 'Player 2', isHost: false, isCurrentUser: false, isReady: false },
  { id: '3', name: 'Player 3', isHost: false, isCurrentUser: false, isReady: false },
];

const RoomScreen = ({ navigation, route }) => {
  const { isCreatingRoom = true } = route.params || {};
  
  const [roomCode, setRoomCode] = useState(isCreatingRoom ? generateRoomCode() : '');
  const [playerName, setPlayerName] = useState('');
  const [players, setPlayers] = useState(MOCK_PLAYERS);
  const [isHost, setIsHost] = useState(isCreatingRoom);
  const [isJoining, setIsJoining] = useState(false);
  const [isReadyToStart, setIsReadyToStart] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  
  useEffect(() => {
    // Load saved player name and avatar if available
    const loadPlayerData = async () => {
      try {
        const savedName = await AsyncStorage.getItem('playerName');
        const savedAvatarId = await AsyncStorage.getItem('playerAvatar');
        
        if (savedName) {
          setPlayerName(savedName);
        }
        
        if (savedAvatarId) {
          const avatar = AVATARS.find(a => a.id === savedAvatarId);
          if (avatar) {
            setSelectedAvatar(avatar);
          }
        }
      } catch (error) {
        console.log('Error loading player data:', error);
      }
    };
    
    loadPlayerData();
    
    // Check if we're joining an existing room
    if (route.params?.joining) {
      setIsJoining(true);
      setIsHost(false);
      if (route.params?.roomCode) {
        setRoomCode(route.params.roomCode);
      }
    }
  }, [route.params]);
  
  const savePlayerData = async (name, avatarId) => {
    try {
      await AsyncStorage.setItem('playerName', name);
      await AsyncStorage.setItem('playerAvatar', avatarId);
    } catch (error) {
      console.log('Error saving player data:', error);
    }
  };
  
  const handleStartGame = () => {
    // Remove the player count check to allow starting with just the host
    // Navigate to category selection for the first player
    navigation.navigate('CategorySelect', { 
      isMultiplayer: true,
      roomCode: roomCode,
      players: players.map(player => ({
        ...player,
        avatar: player.isCurrentUser ? selectedAvatar.id : generateRandomAvatarId()
      })),
      roundNumber: 1,
      totalRounds: 10,
      playerScores: {}
    });
  };
  
  const generateRandomAvatarId = () => {
    const randomIndex = Math.floor(Math.random() * AVATARS.length);
    return AVATARS[randomIndex].id;
  };
  
  const handleJoinRoom = () => {
    if (!playerName.trim()) {
      Alert.alert('Name Required', 'Please enter your name to join the room.');
      return;
    }
    
    savePlayerData(playerName, selectedAvatar.id);
    
    // In a real app, we would connect to the server here
    // For now, we'll simulate joining by adding the player to the list
    const newPlayer = {
      id: (players.length + 1).toString(),
      name: playerName,
      isHost: false,
      isCurrentUser: true,
      avatar: selectedAvatar.id
    };
    
    // Update the mock players list to set current user
    const updatedPlayers = MOCK_PLAYERS.map(p => ({
      ...p,
      isCurrentUser: false
    }));
    updatedPlayers.push(newPlayer);
    
    setPlayers(updatedPlayers);
    setIsJoining(false);
  };
  
  // Render player list item
  const renderPlayerItem = (player, index) => {
    // Get avatar image for this player
    const playerAvatar = player.avatar ? 
      AVATARS.find(a => a.id === player.avatar)?.image : 
      AVATARS[index % AVATARS.length].image;
    
    return (
      <View key={player.id} style={styles.playerItem}>
        <View style={styles.playerIdentity}>
          <View style={[
            styles.playerIcon, 
            player.isCurrentUser && styles.currentPlayerIcon
          ]}>
            {playerAvatar ? (
              <Image source={playerAvatar} style={styles.avatarImage} />
            ) : (
              <Ionicons name="person" size={20} color="white" />
            )}
          </View>
          
          <Text style={styles.playerName}>
            {player.name}
            {player.isHost && <Text style={styles.hostTag}> (Host)</Text>}
          </Text>
        </View>
        
        <View style={[
          styles.readyStatus,
          player.isReady ? styles.readyStatusReady : styles.readyStatusNotReady
        ]}>
          <Text style={styles.readyStatusText}>
            {player.isReady ? 'Ready' : 'Not Ready'}
          </Text>
        </View>
      </View>
    );
  };
  
  // Open avatar selection modal
  const openAvatarSelector = () => {
    setShowAvatarModal(true);
  };
  
  // Render avatar item in selection modal
  const renderAvatarItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.avatarItem,
        selectedAvatar.id === item.id && styles.selectedAvatarItem
      ]}
      onPress={() => {
        setSelectedAvatar(item);
        savePlayerData(playerName, item.id);
      }}
    >
      <Image source={item.image} style={styles.avatarSelectionImage} />
      {selectedAvatar.id === item.id && (
        <View style={styles.selectedAvatarCheck}>
          <Ionicons name="checkmark-circle" size={24} color="#FFD700" />
        </View>
      )}
    </TouchableOpacity>
  );
  
  // Add the avatar selection modal component
  const AvatarSelectionModal = () => (
    <Modal
      visible={showAvatarModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowAvatarModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Choose Your Avatar</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowAvatarModal(false)}
            >
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={AVATARS}
            renderItem={renderAvatarItem}
            keyExtractor={item => item.id}
            numColumns={3}
            contentContainerStyle={styles.avatarGrid}
          />
          
          <TouchableOpacity 
            style={styles.confirmButton}
            onPress={() => setShowAvatarModal(false)}
          >
            <Text style={styles.confirmButtonText}>Confirm Selection</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
  
  // Handle ready/not ready status toggle
  const toggleReady = () => {
    const updatedPlayers = players.map(player => {
      if (player.isCurrentUser) {
        return { ...player, isReady: !player.isReady };
      }
      return player;
    });
    
    setPlayers(updatedPlayers);
    
    // Update ready to start state based on all players being ready
    const allPlayersReady = updatedPlayers.every(p => p.isReady);
    setIsReadyToStart(isHost && allPlayersReady);
  };
  
  // Add a simulated player to the room (for testing)
  const addSimulatedPlayer = () => {
    if (players.length >= 8) {
      Alert.alert('Room Full', 'This room already has the maximum number of players.');
      return;
    }
    
    const aiNames = ['Dr. Watson', 'Dr. House', 'Dr. Grey', 'Dr. Smith', 'Dr. Oz'];
    const usedNames = players.map(p => p.name);
    
    // Find an unused name
    const availableNames = aiNames.filter(name => !usedNames.includes(name));
    
    if (availableNames.length === 0) {
      Alert.alert('No More Names', 'We ran out of AI player names!');
      return;
    }
    
    const randomName = availableNames[Math.floor(Math.random() * availableNames.length)];
    
    const newPlayer = {
      id: `ai_${players.length + 1}`,
      name: randomName,
      isHost: false,
      isCurrentUser: false,
      isReady: Math.random() > 0.3
    };
    
    setPlayers([...players, newPlayer]);
  };
  
  // Handle dismissing the keyboard
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <LinearGradient
          colors={['#0047AB', '#002366']}
          style={styles.background}
        >
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.screenTitle}>
              {isJoining ? 'Join Room' : 'Game Room'}
            </Text>
          </View>
          
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.content}
          >
            {!isJoining ? (
              // Room is created or joined - show lobby
              <ScrollView style={styles.scrollContent}>
                <View style={styles.roomInfoContainer}>
                  <Text style={styles.roomCodeLabel}>Room Code:</Text>
                  <View style={styles.roomCodeContainer}>
                    <Text style={styles.roomCode}>{roomCode}</Text>
                    <TouchableOpacity 
                      style={styles.copyButton}
                      onPress={() => {
                        // In a real app, copy to clipboard
                        Alert.alert('Copied!', `Room code ${roomCode} copied to clipboard`);
                      }}
                    >
                      <Ionicons name="copy-outline" size={20} color="#FFD700" />
                    </TouchableOpacity>
                  </View>
                  
                  <Text style={styles.playersTitle}>
                    Players ({players.length}/8)
                  </Text>
                </View>
                
                <View style={styles.playersList}>
                  {players.map(renderPlayerItem)}
                </View>
                
                {/* For testing - add player button */}
                {isHost && players.length < 8 && (
                  <TouchableOpacity 
                    style={styles.addPlayerButton}
                    onPress={addSimulatedPlayer}
                  >
                    <Ionicons name="add-circle" size={20} color="#0047AB" />
                    <Text style={styles.addPlayerText}>Add Test Player</Text>
                  </TouchableOpacity>
                )}
                
                <View style={styles.roomActions}>
                  {isHost ? (
                    <TouchableOpacity 
                      style={styles.startGameButton}
                      onPress={handleStartGame}
                    >
                      <Text style={styles.startGameText}>Start Game</Text>
                      <Ionicons name="play" size={20} color="#0047AB" />
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity 
                      style={[
                        styles.readyButton,
                        players.find(p => p.isCurrentUser)?.isReady && styles.notReadyButton
                      ]}
                      onPress={toggleReady}
                    >
                      <Text style={styles.readyButtonText}>
                        {players.find(p => p.isCurrentUser)?.isReady ? 'Not Ready' : 'Ready'}
                      </Text>
                      <Ionicons 
                        name={players.find(p => p.isCurrentUser)?.isReady ? "close-circle" : "checkmark-circle"} 
                        size={20} 
                        color={players.find(p => p.isCurrentUser)?.isReady ? "#FF6B6B" : "#4CAF50"} 
                      />
                    </TouchableOpacity>
                  )}
                </View>
              </ScrollView>
            ) : (
              // Joining a room - show form
              <View style={styles.joinFormContainer}>
                <Text style={styles.formInstructions}>
                  Enter a 6-character room code to join a game
                </Text>
                
                <TextInput
                  style={styles.roomCodeInput}
                  value={roomCode}
                  onChangeText={setRoomCode}
                  placeholder="Enter Room Code"
                  placeholderTextColor="#999"
                  maxLength={6}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  editable={!isJoining}
                />
                
                <View style={styles.avatarSelectionRow}>
                  <Text style={styles.avatarSelectionLabel}>Select Your Avatar:</Text>
                  <TouchableOpacity 
                    style={styles.avatarPreviewButton}
                    onPress={openAvatarSelector}
                  >
                    <Image source={selectedAvatar.image} style={styles.avatarPreview} />
                    <Text style={styles.changeAvatarText}>Change</Text>
                  </TouchableOpacity>
                </View>
                
                <TouchableOpacity
                  style={[
                    styles.joinButton,
                    roomCode.length !== 6 && styles.disabledButton,
                    isJoining && styles.joiningButton
                  ]}
                  onPress={handleJoinRoom}
                  disabled={roomCode.length !== 6 || isJoining}
                >
                  {isJoining ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Text style={styles.joinButtonText}>Join Room</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </KeyboardAvoidingView>
        </LinearGradient>
      </TouchableWithoutFeedback>
      
      {/* Avatar selection modal */}
      <AvatarSelectionModal />
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
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 10,
  },
  menuButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  screenTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 15,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
  },
  roomInfoContainer: {
    marginBottom: 20,
  },
  roomCodeLabel: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  roomCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
  },
  roomCode: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    flex: 1,
    letterSpacing: 2,
  },
  copyButton: {
    padding: 8,
  },
  playersTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  playersList: {
    marginBottom: 20,
  },
  playerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  playerIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  playerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#555',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  currentPlayerIcon: {
    backgroundColor: '#0047AB',
  },
  playerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  hostTag: {
    fontWeight: 'normal',
    fontStyle: 'italic',
    color: '#0047AB',
  },
  readyStatus: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 15,
  },
  readyStatusReady: {
    backgroundColor: '#4CAF50',
  },
  readyStatusNotReady: {
    backgroundColor: '#FF6B6B',
  },
  readyStatusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  addPlayerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#0047AB',
  },
  addPlayerText: {
    color: '#0047AB',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  roomActions: {
    marginTop: 20,
  },
  startGameButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    borderRadius: 10,
    padding: 15,
    marginHorizontal: width * 0.1,
  },
  startGameText: {
    color: '#0047AB',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  readyButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    padding: 15,
    marginHorizontal: width * 0.1,
  },
  notReadyButton: {
    backgroundColor: '#FF6B6B',
  },
  readyButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  joinFormContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  formInstructions: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  roomCodeInput: {
    backgroundColor: 'white',
    borderRadius: 10,
    width: '100%',
    paddingVertical: 15,
    paddingHorizontal: 20,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#0047AB',
    letterSpacing: 8,
  },
  joinButton: {
    backgroundColor: '#FFD700',
    borderRadius: 10,
    width: '100%',
    paddingVertical: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  joiningButton: {
    backgroundColor: '#cca700',
  },
  joinButtonText: {
    color: '#0047AB',
    fontSize: 18,
    fontWeight: 'bold',
  },
  avatarImage: {
    width: 25,
    height: 25,
    resizeMode: 'contain'
  },
  avatarSelectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 15,
  },
  avatarSelectionLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  avatarPreviewButton: {
    alignItems: 'center',
  },
  avatarPreview: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  changeAvatarText: {
    color: '#FFD700',
    marginTop: 5,
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.85,
    backgroundColor: '#002366',
    borderRadius: 15,
    padding: 20,
    borderWidth: 2,
    borderColor: '#0047AB',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  avatarGrid: {
    paddingVertical: 10,
  },
  avatarItem: {
    width: (width * 0.85 - 40) / 3 - 10,
    height: (width * 0.85 - 40) / 3 - 10,
    margin: 5,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedAvatarItem: {
    borderColor: '#FFD700',
    backgroundColor: 'rgba(255,215,0,0.1)',
  },
  avatarSelectionImage: {
    width: '80%',
    height: '80%',
    resizeMode: 'contain',
  },
  selectedAvatarCheck: {
    position: 'absolute',
    top: 5,
    right: 5,
  },
  confirmButton: {
    backgroundColor: '#FFD700',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 15,
  },
  confirmButtonText: {
    color: '#0047AB',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default RoomScreen; 