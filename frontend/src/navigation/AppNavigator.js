/**
 * CashTrack — AppNavigator
 * Root navigator: shows animated splash while auth/data loads,
 * then transitions to AuthStack or MainTabs.
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import AuthStack from './AuthStack';
import MainTabs from './MainTabs';
import { useAuth } from '../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SW } = Dimensions.get('window');

// Rotating tip messages shown during load
const TIPS = [
  'Syncing your expenses…',
  'Crunching the numbers…',
  'Loading your insights…',
  'Almost ready…',
];

// ─── Animated Splash ──────────────────────────────────────────────────────────
const SplashScreen = ({ onDone }) => {
  // Core animations
  const logoScale   = useRef(new Animated.Value(0.7)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const titleOpacity= useRef(new Animated.Value(0)).current;
  const titleSlide  = useRef(new Animated.Value(16)).current;
  const subtitleOp  = useRef(new Animated.Value(0)).current;
  const barWidth    = useRef(new Animated.Value(0)).current;
  const shimmerX    = useRef(new Animated.Value(-SW)).current;
  const orbScale1   = useRef(new Animated.Value(0.8)).current;
  const orbScale2   = useRef(new Animated.Value(0.6)).current;
  const fadeOut     = useRef(new Animated.Value(1)).current;
  const tipOpacity  = useRef(new Animated.Value(0)).current;

  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    // 1. Logo pop-in
    Animated.parallel([
      Animated.spring(logoScale,   { toValue: 1,   friction: 7, useNativeDriver: true }),
      Animated.timing(logoOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();

    // 2. Title slide up after 200ms
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(titleOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
        Animated.spring(titleSlide,   { toValue: 0, friction: 9,  useNativeDriver: true }),
      ]).start();
    }, 200);

    // 3. Subtitle after 400ms
    setTimeout(() => {
      Animated.timing(subtitleOp, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    }, 400);

    // 4. Progress bar fill
    setTimeout(() => {
      Animated.timing(barWidth, {
        toValue: SW * 0.55,
        duration: 2200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    }, 500);

    // 5. Shimmer loop over the bar
    const runShimmer = () => {
      shimmerX.setValue(-SW * 0.6);
      Animated.timing(shimmerX, {
        toValue: SW * 0.6,
        duration: 1400,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(() => runShimmer());
    };
    setTimeout(runShimmer, 600);

    // 6. Orb breathe loops
    Animated.loop(
      Animated.sequence([
        Animated.timing(orbScale1, { toValue: 1.15, duration: 2200, useNativeDriver: true }),
        Animated.timing(orbScale1, { toValue: 0.8,  duration: 2200, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(orbScale2, { toValue: 1.2,  duration: 2800, useNativeDriver: true }),
        Animated.timing(orbScale2, { toValue: 0.6,  duration: 2800, useNativeDriver: true }),
      ])
    ).start();

    // 7. Cycle tip messages
    const tipTimer = setInterval(() => {
      Animated.timing(tipOpacity, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
        setTipIndex(i => (i + 1) % TIPS.length);
        Animated.timing(tipOpacity, { toValue: 1, duration: 300, useNativeDriver: true }).start();
      });
    }, 1800);

    setTimeout(() => {
      Animated.timing(tipOpacity, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    }, 600);

    return () => clearInterval(tipTimer);
  }, []);

  // Called by parent when both auth + data are ready
  useEffect(() => {
    if (onDone) {
      // slight delay so bar looks full before fading
      const t = setTimeout(() => {
        Animated.timing(fadeOut, {
          toValue: 0,
          duration: 380,
          useNativeDriver: true,
        }).start(() => onDone());
      }, 600);
      return () => clearTimeout(t);
    }
  }, [onDone]);

  return (
    <Animated.View style={[styles.splash, { opacity: fadeOut }]}>
      <LinearGradient
        colors={['#080a10', '#0c0e16', '#10121c']}
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative orbs */}
      <Animated.View style={[styles.orb1, { transform: [{ scale: orbScale1 }] }]}>
        <LinearGradient
          colors={['rgba(201,168,76,0.18)', 'transparent']}
          style={StyleSheet.absoluteFill}
          borderRadius={200}
        />
      </Animated.View>
      <Animated.View style={[styles.orb2, { transform: [{ scale: orbScale2 }] }]}>
        <LinearGradient
          colors={['rgba(91,141,238,0.12)', 'transparent']}
          style={StyleSheet.absoluteFill}
          borderRadius={160}
        />
      </Animated.View>

      {/* Grid lines */}
      <View style={styles.grid} pointerEvents="none">
        {[0,1,2,3].map(i => (
          <View key={i} style={[styles.gridLine, { left: (SW / 4) * i }]} />
        ))}
      </View>

      {/* Logo */}
      <Animated.Image
        source={require('../../assets/logo.png')}
        style={[styles.logo, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}
        resizeMode="contain"
      />

      {/* Brand name */}
      <Animated.Text
        style={[styles.brand, { opacity: titleOpacity, transform: [{ translateY: titleSlide }] }]}
      >
        CashTrack
      </Animated.Text>

      {/* Tagline */}
      <Animated.Text style={[styles.tagline, { opacity: subtitleOp }]}>
        Your personal finance tracker
      </Animated.Text>

      {/* Progress bar */}
      <View style={styles.barTrack}>
        <Animated.View style={[styles.barFill, { width: barWidth }]}>
          {/* Shimmer overlay */}
          <Animated.View
            style={[styles.shimmer, { transform: [{ translateX: shimmerX }] }]}
          />
        </Animated.View>
      </View>

      {/* Tip message */}
      <Animated.Text style={[styles.tip, { opacity: tipOpacity }]}>
        {TIPS[tipIndex]}
      </Animated.Text>
    </Animated.View>
  );
};

