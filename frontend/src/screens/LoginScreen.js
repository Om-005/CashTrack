/**
 * CashTrack — LoginScreen
 * Premium dark fintech login with floating-label inputs,
 * staggered field animations, and radial orb background.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  Animated,
  Dimensions,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../utils/constants';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

// ─── Floating Label Input ──────────────────────────────────────────────────────
const FloatingInput = ({
  label,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  delay = 0,
}) => {
  const [focused, setFocused] = useState(false);
  const labelAnim  = useRef(new Animated.Value(value ? 1 : 0)).current;
  const borderAnim = useRef(new Animated.Value(0)).current;
  const slideAnim  = useRef(new Animated.Value(24)).current;
  const fadeAnim   = useRef(new Animated.Value(0)).current;

  // Entrance animation (staggered by delay)
  useEffect(() => {
    const t = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim,  { toValue: 1, duration: 420, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, friction: 9, useNativeDriver: true }),
      ]).start();
    }, delay);
    return () => clearTimeout(t);
  }, []);

  // Float label when focused or has value
  useEffect(() => {
    Animated.timing(labelAnim, {
      toValue: focused || value ? 1 : 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
    Animated.timing(borderAnim, {
      toValue: focused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [focused, value]);

  const labelTop   = labelAnim.interpolate({ inputRange: [0, 1], outputRange: [17, -9] });
  const labelSize  = labelAnim.interpolate({ inputRange: [0, 1], outputRange: [15, 11] });
  const labelColor = labelAnim.interpolate({ inputRange: [0, 1], outputRange: ['#555870', COLORS.primary || '#c9a84c'] });
  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [COLORS.inputBorder || '#272a38', COLORS.primary || '#c9a84c'],
  });

  return (
    <Animated.View style={[styles.floatWrap, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <Animated.View style={[styles.floatCard, { borderColor }]}>
        {/* Floating Label */}
        <Animated.Text
          style={[
            styles.floatLabel,
            { top: labelTop, fontSize: labelSize, color: labelColor },
          ]}
        >
          {label}
        </Animated.Text>

        <TextInput
          style={styles.floatInput}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize || 'none'}
          placeholderTextColor="transparent"
          placeholder=" "
          selectionColor={COLORS.primary || '#c9a84c'}
        />

        {/* Active glow line */}
        <Animated.View style={[styles.activeLine, { opacity: borderAnim }]} />
      </Animated.View>
    </Animated.View>
  );
};

