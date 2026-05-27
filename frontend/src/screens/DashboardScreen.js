/**
 * CashTrack — DashboardScreen
 * Theme-matched to LoginScreen / RegisterScreen:
 *   bg #080a10, cards #13151e/#1e2130, gold #c9a84c/#e8c96a,
 *   decorative orbs, subtle grid lines, gold card-shine strips.
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Platform,
  Animated,
  useWindowDimensions,
  Pressable,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, CATEGORIES } from '../utils/constants';
import { formatCurrency } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import { useExpenses } from '../context/ExpenseContext';
import * as expenseService from '../services/expenseService';
import ExpenseCard from '../components/ExpenseCard';
import EmptyState from '../components/EmptyState';
import LoadingSkeleton from '../components/LoadingSkeleton';

// ─── Theme tokens (mirrors Login / Register) ──────────────────────────────────
const T = {
  bg:        '#080a10',
  surface:   '#13151e',
  card:      '#13151e',
  cardBorder:'#1e2130',
  inner:     '#0f1119',
  gold:      '#c9a84c',
  gold2:     '#e8c96a',
  goldDim:   '#a8862e',
  text:      '#e8e9ef',
  muted:     '#6b6f84',
  border:    '#272a38',
  // stat accent colours
  blue:      '#5b8dee',
  purple:    '#9b6dff',
  teal:      '#4ecdc4',
  amber:     '#f5a623',
  danger:    '#e05c5c',
};

// ─── Chart configs ─────────────────────────────────────────────────────────────
const lineConfig = {
  backgroundGradientFrom:        T.card,
  backgroundGradientTo:          T.card,
  color: (o = 1) =>             `rgba(201,168,76,${o})`,
  labelColor: (o = 1) =>        `rgba(107,111,132,${o})`,
  strokeWidth: 2.5,
  decimalPlaces: 0,
  propsForDots: { r: '4', strokeWidth: '2', stroke: T.gold2, fill: T.inner },
  propsForBackgroundLines: { stroke: 'rgba(30,33,48,0.8)', strokeDasharray: '' },
  fillShadowGradientFrom:        T.gold,
  fillShadowGradientFromOpacity: 0.22,
  fillShadowGradientTo:          T.card,
  fillShadowGradientToOpacity:   0,
};

const barConfig = {
  ...lineConfig,
  color: (o = 1) =>             `rgba(232,201,106,${o})`,
  fillShadowGradientFrom:        T.gold2,
  fillShadowGradientFromOpacity: 0.85,
  fillShadowGradientTo:          T.gold,
  fillShadowGradientToOpacity:   0.2,
};

// ─── Sub-components ────────────────────────────────────────────────────────────

/** Thin coloured top-bar + dark body — mirrors the formCard shine strip. */
const StatCard = ({ label, valueText, sub, accent, icon, delay = 0 }) => {
  const fade  = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(20)).current;

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
    <Animated.View style={[sc.wrap, { opacity: fade, transform: [{ translateY: slide }] }]}>
      {/* coloured top shine strip (same trick as formCard) */}
      <View style={[sc.strip, { backgroundColor: accent }]} />
      <Text style={sc.label}>{label}</Text>
      {icon ? (
        <View style={sc.iconRow}>
          <Text style={sc.iconEmoji}>{icon}</Text>
          <Text style={[sc.value, { fontSize: 17 }]} numberOfLines={1}>{valueText}</Text>
        </View>
      ) : (
        <Text style={sc.value}>{valueText}</Text>
      )}
      {sub ? <Text style={sc.sub}>{sub}</Text> : null}
    </Animated.View>
  );
};

