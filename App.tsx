import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { useColorScheme } from 'react-native';
import { lightTheme, darkTheme } from './src/theme';
import { useAuthStore, useSettingsStore } from './src/store';

// Auth Screens
import LoginScreen from './src/screens/auth/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';

// Main Screens
import HomeScreen from './src/screens/HomeScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import HistoryListScreen from './src/screens/HistoryListScreen';
import HistoryDetailScreen from './src/screens/HistoryDetailScreen';

// Calculator Screens
import ChitFundScreen from './src/screens/calculators/ChitFundScreen';
import DailyDepositScreen from './src/screens/calculators/DailyDepositScreen';
import RDCalculatorScreen from './src/screens/calculators/RDCalculatorScreen';
import FDCalculatorScreen from './src/screens/calculators/FDCalculatorScreen';
import LoanEmiScreen from './src/screens/calculators/LoanEmiScreen';
import InterestScreen from './src/screens/calculators/InterestScreen';
import GoalPlannerScreen from './src/screens/calculators/GoalPlannerScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const scheme = useColorScheme();
  const { session, initialize } = useAuthStore();
  const { darkModeOverride, load } = useSettingsStore();
  
  useEffect(() => { 
    initialize(); 
    load(); 
  }, [initialize, load]);
  
  const isDark = darkModeOverride === 'dark' || (darkModeOverride === 'system' && scheme === 'dark');
  const navTheme = isDark ? DarkTheme : DefaultTheme;
  const paperTheme = isDark ? darkTheme : lightTheme;

  return (
    <PaperProvider theme={paperTheme}>
      <NavigationContainer theme={navTheme}>
        <Stack.Navigator 
          screenOptions={{ 
            headerShown: false,
            animation: 'slide_from_right'
          }}
        >
          {!session ? (
            <>
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Signup" component={SignupScreen} />
              <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            </>
          ) : (
            <>
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen name="Profile" component={ProfileScreen} />
              <Stack.Screen name="History" component={HistoryListScreen} />
              <Stack.Screen name="HistoryDetail" component={HistoryDetailScreen} />
              <Stack.Screen name="ChitFund" component={ChitFundScreen} />
              <Stack.Screen name="DailyDeposit" component={DailyDepositScreen} />
              <Stack.Screen name="RD" component={RDCalculatorScreen} />
              <Stack.Screen name="FD" component={FDCalculatorScreen} />
              <Stack.Screen name="LoanEmi" component={LoanEmiScreen} />
              <Stack.Screen name="Interest" component={InterestScreen} />
              <Stack.Screen name="GoalPlanner" component={GoalPlannerScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}