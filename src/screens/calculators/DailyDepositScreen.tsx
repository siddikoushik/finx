import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Button } from 'react-native-paper';
import FormTextInput from '../../components/FormTextInput';
import ResultCard from '../../components/ResultCard';
import { dailyDeposit } from '../../utils/calculations';
import { useAuthStore } from '../../store';
import { saveCalculation } from '../../utils';

export default function DailyDepositScreen() {
	const { session } = useAuthStore();
	const [daily, setDaily] = useState('');
	const [days, setDays] = useState('');
	const [rate, setRate] = useState('');
	const [result, setResult] = useState<any>(null);
	const onCalc = () => setResult(dailyDeposit(Number(daily), Number(days), Number(rate)));
	const onSave = async () => { if (session?.user?.id && result) { await saveCalculation(session.user.id, 'daily_deposit', { daily, days, rate }, result, `Daily Maturity ${result.maturity.toFixed(2)}`); } };
	return (
		<ScrollView contentContainerStyle={{ padding: 16 }}>
			<FormTextInput label="Daily Amount" value={daily} onChangeText={setDaily} keyboardType="numeric" />
			<View style={{ height: 8 }} />
			<FormTextInput label="Total Days" value={days} onChangeText={setDays} keyboardType="numeric" />
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