const sc = StyleSheet.create({
  wrap: {
    width: '48%',
    backgroundColor: T.inner,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: T.cardBorder,
    padding: 16,
    marginBottom: 14,
    overflow: 'hidden',
  },
  strip: { position: 'absolute', top: 0, left: 0, right: 0, height: 3 },
  label: {
    fontSize: 10,
    color: T.muted,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: 12,
    marginTop: 4,
  },
  iconRow:  { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  iconEmoji:{ fontSize: 16 },
  value:    { fontSize: 22, fontWeight: '800', color: T.text, marginBottom: 4, letterSpacing: -0.3 },
  sub:      { fontSize: 11, color: T.muted },
});

/** Reusable section heading — accent bar + serif-style label. */
const SectionTitle = ({ title, sub }) => (
  <View style={st.row}>
    <View style={st.bar} />
    <Text style={st.title}>{title}</Text>
    {sub ? <Text style={st.sub}>{sub}</Text> : null}
  </View>
);
const st = StyleSheet.create({
  row:  { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14, marginTop: 22 },
  bar:  { width: 3, height: 20, borderRadius: 2, backgroundColor: T.gold },
  title:{ fontSize: 19, fontWeight: '800', color: T.text, letterSpacing: -0.3 },
  sub:  { fontSize: 13, color: T.muted, fontWeight: '500' },
});

/** Card wrapper that matches the login formCard style. */
const ChartCard = ({ children }) => (
  <View style={cc.card}>
    <LinearGradient
      colors={['rgba(201,168,76,0.10)', 'transparent']}
      style={cc.shine}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
    />
    {children}
  </View>
);
const cc = StyleSheet.create({
  card: {
    backgroundColor: T.card,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: T.cardBorder,
    padding: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16 },
      android: { elevation: 6 },
    }),
  },
  shine: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 3,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
  },
});

