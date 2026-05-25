/**
 * CashTrack — ChartCard Component
 * Premium chart wrapper with accent title dot.
 */

import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { COLORS } from '../utils/constants';

const ChartCard = ({ title, children }) => (
  <View style={styles.card}>
    {title ? (
      <View style={styles.header}>
        <View style={styles.dot} />
        <Text style={styles.title}>{title}</Text>
      </View>
    ) : null}
    {children}
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 18,
    marginBottom: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: { elevation: 3 },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  dot: {
    width: 4,
    height: 16,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
    marginRight: 10,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
});

export default ChartCard;
