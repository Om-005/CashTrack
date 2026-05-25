/**
 * CashTrack — EmptyState Component
 * Large emoji + title + subtitle placeholder.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../utils/constants';

const EmptyState = ({ emoji = '📭', title = 'Nothing here', subtitle = '' }) => (
  <View style={styles.container}>
    <View style={styles.emojiWrap}>
      <Text style={styles.emoji}>{emoji}</Text>
    </View>
    <Text style={styles.title}>{title}</Text>
    {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emojiWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  emoji: {
    fontSize: 36,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textTertiary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default EmptyState;
