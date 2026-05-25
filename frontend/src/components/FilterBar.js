/**
 * CashTrack — FilterBar Component
 * Horizontal scrollable filter chips with premium styling.
 */

import React from 'react';
import { ScrollView, Pressable, Text, StyleSheet } from 'react-native';
import { COLORS } from '../utils/constants';

const FilterBar = ({ filters = [], onFilterPress }) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    style={{ maxHeight: 60 }}
    contentContainerStyle={styles.bar}
  >
    {filters.map((f, idx) => (
      <Pressable
        key={f.value || idx}
        style={[styles.chip, f.active && styles.chipActive]}
        onPress={() => onFilterPress?.(f.value)}
      >
        <Text style={[styles.chipText, f.active && styles.chipTextActive]}>
          {f.label}
        </Text>
      </Pressable>
    ))}
  </ScrollView>
);

const styles = StyleSheet.create({
  bar: {
    paddingVertical: 10,
    paddingHorizontal: 4,
    gap: 8,
    alignItems: 'center',
  },
  chip: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#fff',
  },
});

export default FilterBar;
