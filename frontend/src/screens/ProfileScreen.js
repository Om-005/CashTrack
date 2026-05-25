/**
 * CashTrack — ProfileScreen
 * Theme-matched to the full CashTrack design system.
 */

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Platform,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useAuth } from '../context/AuthContext';
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
  blue:       '#5b8dee',
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

const MenuItem = ({ icon, iconBg, iconColor, label, onPress, delay = 0 }) => (
  <FadeSlot delay={delay}>
    <Pressable onPress={onPress} style={({ pressed }) => [mi.wrap, { opacity: pressed ? 0.75 : 1 }]}>
      <View style={[mi.iconWrap, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={19} color={iconColor} />
      </View>
      <Text style={mi.label}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color={T.muted} />
    </Pressable>
  </FadeSlot>
);
const mi = StyleSheet.create({
  wrap:    { flexDirection: 'row', alignItems: 'center', backgroundColor: T.card, borderWidth: 1, borderColor: T.cardBorder, borderRadius: 16, padding: 16, marginBottom: 10 },
  iconWrap:{ width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  label:   { flex: 1, fontSize: 15, color: T.text, fontWeight: '600' },
});

const ProfileScreen = () => {
  const { user, logout }   = useAuth();
  const { expenses }       = useExpenses();
  const { showToast }      = useToast();
  const [aboutVisible, setAboutVisible] = React.useState(false);

  const initials = (user?.name || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const totalSpent = (expenses || []).reduce((s, e) => s + (e.amount || 0), 0);

  // Avatar entrance
  const avatarScale = useRef(new Animated.Value(0.7)).current;
  const avatarFade  = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(avatarFade,  { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(avatarScale, { toValue: 1, friction: 7,   useNativeDriver: true }),
    ]).start();
  }, []);

  const handleExport = async () => {
    try {
      let csv = 'Date,Category,Description,Amount,Payment Method,Notes\n';
      (expenses || []).forEach(e => {
        csv += `"${e.date || e.createdAt}","${e.category}","${e.description}",${e.amount},"${e.paymentMethod || ''}","${e.notes || ''}"\n`;
      });
      if (Platform.OS === 'web') {
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a'); a.href = url; a.download = 'cashtrack_all_data.csv'; a.click();
        URL.revokeObjectURL(url);
      } else {
        const uri = FileSystem.documentDirectory + 'cashtrack_all_data.csv';
        await FileSystem.writeAsStringAsync(uri, csv);
        await Sharing.shareAsync(uri);
      }
      showToast('Data exported! 📁', 'success');
    } catch { showToast('Export failed', 'error'); }
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to logout?')) logout();
    } else {
      Alert.alert('Logout', 'Are you sure you want to logout?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
      ]);
    }
  };

  return (
    <View style={styles.root}>
      <LinearGradient colors={[T.bg, '#0c0e16', '#10121c']} style={StyleSheet.absoluteFill} />

      {/* Orbs */}
      <View style={styles.orb1} pointerEvents="none">
        <LinearGradient colors={['rgba(201,168,76,0.12)', 'transparent']} style={StyleSheet.absoluteFill} borderRadius={180} />
      </View>
      <View style={styles.orb2} pointerEvents="none" />

      {/* Grid */}
      <View style={styles.gridLines} pointerEvents="none">
        {[0,1,2,3].map(i => <View key={i} style={[styles.gridLine, { left: (SW / 4) * i }]} />)}
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ── Avatar section ── */}
        <Animated.View style={[styles.avatarSection, { opacity: avatarFade, transform: [{ scale: avatarScale }] }]}>
          {/* Outer glow ring */}
          <View style={styles.avatarGlowRing} />
          {/* Gold gradient ring */}
          <LinearGradient colors={[T.gold2, T.gold, T.goldDim]} style={styles.avatarRing} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <View style={styles.avatarInner}>
              <Text style={styles.avatarInitials}>{initials}</Text>
            </View>
          </LinearGradient>
          <Text style={styles.name}>{user?.name || 'User'}</Text>
          <Text style={styles.email}>{user?.email || ''}</Text>

          {/* Member badge */}
          <View style={styles.memberBadge}>
            <LinearGradient colors={[`${T.gold}20`, 'transparent']} style={StyleSheet.absoluteFill} borderRadius={20} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />
            <Text style={styles.memberText}>⭐  Premium Member</Text>
          </View>
        </Animated.View>

        {/* ── Stats card ── */}
        <FadeSlot delay={120}>
          <View style={styles.statsCard}>
            <LinearGradient colors={[`${T.gold}14`, 'transparent']} style={styles.statsShine} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />

            <View style={styles.statCell}>
              <View style={[styles.statAccent, { backgroundColor: T.blue }]} />
              <Text style={styles.statLabel}>TOTAL EXPENSES</Text>
              <Text style={styles.statValue}>{expenses?.length || 0}</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statCell}>
              <View style={[styles.statAccent, { backgroundColor: T.gold }]} />
              <Text style={styles.statLabel}>TOTAL SPENT</Text>
              <Text style={[styles.statValue, { color: T.gold2 }]}>
                ₹{totalSpent.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </Text>
            </View>
          </View>
        </FadeSlot>

        {/* ── Menu items ── */}
        <FadeSlot delay={200}>
          <View style={styles.sectionRow}>
            <View style={styles.sectionBar} />
            <Text style={styles.sectionTitle}>Account</Text>
          </View>
        </FadeSlot>

        <MenuItem
          icon="download-outline"
          iconBg={`${T.teal}18`}
          iconColor={T.teal}
          label="Export All Data"
          onPress={handleExport}
          delay={240}
        />
        <MenuItem
          icon="information-circle-outline"
          iconBg={`${T.gold}18`}
          iconColor={T.gold}
          label="About CashTrack"
          onPress={() => setAboutVisible(true)}
          delay={300}
        />

        {/* ── Logout ── */}
        <FadeSlot delay={420}>
          <Pressable
            onPress={handleLogout}
            style={({ pressed }) => [styles.logoutBtn, { opacity: pressed ? 0.75 : 1 }]}
          >
            <View style={[styles.logoutIconWrap]}>
              <Ionicons name="log-out-outline" size={19} color={T.danger} />
            </View>
            <Text style={styles.logoutText}>Logout</Text>
          </Pressable>
        </FadeSlot>

        <FadeSlot delay={480}>
          <Text style={styles.version}>CashTrack v1.0.0</Text>
        </FadeSlot>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ── About Modal ── */}
      <Modal visible={aboutVisible} transparent animationType="fade" onRequestClose={() => setAboutVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setAboutVisible(false)}>
          <Pressable style={styles.modalCard} onPress={e => e.stopPropagation()}>
            {/* Gold shine strip */}
            <LinearGradient colors={[`${T.gold}28`, 'transparent']} style={styles.modalShine} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />

            <View style={styles.modalLogoRing}>
              <LinearGradient colors={['rgba(201,168,76,0.18)', 'rgba(201,168,76,0.04)']} style={StyleSheet.absoluteFill} borderRadius={36} />
              <Text style={{ fontSize: 32 }}>💰</Text>
            </View>

            <Text style={styles.modalTitle}>CashTrack</Text>
            <Text style={styles.modalVersion}>Version 1.0.0</Text>

            <Text style={styles.modalDesc}>
              A premium, beautifully designed spending tracker built to help you master your finances with clarity and elegance.
            </Text>

            <View style={styles.modalFeatures}>
              <LinearGradient colors={[`${T.gold}10`, 'transparent']} style={StyleSheet.absoluteFill} borderRadius={14} />
              {['✨  Beautiful dark-luxury UI', '📊  Deep spending analytics', '📱  Cross-platform sync'].map(f => (
                <Text key={f} style={styles.featureText}>{f}</Text>
              ))}
            </View>

            <Pressable
              onPress={() => setAboutVisible(false)}
              style={({ pressed }) => [{ opacity: pressed ? 0.84 : 1 }]}
            >
              <LinearGradient colors={[T.gold2, T.gold, T.goldDim]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.modalBtn}>
                <Text style={styles.modalBtnText}>Close</Text>
              </LinearGradient>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  orb1: { position: 'absolute', top: -60, right: -100, width: 300, height: 300, borderRadius: 150, borderWidth: 1, borderColor: 'rgba(201,168,76,0.07)', overflow: 'hidden' },
  orb2: { position: 'absolute', bottom: 200, left: -80, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(91,141,238,0.04)', borderWidth: 1, borderColor: 'rgba(91,141,238,0.07)' },
  gridLines: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 },
  gridLine:  { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(255,255,255,0.018)' },
  content:   { paddingHorizontal: 24, paddingTop: 40, paddingBottom: 24 },

  // Avatar
  avatarSection: { alignItems: 'center', marginBottom: 32 },
  avatarGlowRing: { position: 'absolute', top: -8, width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(201,168,76,0.07)' },
  avatarRing:   { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  avatarInner:  { width: 92,  height: 92,  borderRadius: 46, backgroundColor: T.bg, justifyContent: 'center', alignItems: 'center' },
  avatarInitials: { fontSize: 32, fontWeight: '900', color: T.gold2 },
  name:  { fontSize: 24, fontWeight: '900', color: T.text, letterSpacing: -0.4, marginBottom: 4 },
  email: { fontSize: 13, color: T.muted, marginBottom: 16 },
  memberBadge: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: `${T.gold}28`, overflow: 'hidden' },
  memberText:  { fontSize: 12, color: T.gold, fontWeight: '700', letterSpacing: 0.3 },

  // Stats card
  statsCard: {
    flexDirection: 'row',
    backgroundColor: T.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: T.cardBorder,
    marginBottom: 28,
    overflow: 'hidden',
    ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 14 }, android: { elevation: 6 } }),
  },
  statsShine:  { position: 'absolute', top: 0, left: 0, right: 0, height: 3 },
  statCell:    { flex: 1, alignItems: 'center', paddingVertical: 20, paddingTop: 22, position: 'relative' },
  statAccent:  { position: 'absolute', top: 0, left: '25%', right: '25%', height: 2, borderBottomLeftRadius: 2, borderBottomRightRadius: 2 },
  statLabel:   { fontSize: 9, color: T.muted, letterSpacing: 2, fontWeight: '800', textTransform: 'uppercase', marginBottom: 8 },
  statValue:   { fontSize: 20, fontWeight: '900', color: T.text, letterSpacing: -0.4 },
  statDivider: { width: 1, backgroundColor: T.cardBorder, marginVertical: 16 },

  // Section
  sectionRow:  { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  sectionBar:  { width: 3, height: 18, borderRadius: 2, backgroundColor: T.gold },
  sectionTitle:{ fontSize: 13, fontWeight: '800', color: T.muted, textTransform: 'uppercase', letterSpacing: 1.4 },

  // Logout
  logoutBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: `${T.danger}0a`, borderWidth: 1.5, borderColor: `${T.danger}35`, borderRadius: 16, padding: 16, marginTop: 8, marginBottom: 28 },
  logoutIconWrap: { width: 40, height: 40, borderRadius: 12, backgroundColor: `${T.danger}15`, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  logoutText: { flex: 1, fontSize: 15, color: T.danger, fontWeight: '800' },

  version: { textAlign: 'center', color: T.border, fontSize: 11, fontWeight: '600', letterSpacing: 0.5 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(6,8,12,0.88)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalCard: {
    width: '100%', maxWidth: 380,
    backgroundColor: T.card,
    borderRadius: 28, borderWidth: 1, borderColor: T.cardBorder,
    padding: 28, overflow: 'hidden',
    ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.45, shadowRadius: 28 }, android: { elevation: 14 } }),
  },
  modalShine: { position: 'absolute', top: 0, left: 0, right: 0, height: 3, borderTopLeftRadius: 28, borderTopRightRadius: 28 },
  modalLogoRing: { width: 72, height: 72, borderRadius: 36, borderWidth: 1, borderColor: `${T.gold}25`, justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginBottom: 16, overflow: 'hidden' },
  modalTitle:   { fontSize: 26, fontWeight: '900', color: T.text, textAlign: 'center', letterSpacing: -0.5 },
  modalVersion: { fontSize: 12, color: T.gold, fontWeight: '800', textAlign: 'center', marginTop: 4, marginBottom: 18, letterSpacing: 0.5 },
  modalDesc:    { fontSize: 14, color: T.muted, lineHeight: 22, textAlign: 'center', marginBottom: 20 },
  modalFeatures:{ borderRadius: 14, borderWidth: 1, borderColor: T.cardBorder, padding: 16, marginBottom: 24, gap: 10, overflow: 'hidden' },
  featureText:  { fontSize: 13, color: T.text, fontWeight: '600' },
  modalBtn:     { borderRadius: 14, paddingVertical: 16, alignItems: 'center', minHeight: 54 },
  modalBtnText: { color: '#0c0e14', fontSize: 16, fontWeight: '900', letterSpacing: 0.5 },
});

export default ProfileScreen;