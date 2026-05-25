/**
 * CashTrack — AllExpensesScreen
 * Theme-matched to LoginScreen / RegisterScreen / DashboardScreen / AddExpenseScreen:
 *   bg #080a10, cards #13151e/#1e2130, gold #c9a84c/#e8c96a,
 *   decorative orbs, grid lines, animated search, gold filter chips.
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SectionList,
  RefreshControl,
  Pressable,
  Alert,
  ActivityIndicator,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, CATEGORIES } from '../utils/constants';
import { formatCurrency, groupExpensesByDate, formatDate } from '../utils/helpers';
import { useExpenses } from '../context/ExpenseContext';
import { useToast } from '../components/Toast';
import ExpenseCard from '../components/ExpenseCard';
import EmptyState from '../components/EmptyState';

// ─── Theme tokens ─────────────────────────────────────────────────────────────
const T = {
  bg:         '#080a10',
  card:       '#13151e',
  cardBorder: '#1e2130',
  inner:      '#0f1119',
  gold:       '#c9a84c',
  gold2:      '#e8c96a',
  goldDim:    '#a8862e',
  text:       '#e8e9ef',
  muted:      '#6b6f84',
  border:     '#272a38',
  danger:     '#e05c5c',
};

const { width: SW } = Dimensions.get('window');

// ─── Animated search bar ──────────────────────────────────────────────────────
const SearchBar = ({ value, onChangeText }) => {
  const [focused, setFocused] = useState(false);
  const border = useRef(new Animated.Value(0)).current;
  const fade   = useRef(new Animated.Value(0)).current;
  const slide  = useRef(new Animated.Value(-14)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade,  { toValue: 1, duration: 480, useNativeDriver: true }),
      Animated.spring(slide, { toValue: 0, friction: 9,   useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    Animated.timing(border, { toValue: focused ? 1 : 0, duration: 200, useNativeDriver: false }).start();
  }, [focused]);

  const borderColor = border.interpolate({ inputRange: [0, 1], outputRange: [T.border, T.gold] });

  return (
    <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }] }}>
      <Animated.View style={[sb.wrap, { borderColor }]}>
        <Ionicons name="search-outline" size={17} color={focused ? T.gold : T.muted} />
        <TextInput
          style={sb.input}
          placeholder="Search expenses…"
          placeholderTextColor={T.muted}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          selectionColor={T.gold}
        />
        {value ? (
          <Pressable onPress={() => onChangeText('')} hitSlop={8}>
            <Ionicons name="close-circle" size={16} color={T.muted} />
          </Pressable>
        ) : null}
      </Animated.View>
    </Animated.View>
  );
};
const sb = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: T.inner,
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  input: { flex: 1, color: T.text, fontSize: 14, fontWeight: '500' },
});

// ─── Filter chip row ──────────────────────────────────────────────────────────
const FilterChips = ({ active, onSelect }) => {
  const fade  = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(-10)).current;
  useEffect(() => {
    const t = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fade,  { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(slide, { toValue: 0, friction: 9,   useNativeDriver: true }),
      ]).start();
    }, 80);
    return () => clearTimeout(t);
  }, []);

  const chips = [
    { label: 'All', value: 'All' },
    ...CATEGORIES.map(c => ({ label: `${c.emoji} ${c.name}`, value: c.name })),
  ];

  return (
    <Animated.ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={[fc.scroll, { opacity: fade, transform: [{ translateY: slide }] }]}
      contentContainerStyle={fc.content}
    >
      {chips.map((chip, i) => {
        const isActive = active === chip.value;
        return (
          <Pressable
            key={chip.value}
            onPress={() => onSelect(chip.value)}
            style={({ pressed }) => [
              fc.chip,
              isActive && fc.chipActive,
              { marginLeft: i === 0 ? 0 : 8, opacity: pressed ? 0.75 : 1 },
            ]}
          >
            {isActive ? (
              <LinearGradient
                colors={[T.gold2, T.gold]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
                borderRadius={20}
              />
            ) : null}
            <Text style={[fc.chipText, isActive && fc.chipTextActive]}>
              {chip.label}
            </Text>
          </Pressable>
        );
      })}
    </Animated.ScrollView>
  );
};
const fc = StyleSheet.create({
  scroll:         { flexGrow: 0 },
  content:        { paddingHorizontal: 20, paddingVertical: 12 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: T.inner,
    borderWidth: 1.5,
    borderColor: T.border,
    overflow: 'hidden',
    minHeight: 38,
    justifyContent: 'center',
  },
  chipActive:     { borderColor: T.gold },
  chipText:       { fontSize: 12, color: T.muted, fontWeight: '600' },
  chipTextActive: { color: '#0c0e14', fontWeight: '900' },
});

// ─── Section header ───────────────────────────────────────────────────────────
const SectionHeader = ({ section }) => (
  <View style={sh.wrap}>
    <View style={sh.leftBar} />
    <View style={{ flex: 1 }}>
      <Text style={sh.date}>{section.title}</Text>
      <Text style={sh.total}>Total · {formatCurrency(section.total)}</Text>
    </View>
    <View style={sh.badge}>
      <Text style={sh.badgeText}>{section.data.length}</Text>
    </View>
  </View>
);
const sh = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 4,
    marginTop: 6,
  },
  leftBar: { width: 3, height: 32, borderRadius: 2, backgroundColor: T.gold },
  date:    { fontSize: 14, fontWeight: '800', color: T.text, letterSpacing: -0.2 },
  total:   { fontSize: 11, color: T.muted, marginTop: 2, fontWeight: '500' },
  badge: {
    backgroundColor: T.inner,
    borderWidth: 1,
    borderColor: T.cardBorder,
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  badgeText: { fontSize: 11, color: T.muted, fontWeight: '700' },
});

// ─── Summary strip ────────────────────────────────────────────────────────────
const SummaryStrip = ({ expenses }) => {
  const total = expenses.reduce((s, e) => s + (e.amount || 0), 0);
  const count = expenses.length;
  const fade  = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);
  return (
    <Animated.View style={{ opacity: fade }}>
      <View style={strip.wrap}>
        <LinearGradient
          colors={[`${T.gold}18`, 'transparent']}
          style={strip.shine}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        />
        <View style={strip.cell}>
          <Text style={strip.label}>RESULTS</Text>
          <Text style={strip.value}>{count}</Text>
        </View>
        <View style={strip.divider} />
        <View style={strip.cell}>
          <Text style={strip.label}>TOTAL</Text>
          <Text style={[strip.value, { color: T.gold2 }]}>{formatCurrency(total)}</Text>
        </View>
      </View>
    </Animated.View>
  );
};
const strip = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    backgroundColor: T.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: T.cardBorder,
    marginHorizontal: 20,
    marginBottom: 4,
    overflow: 'hidden',
  },
  shine: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 2,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  cell:    { flex: 1, alignItems: 'center', paddingVertical: 12 },
  label:   { fontSize: 9, color: T.muted, letterSpacing: 2, fontWeight: '800', textTransform: 'uppercase', marginBottom: 4 },
  value:   { fontSize: 16, fontWeight: '900', color: T.text, letterSpacing: -0.3 },
  divider: { width: 1, backgroundColor: T.cardBorder, marginVertical: 10 },
});

// ─── Main Screen ───────────────────────────────────────────────────────────────
const AllExpensesScreen = ({ navigation }) => {
  const { expenses, fetchExpenses, deleteExpense, loading } = useExpenses();
  const { showToast } = useToast();

  const [search,       setSearch]       = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [refreshing,   setRefreshing]   = useState(false);

  useEffect(() => { fetchExpenses(); }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchExpenses();
    setRefreshing(false);
  }, []);

  const filtered = (expenses || []).filter(exp => {
    const matchCat =
      activeFilter === 'All' ||
      (exp.category || '').toLowerCase() === activeFilter.toLowerCase();
    const q    = search.trim().toLowerCase();
    const desc = (exp.description || '').toLowerCase();
    const cat  = (exp.category    || '').toLowerCase();
    const df   = formatDate(exp.date || exp.createdAt).toLowerCase();
    const di   = (exp.date || exp.createdAt || '').toString().toLowerCase();
    const matchSearch = !q || desc.includes(q) || cat.includes(q) || df.includes(q) || di.includes(q);
    return matchCat && matchSearch;
  });

  const sections = groupExpensesByDate(filtered);

  const handleDelete = expense => {
    const confirm = async () => {
      try {
        await deleteExpense(expense._id || expense.id);
        showToast('Expense deleted', 'success');
      } catch {
        showToast('Failed to delete', 'error');
      }
    };
    if (Platform.OS === 'web') {
      if (window.confirm('Delete this expense?')) confirm();
    } else {
      Alert.alert('Delete Expense', 'Are you sure you want to delete this expense?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: confirm },
      ]);
    }
  };

  return (
    <View style={styles.root}>
      {/* ── Background ── */}
      <LinearGradient colors={[T.bg, '#0c0e16', '#10121c']} style={StyleSheet.absoluteFill} />

      {/* Decorative orbs */}
      <View style={styles.orb1} pointerEvents="none">
        <LinearGradient
          colors={['rgba(201,168,76,0.11)', 'transparent']}
          style={StyleSheet.absoluteFill}
          borderRadius={180}
        />
      </View>
      <View style={styles.orb2} pointerEvents="none" />

      {/* Grid lines */}
      <View style={styles.gridLines} pointerEvents="none">
        {[0, 1, 2, 3].map(i => (
          <View key={i} style={[styles.gridLine, { left: (SW / 4) * i }]} />
        ))}
      </View>

      {/* ── Search ── */}
      <View style={styles.searchPad}>
        <SearchBar value={search} onChangeText={setSearch} />
      </View>

      {/* ── Filter chips ── */}
      <FilterChips active={activeFilter} onSelect={setActiveFilter} />

      {/* ── Summary strip ── */}
      {filtered.length > 0 && <SummaryStrip expenses={filtered} />}

      {/* ── List ── */}
      <SectionList
        sections={sections}
        keyExtractor={(item, idx) => item._id || item.id || String(idx)}
        renderSectionHeader={({ section }) => <SectionHeader section={section} />}
        renderItem={({ item }) => (
          <View style={styles.itemWrap}>
            <ExpenseCard
              expense={item}
              onPress={exp => navigation.navigate('EditExpense', { expense: exp })}
              onDelete={handleDelete}
            />
          </View>
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState
            emoji={search ? '🔍' : '📋'}
            title={search ? 'No results found' : 'No expenses yet'}
            subtitle={search ? 'Try a different search term' : 'Add your first expense!'}
          />
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={T.gold}
            colors={[T.gold]}
          />
        }
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
      />

    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },

  orb1: {
    position: 'absolute',
    top: -80,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.07)',
    overflow: 'hidden',
  },
  orb2: {
    position: 'absolute',
    bottom: 200,
    left: -80,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(91,141,238,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(91,141,238,0.07)',
  },

  gridLines: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 },
  gridLine:  { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(255,255,255,0.018)' },

  searchPad:   { paddingHorizontal: 20, paddingTop: 16 },
  listContent: { paddingHorizontal: 20, paddingBottom: 110 },
  itemWrap:    { marginBottom: 8 },
});

export default AllExpensesScreen;