// ─── Main Screen ───────────────────────────────────────────────────────────────
const DashboardScreen = ({ navigation }) => {
  const { width: SW } = useWindowDimensions();
  const CHART_W = SW - 80;
  
  const { user }                  = useAuth();
  const { expenses, fetchExpenses } = useExpenses();

  const [refreshing,    setRefreshing]    = useState(false);
  const [stats,         setStats]         = useState(null);
  const [dailyTrend,    setDailyTrend]    = useState(null);
  const [monthlyData,   setMonthlyData]   = useState(null);
  const [categoryData,  setCategoryData]  = useState(null);
  const [loading,       setLoading]       = useState(true);

  // Entrance animations
  const headerFade  = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-20)).current;
  const heroFade    = useRef(new Animated.Value(0)).current;
  const heroSlide   = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.stagger(150, [
      Animated.parallel([
        Animated.timing(headerFade,  { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(headerSlide, { toValue: 0, friction: 9,   useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(heroFade,  { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(heroSlide, { toValue: 0, friction: 9,   useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  const loadData = useCallback(async () => {
    try {
      const [statsRes, trendRes, monthlyRes, catRes] = await Promise.allSettled([
        expenseService.getDashboardStats(),
        expenseService.getDailyTrend(),
        expenseService.getMonthlyAnalytics(new Date().getFullYear()),
        expenseService.getCategoryAnalytics(new Date().getMonth() + 1, new Date().getFullYear()),
      ]);
      if (statsRes.status   === 'fulfilled') setStats(statsRes.value?.stats     || statsRes.value);
      if (trendRes.status   === 'fulfilled') setDailyTrend(trendRes.value);
      if (monthlyRes.status === 'fulfilled') setMonthlyData(monthlyRes.value);
      if (catRes.status     === 'fulfilled') setCategoryData(catRes.value);
    } catch { /* silent */ }
  }, []);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      (async () => {
        await Promise.all([fetchExpenses(), loadData()]);
        if (isActive) setLoading(false);
      })();
      return () => { isActive = false; };
    }, [fetchExpenses, loadData])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchExpenses(), loadData()]);
    setRefreshing(false);
  }, []);

  // ── Chart data preparation ─────────────────────────────────────────────────
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i)); return d;
  });
  const lineData = {
    labels: last7.map(d => d.toLocaleDateString('en-US', { weekday: 'short' })),
    datasets: [{
      data: last7.map(d => {
        const m = dailyTrend?.analytics?.find(a => new Date(a.date).toDateString() === d.toDateString());
        return m ? m.total : 0;
      }),
      strokeWidth: 2.5,
    }],
  };

  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const curMonth = new Date().getMonth();
  const barLabels = MONTHS.slice(Math.max(0, curMonth - 5), curMonth + 1);
  const barValues = barLabels.map((_, i) => {
    const month = Math.max(0, curMonth - 5) + i + 1;
    const m = monthlyData?.analytics?.find(a => a.month === month);
    return m ? m.total : 0;
  });
  const barData = {
    labels: barLabels.length ? barLabels : MONTHS.slice(0, 6),
    datasets: [{ data: barValues.length ? barValues : Array(6).fill(0) }],
  };

  const PIE_FALLBACK_COLORS = [
    '#e8c96a', '#4ecdc4', '#5b8dee', '#9b6dff',
    '#f5a623', '#c9a84c', '#e05c5c', '#6b6f84',
  ];

  const pieData = (categoryData?.analytics || []).slice(0, 5).map((cat, idx) => {
    // Backend projects the aggregated field as `category` (not `name` or `_id`)
    const rawKey = (cat.category || cat.name || cat._id || '').toLowerCase().trim();
    const found = CATEGORIES.find(c =>
      c.id.toLowerCase() === rawKey ||
      c.name.toLowerCase() === rawKey ||
      c.name.toLowerCase().includes(rawKey) ||
      rawKey.includes(c.id.toLowerCase())
    );
    return {
      name:            found?.name || cat.category || cat.name || cat._id || 'Other',
      amount:          cat.total || cat.amount || 0,
      color:           found?.color || PIE_FALLBACK_COLORS[idx % PIE_FALLBACK_COLORS.length],
      legendFontColor: T.muted,
      legendFontSize:  11,
    };
  });

  const todayCount    = (expenses || []).filter(e => new Date(e.date).toDateString() === new Date().toDateString()).length;
  const recentExpenses = (expenses || []).slice(0, 5);
  const initials = (user?.name || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.root}>
        <LinearGradient colors={[T.bg, '#0c0e16', '#10121c']} style={StyleSheet.absoluteFill} />
        <View style={{ padding: 24 }}>
          <LoadingSkeleton width="50%" height={18} />
          <LoadingSkeleton width="70%" height={28} style={{ marginTop: 8 }} />
          <LoadingSkeleton width="100%" height={140} borderRadius={22} style={{ marginTop: 24 }} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
            <LoadingSkeleton width="48%" height={90} borderRadius={16} />
            <LoadingSkeleton width="48%" height={90} borderRadius={16} />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 }}>
            <LoadingSkeleton width="48%" height={90} borderRadius={16} />
            <LoadingSkeleton width="48%" height={90} borderRadius={16} />
          </View>
          <LoadingSkeleton width="100%" height={220} borderRadius={22} style={{ marginTop: 24 }} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {/* ── Background layers (identical to Login/Register) ── */}
      <LinearGradient colors={[T.bg, '#0c0e16', '#10121c']} style={StyleSheet.absoluteFill} />

      {/* Decorative orbs */}
      <View style={styles.orb1} pointerEvents="none">
        <LinearGradient
          colors={['rgba(201,168,76,0.13)', 'transparent']}
          style={StyleSheet.absoluteFill}
          borderRadius={180}
        />
      </View>
      <View style={styles.orb2} pointerEvents="none" />
      <View style={styles.orb3} pointerEvents="none" />

      {/* Subtle vertical grid */}
      <View style={styles.gridLines} pointerEvents="none">
        {[0, 1, 2, 3].map(i => (
          <View key={i} style={[styles.gridLine, { left: (SW / 4) * i }]} />
        ))}
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={T.gold}
            colors={[T.gold]}
          />
        }
      >
        {/* ── Header ── */}
        <Animated.View
          style={[styles.headerRow, { opacity: headerFade, transform: [{ translateY: headerSlide }] }]}
        >
          {/* Profile avatar ring */}
          <Pressable onPress={() => navigation.navigate('Profile')}>
            <View style={styles.avatarRing}>
              <LinearGradient
                colors={[T.gold2, T.gold, T.goldDim]}
                style={StyleSheet.absoluteFill}
                borderRadius={24}
              />
              <View style={styles.avatarInner}>
                <Text style={styles.avatarInitials}>{initials}</Text>
              </View>
            </View>
          </Pressable>

          {/* Title block */}
          <View style={{ alignItems: 'center', flex: 1 }}>
            <Text style={styles.headerEyebrow}>CASHTRACK</Text>
            <Text style={styles.headerTitle}>Spending Insights</Text>
          </View>

          {/* Empty view to balance the header flex layout */}
          <View style={{ width: 46 }} />
        </Animated.View>

        {/* ── Hero total card ── */}
        <Animated.View style={{ opacity: heroFade, transform: [{ translateY: heroSlide }] }}>
          <View style={styles.heroCard}>
            {/* Gold shine strip */}
            <LinearGradient
              colors={[`${T.gold}22`, 'transparent']}
              style={styles.heroShine}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />

            {/* Radial glow inside card */}
            <LinearGradient
              colors={['rgba(201,168,76,0.07)', 'transparent']}
              style={styles.heroGlow}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
            />

            <Text style={styles.heroLabel}>TOTAL THIS MONTH</Text>
            <Text style={styles.heroAmount}>{formatCurrency(stats?.monthlyTotal || 0)}</Text>
            <View style={styles.heroDivider} />
            <Text style={styles.heroSub}>All time · {formatCurrency(stats?.yearlyTotal || 0)}</Text>
          </View>
        </Animated.View>

        {/* ── Overview stats grid ── */}
        <SectionTitle title="Overview" />
        <View style={styles.statsGrid}>
          <StatCard
            label="Daily Avg (7d)"
            valueText={formatCurrency(stats?.avgDailySpending || 0)}
            sub="last 7 days"
            accent={T.blue}
            delay={80}
          />
          <StatCard
            label="Top Category"
            valueText={stats?.topCategory?.category || '—'}
            icon={CATEGORIES.find(c => c.name === stats?.topCategory?.category)?.emoji || '🍽️'}
            sub={formatCurrency(stats?.topCategory?.total || 0)}
            accent={T.purple}
            delay={160}
          />
          <StatCard
            label="Transactions"
            valueText={String(expenses?.length || 0)}
            sub="this month"
            accent={T.teal}
            delay={240}
          />
          <StatCard
            label="Today"
            valueText={String(todayCount)}
            sub="entries today"
            accent={T.amber}
            delay={320}
          />
        </View>

        {/* ── 7-Day Trend ── */}
        <SectionTitle title="7-Day Trend" sub="Daily spending" />
        <ChartCard>
          <LineChart
            data={lineData}
            width={CHART_W}
            height={190}
            chartConfig={lineConfig}
            bezier
            style={styles.chart}
            withInnerLines={false}
            withShadow
          />
        </ChartCard>

        {/* ── Monthly Overview ── */}
        <SectionTitle title="Monthly Overview" />
        <ChartCard>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <BarChart
              data={barData}
              width={Math.max(CHART_W, barData.labels.length * 52)}
              height={190}
              chartConfig={barConfig}
              style={styles.chart}
              showValuesOnTopOfBars
              fromZero
              withInnerLines={false}
            />
          </ScrollView>
        </ChartCard>

        {/* ── Category Breakdown ── */}
        {pieData.length > 0 && (
          <>
            <SectionTitle title="Category Breakdown" sub="this month" />
            <ChartCard>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <PieChart
                  data={pieData}
                  width={Math.max(SW - 40, 360)}
                  height={190}
                  chartConfig={lineConfig}
                  accessor="amount"
                  backgroundColor="transparent"
                  paddingLeft="15"
                  center={[10, 0]}
                  absolute
                  style={styles.chart}
                />
              </ScrollView>
            </ChartCard>
          </>
        )}

        {/* ── Full Analytics CTA ── */}
        <Pressable
          onPress={() => navigation.navigate('Analytics')}
          style={({ pressed }) => [styles.analyticsBtnWrap, { opacity: pressed ? 0.86 : 1 }]}
        >
          <LinearGradient
            colors={[T.gold2, T.gold, T.goldDim]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.analyticsBtn}
          >
            <Ionicons name="analytics-outline" size={19} color="#0c0e14" />
            <Text style={styles.analyticsBtnText}>View Full Analytics</Text>
            <Ionicons name="chevron-forward" size={17} color="#0c0e14" />
          </LinearGradient>
        </Pressable>

        {/* ── Recent Transactions ── */}
        <SectionTitle title="Recent" sub="last 5 entries" />
        {recentExpenses.length > 0 ? (
          <View style={styles.transactionList}>
            {recentExpenses.map((exp, idx) => (
              <ExpenseCard
                key={exp._id || exp.id || idx}
                expense={exp}
                onPress={e => navigation.navigate('EditExpense', { expense: e })}
              />
            ))}
          </View>
        ) : (
          <EmptyState
            emoji="📭"
            title="No expenses yet"
            subtitle="Tap the + button to add your first expense"
          />
        )}

        <View style={{ height: 48 }} />
      </ScrollView>
    </View>
  );
};

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1 },

  // Orbs
  orb1: {
    position: 'absolute',
    top: -100,
    right: -80,
    width: 360,
    height: 360,
    borderRadius: 180,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.07)',
    overflow: 'hidden',
  },
  orb2: {
    position: 'absolute',
    top: 300,
    left: -100,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(91,141,238,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(91,141,238,0.07)',
  },
  orb3: {
    position: 'absolute',
    bottom: 200,
    right: -60,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(78,205,196,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(78,205,196,0.06)',
  },

  // Grid
  gridLines: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 },
  gridLine:  { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(255,255,255,0.018)' },

  // Content
  content: { paddingHorizontal: 24, paddingTop: 56, paddingBottom: 24 },

  // Header
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
  },
  avatarRing: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: T.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: { fontSize: 14, fontWeight: '900', color: T.gold2 },
  headerEyebrow: {
    fontSize: 10,
    color: T.gold,
    fontWeight: '800',
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: T.text,
    letterSpacing: -0.4,
  },
  iconBtn: {
    width: 46,
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: T.cardBorder,
    backgroundColor: T.inner,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Hero card
  heroCard: {
    backgroundColor: T.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: T.cardBorder,
    padding: 32,
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 4,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.35, shadowRadius: 20 },
      android: { elevation: 8 },
    }),
  },
  heroShine: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 3,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  heroGlow: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: '60%',
  },
  heroLabel: {
    fontSize: 10,
    color: T.muted,
    fontWeight: '700',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    marginBottom: 14,
  },
  heroAmount: {
    fontSize: 44,
    fontWeight: '900',
    color: T.gold2,
    letterSpacing: -1.5,
    marginBottom: 14,
  },
  heroDivider: {
    width: 40,
    height: 1,
    backgroundColor: T.cardBorder,
    marginBottom: 12,
  },
  heroSub: { fontSize: 12, color: T.muted },

  // Stats
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  // Charts
  chart: { borderRadius: 12, marginLeft: -8 },

  // Analytics button
  analyticsBtnWrap: { marginTop: 24 },
  analyticsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    paddingVertical: 16,
    minHeight: 54,
  },
  analyticsBtnText: {
    color: '#0c0e14',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.4,
  },

  // Transactions
  transactionList: { gap: 8 },
});

export default DashboardScreen;