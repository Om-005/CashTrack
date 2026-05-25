/**
 * CashTrack — AppNavigator
 * Root navigator: shows AuthStack or MainTabs based on auth state.
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Animated } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import AuthStack from './AuthStack';
import MainTabs from './MainTabs';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../utils/constants';
import { LinearGradient } from 'expo-linear-gradient';

const LoadingSplash = () => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.loading}>
      <LinearGradient
        colors={['#080a10', '#0c0e16', '#10121c']}
        style={StyleSheet.absoluteFill}
      />
      <Animated.Image 
        source={require('../../assets/logo.png')} 
        style={[styles.logoImg, { transform: [{ scale: pulseAnim }] }]} 
        resizeMode="contain" 
      />
      <Text style={styles.loadingTitle}>CashTrack</Text>
      <Text style={styles.loadingSub}>Loading your finances...</Text>
    </View>
  );
};

const AppNavigator = () => {
  const { isAuthenticated, loading } = useAuth();

  // Show custom splash screen while restoring token from AsyncStorage
  if (loading) {
    return <LoadingSplash />;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#080a10',
  },
  logoImg: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  loadingTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#e8e9ef',
    letterSpacing: -1,
  },
  loadingSub: {
    fontSize: 14,
    color: '#c9a84c',
    marginTop: 8,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

export default AppNavigator;
