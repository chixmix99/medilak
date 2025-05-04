import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import screens
import HomeScreen from './screens/HomeScreen';
import GameScreen from './screens/GameScreen';
import ResultsScreen from './screens/ResultsScreen';
import HowToPlayScreen from './screens/HowToPlayScreen';
import SettingsScreen from './screens/SettingsScreen';

// Import multiplayer screens
import RoomScreen from './screens/RoomScreen';
import CategorySelectScreen from './screens/CategorySelectScreen';
import MultiplayerQuestionScreen from './screens/MultiplayerQuestionScreen';
import MultiplayerVotingScreen from './screens/MultiplayerVotingScreen';
import MultiplayerResultsScreen from './screens/MultiplayerResultsScreen';

const Stack = createNativeStackNavigator();

// App version - update this when making significant changes
const APP_VERSION = '1.1.0';

export default function App() {
  return (
    <>
      <NavigationContainer>
        <Stack.Navigator 
          initialRouteName="Home"
          screenOptions={{
            headerShown: false,
          }}
        >
          {/* Single player screens */}
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Game" component={GameScreen} />
          <Stack.Screen name="Results" component={ResultsScreen} />
          <Stack.Screen name="HowToPlay" component={HowToPlayScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          
          {/* Multiplayer screens */}
          <Stack.Screen name="Room" component={RoomScreen} />
          <Stack.Screen name="CategorySelect" component={CategorySelectScreen} />
          <Stack.Screen name="MultiplayerQuestion" component={MultiplayerQuestionScreen} />
          <Stack.Screen name="MultiplayerVoting" component={MultiplayerVotingScreen} />
          <Stack.Screen name="MultiplayerResults" component={MultiplayerResultsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
      
      {/* Version indicator */}
      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>Version {APP_VERSION}</Text>
      </View>
      
      <StatusBar style="auto" />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  versionContainer: {
    position: 'absolute',
    bottom: 60,
    right: 15,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#FFD700',
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  versionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  }
});
