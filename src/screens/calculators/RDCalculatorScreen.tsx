import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, Text, Card, DataTable } from 'react-native-paper';
import FormTextInput from '../../components/FormTextInput';
import ResultCard from '../../components/ResultCard';
import AppHeader from '../../components/AppHeader';
import CenteredContainer from '../../components/CenteredContainer';
import { recurringDeposit } from '../../utils/calculations';
import { useAuthStore, useSettingsStore } from '../../store';
import { saveCalculation, exportCSV, exportPDF } from '../../utils';
import { formatCurrency } from '../../utils/formatting';
import { LayoutConfig } from '../../config/layout';

interface RDCalculatorScreenProps {
	navigation: any;
}

export default function RDCalculatorScreen({ navigation }: RDCalculatorScreenProps) {
	const { session } = useAuthStore();
	const { locale, currency } = useSettingsStore();
	const [monthly, setMonthly] = useState('');
	const [months, setMonths] = useState('');
	const [rate, setRate] = useState('');
	const [result, setResult] = useState<any>(null);
	const [showSchedule, setShowSchedule] = useState(false);

	const onCalc = () => {
		if (!monthly || !months || !rate) {
			alert('Please fill all fields');
			return;
		}
		const monthlyNum = Number(String(monthly).replace(/[^0-9.\-]/g, ''));
		const res = recurringDeposit(monthlyNum, Number(months), Number(rate));
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
				'rd',
				{ monthly, months, rate },
				result,
				`RD Maturity ${formatCurrency(result.maturity, currency, locale)} | Interest ${formatCurrency(result.interest, currency, locale)}`
			);
			alert('Saved to History!');
		} catch (error) {
			alert('Failed to save: ' + error);
		}
	};

	const toggleSchedule = () => setShowSchedule(!showSchedule);

	const exportSchedule = async (as: 'csv' | 'pdf') => {
		if (!result) return;
		const rows = [
			{ Item: 'Total Deposit', Value: formatCurrency(result.totalDeposit, currency, locale) },
			{ Item: 'Interest Earned', Value: formatCurrency(result.interest, currency, locale) },
			{ Item: 'Maturity Amount', Value: formatCurrency(result.maturity, currency, locale) },
		];
		if (as === 'csv') {
			await exportCSV('rd_summary.csv', rows);
		} else {
			const html = `
				<html><body>
				<h2>Recurring Deposit Calculator</h2>
				<table border="1" cellspacing="0" cellpadding="6">
				<tr><th>Item</th><th>Value</th></tr>
				${rows.map(r => `<tr><td>${r.Item}</td><td>${r.Value}</td></tr>`).join('')}
				</table>
				</body></html>
			`;
			await exportPDF('rd_summary.pdf', html);
		}
	};

	return (
		<CenteredContainer>
			<AppHeader title="Recurring Deposit (RD)" />
			<ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
				<Card style={styles.card}>
					<Card.Content>
						<Text variant="titleLarge" style={styles.cardTitle}>Calculate RD</Text>

						<FormTextInput label="Monthly Amount (₹)" value={monthly} onChangeText={setMonthly} keyboardType="numeric" />
						<FormTextInput label="Tenure (Months)" value={months} onChangeText={setMonths} keyboardType="numeric" />
						<FormTextInput label="Interest Rate (% per annum)" value={rate} onChangeText={setRate} keyboardType="numeric" />

						<Button mode="contained" onPress={onCalc} style={styles.primaryButton} labelStyle={styles.buttonLabel}>
							Calculate RD
						</Button>
					</Card.Content>
				</Card>

				{result && (
					<Card style={styles.card}>
						<Card.Content>
							<Text variant="titleLarge" style={styles.cardTitle}>Results</Text>

							<ResultCard title="Maturity Amount" value={formatCurrency(result.maturity, currency, locale)} subtitle="Total amount at maturity" />
							<ResultCard title="Interest Earned" value={formatCurrency(result.interest, currency, locale)} subtitle="Total interest earned" type="profit" />
							<ResultCard title="Total Deposit" value={formatCurrency(result.totalDeposit, currency, locale)} subtitle="Total amount deposited" />

							<View style={styles.buttonRow}>
								<Button mode="outlined" onPress={toggleSchedule} style={styles.outlinedButton}>{showSchedule ? 'Hide' : 'Show'} Details</Button>
								<Button mode="contained" onPress={onSave} style={styles.successButton}>Save to History</Button>
							</View>
						</Card.Content>
					</Card>
				)}

				{result && showSchedule && (
					<Card style={styles.card}>
						<Card.Content>
							<Text variant="titleMedium" style={styles.cardTitle}>Details</Text>
							<DataTable>
								<DataTable.Header>
									<DataTable.Title>Item</DataTable.Title>
									<DataTable.Title numeric>Value</DataTable.Title>
								</DataTable.Header>
								<DataTable.Row>
									<DataTable.Cell>Monthly Deposit</DataTable.Cell>
									<DataTable.Cell numeric>{formatCurrency(Number(monthly), currency, locale)}</DataTable.Cell>
								</DataTable.Row>
								<DataTable.Row>
									<DataTable.Cell>Tenure</DataTable.Cell>
									<DataTable.Cell numeric>{months} months</DataTable.Cell>
								</DataTable.Row>
								<DataTable.Row>
									<DataTable.Cell>Interest Rate</DataTable.Cell>
									<DataTable.Cell numeric>{rate}% p.a.</DataTable.Cell>
								</DataTable.Row>
							</DataTable>

							<View style={styles.buttonRow}>
								<Button mode="outlined" onPress={() => exportSchedule('csv')} style={styles.outlinedButton}>Export CSV</Button>
								<Button mode="contained" onPress={() => exportSchedule('pdf')} style={styles.primaryButton}>Export PDF</Button>
							</View>
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
	primaryButton: { ...LayoutConfig.button.primary, marginTop: 16 },
	buttonLabel: { fontWeight: 'bold', fontSize: 16 },
	buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, gap: 12, flexWrap: 'wrap' },
	outlinedButton: { flexGrow: 1, borderRadius: 8 },
	successButton: { flexGrow: 1, borderRadius: 8, backgroundColor: '#10B981' },
});
