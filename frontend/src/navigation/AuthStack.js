/**
 * CashTrack — AuthStack Navigator
 * Login and Register screens for unauthenticated users.
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import { COLORS } from '../utils/constants';

const Stack = createNativeStackNavigator();

const AuthStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: COLORS.background },
      headerTintColor: COLORS.text,
      headerTitleStyle: { fontWeight: '700' },
      headerShadowVisible: false,
      contentStyle: { backgroundColor: COLORS.background },
    }}
  >
    <Stack.Screen
      name="Login"
      component={LoginScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="Register"
      component={RegisterScreen}
      options={{ title: 'Create Account' }}
    />
  </Stack.Navigator>
);

export default AuthStack;
