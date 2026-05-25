/**
 * CashTrack — GlassCard Component
 * Premium dark surface card with elevation and subtle glow border.
 */

import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { COLORS } from '../utils/constants';

const GlassCard = ({ children, style }) => (
  <View style={[styles.card, style]}>{children}</View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
});

export default GlassCard;
