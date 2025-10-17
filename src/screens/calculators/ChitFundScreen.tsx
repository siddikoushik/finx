import React, { useState } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { Button, DataTable, Card, Text } from 'react-native-paper';
import AppHeader from '../../components/AppHeader';
import CenteredContainer from '../../components/CenteredContainer';
import FormTextInput from '../../components/FormTextInput';
import { chitFund } from '../../utils/calculations';
import { formatIndianNumber } from '../../utils/formatting';
import { LayoutConfig } from '../../config/layout';
import { exportCSV, exportPDF } from '../../utils';

export default function ChitFundScreen({ navigation }: any) {
	const [total, setTotal] = useState('');
	const [members, setMembers] = useState('');
	const [months, setMonths] = useState('');
	const [commission, setCommission] = useState('5');
	const [res, setRes] = useState<any>(null);

	const onCalc = () => setRes(chitFund(Number(total), Number(members), Number(commission), Number(months)));

	const exportTable = async (as: 'csv' | 'pdf') => {
		if (!res) return;
		const rows = res.table.map((row: any) => ({
			Month: row.month,
			Winner: row.winner,
			Bid: formatIndianNumber(row.bid),
			Dividend: formatIndianNumber(row.dividendPerMember),
			Fee: formatIndianNumber(row.foremanFee),
		}));
		if (as === 'csv') {
			await exportCSV('chit_table.csv', rows);
		} else {
			const html = `
				<html><body>
				<h2>Chit Fund Auction Table</h2>
				<table border="1" cellspacing="0" cellpadding="6">
				<tr><th>Month</th><th>Winner</th><th>Bid</th><th>Dividend</th><th>Fee</th></tr>
				${rows.map(r => `<tr><td>${r.Month}</td><td>${r.Winner}</td><td>${r.Bid}</td><td>${r.Dividend}</td><td>${r.Fee}</td></tr>`).join('')}
				</table>
				</body></html>
			`;
			await exportPDF('chit_table.pdf', html);
		}
	};

	return (
		<CenteredContainer>
			<AppHeader title="Chit Fund" onBack={() => navigation.goBack()} />
			<ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
				<Card style={styles.card}>
					<Card.Content>
						<Text variant="titleLarge" style={styles.title}>Calculate</Text>
						<FormTextInput label="Total Amount (₹)" value={total} onChangeText={setTotal} keyboardType="numeric" />
						<FormTextInput label="Members" value={members} onChangeText={setMembers} keyboardType="numeric" />
						<FormTextInput label="Duration (months)" value={months} onChangeText={setMonths} keyboardType="numeric" />
						<FormTextInput label="Foreman Commission %" value={commission} onChangeText={setCommission} keyboardType="numeric" />
						<Button mode="contained" onPress={onCalc} style={styles.primaryButton}>Calculate</Button>
					</Card.Content>
				</Card>
				{res && (
					<Card style={styles.card}>
						<Card.Content>
							<Text variant="titleLarge" style={styles.title}>Auction Table</Text>
							<DataTable>
								<DataTable.Header>
									<DataTable.Title>Month</DataTable.Title>
									<DataTable.Title>Winner</DataTable.Title>
									<DataTable.Title numeric>Bid</DataTable.Title>
									<DataTable.Title numeric>Dividend</DataTable.Title>
									<DataTable.Title numeric>Fee</DataTable.Title>
								</DataTable.Header>
								{res.table.map((row: any) => (
									<DataTable.Row key={row.month}>
										<DataTable.Cell>{row.month}</DataTable.Cell>
										<DataTable.Cell>{row.winner}</DataTable.Cell>
										<DataTable.Cell numeric>₹{formatIndianNumber(row.bid)}</DataTable.Cell>
										<DataTable.Cell numeric>₹{formatIndianNumber(row.dividendPerMember)}</DataTable.Cell>
										<DataTable.Cell numeric>₹{formatIndianNumber(row.foremanFee)}</DataTable.Cell>
									</DataTable.Row>
								))}
							</DataTable>

							<View style={styles.buttonRow}>
								<Button mode="outlined" onPress={() => exportTable('csv')} style={styles.outlinedButton}>Export CSV</Button>
								<Button mode="contained" onPress={() => exportTable('pdf')} style={styles.primaryButton}>Export PDF</Button>
							</View>
						</Card.Content>
					</Card>
				)}
			</ScrollView>
		</CenteredContainer>
	);
}

const styles = StyleSheet.create({
	scroll: { flex: 1, width: '100%' },
	content: { padding: LayoutConfig.spacing.md, alignItems: 'center' },
	card: { width: '100%', maxWidth: LayoutConfig.container.maxWidth, ...LayoutConfig.card },
	title: { fontWeight: 'bold', marginBottom: LayoutConfig.spacing.md, textAlign: 'center', color: LayoutConfig.colors.primary },
	primaryButton: { ...LayoutConfig.button.primary, marginTop: LayoutConfig.spacing.md },
	buttonRow: { flexDirection: 'row', gap: LayoutConfig.spacing.sm, marginTop: LayoutConfig.spacing.md, flexWrap: 'wrap' },
	outlinedButton: { flexGrow: 1, borderRadius: 8 },
});
