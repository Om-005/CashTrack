/**
 * CashTrack — StatCard Component
 * Premium stat display with colored top accent border and slide-up animation.
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { COLORS } from '../utils/constants';

const StatCard = ({ icon, label, value, color = COLORS.primary }) => {
  const slideAnim = useRef(new Animated.Value(30)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={[styles.card, { borderTopColor: color }]}>
        <View style={styles.row}>
          <View style={[styles.iconWrap, { backgroundColor: color + '18' }]}>
            <Text style={styles.icon}>{icon}</Text>
          </View>
          <View style={styles.textWrap}>
            <Text style={styles.label}>{label}</Text>
            <Text style={[styles.value, { color }]} numberOfLines={1}>
              {value}
            </Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    marginHorizontal: 5,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderTopWidth: 3,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#0c0e14',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
    }),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 20,
  },
  textWrap: {
    flex: 1,
  },
  label: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  value: {
    fontSize: 20,
    fontWeight: '800',
  },
});

export default StatCard;
