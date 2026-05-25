/**
 * CashTrack — AnalyticsScreen
 * Theme-matched to LoginScreen / RegisterScreen / DashboardScreen /
 * AddExpenseScreen / AllExpensesScreen:
 *   bg #080a10, cards #13151e/#1e2130, gold #c9a84c/#e8c96a,
 *   decorative orbs, grid lines, staggered reveals.
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  useWindowDimensions,
  ActivityIndicator,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { CATEGORIES } from '../utils/constants';
import { formatCurrency } from '../utils/helpers';
import * as expenseService from '../services/expenseService';
import EmptyState from '../components/EmptyState';
import { useToast } from '../components/Toast';

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
  blue:       '#5b8dee',
  teal:       '#4ecdc4',
  amber:      '#f5a623',
  purple:     '#9b6dff',
  danger:     '#e05c5c',
};

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const { width: SW } = Dimensions.get('window');

// ─── Chart configs ─────────────────────────────────────────────────────────────
const barConfig = {
  backgroundGradientFrom:        T.card,
  backgroundGradientTo:          T.card,
  color: (o = 1) =>             `rgba(232,201,106,${o})`,
  labelColor: (o = 1) =>        `rgba(107,111,132,${o})`,
  strokeWidth: 2,
  decimalPlaces: 0,
  propsForBackgroundLines: { stroke: 'rgba(30,33,48,0.8)', strokeDasharray: '' },
  fillShadowGradientFrom:        T.gold2,
  fillShadowGradientFromOpacity: 0.85,
  fillShadowGradientTo:          T.gold,
  fillShadowGradientToOpacity:   0.15,
};

const pieConfig = {
  backgroundGradientFrom: T.card,
  backgroundGradientTo:   T.card,
  color: (o = 1) =>      `rgba(201,168,76,${o})`,
  labelColor: (o = 1) => `rgba(107,111,132,${o})`,
};

// ─── Shared animated slot ──────────────────────────────────────────────────────
const FadeSlot = ({ delay = 0, children, style }) => {
  const fade  = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(18)).current;
  useEffect(() => {
    const t = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fade,  { toValue: 1, duration: 420, useNativeDriver: true }),
        Animated.spring(slide, { toValue: 0, friction: 9,   useNativeDriver: true }),
      ]).start();
    }, delay);
    return () => clearTimeout(t);
  }, []);
  return (
    <Animated.View style={[{ opacity: fade, transform: [{ translateY: slide }] }, style]}>
      {children}
    </Animated.View>
  );
};

const SectionTitle = ({ title, sub, delay = 0 }) => (
  <FadeSlot delay={delay}>
    <View style={st.row}>
      <View style={st.bar} />
      <Text style={st.title}>{title}</Text>
      {sub ? <Text style={st.sub}>{sub}</Text> : null}
    </View>
  </FadeSlot>
);
const st = StyleSheet.create({
  row:   { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14, marginTop: 22 },
  bar:   { width: 3, height: 20, borderRadius: 2, backgroundColor: T.gold },
  title: { fontSize: 18, fontWeight: '800', color: T.text, letterSpacing: -0.3 },
  sub:   { fontSize: 13, color: T.muted, fontWeight: '500' },
});

const ChartCard = ({ children, delay = 0 }) => (
  <FadeSlot delay={delay}>
    <View style={cc.card}>
      <LinearGradient
        colors={[`${T.gold}18`, 'transparent']}
        style={cc.shine}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      />
      {children}
    </View>
  </FadeSlot>
);
const cc = StyleSheet.create({
  card: {
    backgroundColor: T.card,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: T.cardBorder,
    padding: 16,
    overflow: 'hidden',
  },
  shine: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 3,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
  },
});

const HighlightCard = ({ label, value, accent, icon, delay = 0 }) => (
  <FadeSlot delay={delay} style={{ flex: 1 }}>
    <View style={hc.wrap}>
      <View style={[hc.strip, { backgroundColor: accent }]} />
      <Text style={hc.label}>{label}</Text>
      <Text style={hc.icon}>{icon}</Text>
      <Text style={[hc.value, { color: accent }]}>{value}</Text>
    </View>
  </FadeSlot>
);
const hc = StyleSheet.create({
  wrap: {
    backgroundColor: T.inner,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: T.cardBorder,
    padding: 16,
    overflow: 'hidden',
  },
  strip: { position: 'absolute', top: 0, left: 0, right: 0, height: 3 },
  label: { fontSize: 10, color: T.muted, fontWeight: '700', letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 10, marginTop: 4 },
  icon:  { fontSize: 22, marginBottom: 6 },
  value: { fontSize: 18, fontWeight: '900', letterSpacing: -0.3 },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
const AnalyticsScreen = () => {
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const CHART_W = SCREEN_WIDTH - 64;

  const { showToast } = useToast();
  const currentYear  = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [year,         setYear]         = useState(currentYear);
  const [month,        setMonth]        = useState(currentMonth);
  const [monthlyData,  setMonthlyData]  = useState(null);
  const [categoryData, setCategoryData] = useState(null);
  const [yearlyData,   setYearlyData]   = useState(null);
  const [loading,      setLoading]      = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [mRes, cRes, yRes] = await Promise.allSettled([
        expenseService.getMonthlyAnalytics(year),
        expenseService.getCategoryAnalytics(month, year),
        expenseService.getYearlySummary(),
      ]);
      if (mRes.status === 'fulfilled') setMonthlyData(mRes.value);
      if (cRes.status === 'fulfilled') setCategoryData(cRes.value);
      if (yRes.status === 'fulfilled') setYearlyData(yRes.value);
    } catch { /* silent */ }
    setLoading(false);
  }, [year, month]);

  useEffect(() => { loadData(); }, [loadData]);

  const chartData = new Array(12).fill(0);
  if (monthlyData?.analytics) {
    monthlyData.analytics.forEach(item => { chartData[item.month - 1] = item.total; });
  }
  const barData = { labels: MONTHS, datasets: [{ data: chartData }] };

  const pieData = (categoryData?.analytics || []).map(cat => {
    const found = CATEGORIES.find(c => c.name.toLowerCase() === (cat.name || cat._id || '').toLowerCase());
    return {
      name:            found?.name || cat.name || cat._id || 'Other',
      amount:          cat.total || cat.amount || 0,
      color:           found?.color || '#8d9099',
      legendFontColor: T.muted,
      legendFontSize:  11,
    };
  });

  const nonZero   = chartData.filter(v => v > 0);
  const maxVal    = nonZero.length ? Math.max(...chartData) : 0;
  const minVal    = nonZero.length ? Math.min(...nonZero)   : 0;
  const maxMonth  = maxVal ? MONTHS[chartData.indexOf(maxVal)] : '—';
  const minMonth  = minVal ? MONTHS[chartData.indexOf(minVal)] : '—';
  const totalYear = chartData.reduce((s, v) => s + v, 0);
  const avgMonth  = nonZero.length ? totalYear / nonZero.length : 0;

  const exportCSV = async () => {
    try {
      let csv = 'Category,Amount\n';
      (categoryData?.analytics || []).forEach(c => {
        csv += `"${c.category || c.name || c._id}",${(c.total || c.amount || 0).toFixed(2)}\n`;
      });
      if (Platform.OS === 'web') {
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href = url; a.download = `cashtrack_${month}_${year}.csv`; a.click();
        URL.revokeObjectURL(url);
      } else {
        const uri = FileSystem.documentDirectory + `cashtrack_${month}_${year}.csv`;
        await FileSystem.writeAsStringAsync(uri, csv);
        await Sharing.shareAsync(uri);
      }
      showToast('CSV exported! 📊', 'success');
    } catch {
      showToast('CSV export failed', 'error');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <LinearGradient colors={[T.bg, '#0c0e16', '#10121c']} style={StyleSheet.absoluteFill} />
        <ActivityIndicator size="large" color={T.gold} />
        <Text style={styles.loadingText}>Loading analytics…</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <LinearGradient colors={[T.bg, '#0c0e16', '#10121c']} style={StyleSheet.absoluteFill} />

      {/* Orbs */}
      <View style={styles.orb1} pointerEvents="none">
        <LinearGradient colors={['rgba(201,168,76,0.11)', 'transparent']} style={StyleSheet.absoluteFill} borderRadius={180} />
      </View>
      <View style={styles.orb2} pointerEvents="none" />
      <View style={styles.orb3} pointerEvents="none" />

      {/* Grid */}
      <View style={styles.gridLines} pointerEvents="none">
        {[0,1,2,3].map(i => <View key={i} style={[styles.gridLine, { left: (SW / 4) * i }]} />)}
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ── Year selector ── */}
        <FadeSlot delay={0}>
          <View style={styles.yearRow}>
            <Pressable
              style={({ pressed }) => [styles.arrowBtn, { opacity: pressed ? 0.65 : 1 }]}
              onPress={() => setYear(y => y - 1)}
            >
              <Ionicons name="chevron-back" size={18} color={T.gold} />
            </Pressable>
            <View style={styles.yearPill}>
              <LinearGradient colors={[`${T.gold}18`, 'transparent']} style={StyleSheet.absoluteFill} borderRadius={20} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />
              <Text style={styles.yearText}>{year}</Text>
            </View>
            <Pressable
              style={({ pressed }) => [styles.arrowBtn, { opacity: pressed ? 0.65 : 1 }]}
              onPress={() => setYear(y => Math.min(y + 1, currentYear))}
            >
              <Ionicons name="chevron-forward" size={18} color={T.gold} />
            </Pressable>
          </View>
        </FadeSlot>

        {/* ── Month chips ── */}
        <FadeSlot delay={60}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.monthRow}>
            {MONTHS.map((m, idx) => {
              const active = month === idx + 1;
              return (
                <Pressable
                  key={m}
                  onPress={() => setMonth(idx + 1)}
                  style={({ pressed }) => [styles.monthChip, active && styles.monthChipActive, { opacity: pressed ? 0.7 : 1 }]}
                >
                  {active && (
                    <LinearGradient colors={[T.gold2, T.gold]} style={StyleSheet.absoluteFill} borderRadius={16} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />
                  )}
                  <Text style={[styles.monthText, active && styles.monthTextActive]}>{m}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </FadeSlot>

        {/* ── Year summary stats ── */}
        <SectionTitle title="Year Summary" sub={String(year)} delay={100} />
        <View style={styles.statsGrid}>
          <HighlightCard label="Total Spent"  value={formatCurrency(totalYear)} accent={T.gold2}  icon="💸" delay={140} />
          <View style={{ width: 10 }} />
          <HighlightCard label="Monthly Avg"  value={formatCurrency(avgMonth)}  accent={T.blue}   icon="📊" delay={200} />
        </View>
        <View style={[styles.statsGrid, { marginTop: 10 }]}>
          <HighlightCard label="Peak Month"   value={maxMonth}                  accent={T.danger} icon="📈" delay={260} />
          <View style={{ width: 10 }} />
          <HighlightCard label="Lowest Month" value={minMonth}                  accent={T.teal}   icon="📉" delay={320} />
        </View>

        {/* ── Monthly bar chart ── */}
        <SectionTitle title="Monthly Spending" sub={String(year)} delay={380} />
        <ChartCard delay={400}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <BarChart
              data={barData}
              width={Math.max(CHART_W, 640)}
              height={210}
              chartConfig={barConfig}
              style={styles.chart}
              showValuesOnTopOfBars
              fromZero
              withInnerLines={false}
            />
          </ScrollView>
        </ChartCard>

        {/* ── Category pie ── */}
        <SectionTitle title="Category Breakdown" sub={`${MONTHS[month - 1]} ${year}`} delay={460} />
        {pieData.length > 0 ? (
          <ChartCard delay={480}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <PieChart
                data={pieData}
                width={Math.max(SCREEN_WIDTH - 40, 360)}
                height={200}
                chartConfig={pieConfig}
                accessor="amount"
                backgroundColor="transparent"
                paddingLeft="15"
                center={[10, 0]}
                absolute
                style={styles.chart}
              />
            </ScrollView>
            <View style={styles.pieLegend}>
              {pieData.map(d => (
                <View key={d.name} style={styles.legendRow}>
                  <View style={[styles.legendDot, { backgroundColor: d.color }]} />
                  <Text style={styles.legendName}>{d.name}</Text>
                  <Text style={styles.legendVal}>{formatCurrency(d.amount)}</Text>
                </View>
              ))}
            </View>
          </ChartCard>
        ) : (
          <EmptyState emoji="📊" title="No data for this month" subtitle="Add expenses to see the breakdown" />
        )}

        {/* ── Export ── */}
        <SectionTitle title="Export" delay={540} />
        <FadeSlot delay={560}>
          <Pressable
            onPress={exportCSV}
            style={({ pressed }) => [{ opacity: pressed ? 0.84 : 1 }]}
          >
            <LinearGradient
              colors={[T.gold2, T.gold, T.goldDim]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.exportBtn}
            >
              <Ionicons name="download-outline" size={19} color="#0c0e14" />
              <Text style={styles.exportText}>Export CSV</Text>
              <Text style={styles.exportArrow}>→</Text>
            </LinearGradient>
          </Pressable>
        </FadeSlot>

        <View style={{ height: 48 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root:        { flex: 1 },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  loadingText: { fontSize: 13, color: T.muted, fontWeight: '600' },

  orb1: {
    position: 'absolute', top: -80, right: -100,
    width: 340, height: 340, borderRadius: 170,
    borderWidth: 1, borderColor: 'rgba(201,168,76,0.07)', overflow: 'hidden',
  },
  orb2: {
    position: 'absolute', top: 380, left: -90,
    width: 240, height: 240, borderRadius: 120,
    backgroundColor: 'rgba(91,141,238,0.04)',
    borderWidth: 1, borderColor: 'rgba(91,141,238,0.07)',
  },
  orb3: {
    position: 'absolute', bottom: 180, right: -60,
    width: 180, height: 180, borderRadius: 90,
    backgroundColor: 'rgba(78,205,196,0.04)',
    borderWidth: 1, borderColor: 'rgba(78,205,196,0.06)',
  },

  gridLines: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 },
  gridLine:  { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(255,255,255,0.018)' },

  content: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 24 },

  yearRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 4 },
  arrowBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: T.inner, borderWidth: 1.5, borderColor: T.border,
    justifyContent: 'center', alignItems: 'center',
  },
  yearPill: {
    paddingHorizontal: 28, paddingVertical: 10,
    borderRadius: 20, borderWidth: 1.5, borderColor: T.cardBorder, overflow: 'hidden',
  },
  yearText: { fontSize: 22, fontWeight: '900', color: T.gold2, letterSpacing: -0.5 },

  monthRow:        { paddingBottom: 4, paddingTop: 4 },
  monthChip: {
    paddingHorizontal: 14, paddingVertical: 9, borderRadius: 16,
    backgroundColor: T.inner, borderWidth: 1.5, borderColor: T.border,
    marginRight: 8, minHeight: 38, justifyContent: 'center', overflow: 'hidden',
  },
  monthChipActive: { borderColor: T.gold },
  monthText:       { fontSize: 12, color: T.muted, fontWeight: '600' },
  monthTextActive: { color: '#0c0e14', fontWeight: '900' },

  statsGrid: { flexDirection: 'row' },
  chart:     { borderRadius: 12, marginVertical: 4 },

  pieLegend: { marginTop: 14, gap: 8 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  legendDot: { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  legendName:{ flex: 1, fontSize: 12, color: T.muted, fontWeight: '500' },
  legendVal: { fontSize: 12, color: T.text, fontWeight: '700' },

  exportBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, borderRadius: 14, paddingVertical: 17, minHeight: 56,
  },
  exportText:  { color: '#0c0e14', fontSize: 16, fontWeight: '900', letterSpacing: 0.5 },
  exportArrow: { color: '#0c0e14', fontSize: 18, fontWeight: '800' },
});

export default AnalyticsScreen;