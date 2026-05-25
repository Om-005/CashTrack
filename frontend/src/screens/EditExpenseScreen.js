/**
 * CashTrack — EditExpenseScreen
 * Theme-matched to the full CashTrack design system.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';
import { PAYMENT_METHODS } from '../utils/constants';
import { formatDate, formatTime } from '../utils/helpers';
import CategorySelector from '../components/CategorySelector';
import { useExpenses } from '../context/ExpenseContext';
import { useToast } from '../components/Toast';

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
  teal:       '#4ecdc4',
  danger:     '#e05c5c',
};

const { width: SW } = Dimensions.get('window');

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

const SectionTitle = ({ title, accent = T.gold, delay = 0 }) => (
  <FadeSlot delay={delay}>
    <View style={st.row}>
      <View style={[st.bar, { backgroundColor: accent }]} />
      <Text style={st.title}>{title}</Text>
    </View>
  </FadeSlot>
);
const st = StyleSheet.create({
  row:   { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12, marginTop: 22 },
  bar:   { width: 3, height: 18, borderRadius: 2 },
  title: { fontSize: 13, fontWeight: '800', color: T.muted, textTransform: 'uppercase', letterSpacing: 1.4 },
});

const StyledInput = ({ value, onChangeText, placeholder, multiline, keyboardType }) => {
  const [focused, setFocused] = useState(false);
  const border = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(border, { toValue: focused ? 1 : 0, duration: 200, useNativeDriver: false }).start();
  }, [focused]);
  const borderColor = border.interpolate({ inputRange: [0, 1], outputRange: [T.border, T.gold] });
  return (
    <Animated.View style={[inp.wrap, { borderColor }]}>
      <TextInput
        style={[inp.input, multiline && inp.multi]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={T.muted}
        multiline={multiline}
        keyboardType={keyboardType}
        textAlignVertical={multiline ? 'top' : 'center'}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        selectionColor={T.gold}
      />
    </Animated.View>
  );
};
const inp = StyleSheet.create({
  wrap:  { backgroundColor: T.inner, borderWidth: 1.5, borderRadius: 14, overflow: 'hidden' },
  input: { paddingHorizontal: 18, paddingVertical: 15, color: T.text, fontSize: 15, fontWeight: '500' },
  multi: { minHeight: 90 },
});

const DateTimeBtn = ({ icon, iconColor, label, onPress, delay, style }) => (
  <FadeSlot delay={delay} style={style}>
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [dtb.btn, { opacity: pressed ? 0.75 : 1 }]}
    >
      <Ionicons name={icon} size={17} color={iconColor} />
      <Text style={dtb.label} numberOfLines={1}>{label}</Text>
      <Ionicons name="chevron-down" size={13} color={T.muted} />
    </Pressable>
  </FadeSlot>
);
const dtb = StyleSheet.create({
  btn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: T.inner, borderWidth: 1.5, borderColor: T.border,
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 14,
  },
  label: { flex: 1, fontSize: 13, color: T.text, fontWeight: '600' },
});

const EditExpenseScreen = ({ navigation, route }) => {
  const expense = route?.params?.expense;
  const { updateExpense, deleteExpense, loading } = useExpenses();
  const { showToast } = useToast();

  const [amount,         setAmount]         = useState(expense?.amount?.toString() || '');
  const [category,       setCategory]       = useState(expense?.category || '');
  const [description,    setDescription]    = useState(expense?.description || '');
  const [paymentMethod,  setPaymentMethod]  = useState(expense?.paymentMethod || 'Cash');
  const [notes,          setNotes]          = useState(expense?.notes || '');

  const initDate = new Date(expense?.date || expense?.createdAt || new Date());
  const [date,           setDate]           = useState(initDate);
  const [time,           setTime]           = useState(initDate);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const heroFade  = useRef(new Animated.Value(0)).current;
  const heroScale = useRef(new Animated.Value(0.94)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(heroFade,  { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(heroScale, { toValue: 1, friction: 8,   useNativeDriver: true }),
    ]).start();
  }, []);

  const onDateChange = (event, selected) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (event.type === 'set' && selected) { setDate(selected); if (Platform.OS === 'ios') setShowDatePicker(false); }
  };
  const onTimeChange = (event, selected) => {
    if (Platform.OS === 'android') setShowTimePicker(false);
    if (event.type === 'set' && selected) { setTime(selected); if (Platform.OS === 'ios') setShowTimePicker(false); }
  };

  const handleSave = async () => {
    if (!amount || isNaN(amount) || Number(amount) <= 0) { Alert.alert('Invalid Amount', 'Please enter a valid amount.'); return; }
    if (!category) { Alert.alert('Select Category', 'Please select a category.'); return; }
    try {
      const finalDate = new Date(date);
      finalDate.setHours(time.getHours(), time.getMinutes(), 0, 0);
      await updateExpense(expense._id || expense.id, {
        amount: parseFloat(amount), category,
        description: description.trim() || category,
        date: finalDate.toISOString(), time: formatTime(time), paymentMethod, notes: notes.trim(),
      });
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast('Expense updated! ✅', 'success');
      navigation.goBack();
    } catch { showToast('Failed to update expense', 'error'); }
  };

  const handleDelete = () => {
    const confirm = async () => {
      try {
        await deleteExpense(expense._id || expense.id);
        showToast('Expense deleted', 'success');
        navigation.goBack();
      } catch { showToast('Failed to delete', 'error'); }
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
      <LinearGradient colors={[T.bg, '#0c0e16', '#10121c']} style={StyleSheet.absoluteFill} />
      <View style={styles.orb1} pointerEvents="none">
        <LinearGradient colors={['rgba(201,168,76,0.11)', 'transparent']} style={StyleSheet.absoluteFill} borderRadius={180} />
      </View>
      <View style={styles.orb2} pointerEvents="none" />
      <View style={styles.gridLines} pointerEvents="none">
        {[0,1,2,3].map(i => <View key={i} style={[styles.gridLine, { left: (SW / 4) * i }]} />)}
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        {/* ── Amount hero card ── */}
        <Animated.View style={{ opacity: heroFade, transform: [{ scale: heroScale }] }}>
          <View style={styles.amountCard}>
            <LinearGradient colors={[`${T.gold}28`, 'transparent']} style={styles.amountShine} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />
            <LinearGradient colors={['rgba(201,168,76,0.06)', 'transparent']} style={styles.amountGlow} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} />
            <Text style={styles.amountEyebrow}>EDITING EXPENSE</Text>
            <View style={styles.amountRow}>
              <Text style={styles.currencySymbol}>₹</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0.00"
                placeholderTextColor="rgba(201,168,76,0.18)"
                keyboardType="decimal-pad"
                value={amount}
                onChangeText={setAmount}
                selectionColor={T.gold}
              />
            </View>
            {amount ? (
              <View style={styles.amountPill}>
                <Text style={styles.amountPillText}>
                  ₹{parseFloat(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </Text>
              </View>
            ) : null}
          </View>
        </Animated.View>

        <SectionTitle title="Category"        accent={T.purple} delay={80}  />
        <FadeSlot delay={100}><CategorySelector selected={category} onSelect={setCategory} /></FadeSlot>

        <SectionTitle title="Description"     accent={T.teal}   delay={160} />
        <FadeSlot delay={180}><StyledInput value={description} onChangeText={setDescription} placeholder="Expense description" /></FadeSlot>

        <SectionTitle title="Date & Time"     accent={T.gold}   delay={240} />
        <View style={styles.dateTimeRow}>
          {Platform.OS === 'web' ? (
            <>
              <FadeSlot delay={260} style={{ flex: 1 }}>
                {React.createElement('input', {
                  type: 'date', value: date.toISOString().split('T')[0],
                  onChange: e => e.target.value && setDate(new Date(e.target.value)),
                  style: { flex: 1, padding: '14px', borderRadius: '14px', border: `1.5px solid ${T.border}`, backgroundColor: T.inner, color: T.text, colorScheme: 'dark', fontFamily: 'inherit', fontSize: '14px' },
                })}
              </FadeSlot>
              <FadeSlot delay={280} style={{ flex: 1 }}>
                {React.createElement('input', {
                  type: 'time', value: time.toTimeString().split(' ')[0].substring(0, 5),
                  onChange: e => { if (e.target.value) { const [h,m] = e.target.value.split(':'); const n = new Date(time); n.setHours(h,m,0,0); setTime(n); } },
                  style: { flex: 1, padding: '14px', borderRadius: '14px', border: `1.5px solid ${T.border}`, backgroundColor: T.inner, color: T.text, colorScheme: 'dark', fontFamily: 'inherit', fontSize: '14px' },
                })}
              </FadeSlot>
            </>
          ) : (
            <>
              <DateTimeBtn icon="calendar-outline" iconColor={T.gold}  label={formatDate(date)} onPress={() => setShowDatePicker(true)} delay={260} style={{ flex: 1 }} />
              <DateTimeBtn icon="time-outline"     iconColor={T.teal}  label={formatTime(time)} onPress={() => setShowTimePicker(true)} delay={300} style={{ flex: 1 }} />
            </>
          )}
        </View>
        {showDatePicker && <DateTimePicker value={date} mode="date" display={Platform.OS === 'ios' ? 'spinner' : 'default'} onChange={onDateChange} themeVariant="dark" />}
        {showTimePicker && <DateTimePicker value={time} mode="time" display={Platform.OS === 'ios' ? 'spinner' : 'default'} onChange={onTimeChange} themeVariant="dark" />}

        <SectionTitle title="Payment Method"  accent={T.amber}  delay={340} />
        <FadeSlot delay={360}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 4 }}>
            {PAYMENT_METHODS.map((method, i) => {
              const active = paymentMethod === method;
              return (
                <Pressable
                  key={method}
                  onPress={() => setPaymentMethod(method)}
                  style={({ pressed }) => [styles.payChip, active && styles.payChipActive, { opacity: pressed ? 0.75 : 1, marginLeft: i === 0 ? 0 : 8 }]}
                >
                  {active && <LinearGradient colors={[T.gold2, T.gold]} style={StyleSheet.absoluteFill} borderRadius={20} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />}
                  <Text style={[styles.payChipText, active && styles.payChipTextActive]}>{method}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </FadeSlot>

        <SectionTitle title="Notes (optional)" accent={T.muted}  delay={420} />
        <FadeSlot delay={440}><StyledInput value={notes} onChangeText={setNotes} placeholder="Any additional notes…" multiline /></FadeSlot>

        {/* ── Update CTA ── */}
        <FadeSlot delay={500}>
          <Pressable onPress={handleSave} disabled={loading} style={({ pressed }) => [styles.saveBtnWrap, { opacity: pressed ? 0.86 : 1 }]}>
            <LinearGradient colors={[T.gold2, T.gold, T.goldDim]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.saveBtn, loading && { opacity: 0.55 }]}>
              {loading ? (
                <ActivityIndicator color="#0c0e14" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={20} color="#0c0e14" />
                  <Text style={styles.saveBtnText}>Update Expense</Text>
                  <Text style={styles.saveBtnArrow}>→</Text>
                </>
              )}
            </LinearGradient>
          </Pressable>
        </FadeSlot>

        {/* ── Delete button ── */}
        <FadeSlot delay={540}>
          <Pressable onPress={handleDelete} disabled={loading} style={({ pressed }) => [styles.deleteBtn, { opacity: pressed ? 0.75 : 1 }]}>
            <Ionicons name="trash-outline" size={18} color={T.danger} />
            <Text style={styles.deleteBtnText}>Delete Expense</Text>
          </Pressable>
        </FadeSlot>

        <View style={{ height: 48 }} />
      </ScrollView>
    </View>
  );
};

const purple = '#9b6dff';
const amber  = '#f5a623';

const styles = StyleSheet.create({
  root: { flex: 1 },
  orb1: { position: 'absolute', top: -80, right: -100, width: 320, height: 320, borderRadius: 160, borderWidth: 1, borderColor: 'rgba(201,168,76,0.07)', overflow: 'hidden' },
  orb2: { position: 'absolute', bottom: 180, left: -80, width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(91,141,238,0.04)', borderWidth: 1, borderColor: 'rgba(91,141,238,0.07)' },
  gridLines: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 },
  gridLine:  { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(255,255,255,0.018)' },
  content: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 24 },

  amountCard: { backgroundColor: T.card, borderRadius: 24, borderWidth: 1, borderColor: T.cardBorder, paddingVertical: 36, paddingHorizontal: 28, alignItems: 'center', overflow: 'hidden', marginBottom: 4, ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.35, shadowRadius: 20 }, android: { elevation: 8 } }) },
  amountShine: { position: 'absolute', top: 0, left: 0, right: 0, height: 3, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  amountGlow:  { position: 'absolute', top: 0, left: 0, right: 0, height: '55%' },
  amountEyebrow: { fontSize: 10, fontWeight: '800', color: T.muted, letterSpacing: 2.5, textTransform: 'uppercase', marginBottom: 18 },
  amountRow:   { flexDirection: 'row', alignItems: 'center', gap: 4 },
  currencySymbol: { fontSize: 36, fontWeight: '300', color: T.gold, marginBottom: 4 },
  amountInput: { fontSize: 52, fontWeight: '900', color: T.gold2, minWidth: 140, textAlign: 'center', letterSpacing: -2 },
  amountPill:  { marginTop: 16, backgroundColor: `${T.gold}14`, borderWidth: 1, borderColor: `${T.gold}30`, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6 },
  amountPillText: { fontSize: 12, fontWeight: '700', color: T.gold, letterSpacing: 0.5 },

  dateTimeRow: { flexDirection: 'row', gap: 10 },

  payChip: { paddingHorizontal: 18, paddingVertical: 12, borderRadius: 20, backgroundColor: T.inner, borderWidth: 1.5, borderColor: T.border, minHeight: 44, justifyContent: 'center', overflow: 'hidden' },
  payChipActive: { borderColor: T.gold },
  payChipText:       { fontSize: 13, color: T.muted, fontWeight: '600' },
  payChipTextActive: { color: '#0c0e14', fontWeight: '900' },

  saveBtnWrap: { marginTop: 32 },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, paddingVertical: 17, minHeight: 56 },
  saveBtnText:  { color: '#0c0e14', fontSize: 16, fontWeight: '900', letterSpacing: 0.5 },
  saveBtnArrow: { color: '#0c0e14', fontSize: 18, fontWeight: '800' },

  deleteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 14, paddingVertical: 17, borderRadius: 14, borderWidth: 1.5, borderColor: `${T.danger}40`, backgroundColor: `${T.danger}0a`, minHeight: 56 },
  deleteBtnText: { fontSize: 15, fontWeight: '700', color: T.danger },
});

export default EditExpenseScreen;