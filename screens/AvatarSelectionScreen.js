import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Animated
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AVATARS } from '../constants/avatars';

const { width, height } = Dimensions.get('window');

const AvatarSelectionScreen = ({ navigation, route }) => {
  const { currentAvatar, onAvatarSelect } = route.params || {};
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar || AVATARS[0].id);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [fadeAnim] = useState(new Animated.Value(0));
  
  useEffect(() => {
    // Extract unique categories
    const uniqueCategories = ['all', ...new Set(AVATARS.map(avatar => avatar.category))];
    setCategories(uniqueCategories);
    
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true
    }).start();
  }, []);
  
  const filteredAvatars = selectedCategory === 'all' 
    ? AVATARS 
    : AVATARS.filter(avatar => avatar.category === selectedCategory);
  
  const handleSelectAvatar = (avatarId) => {
    setSelectedAvatar(avatarId);
  };
  
  const handleConfirm = () => {
    if (onAvatarSelect) {
      onAvatarSelect(selectedAvatar);
    }
    navigation.goBack();
  };
  
  const renderCategory = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        selectedCategory === item && styles.selectedCategoryButton
      ]}
      onPress={() => setSelectedCategory(item)}
    >
      <Text style={[
        styles.categoryText,
        selectedCategory === item && styles.selectedCategoryText
      ]}>
        {item.charAt(0).toUpperCase() + item.slice(1)}
      </Text>
    </TouchableOpacity>
  );
  
  const renderAvatarItem = ({ item }) => {
    const isSelected = selectedAvatar === item.id;
    
    return (
      <TouchableOpacity
        style={[
          styles.avatarItem,
          isSelected && styles.selectedAvatarItem
        ]}
        onPress={() => handleSelectAvatar(item.id)}
      >
        <View style={styles.avatarImageContainer}>
          <Image 
            source={item.src} 
            style={styles.avatarImage} 
            resizeMode="contain"
          />
        </View>
        <Text style={styles.avatarName}>{item.name}</Text>
        
        {isSelected && (
          <View style={styles.selectedIndicator}>
            <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
          </View>
        )}
      </TouchableOpacity>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0047AB', '#002366']}
        style={styles.background}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={28} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Choose Your Avatar</Text>
        </View>
        
        <View style={styles.categoriesContainer}>
          <FlatList
            data={categories}
            renderItem={renderCategory}
            keyExtractor={item => item}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
        </View>
        
        <Animated.View style={[styles.avatarsContainer, { opacity: fadeAnim }]}>
          <FlatList
            data={filteredAvatars}
            renderItem={renderAvatarItem}
            keyExtractor={item => item.id}
            numColumns={2}
            contentContainerStyle={styles.avatarsList}
            showsVerticalScrollIndicator={false}
          />
        </Animated.View>
        
        <View style={styles.previewContainer}>
          <Text style={styles.previewTitle}>Selected Avatar</Text>
          <View style={styles.previewAvatarContainer}>
            <Image 
              source={AVATARS.find(a => a.id === selectedAvatar)?.src} 
              style={styles.previewAvatar}
              resizeMode="contain"
            />
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.confirmButton}
          onPress={handleConfirm}
        >
          <Text style={styles.confirmButtonText}>Confirm Selection</Text>
        </TouchableOpacity>
      </LinearGradient>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 10,
  },
  backButton: {
    padding: 5,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 5,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 15,
  },
  categoriesContainer: {
    marginBottom: 20,
  },
  categoriesList: {
    paddingVertical: 5,
  },
  categoryButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    marginRight: 10,
  },
  selectedCategoryButton: {
    backgroundColor: '#FFD700',
  },
  categoryText: {
    color: 'white',
    fontWeight: 'bold',
  },
  selectedCategoryText: {
    color: '#0047AB',
  },
  avatarsContainer: {
    flex: 1,
  },
  avatarsList: {
    paddingBottom: 20,
  },
  avatarItem: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 10,
    padding: 10,
    margin: 8,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    height: 160,
  },
  selectedAvatarItem: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  avatarImageContainer: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarName: {
    marginTop: 10,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  previewContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  previewTitle: {
    fontSize: 18,
    color: '#FFD700',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  previewAvatarContainer: {
    width: 120,
    height: 120,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  previewAvatar: {
    width: '90%',
    height: '90%',
  },
  confirmButton: {
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
  confirmButtonText: {
    color: '#0047AB',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AvatarSelectionScreen; 