// ─── Main Screen ───────────────────────────────────────────────────────────────
const LoginScreen = ({ navigation }) => {
  const { login, loading, error, clearError } = useAuth();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');

  // Orchestrated entrance
  const heroFade  = useRef(new Animated.Value(0)).current;
  const heroSlide = useRef(new Animated.Value(-30)).current;
  const orb1Scale = useRef(new Animated.Value(0.6)).current;
  const orb2Scale = useRef(new Animated.Value(0.4)).current;
  const cardFade  = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.stagger(120, [
      Animated.parallel([
        Animated.spring(orb1Scale, { toValue: 1, friction: 6, useNativeDriver: true }),
        Animated.spring(orb2Scale, { toValue: 1, friction: 5, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(heroFade,  { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.spring(heroSlide, { toValue: 0, friction: 9, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(cardFade,  { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(cardSlide, { toValue: 0, friction: 9, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  const handleLogin = async () => {
    setLocalError('');
    clearError();
    if (!email.trim() || !password.trim()) {
      setLocalError('Please fill in all fields');
      return;
    }
    try {
      await login(email.trim(), password);
    } catch { /* handled in context */ }
  };

  const displayError = localError || error;

  return (
    <View style={styles.root}>
      {/* Deep layered background */}
      <LinearGradient
        colors={['#080a10', '#0c0e16', '#10121c']}
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative orbs */}
      <Animated.View style={[styles.orb1, { transform: [{ scale: orb1Scale }] }]}>
        <LinearGradient
          colors={['rgba(201,168,76,0.18)', 'rgba(201,168,76,0)']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
      </Animated.View>
      <Animated.View style={[styles.orb2, { transform: [{ scale: orb2Scale }] }]} />

      {/* Subtle grid lines */}
      <View style={styles.gridLines} pointerEvents="none">
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={[styles.gridLine, { left: (width / 4) * i }]} />
        ))}
      </View>

      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Hero section */}
          <Animated.View
            style={[styles.heroWrap, { opacity: heroFade, transform: [{ translateY: heroSlide }] }]}
          >
            <View style={styles.logoRing}>
              <LinearGradient
                colors={['rgba(201,168,76,0.1)', 'transparent']}
                style={StyleSheet.absoluteFill}
                borderRadius={44}
              />
              <Image 
                source={require('../../assets/logo.png')}
                style={{ width: 64, height: 64 }}
                resizeMode="contain"
              />
            </View>

            <Text style={styles.appName}>CashTrack</Text>
            <Text style={styles.tagline}>Track smarter. Spend wiser.</Text>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerDot}>◆</Text>
              <View style={styles.dividerLine} />
            </View>
          </Animated.View>

          {/* Form card */}
          <Animated.View
            style={[styles.formCard, { opacity: cardFade, transform: [{ translateY: cardSlide }] }]}
          >
            {/* Shine strip */}
            <LinearGradient
              colors={['rgba(201,168,76,0.12)', 'transparent']}
              style={styles.cardShine}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />

            <Text style={styles.formTitle}>Welcome Back</Text>
            <Text style={styles.formSub}>Sign in to your account</Text>

            {displayError ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorIcon}>⚠</Text>
                <Text style={styles.errorText}>{displayError}</Text>
              </View>
            ) : null}

            {/* Floating label inputs */}
            <FloatingInput
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              delay={100}
            />
            <FloatingInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              delay={200}
            />

            <Pressable style={styles.forgotWrap}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </Pressable>

            {/* CTA Button */}
            <Pressable
              onPress={handleLogin}
              disabled={loading}
              style={({ pressed }) => [styles.btnWrap, { opacity: pressed ? 0.88 : 1 }]}
            >
              <LinearGradient
                colors={['#e8c96a', '#c9a84c', '#a8862e']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.btn, loading && styles.btnDisabled]}
              >
                {loading ? (
                  <ActivityIndicator color="#0c0e14" />
                ) : (
                  <>
                    <Text style={styles.btnText}>Sign In</Text>
                    <Text style={styles.btnArrow}>→</Text>
                  </>
                )}
              </LinearGradient>
            </Pressable>


          </Animated.View>

          {/* Register link */}
          <Pressable
            style={styles.linkWrap}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.linkText}>
              Don't have an account?{'  '}
              <Text style={styles.linkBold}>Create one</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  kav: { flex: 1 },

  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },

  // Orbs
  orb1: {
    position: 'absolute',
    top: -120,
    right: -80,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.08)',
    overflow: 'hidden',
  },
  orb2: {
    position: 'absolute',
    bottom: 60,
    left: -100,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(91,141,238,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(91,141,238,0.08)',
  },

  // Grid
  gridLines: { position: 'absolute', inset: 0 },
  gridLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },

  // Hero
  heroWrap: { alignItems: 'center', marginBottom: 36 },
  logoRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  logoEmoji: { fontSize: 40 },
  appName: {
    fontSize: 34,
    fontWeight: '900',
    color: '#e8e9ef',
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 13,
    color: '#6b6f84',
    marginTop: 6,
    letterSpacing: 0.4,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 24,
    width: '70%',
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.06)' },
  dividerDot: { fontSize: 8, color: 'rgba(201,168,76,0.5)' },

  // Form card
  formCard: {
    backgroundColor: '#13151e',
    borderRadius: 28,
    padding: 28,
    borderWidth: 1,
    borderColor: '#1e2130',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.4,
        shadowRadius: 24,
      },
      android: { elevation: 10 },
    }),
  },
  cardShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#e8e9ef',
    marginBottom: 4,
    marginTop: 4,
  },
  formSub: { fontSize: 13, color: '#6b6f84', marginBottom: 24 },

  // Error
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(224,92,92,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(224,92,92,0.25)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  errorIcon: { fontSize: 13, color: '#e05c5c' },
  errorText: { color: '#e05c5c', fontSize: 13, fontWeight: '500', flex: 1 },

  // Floating input
  floatWrap: { marginBottom: 16 },
  floatCard: {
    borderWidth: 1.5,
    borderRadius: 14,
    backgroundColor: '#0f1119',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 10,
    position: 'relative',
  },
  floatLabel: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
    fontWeight: '600',
    letterSpacing: 0.2,
    backgroundColor: '#0f1119',
    paddingHorizontal: 4,
  },
  floatInput: {
    color: '#e8e9ef',
    fontSize: 15,
    paddingTop: 4,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  activeLine: {
    position: 'absolute',
    bottom: 0,
    left: 16,
    right: 16,
    height: 1.5,
    backgroundColor: '#c9a84c',
    borderRadius: 1,
  },

  // Forgot
  forgotWrap: { alignSelf: 'flex-end', marginTop: 4, marginBottom: 4 },
  forgotText: { fontSize: 12, color: '#c9a84c', fontWeight: '600' },

  // Button
  btnWrap: { marginTop: 20 },
  btn: {
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 54,
  },
  btnDisabled: { opacity: 0.55 },
  btnText: {
    color: '#0c0e14',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  btnArrow: { color: '#0c0e14', fontSize: 18, fontWeight: '800' },

  // Or divider
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 24,
    marginBottom: 16,
  },
  orLine: { flex: 1, height: 1, backgroundColor: '#1e2130' },
  orText: { fontSize: 11, color: '#6b6f84', fontWeight: '600', letterSpacing: 0.5 },

  // Social
  socialRow: { flexDirection: 'row', gap: 10 },
  socialBtn: {
    flex: 1,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: '#272a38',
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#0f1119',
  },
  socialText: { color: '#8d91a8', fontSize: 13, fontWeight: '600' },

  // Link
  linkWrap: { marginTop: 28, alignItems: 'center', paddingVertical: 8 },
  linkText: { color: '#6b6f84', fontSize: 14 },
  linkBold: { color: '#c9a84c', fontWeight: '800' },
});

export default LoginScreen;