/**
 * CashTrack — ExpenseCard Component
 * Premium expense item with solid card, category accent, and rich details.
 */

import React, { useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/constants';
import { formatCurrency, formatDate, formatTime, getCategoryByName } from '../utils/helpers';

const ExpenseCard = ({ expense, onPress, onDelete }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const category = getCategoryByName(expense.category) || {
    emoji: '📦',
    color: '#C4C4C4',
    name: 'Other',
  };

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }).start();
  };

  return (
    <Pressable
      onPress={() => onPress?.(expense)}
      onLongPress={() => onDelete?.(expense)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View
        style={[
          styles.card,
          { borderLeftColor: category.color, transform: [{ scale: scaleAnim }] },
        ]}
      >
        {/* Category Icon */}
        <View style={[styles.emojiWrap, { backgroundColor: category.color + '15' }]}>
          <Text style={styles.emoji}>{category.emoji}</Text>
        </View>

        {/* Details */}
        <View style={styles.details}>
          <Text style={styles.description} numberOfLines={1}>
            {expense.description || category.name}
          </Text>
          <View style={styles.metaRow}>
            <Ionicons name="calendar-outline" size={11} color={COLORS.textTertiary} />
            <Text style={styles.metaText}>
              {formatDate(expense.date || expense.createdAt)}
            </Text>
            <Ionicons name="time-outline" size={11} color={COLORS.textTertiary} style={{ marginLeft: 8 }} />
            <Text style={styles.metaText}>
              {formatTime(expense.time || expense.date || expense.createdAt)}
            </Text>
          </View>
          {expense.paymentMethod ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{expense.paymentMethod}</Text>
            </View>
          ) : null}
        </View>

        {/* Amount */}
        <Text style={styles.amount}>
          {formatCurrency(expense.amount)}
        </Text>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderLeftWidth: 3,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#0c0e14',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: { elevation: 3 },
    }),
  },
  emojiWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  emoji: {
    fontSize: 22,
  },
  details: {
    flex: 1,
  },
  description: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  metaText: {
    fontSize: 11,
    color: COLORS.textTertiary,
    marginLeft: 3,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primary + '18',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10,
    color: COLORS.primaryLight,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  amount: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.primaryLight,
    marginLeft: 8,
  },
});

export default ExpenseCard;