// ─── App Navigator ────────────────────────────────────────────────────────────
const AppNavigator = () => {
  const { isAuthenticated, loading } = useAuth();
  const [splashDone, setSplashDone]  = useState(false);
  const [readyToHide, setReadyToHide] = useState(false);

  // Auth resolved — signal splash it can start fading
  useEffect(() => {
    if (!loading) setReadyToHide(true);
  }, [loading]);

  const showSplash = !splashDone;

  return (
    <View style={{ flex: 1 }}>
      {/* Main app — mount early so it loads in the background */}
      {!loading && (
        <NavigationContainer>
          {isAuthenticated ? <MainTabs /> : <AuthStack />}
        </NavigationContainer>
      )}

      {/* Splash overlay sits on top until fade is complete */}
      {showSplash && (
        <View style={StyleSheet.absoluteFill}>
          <SplashScreen onDone={readyToHide ? () => setSplashDone(true) : null} />
        </View>
      )}
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  splash: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#080a10',
  },

  orb1: {
    position: 'absolute',
    top: -60, right: -80,
    width: 400, height: 400, borderRadius: 200,
    overflow: 'hidden',
  },
  orb2: {
    position: 'absolute',
    bottom: 40, left: -100,
    width: 320, height: 320, borderRadius: 160,
    overflow: 'hidden',
  },

  grid: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 },
  gridLine: {
    position: 'absolute', top: 0, bottom: 0,
    width: 1, backgroundColor: 'rgba(255,255,255,0.018)',
  },

  logo: {
    width: 110,
    height: 110,
    marginBottom: 22,
  },

  brand: {
    fontSize: 36,
    fontWeight: '900',
    color: '#e8c96a',
    letterSpacing: -1.2,
    marginBottom: 8,
  },

  tagline: {
    fontSize: 13,
    color: '#6b6f84',
    fontWeight: '600',
    letterSpacing: 0.4,
    marginBottom: 52,
  },

  barTrack: {
    width: SW * 0.55,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.07)',
    overflow: 'hidden',
    marginBottom: 20,
  },
  barFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: '#c9a84c',
    overflow: 'hidden',
  },
  shimmer: {
    position: 'absolute',
    top: 0, bottom: 0,
    width: 80,
    backgroundColor: 'rgba(255,255,255,0.35)',
    transform: [{ skewX: '-20deg' }],
  },

  tip: {
    fontSize: 12,
    color: '#c9a84c',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

export default AppNavigator;
