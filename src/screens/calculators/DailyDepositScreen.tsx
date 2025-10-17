import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, Text, Card, DataTable, useTheme } from 'react-native-paper';
import FormTextInput from '../../components/FormTextInput';
import ResultCard from '../../components/ResultCard';
import AppHeader from '../../components/AppHeader';
import CenteredContainer from '../../components/CenteredContainer';
import { dailyDeposit } from '../../utils/calculations';
import { useAuthStore, useSettingsStore } from '../../store';
import { saveCalculation, exportCSV, exportPDF } from '../../utils';
import { formatCurrency } from '../../utils/formatting';
import { LayoutConfig } from '../../config/layout';

interface DailyDepositScreenProps {
	navigation: any;
}

export default function DailyDepositScreen({ navigation }: DailyDepositScreenProps) {
	const theme = useTheme();
	const { session } = useAuthStore();
	const { locale, currency } = useSettingsStore();
	const [daily, setDaily] = useState('');
	const [days, setDays] = useState('');
	const [rate, setRate] = useState('');
	const [result, setResult] = useState<any>(null);
	const [showSchedule, setShowSchedule] = useState(false);

	const onCalc = () => {
		if (!daily || !days || !rate) {
			alert('Please fill all fields');
			return;
		}
		const dailyNum = Number(String(daily).replace(/[^0-9.\-]/g, ''));
		const res = dailyDeposit(dailyNum, Number(days), Number(rate));
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
				'daily_deposit',
				{ daily, days, rate },
				result,
				`Daily Maturity ${formatCurrency(result.maturity, currency, locale)} | Interest ${formatCurrency(result.interest, currency, locale)}`
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
			await exportCSV('daily_deposit.csv', rows);
		} else {
			const html = `
				<html><body>
				<h2>Daily Deposit Calculator</h2>
				<table border="1" cellspacing="0" cellpadding="6">
				<tr><th>Item</th><th>Value</th></tr>
				${rows.map(r => `<tr><td>${r.Item}</td><td>${r.Value}</td></tr>`).join('')}
				</table>
				</body></html>
			`;
			await exportPDF('daily_deposit.pdf', html);
		}
	};

	return (
		<CenteredContainer>
			<AppHeader title="Daily Deposit Calculator" />
			<ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
				<Card style={styles.card}>
					<Card.Content>
						<Text variant="titleLarge" style={[styles.cardTitle, { color: theme.colors.primary }]}>Calculate Daily Deposit</Text>

						<FormTextInput label="Daily Amount (₹)" value={daily} onChangeText={setDaily} keyboardType="numeric" />
						<FormTextInput label="Total Days" value={days} onChangeText={setDays} keyboardType="numeric" />
						<FormTextInput label="Interest Rate (% per annum)" value={rate} onChangeText={setRate} keyboardType="numeric" />

						<Button mode="contained" onPress={onCalc} style={styles.primaryButton} labelStyle={styles.buttonLabel}>
							Calculate
						</Button>
					</Card.Content>
				</Card>

				{result && (
					<Card style={styles.card}>
						<Card.Content>
							<Text variant="titleLarge" style={[styles.cardTitle, { color: theme.colors.primary }]}>Results</Text>

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
							<Text variant="titleMedium" style={[styles.cardTitle, { color: theme.colors.primary }]}>Details</Text>
							<DataTable>
								<DataTable.Header>
									<DataTable.Title>Item</DataTable.Title>
									<DataTable.Title numeric>Value</DataTable.Title>
								</DataTable.Header>
								<DataTable.Row>
									<DataTable.Cell>Daily Amount</DataTable.Cell>
									<DataTable.Cell numeric>{formatCurrency(Number(daily), currency, locale)}</DataTable.Cell>
								</DataTable.Row>
								<DataTable.Row>
									<DataTable.Cell>Total Days</DataTable.Cell>
									<DataTable.Cell numeric>{days}</DataTable.Cell>
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
	cardTitle: { fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
	primaryButton: { ...LayoutConfig.button.primary, marginTop: 16 },
	buttonLabel: { fontWeight: 'bold', fontSize: 16 },
	buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, gap: 12, flexWrap: 'wrap' },
	outlinedButton: { flexGrow: 1, borderRadius: 8 },
	successButton: { flexGrow: 1, borderRadius: 8, backgroundColor: '#10B981' },
});
