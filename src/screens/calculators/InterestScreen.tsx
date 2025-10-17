import React, { useState } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { Button, Text, Card, SegmentedButtons } from 'react-native-paper';
import FormTextInput from '../../components/FormTextInput';
import ResultCard from '../../components/ResultCard';
import AppHeader from '../../components/AppHeader';
import CenteredContainer from '../../components/CenteredContainer';
import { simpleInterest, compoundInterest } from '../../utils/calculations';
import { formatIndianCurrency } from '../../utils/formatting';
import { LayoutConfig } from '../../config/layout';

interface InterestScreenProps {
  navigation: any;
}

export default function InterestScreen({ navigation }: InterestScreenProps) {
  const [principal, setPrincipal] = useState('');
  const [rate, setRate] = useState('');
  const [timeValue, setTimeValue] = useState('');
  const [timeUnit, setTimeUnit] = useState('years');
  const [freq, setFreq] = useState('12');
  const [resSI, setResSI] = useState<any>(null);
  const [resCI, setResCI] = useState<any>(null);

  const onCalc = () => {
    if (!principal || !rate || !timeValue) {
      alert('Please fill all fields');
      return;
    }

    const principalNum = parseFloat(principal.replace(/,/g, ''));
    const rateNum = parseFloat(rate);
    const timeNum = parseFloat(timeValue);
    
    // Convert time to years
    const years = timeUnit === 'months' ? timeNum / 12 : timeNum;
    
    setResSI(simpleInterest(principalNum, rateNum, years));
    setResCI(compoundInterest(principalNum, rateNum, years, parseFloat(freq)));
  };

  return (
    <CenteredContainer>
      <AppHeader title="Interest Calculator" />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.cardTitle}>Calculate Interest</Text>
            
            <FormTextInput 
              label="Principal Amount (₹)" 
              value={principal} 
              onChangeText={setPrincipal} 
              keyboardType="numeric"
              formatNumbers={true}
            />
            
            <FormTextInput 
              label="Interest Rate (% per annum)" 
              value={rate} 
              onChangeText={setRate} 
              keyboardType="numeric" 
            />
            
            <View style={styles.timeContainer}>
              <FormTextInput 
                label={`Time (${timeUnit})`} 
                value={timeValue} 
                onChangeText={setTimeValue} 
                keyboardType="numeric" 
              />
              
              <SegmentedButtons
                value={timeUnit}
                onValueChange={setTimeUnit}
                buttons={[
                  { value: 'years', label: 'Years' },
                  { value: 'months', label: 'Months' },
                ]}
                style={styles.segmentedButtons}
              />
            </View>
            
            <FormTextInput 
              label="Compounding Frequency (per year)" 
              value={freq} 
              onChangeText={setFreq} 
              keyboardType="numeric" 
            />
            
            <Button 
              mode="contained" 
              onPress={onCalc}
              style={styles.calculateButton}
              labelStyle={styles.buttonLabel}
            >
              Calculate Interest
            </Button>
          </Card.Content>
        </Card>

        {resSI && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.cardTitle}>Simple Interest</Text>
              
              <ResultCard 
                title="Interest Earned" 
                value={formatIndianCurrency(resSI.interest)}
                subtitle="Simple interest amount"
                type="profit"
              />
              
              <ResultCard 
                title="Total Amount" 
                value={formatIndianCurrency(resSI.amount)}
                subtitle="Principal + Interest"
              />
            </Card.Content>
          </Card>
        )}

        {resCI && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.cardTitle}>Compound Interest</Text>
              
              <ResultCard 
                title="Interest Earned" 
                value={formatIndianCurrency(resCI.interest)}
                subtitle="Compound interest amount"
                type="profit"
              />
              
              <ResultCard 
                title="Total Amount" 
                value={formatIndianCurrency(resCI.amount)}
                subtitle="Principal + Interest"
              />
            </Card.Content>
          </Card>
        )}
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
  card: {
    width: '100%',
    maxWidth: LayoutConfig.container.maxWidth,
    ...LayoutConfig.card,
  },
  cardTitle: {
    fontWeight: 'bold',
    marginBottom: LayoutConfig.spacing.md,
    textAlign: 'center',
    color: LayoutConfig.colors.primary,
  },
  timeContainer: {
    width: '100%',
  },
  segmentedButtons: {
    marginTop: LayoutConfig.spacing.sm,
  },
  calculateButton: {
    marginTop: LayoutConfig.spacing.md,
    ...LayoutConfig.button.primary,
  },
  buttonLabel: {
    fontWeight: 'bold',
    fontSize: LayoutConfig.fontSize.md,
  },
});