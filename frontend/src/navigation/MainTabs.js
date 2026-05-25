/**
 * CashTrack — MainTabs Navigator
 * Bottom tab bar with Dashboard, Add Expense, All Expenses.
 * Profile has been moved to the top header.
 */

import React from 'react';
import { View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/constants';

import DashboardScreen from '../screens/DashboardScreen';
import AddExpenseScreen from '../screens/AddExpenseScreen';
import AllExpensesScreen from '../screens/AllExpensesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import EditExpenseScreen from '../screens/EditExpenseScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const stackScreenOptions = {
  headerStyle: { backgroundColor: COLORS.background },
  headerTintColor: COLORS.text,
  headerTitleStyle: { fontWeight: '800', fontSize: 18, letterSpacing: -0.3 },
  headerShadowVisible: false,
  contentStyle: { backgroundColor: COLORS.background },
};

// ── Dashboard Stack ─────────────────────────────────────────────────────────
const DashboardStack = () => (
  <Stack.Navigator screenOptions={stackScreenOptions}>
    <Stack.Screen
      name="DashboardHome"
      component={DashboardScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="Profile"
      component={ProfileScreen}
      options={{ title: 'Profile' }}
    />
    <Stack.Screen
      name="EditExpense"
      component={EditExpenseScreen}
      options={{ title: 'Edit Expense' }}
    />
    <Stack.Screen
      name="Analytics"
      component={AnalyticsScreen}
      options={{ title: 'Analytics' }}
    />
  </Stack.Navigator>
);

// ── All Expenses Stack ──────────────────────────────────────────────────────
const ExpensesStack = () => (
  <Stack.Navigator screenOptions={stackScreenOptions}>
    <Stack.Screen
      name="AllExpensesHome"
      component={AllExpensesScreen}
      options={{ title: 'All Expenses' }}
    />
    <Stack.Screen
      name="EditExpense"
      component={EditExpenseScreen}
      options={{ title: 'Edit Expense' }}
    />
    <Stack.Screen
      name="AddExpense"
      component={AddExpenseScreen}
      options={{ title: 'Add Expense' }}
    />
  </Stack.Navigator>
);

// ── Tab Navigator ───────────────────────────────────────────────────────────
const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarStyle: {
        backgroundColor: '#11131A',
        borderTopColor: '#1A1D27',
        borderTopWidth: 1,
        height: 80,
        paddingBottom: 20,
        paddingTop: 10,
        elevation: 0,
      },
      tabBarActiveTintColor: '#E8C96A',
      tabBarInactiveTintColor: '#545766',
      tabBarLabelStyle: { fontSize: 11, fontWeight: '600', letterSpacing: 0.2 },
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;
        if (route.name === 'Dashboard') {
          return <Ionicons name="stats-chart" size={24} color={color} />;
        } else if (route.name === 'Add') {
          return (
            <View style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: '#E8C96A',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 20,
              shadowColor: '#E8C96A',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 5,
            }}>
              <Ionicons name="add" size={32} color="#000" />
            </View>
          );
        } else if (route.name === 'All') {
          return <Ionicons name="receipt-outline" size={24} color={color} />;
        }
      },
    })}
  >
    <Tab.Screen name="Dashboard" component={DashboardStack} />
    <Tab.Screen
      name="Add"
      component={AddExpenseScreen}
      options={{
        title: '',
        headerShown: true,
        headerTitle: 'Add Expense',
        headerStyle: { backgroundColor: COLORS.background },
        headerTintColor: COLORS.text,
        headerShadowVisible: false,
      }}
    />
    <Tab.Screen name="All" component={ExpensesStack} />
  </Tab.Navigator>
);

export default MainTabs;
