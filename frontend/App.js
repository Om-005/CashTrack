/**
 * CashTrack — App Entry Point
 * Wraps the entire app with providers: Auth, Expense, Toast, SafeArea.
 */

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from './src/context/AuthContext';
import { ExpenseProvider } from './src/context/ExpenseContext';
import { ToastProvider } from './src/components/Toast';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <ExpenseProvider>
            <ToastProvider>
              <StatusBar style="light" />
              <AppNavigator />
            </ToastProvider>
          </ExpenseProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
