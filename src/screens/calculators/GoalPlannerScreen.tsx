import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, Text, Card, DataTable } from 'react-native-paper';
import FormTextInput from '../../components/FormTextInput';
import ResultCard from '../../components/ResultCard';
import AppHeader from '../../components/AppHeader';
import CenteredContainer from '../../components/CenteredContainer';
import { goalPlanner } from '../../utils/calculations';
import { useAuthStore, useSettingsStore } from '../../store';
import { saveCalculation, exportCSV, exportPDF } from '../../utils';
import { formatCurrency } from '../../utils/formatting';
import { LayoutConfig } from '../../config/layout';

interface GoalPlannerScreenProps {
	navigation: any;
}

export default function GoalPlannerScreen({ navigation }: GoalPlannerScreenProps) {
	const { session } = useAuthStore();
	const { locale, currency } = useSettingsStore();
	const [goal, setGoal] = useState('');
	const [months, setMonths] = useState('');
	const [existing, setExisting] = useState('0');
	const [result, setResult] = useState<any>(null);
	const [showSchedule, setShowSchedule] = useState(false);

	const onCalc = () => {
		if (!goal || !months) {
			alert('Please fill all fields');
			return;
		}
		const goalNum = Number(String(goal).replace(/[^0-9.\-]/g, ''));
		const existingNum = Number(String(existing).replace(/[^0-9.\-]/g, ''));
		const res = goalPlanner(goalNum, Number(months), existingNum);
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
				'goal_planner',
				{ goal, months, existing },
				result,
				`Monthly ${formatCurrency(result.requiredMonthly, currency, locale)} for ${months} months`
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
			{ Item: 'Goal Amount', Value: formatCurrency(Number(goal), currency, locale) },
			{ Item: 'Existing Savings', Value: formatCurrency(Number(existing), currency, locale) },
			{ Item: 'Required Monthly Saving', Value: formatCurrency(result.requiredMonthly, currency, locale) },
		];
		if (as === 'csv') {
			await exportCSV('goal_planner.csv', rows);
		} else {
			const html = `
				<html><body>
				<h2>Goal Planner</h2>
				<table border="1" cellspacing="0" cellpadding="6">
				<tr><th>Item</th><th>Value</th></tr>
				${rows.map(r => `<tr><td>${r.Item}</td><td>${r.Value}</td></tr>`).join('')}
				</table>
				</body></html>
			`;
			await exportPDF('goal_planner.pdf', html);
		}
	};

	return (
		<CenteredContainer>
			<AppHeader title="Goal Planner" />
			<ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
				<Card style={styles.card}>
					<Card.Content>
						<Text variant="titleLarge" style={styles.cardTitle}>Plan Your Goal</Text>

						<FormTextInput label="Goal Amount (₹)" value={goal} onChangeText={setGoal} keyboardType="numeric" />
						<FormTextInput label="Duration (Months)" value={months} onChangeText={setMonths} keyboardType="numeric" />
						<FormTextInput label="Existing Savings (₹)" value={existing} onChangeText={setExisting} keyboardType="numeric" />

						<Button mode="contained" onPress={onCalc} style={styles.primaryButton} labelStyle={styles.buttonLabel}>
							Calculate Plan
						</Button>
					</Card.Content>
				</Card>

				{result && (
					<Card style={styles.card}>
						<Card.Content>
							<Text variant="titleLarge" style={styles.cardTitle}>Results</Text>

							<ResultCard
								title="Required Monthly Saving"
								value={formatCurrency(result.requiredMonthly, currency, locale)}
								subtitle={`Save this amount monthly for ${months} months`}
								type="profit"
							/>

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
									<DataTable.Cell>Goal Amount</DataTable.Cell>
									<DataTable.Cell numeric>{formatCurrency(Number(goal), currency, locale)}</DataTable.Cell>
								</DataTable.Row>
								<DataTable.Row>
									<DataTable.Cell>Existing Savings</DataTable.Cell>
									<DataTable.Cell numeric>{formatCurrency(Number(existing), currency, locale)}</DataTable.Cell>
								</DataTable.Row>
								<DataTable.Row>
									<DataTable.Cell>Duration</DataTable.Cell>
									<DataTable.Cell numeric>{months} months</DataTable.Cell>
								</DataTable.Row>
								<DataTable.Row>
									<DataTable.Cell>Total to Save</DataTable.Cell>
									<DataTable.Cell numeric>{formatCurrency(Number(goal) - Number(existing), currency, locale)}</DataTable.Cell>
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
