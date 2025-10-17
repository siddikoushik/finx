import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, Text, Card, DataTable, SegmentedButtons } from 'react-native-paper';
import FormTextInput from '../../components/FormTextInput';
import ResultCard from '../../components/ResultCard';
import AppHeader from '../../components/AppHeader';
import CenteredContainer from '../../components/CenteredContainer';
import { calculateEMI } from '../../utils/calculations';
import { useAuthStore, useSettingsStore } from '../../store';
import { saveCalculation } from '../../utils';
import { formatCurrency } from '../../utils/formatting';
import { LayoutConfig } from '../../config/layout';

interface LoanEmiScreenProps {
	navigation: any;
}

export default function LoanEmiScreen({ navigation }: LoanEmiScreenProps) {
	const { session } = useAuthStore();
	const { locale, currency } = useSettingsStore();
	const [principal, setPrincipal] = useState('');
	const [rate, setRate] = useState('');
	const [rateUnit, setRateUnit] = useState<'per_annum' | 'per_month'>('per_annum');
	const [months, setMonths] = useState('');
	const [result, setResult] = useState<any>(null);
	const [showSchedule, setShowSchedule] = useState(false);

	const onCalc = () => {
		if (!principal || !rate || !months) {
			alert('Please fill all fields');
			return;
		}
		const principalNum = Number(String(principal).replace(/[^0-9.\-]/g, ''));
		let annualRate = Number(rate);
		if (rateUnit === 'per_month') annualRate = annualRate * 12; // convert to per annum
		const res = calculateEMI(principalNum, annualRate, Number(months));
		setResult(res);
		setShowSchedule(false);
	};

	const onSave = async () => {
		if (!session?.user?.id || !result) {
			alert('Please calculate first');
			return;
		}
		try {
			await saveCalculation(
				session.user.id, 
				'loan_emi', 
				{ principal, rate, rateUnit, months }, 
				result, 
				`EMI ${formatCurrency(result.emi, currency, locale)} | Interest ${formatCurrency(result.totalInterest, currency, locale)}`
			);
			alert('Saved to History!');
		} catch (error) {
			alert('Failed to save: ' + error);
		}
	};

	const toggleSchedule = () => setShowSchedule(!showSchedule);

	return (
		<CenteredContainer>
			<AppHeader title="Loan EMI Calculator" />
			<ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
				<Card style={styles.card}>
					<Card.Content>
						<Text variant="titleLarge" style={styles.cardTitle}>Calculate EMI</Text>

						<FormTextInput label="Loan Amount (₹)" value={principal} onChangeText={setPrincipal} keyboardType="numeric" />

						<FormTextInput label="Interest Rate" value={rate} onChangeText={setRate} keyboardType="numeric" />

						<SegmentedButtons
							value={rateUnit}
							onValueChange={(v: any) => setRateUnit(v)}
							buttons={[
								{ value: 'per_annum', label: '% per annum' },
								{ value: 'per_month', label: '% per month' },
							]}
							style={styles.segmented}
						/>

						<FormTextInput label="Loan Tenure (months)" value={months} onChangeText={setMonths} keyboardType="numeric" />

						<Button mode="contained" onPress={onCalc} style={styles.primaryButton} labelStyle={styles.buttonLabel}>
							Calculate EMI
						</Button>
					</Card.Content>
				</Card>

				{result && (
					<Card style={styles.card}>
						<Card.Content>
							<Text variant="titleLarge" style={styles.cardTitle}>Results</Text>

							<ResultCard title="Monthly EMI" value={formatCurrency(result.emi, currency, locale)} subtitle="Monthly payment amount" />
							<ResultCard title="Total Interest" value={formatCurrency(result.totalInterest, currency, locale)} subtitle="Total interest to be paid" />
							<ResultCard title="Total Payment" value={formatCurrency(result.totalPayment, currency, locale)} subtitle="Principal + Interest" />

							<View style={styles.buttonRow}>
								<Button mode="outlined" onPress={toggleSchedule} style={styles.outlinedButton}> {showSchedule ? 'Hide' : 'Show'} Schedule </Button>
								<Button mode="contained" onPress={onSave} style={styles.successButton}> Save to History </Button>
							</View>
						</Card.Content>
					</Card>
				)}

				{result && showSchedule && (
					<Card style={styles.card}>
						<Card.Content>
							<Text variant="titleMedium" style={styles.cardTitle}>EMI Schedule</Text>
							<ScrollView horizontal showsHorizontalScrollIndicator={false}>
								<DataTable>
									<DataTable.Header>
										<DataTable.Title>Month</DataTable.Title>
										<DataTable.Title numeric>EMI</DataTable.Title>
										<DataTable.Title numeric>Interest</DataTable.Title>
										<DataTable.Title numeric>Principal</DataTable.Title>
										<DataTable.Title numeric>Balance</DataTable.Title>
									</DataTable.Header>
									{result.schedule.slice(0, 12).map((row: any) => (
										<DataTable.Row key={row.month}>
											<DataTable.Cell>{row.month}</DataTable.Cell>
											<DataTable.Cell numeric>{formatCurrency(row.emi, currency, locale)}</DataTable.Cell>
											<DataTable.Cell numeric>{formatCurrency(row.interest, currency, locale)}</DataTable.Cell>
											<DataTable.Cell numeric>{formatCurrency(row.principal, currency, locale)}</DataTable.Cell>
											<DataTable.Cell numeric>{formatCurrency(row.balance, currency, locale)}</DataTable.Cell>
										</DataTable.Row>
									))}
								</DataTable>
							</ScrollView>
							{result.schedule.length > 12 && (
								<Text style={styles.note}>Showing first 12 months. Total {result.schedule.length} months.</Text>
							)}
						</Card.Content>
					</Card>
				)}
			</ScrollView>
		</CenteredContainer>
	);
}

const styles = StyleSheet.create({
	scrollView: { flex: 1, width: '100%' },
	content: { padding: 16, alignItems: 'center' },
	card: { width: '100%', maxWidth: 400, marginBottom: 16, elevation: 4, borderRadius: 12 },
	cardTitle: { fontWeight: 'bold', marginBottom: 16, textAlign: 'center', color: '#1E3A8A' },
	segmented: { marginTop: 8, marginBottom: 8 },
	primaryButton: { ...LayoutConfig.button.primary, marginTop: 16 },
	buttonLabel: { fontWeight: 'bold', fontSize: 16 },
	buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, gap: 12 },
	outlinedButton: { flex: 1, borderRadius: 8 },
	successButton: { flex: 1, borderRadius: 8, backgroundColor: '#10B981' },
	note: { fontSize: 12, color: '#666', textAlign: 'center', marginTop: 8, fontStyle: 'italic' },
});