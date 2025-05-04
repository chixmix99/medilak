import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import colors from '../constants/colors';

const Timer = ({ duration = 15, isActive = true, onTimeUp }) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const animatedWidth = useRef(new Animated.Value(1)).current;
  
  // Reset animation when duration changes
  useEffect(() => {
    setTimeLeft(duration);
    animatedWidth.setValue(1);
  }, [duration]);

  // Start timer countdown when active
  useEffect(() => {
    let intervalId;
    if (isActive && timeLeft > 0) {
      // Start animation for progress bar
      Animated.timing(animatedWidth, {
        toValue: 0,
        duration: timeLeft * 1000,
        useNativeDriver: false,
      }).start();
      
      // Start countdown
      intervalId = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            clearInterval(intervalId);
            if (onTimeUp) onTimeUp();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (!isActive) {
      // Pause animation and timer if not active
      clearInterval(intervalId);
      animatedWidth.stopAnimation();
    }
    
    return () => {
      clearInterval(intervalId);
      animatedWidth.stopAnimation();
    };
  }, [isActive, timeLeft, onTimeUp]);

  // Determine color based on time left
  const getBarColor = () => {
    if (timeLeft > 10) return colors.feedback.correct;
    if (timeLeft > 5) return colors.feedback.neutral;
    return colors.feedback.incorrect;
  };

  return (
    <View style={styles.container}>
      <View style={styles.timerContainer}>
        <Text style={styles.timeText}>{timeLeft}</Text>
        <Text style={styles.secondsText}>sec</Text>
      </View>
      <View style={styles.progressContainer}>
        <Animated.View 
          style={[
            styles.progressBar, 
            { 
              backgroundColor: getBarColor(),
              width: animatedWidth.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              })
            }
          ]} 
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 5,
  },
  timeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  secondsText: {
    fontSize: 16,
    marginLeft: 4,
    color: colors.text.secondary,
  },
  progressContainer: {
    height: 6,
    width: '100%',
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
});

export default Timer;
