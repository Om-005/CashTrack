/**
 * CashTrack — RegisterScreen
 * Premium dark fintech registration with floating-label inputs,
 * live password-strength meter, and step-by-step staggered reveals.
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

// ─── Password Strength ─────────────────────────────────────────────────────────
const getStrength = (pwd) => {
  if (!pwd) return { score: 0, label: '', color: 'transparent' };
  let score = 0;
  if (pwd.length >= 6)  score++;
  if (pwd.length >= 10) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  if (score <= 1) return { score, label: 'Weak',   color: '#e05c5c' };
  if (score <= 2) return { score, label: 'Fair',   color: '#f5a623' };
  if (score <= 3) return { score, label: 'Good',   color: '#c9a84c' };
  return                { score, label: 'Strong', color: '#4ecdc4' };
};

const StrengthMeter = ({ password }) => {
  const { score, label, color } = getStrength(password);
  const bars = [1, 2, 3, 4];
  if (!password) return null;
  return (
    <View style={mStyles.wrap}>
      <View style={mStyles.bars}>
        {bars.map((b) => (
          <View
            key={b}
            style={[
              mStyles.bar,
              { backgroundColor: b <= Math.ceil(score * 0.9) ? color : '#1e2130' },
            ]}
          />
        ))}
      </View>
      <Text style={[mStyles.label, { color }]}>{label}</Text>
    </View>
  );
};

const mStyles = StyleSheet.create({
  wrap:  { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8, marginBottom: 4 },
  bars:  { flex: 1, flexDirection: 'row', gap: 4 },
  bar:   { flex: 1, height: 3, borderRadius: 2 },
  label: { fontSize: 11, fontWeight: '700', width: 44, textAlign: 'right', letterSpacing: 0.3 },
});

// ─── Floating Label Input ──────────────────────────────────────────────────────
const FloatingInput = ({
  label,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  delay = 0,
  rightSlot,
}) => {
  const [focused, setFocused] = useState(false);
  const labelAnim  = useRef(new Animated.Value(value ? 1 : 0)).current;
  const borderAnim = useRef(new Animated.Value(0)).current;
  const slideAnim  = useRef(new Animated.Value(24)).current;
  const fadeAnim   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const t = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim,  { toValue: 1, duration: 420, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, friction: 9,   useNativeDriver: true }),
      ]).start();
    }, delay);
    return () => clearTimeout(t);
  }, []);

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
  const labelColor = labelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#555870', COLORS.primary || '#c9a84c'],
  });
  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [COLORS.inputBorder || '#272a38', COLORS.primary || '#c9a84c'],
  });

  return (
    <Animated.View style={[fiStyles.wrap, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <Animated.View style={[fiStyles.card, { borderColor }]}>
        <Animated.Text style={[fiStyles.label, { top: labelTop, fontSize: labelSize, color: labelColor }]}>
          {label}
        </Animated.Text>
        <TextInput
          style={fiStyles.input}
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
        <Animated.View style={[fiStyles.activeLine, { opacity: borderAnim }]} />
      </Animated.View>
      {rightSlot}
    </Animated.View>
  );
};

const fiStyles = StyleSheet.create({
  wrap: { marginBottom: 16 },
  card: {
    borderWidth: 1.5,
    borderRadius: 14,
    backgroundColor: '#0f1119',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 10,
    position: 'relative',
  },
  label: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
    fontWeight: '600',
    letterSpacing: 0.2,
    backgroundColor: '#0f1119',
    paddingHorizontal: 4,
  },
  input: {
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
});

// ─── Benefit Row ──────────────────────────────────────────────────────────────
const Benefit = ({ icon, text, delay }) => {
  const fade  = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(16)).current;
  useEffect(() => {
    const t = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fade,  { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(slide, { toValue: 0, friction: 9,   useNativeDriver: true }),
      ]).start();
    }, delay);
    return () => clearTimeout(t);
  }, []);
  return (
    <Animated.View style={[bStyles.row, { opacity: fade, transform: [{ translateX: slide }] }]}>
      <Text style={bStyles.icon}>{icon}</Text>
      <Text style={bStyles.text}>{text}</Text>
    </Animated.View>
  );
};
const bStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  icon: { fontSize: 14 },
  text: { fontSize: 12, color: '#8d91a8', flex: 1, lineHeight: 18 },
});

// ─── Main Screen ───────────────────────────────────────────────────────────────
const RegisterScreen = ({ navigation }) => {
  const { register, loading, error, clearError } = useAuth();
  const [name, setName]                     = useState('');
  const [email, setEmail]                   = useState('');
  const [password, setPassword]             = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError]         = useState('');

  // Orchestrated entrance
  const heroFade  = useRef(new Animated.Value(0)).current;
  const heroSlide = useRef(new Animated.Value(-20)).current;
  const orb1Scale = useRef(new Animated.Value(0.5)).current;
  const orb2Scale = useRef(new Animated.Value(0.5)).current;
  const cardFade  = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.stagger(100, [
      Animated.parallel([
        Animated.spring(orb1Scale, { toValue: 1, friction: 5, useNativeDriver: true }),
        Animated.spring(orb2Scale, { toValue: 1, friction: 6, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(heroFade,  { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.spring(heroSlide, { toValue: 0, friction: 9,   useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(cardFade,  { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(cardSlide, { toValue: 0, friction: 9,   useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  const handleRegister = async () => {
    setLocalError('');
    clearError();
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setLocalError('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return;
    }
    try {
      await register(name.trim(), email.trim(), password);
    } catch { /* handled in context */ }
  };

  const strength       = getStrength(password);
  const displayError   = localError || error;
  const passwordsMatch = confirmPassword && password === confirmPassword;

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#080a10', '#0c0e16', '#10121c']}
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative orbs */}
      <Animated.View style={[styles.orb1, { transform: [{ scale: orb1Scale }] }]}>
        <LinearGradient
          colors={['rgba(78,205,196,0.14)', 'transparent']}
          style={StyleSheet.absoluteFill}
          borderRadius={160}
        />
      </Animated.View>
      <Animated.View style={[styles.orb2, { transform: [{ scale: orb2Scale }] }]} />

      {/* Grid lines */}
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
          {/* Hero */}
          <Animated.View
            style={[styles.heroWrap, { opacity: heroFade, transform: [{ translateY: heroSlide }] }]}
          >
            <Image 
              source={require('../../assets/logo.png')}
              style={{ width: 64, height: 64, marginBottom: 12 }}
              resizeMode="contain"
            />
            <Text style={styles.heroTitle}>Create Account</Text>
          </Animated.View>

          {/* Form card */}
          <Animated.View
            style={[styles.formCard, { opacity: cardFade, transform: [{ translateY: cardSlide }] }]}
          >
            {/* Gold top shine */}
            <LinearGradient
              colors={['rgba(201,168,76,0.14)', 'transparent']}
              style={styles.cardShine}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />

            <Text style={styles.formTitle}>Your Details</Text>
            <Text style={styles.formSub}>Fill in the fields below to get started</Text>

            {displayError ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorIcon}>⚠</Text>
                <Text style={styles.errorText}>{displayError}</Text>
              </View>
            ) : null}

            <FloatingInput
              label="Full Name"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              delay={100}
            />
            <FloatingInput
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              delay={200}
            />
            <FloatingInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              delay={300}
              rightSlot={<StrengthMeter password={password} />}
            />

            {/* Confirm password with match indicator */}
            <Animated.View style={{ marginBottom: 8 }}>
              <FloatingInput
                label="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                delay={400}
              />
              {confirmPassword ? (
                <View style={[styles.matchRow, { opacity: confirmPassword ? 1 : 0 }]}>
                  <Text style={{ color: passwordsMatch ? '#4ecdc4' : '#e05c5c', fontSize: 11, fontWeight: '700' }}>
                    {passwordsMatch ? '✓  Passwords match' : '✕  Passwords do not match'}
                  </Text>
                </View>
              ) : null}
            </Animated.View>



            {/* CTA */}
            <Pressable
              onPress={handleRegister}
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
                    <Text style={styles.btnText}>Create Account</Text>
                    <Text style={styles.btnArrow}>→</Text>
                  </>
                )}
              </LinearGradient>
            </Pressable>
          </Animated.View>

          {/* Login link */}
          <Pressable
            style={styles.linkWrap}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.linkText}>
              Already have an account?{'  '}
              <Text style={styles.linkBold}>Sign In</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  kav:  { flex: 1 },

  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 44,
  },

  // Orbs
  orb1: {
    position: 'absolute',
    top: -60,
    left: -100,
    width: 320,
    height: 320,
    borderRadius: 160,
    borderWidth: 1,
    borderColor: 'rgba(78,205,196,0.08)',
    overflow: 'hidden',
  },
  orb2: {
    position: 'absolute',
    bottom: 100,
    right: -80,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(201,168,76,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.08)',
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
  heroWrap: { alignItems: 'center', marginBottom: 28 },
  heroEmoji: { fontSize: 44, marginBottom: 12 },
  heroTitle: {
    fontSize: 30,
    fontWeight: '900',
    color: '#e8e9ef',
    letterSpacing: -0.8,
  },
  heroSub: { fontSize: 13, color: '#6b6f84', marginTop: 6, marginBottom: 20 },
  benefitsWrap: {
    alignSelf: 'stretch',
    backgroundColor: 'rgba(255,255,255,0.025)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1e2130',
    padding: 16,
  },

  // Card
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
    fontSize: 22,
    fontWeight: '800',
    color: '#e8e9ef',
    marginBottom: 4,
    marginTop: 4,
  },
  formSub: { fontSize: 13, color: '#6b6f84', marginBottom: 22 },

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
    marginBottom: 18,
  },
  errorIcon: { fontSize: 13, color: '#e05c5c' },
  errorText: { color: '#e05c5c', fontSize: 13, fontWeight: '500', flex: 1 },

  // Match indicator
  matchRow: { marginTop: -8, marginBottom: 4, paddingHorizontal: 4 },

  // Terms
  termsText: {
    fontSize: 11,
    color: '#555870',
    lineHeight: 17,
    textAlign: 'center',
    marginBottom: 4,
  },
  termsLink: { color: '#c9a84c', fontWeight: '700' },

  // Button
  btnWrap: { marginTop: 18 },
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
  btnText: { color: '#0c0e14', fontSize: 16, fontWeight: '900', letterSpacing: 0.6 },
  btnArrow: { color: '#0c0e14', fontSize: 18, fontWeight: '800' },

  // Link
  linkWrap: { marginTop: 26, alignItems: 'center', paddingVertical: 8 },
  linkText: { color: '#6b6f84', fontSize: 14 },
  linkBold: { color: '#c9a84c', fontWeight: '800' },
});

export default RegisterScreen;