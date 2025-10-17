import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import AppHeader from '../components/AppHeader';
import CenteredContainer from '../components/CenteredContainer';
import { LayoutConfig } from '../config/layout';

interface HomeScreenProps {
  navigation: any;
}

const calculatorOptions = [
  { id: 'chit_fund', title: 'Chit Fund', subtitle: 'Calculate chit fund returns', icon: 'groups', route: 'ChitFund', color: LayoutConfig.colors.success },
  { id: 'daily_deposit', title: 'Daily Deposit', subtitle: 'Daily savings calculator', icon: 'today', route: 'DailyDeposit', color: LayoutConfig.colors.info },
  { id: 'rd', title: 'Recurring Deposit (RD)', subtitle: 'Monthly recurring deposits', icon: 'repeat', route: 'RD', color: LayoutConfig.colors.warning },
  { id: 'fd', title: 'Fixed Deposit (FD)', subtitle: 'Fixed deposit calculator', icon: 'lock', route: 'FD', color: LayoutConfig.colors.purple },
  { id: 'loan_emi', title: 'Loan / EMI', subtitle: 'Calculate EMI and loan details', icon: 'account-balance', route: 'LoanEmi', color: LayoutConfig.colors.error },
  { id: 'interest', title: 'Interest Calculator', subtitle: 'Simple & Compound Interest', icon: 'calculate', route: 'Interest', color: LayoutConfig.colors.muted },
  { id: 'goal_planner', title: 'Goal Planner', subtitle: 'Plan your financial goals', icon: 'flag', route: 'GoalPlanner', color: LayoutConfig.colors.brown },
];

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const handleNavigate = (route: string) => navigation.navigate(route);

  return (
    <CenteredContainer>
      <AppHeader title="FinX - Finance Calculator" showBack={false} />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text variant="headlineMedium" style={styles.welcomeText}>Welcome to FinX</Text>
        <Text variant="bodyLarge" style={styles.subtitle}>Simplify Every Rupee</Text>

        <View style={styles.grid}>
          {calculatorOptions.map((option) => (
            <Card key={option.id} style={[styles.card, { borderLeftColor: option.color }]}>
              <Card.Content style={styles.cardContent}>
                <MaterialIcons name={option.icon as any} size={32} color={option.color} style={styles.icon} />
                <Text variant="titleMedium" style={styles.cardTitle}>{option.title}</Text>
                <Text variant="bodySmall" style={styles.cardSubtitle}>{option.subtitle}</Text>
                <Button mode="contained" onPress={() => handleNavigate(option.route)} style={styles.button} labelStyle={styles.buttonLabel}>
                  Calculate
                </Button>
              </Card.Content>
            </Card>
          ))}
        </View>
      </ScrollView>
    </CenteredContainer>
  );
}

const styles = StyleSheet.create({
  scrollView: { flex: 1, width: '100%' },
  content: { padding: LayoutConfig.spacing.md, alignItems: 'center' },
  welcomeText: { fontWeight: 'bold', marginBottom: LayoutConfig.spacing.sm, textAlign: 'center', color: LayoutConfig.colors.primary },
  subtitle: { marginBottom: LayoutConfig.spacing.xl, textAlign: 'center', color: LayoutConfig.colors.textSecondary },
  grid: { width: '100%', gap: LayoutConfig.spacing.md },
  card: { marginBottom: LayoutConfig.spacing.md, borderLeftWidth: 4, ...LayoutConfig.card },
  cardContent: { alignItems: 'center', padding: LayoutConfig.spacing.lg },
  icon: { marginBottom: LayoutConfig.spacing.md },
  cardTitle: { fontWeight: 'bold', marginBottom: LayoutConfig.spacing.sm, textAlign: 'center' },
  cardSubtitle: { textAlign: 'center', marginBottom: LayoutConfig.spacing.md, color: LayoutConfig.colors.textSecondary },
  button: { ...LayoutConfig.button.primary },
  buttonLabel: { fontWeight: 'bold' },
});