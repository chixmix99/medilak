import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  SafeAreaView, 
  TouchableOpacity, 
  Switch,
  Alert,
  ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';
import { getSettings, saveSettings, resetProgress } from '../utils/storage';

const SettingItem = ({ icon, title, description, value, onValueChange }) => (
  <View style={styles.settingItem}>
    <View style={styles.settingInfo}>
      <Ionicons name={icon} size={24} color={colors.primaryGradient.start} style={styles.settingIcon} />
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
    </View>
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: '#ccc', true: colors.primaryGradient.start }}
      thumbColor={'#fff'}
    />
  </View>
);

const SettingsScreen = ({ navigation }) => {
  const [settings, setSettings] = useState({
    soundEnabled: true,
    notificationsEnabled: true,
    darkMode: false,
  });
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Load settings when component mounts
    loadSettings();
  }, []);
  
  const loadSettings = async () => {
    try {
      const savedSettings = await getSettings();
      setSettings(savedSettings);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleToggleSetting = (setting) => {
    const updatedSettings = {
      ...settings,
      [setting]: !settings[setting]
    };
    
    setSettings(updatedSettings);
    saveSettings(updatedSettings);
  };
  
  const handleResetProgress = () => {
    Alert.alert(
      'Reset Progress',
      'This will reset all your scores and game progress. This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            const success = await resetProgress();
            if (success) {
              Alert.alert('Success', 'Your progress has been reset.');
            }
          },
        },
      ]
    );
  };
  
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }
  
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
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={{ width: 24 }} /> {/* Empty view for balanced header */}
        </View>
      </LinearGradient>
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>App Settings</Text>
          
          <SettingItem 
            icon="volume-high"
            title="Sound Effects"
            description="Enable or disable game sound effects"
            value={settings.soundEnabled}
            onValueChange={() => handleToggleSetting('soundEnabled')}
          />
          
          <SettingItem 
            icon="notifications"
            title="Notifications"
            description="Receive reminders to practice"
            value={settings.notificationsEnabled}
            onValueChange={() => handleToggleSetting('notificationsEnabled')}
          />
          
          <SettingItem 
            icon="moon"
            title="Dark Mode"
            description="Switch between light and dark themes"
            value={settings.darkMode}
            onValueChange={() => handleToggleSetting('darkMode')}
          />
        </View>
        
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Data & Privacy</Text>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleResetProgress}>
            <Ionicons name="refresh-circle" size={24} color={colors.primaryGradient.start} />
            <Text style={styles.actionText}>Reset Progress</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="document-text" size={24} color={colors.primaryGradient.start} />
            <Text style={styles.actionText}>Privacy Policy</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="document" size={24} color={colors.primaryGradient.start} />
            <Text style={styles.actionText}>Terms of Service</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>MediKalak v1.0.0</Text>
        </View>
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
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.light,
  },
  scrollView: {
    flex: 1,
  },
  sectionContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  settingInfo: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 15,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  actionText: {
    fontSize: 16,
    color: colors.text.primary,
    marginLeft: 15,
  },
  versionContainer: {
    alignItems: 'center',
    padding: 20,
  },
  versionText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
});

export default SettingsScreen;
