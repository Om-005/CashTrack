/**
 * CashTrack — LoadingSkeleton Component
 * Smooth pulsing placeholder with surface colors.
 */

import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { COLORS } from '../utils/constants';

const LoadingSkeleton = ({ width = '100%', height = 20, borderRadius = 10, style }) => {
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.8,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width, height, borderRadius, opacity: pulseAnim },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: COLORS.surfaceLight,
    marginBottom: 8,
  },
});

export default LoadingSkeleton;
