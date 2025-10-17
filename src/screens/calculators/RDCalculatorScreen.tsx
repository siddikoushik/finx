import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Button } from 'react-native-paper';
import FormTextInput from '../../components/FormTextInput';
import ResultCard from '../../components/ResultCard';
import { recurringDeposit } from '../../utils/calculations';
import { useAuthStore } from '../../store';
import { saveCalculation } from '../../utils';

export default function RDCalculatorScreen() {
	const { session } = useAuthStore();
	const [monthly, setMonthly] = useState('');
	const [months, setMonths] = useState('');
	const [rate, setRate] = useState('');
	const [result, setResult] = useState<any>(null);
	const onCalc = () => setResult(recurringDeposit(Number(monthly), Number(months), Number(rate)));
	const onSave = async () => { if (session?.user?.id && result) { await saveCalculation(session.user.id, 'rd', { monthly, months, rate }, result, `RD Maturity ${result.maturity.toFixed(2)}`); } };
	return (
		<ScrollView contentContainerStyle={{ padding: 16 }}>
			<FormTextInput label="Monthly Amount" value={monthly} onChangeText={setMonthly} keyboardType="numeric" />
			<View style={{ height: 8 }} />
			<FormTextInput label="Months" value={months} onChangeText={setMonths} keyboardType="numeric" />
			<View style={{ height: 8 }} />
			<FormTextInput label="Rate % (annual)" value={rate} onChangeText={setRate} keyboardType="numeric" />
			<Button mode="contained" onPress={onCalc}>Calculate</Button>
			{result && (
				<View>
					<ResultCard title="Maturity" value={result.maturity.toFixed(2)} />
					<ResultCard title="Interest" value={result.interest.toFixed(2)} />
					<ResultCard title="Total Deposit" value={result.totalDeposit.toFixed(2)} />
					<Button onPress={onSave}>Save to History</Button>
				</View>
			)}
		</ScrollView>
	);
}
