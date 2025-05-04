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
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';

// Import the questions to get categories
import medicalQuestions from '../constants/medicalQuestions';

const { width, height } = Dimensions.get('window');

const CategorySelectScreen = ({ navigation, route }) => {
  const { 
    isMultiplayer, 
    roomCode, 
    players,
    playerScores,
    roundNumber = 1, 
    totalRounds = 10,
  } = route.params || {};
  
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Get unique categories from questions
  useEffect(() => {
    // Extract unique categories and count questions in each
    const categoriesMap = {};
    
    medicalQuestions.forEach(question => {
      const category = question.category || 'Uncategorized';
      if (!categoriesMap[category]) {
        categoriesMap[category] = 1;
      } else {
        categoriesMap[category]++;
      }
    });
    
    // Convert to array with category name and question count
    const categoriesArray = Object.keys(categoriesMap).map(category => ({
      id: category,
      name: category,
      questionCount: categoriesMap[category]
    }));
    
    // Add a "Random" category
    categoriesArray.unshift({
      id: 'random',
      name: 'Random',
      questionCount: medicalQuestions.length,
      isRandom: true
    });
    
    // Sort categories alphabetically (except Random stays first)
    const sortedCategories = categoriesArray.sort((a, b) => {
      if (a.isRandom) return -1;
      if (b.isRandom) return 1;
      return a.name.localeCompare(b.name);
    });
    
    setCategories(sortedCategories);
    setLoading(false);
  }, []);
  
  // Handle category selection
  const handleSelectCategory = (category) => {
    setSelectedCategory(category);
    
    // Navigate to the question screen with the selected category
    setTimeout(() => {
      navigation.navigate('MultiplayerQuestion', {
        isMultiplayer,
        roomCode,
        players,
        category: category.isRandom ? null : category.name,
        playerScores,
        roundNumber,
        totalRounds
      });
    }, 500);
  };
  
  // Handle dismissing the keyboard
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  // Render each category item
  const renderCategoryItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={[
          styles.categoryCard,
          selectedCategory?.id === item.id && styles.selectedCategory
        ]}
        onPress={() => handleSelectCategory(item)}
        activeOpacity={0.7}
      >
        <View style={styles.categoryIcon}>
          <Ionicons 
            name={item.isRandom ? "shuffle" : "medical"} 
            size={24} 
            color="#0047AB" 
          />
        </View>
        
        <View style={styles.categoryInfo}>
          <Text style={styles.categoryName}>{item.name}</Text>
          <Text style={styles.questionCount}>
            {item.questionCount} {item.questionCount === 1 ? 'question' : 'questions'}
          </Text>
        </View>
        
        <Ionicons 
          name="chevron-forward" 
          size={24} 
          color="#0047AB" 
          style={styles.chevron}
        />
      </TouchableOpacity>
    );
  };
  
  const currentPlayer = players.find(p => p.isCurrentUser);
  const currentPlayerIndex = players.findIndex(p => p.isCurrentUser);
  
  // Determine if it's the current player's turn to select the category
  // For simplicity, we'll use the round number modulo the number of players
  const isCurrentPlayersTurn = (currentPlayerIndex === (roundNumber - 1) % players.length);
  
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
          
          <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>
              {isCurrentPlayersTurn 
                ? 'Choose a Category' 
                : `${players[(roundNumber - 1) % players.length].name} is choosing...`}
            </Text>
            
            {isCurrentPlayersTurn && (
              <Text style={styles.headerSubtitle}>
                Select a category for this round
              </Text>
            )}
            
            {!isCurrentPlayersTurn && (
              <View style={styles.waitingMessage}>
                <ActivityIndicator color="#FFD700" size="small" style={styles.waitingSpinner} />
                <Text style={styles.waitingText}>
                  Waiting for category selection...
                </Text>
              </View>
            )}
          </View>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FFD700" />
              <Text style={styles.loadingText}>Loading categories...</Text>
            </View>
          ) : (
            <FlatList
              data={categories}
              renderItem={renderCategoryItem}
              keyExtractor={item => item.id}
              style={styles.categoryList}
              contentContainerStyle={styles.listContentContainer}
              showsVerticalScrollIndicator={false}
            />
          )}
          
          <View style={styles.playerIndicator}>
            <Ionicons name="person" size={24} color="white" />
            <Text style={styles.playerName}>{currentPlayer.name}</Text>
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
  headerContainer: {
    marginTop: 20,
    marginBottom: 30,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#FFD700',
    textAlign: 'center',
  },
  waitingMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  waitingSpinner: {
    marginRight: 10,
  },
  waitingText: {
    fontSize: 16,
    color: '#FFD700',
    fontStyle: 'italic',
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
  categoryList: {
    flex: 1,
  },
  listContentContainer: {
    paddingBottom: 20,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
  },
  selectedCategory: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  categoryIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,71,171,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0047AB',
    marginBottom: 4,
  },
  questionCount: {
    fontSize: 14,
    color: '#777',
  },
  chevron: {
    padding: 5,
  },
  playerIndicator: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 10,
    borderRadius: 20,
  },
  playerName: {
    color: 'white',
    marginLeft: 5,
    fontWeight: 'bold',
  },
});

export default CategorySelectScreen; 