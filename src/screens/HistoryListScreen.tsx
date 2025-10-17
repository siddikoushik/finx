import React, { useEffect, useState, useCallback } from 'react';
import { RefreshControl, ScrollView, View, StyleSheet } from 'react-native';
import { Button, Text, TextInput, SegmentedButtons, Card } from 'react-native-paper';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store';
import { CalculationRecord, CalculatorType } from '../utils';
import AppHeader from '../components/AppHeader';
import CenteredContainer from '../components/CenteredContainer';
import { LayoutConfig } from '../config/layout';

interface HistoryListScreenProps {
  navigation: any;
}

export default function HistoryListScreen({ navigation }: HistoryListScreenProps) {
  const { session } = useAuthStore();
  const [rows, setRows] = useState<CalculationRecord[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [type, setType] = useState<CalculatorType | 'all'>('all');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  
  const fetchRows = useCallback(async () => {
    if (!session?.user?.id) return;
    try {
      let q: any = supabase
        .from('calculations')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });
      
      if (type !== 'all') q = q.eq('calculator_type', type);
      if (from) q = q.gte('created_at', from);
      if (to) q = q.lte('created_at', to);
      
      const { data, error } = await q;
      if (error) throw error;
      setRows(data || []);
    } catch (error) {
      console.error('Error fetching history:', error);
      alert('Failed to load history');
    }
  }, [session?.user?.id, type, from, to]);
  
  useEffect(() => { fetchRows(); }, [fetchRows]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchRows();
    setRefreshing(false);
  };

  return (
    <CenteredContainer>
      <AppHeader 
        title="Calculation History" 
        showBack={true} 
        onBack={() => navigation.goBack()} 
      />
      
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={handleRefresh} 
          />
        }
      >
        <Card style={styles.filterCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.filterTitle}>Filters</Text>
            
            <SegmentedButtons
              value={type}
              onValueChange={(v: any) => setType(v)}
              buttons={[
                { value: 'all', label: 'All' },
                { value: 'loan_emi', label: 'EMI' },
                { value: 'fd', label: 'FD' },
                { value: 'rd', label: 'RD' },
                { value: 'daily_deposit', label: 'Daily' },
                { value: 'goal_planner', label: 'Goal' },
              ]}
              style={styles.segmentedButtons}
            />
            
            <View style={styles.dateContainer}>
              <TextInput 
                style={styles.dateInput} 
                label="From (YYYY-MM-DD)" 
                value={from} 
                onChangeText={setFrom}
                mode="outlined"
              />
              <TextInput 
                style={styles.dateInput} 
                label="To (YYYY-MM-DD)" 
                value={to} 
                onChangeText={setTo}
                mode="outlined"
              />
            </View>
          </Card.Content>
        </Card>

        <View style={styles.historyContainer}>
          {rows.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Card.Content>
                <Text variant="bodyLarge" style={styles.emptyText}>
                  No calculations found
                </Text>
              </Card.Content>
            </Card>
          ) : (
            rows.map((r) => (
              <Card key={r.id} style={styles.historyCard}>
                <Card.Content>
                  <Text variant="titleMedium" style={styles.historyTitle}>
                    {r.calculator_type.replace('_', ' ').toUpperCase()}
                  </Text>
                  <Text variant="bodyMedium" style={styles.historySummary}>
                    {r.summary_text}
                  </Text>
                  <Text variant="bodySmall" style={styles.historyDate}>
                    {new Date(r.created_at).toLocaleString()}
                  </Text>
                  <Button 
                    mode="outlined" 
                    onPress={() => navigation.navigate('HistoryDetail', { id: r.id })}
                    style={styles.viewButton}
                  >
                    View Details
                  </Button>
                </Card.Content>
              </Card>
            ))
          )}
        </View>
      </ScrollView>
    </CenteredContainer>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    width: '100%',
  },
  content: {
    padding: LayoutConfig.spacing.md,
    alignItems: 'center',
  },
  filterCard: {
    width: '100%',
    maxWidth: LayoutConfig.container.maxWidth,
    ...LayoutConfig.card,
    marginBottom: LayoutConfig.spacing.md,
  },
  filterTitle: {
    fontWeight: 'bold',
    marginBottom: LayoutConfig.spacing.md,
    textAlign: 'center',
  },
  segmentedButtons: {
    marginBottom: LayoutConfig.spacing.md,
  },
  dateContainer: {
    flexDirection: 'row',
    gap: LayoutConfig.spacing.sm,
  },
  dateInput: {
    flex: 1,
  },
  historyContainer: {
    width: '100%',
    maxWidth: LayoutConfig.container.maxWidth,
  },
  emptyCard: {
    ...LayoutConfig.card,
  },
  emptyText: {
    textAlign: 'center',
    color: LayoutConfig.colors.textSecondary,
  },
  historyCard: {
    ...LayoutConfig.card,
    marginBottom: LayoutConfig.spacing.sm,
  },
  historyTitle: {
    fontWeight: 'bold',
    color: LayoutConfig.colors.primary,
    marginBottom: LayoutConfig.spacing.xs,
  },
  historySummary: {
    marginBottom: LayoutConfig.spacing.xs,
  },
  historyDate: {
    color: LayoutConfig.colors.textSecondary,
    marginBottom: LayoutConfig.spacing.sm,
  },
  viewButton: {
    alignSelf: 'flex-start',
  },
});