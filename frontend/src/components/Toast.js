/**
 * CashTrack — Toast Component & Provider
 * Slide-in notification system with auto-dismiss.
 *
 * Usage:
 *   Wrap your app with <ToastProvider>, then call
 *   const { showToast } = useToast();
 *   showToast('Saved!', 'success');
 */

import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { COLORS } from '../utils/constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ToastContext = createContext(undefined);

const ICON_MAP = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️',
};

const COLOR_MAP = {
  success: COLORS.success,
  error: COLORS.danger,
  warning: COLORS.warning,
  info: COLORS.secondary,
};

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null);
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const timerRef = useRef(null);

  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    if (timerRef.current) clearTimeout(timerRef.current);

    setToast({ message, type });
    slideAnim.setValue(-100);

    Animated.spring(slideAnim, {
      toValue: 50,
      friction: 8,
      useNativeDriver: true,
    }).start();

    timerRef.current = setTimeout(() => {
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setToast(null));
    }, duration);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <Animated.View
          style={[
            styles.container,
            { transform: [{ translateY: slideAnim }], borderLeftColor: COLOR_MAP[toast.type] },
          ]}
        >
          <Text style={styles.icon}>{ICON_MAP[toast.type]}</Text>
          <Text style={styles.message}>{toast.message}</Text>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderLeftWidth: 4,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    zIndex: 9999,
  },
  icon: {
    fontSize: 18,
    marginRight: 10,
  },
  message: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
});
