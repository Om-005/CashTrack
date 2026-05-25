/**
 * CashTrack — CategorySelector Component
 * Premium 2-column grid of category pills with active state.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { COLORS, CATEGORIES } from '../utils/constants';

const CategorySelector = ({ selected, onSelect }) => (
  <View style={styles.grid}>
    {CATEGORIES.map((cat) => {
      const isActive = selected === cat.name;
      return (
        <Pressable
          key={cat.id}
          style={[
            styles.pill,
            { borderColor: isActive ? cat.color : COLORS.cardBorder },
            isActive && { backgroundColor: cat.color + '18' },
          ]}
          onPress={() => onSelect?.(cat.name)}
        >
          <Text style={styles.emoji}>{cat.emoji}</Text>
          <Text
            style={[
              styles.name,
              { color: isActive ? cat.color : COLORS.textSecondary },
            ]}
            numberOfLines={1}
          >
            {cat.name}
          </Text>
        </Pressable>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  pill: {
    width: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  emoji: {
    fontSize: 20,
    marginRight: 10,
  },
  name: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
});

export default CategorySelector;
