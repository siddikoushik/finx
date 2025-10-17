import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Button } from 'react-native-paper';
import FormTextInput from '../../components/FormTextInput';
import ResultCard from '../../components/ResultCard';
import { fixedDeposit } from '../../utils/calculations';
import { useAuthStore } from '../../store';
import { saveCalculation } from '../../utils';

export default function FDCalculatorScreen() {
	const { session } = useAuthStore();
	const [principal, setPrincipal] = useState('');
	const [months, setMonths] = useState('');
	const [rate, setRate] = useState('');
	const [result, setResult] = useState<any>(null);
	const onCalc = () => setResult(fixedDeposit(Number(principal), Number(months), Number(rate)));
	const onSave = async () => { if (session?.user?.id && result) { await saveCalculation(session.user.id, 'fd', { principal, months, rate }, result, `FD Maturity ${result.maturity.toFixed(2)}`); } };
	return (
		<ScrollView contentContainerStyle={{ padding: 16 }}>
			<FormTextInput label="Principal" value={principal} onChangeText={setPrincipal} keyboardType="numeric" />
			<View style={{ height: 8 }} />
			<FormTextInput label="Months" value={months} onChangeText={setMonths} keyboardType="numeric" />
			<View style={{ height: 8 }} />
			<FormTextInput label="Rate % (annual)" value={rate} onChangeText={setRate} keyboardType="numeric" />
			<Button mode="contained" onPress={onCalc}>Calculate</Button>
			{result && (
				<View>
					<ResultCard title="Maturity" value={result.maturity.toFixed(2)} />
					<ResultCard title="Interest" value={result.interest.toFixed(2)} />
					<ResultCard title="Deposit" value={result.totalDeposit.toFixed(2)} />
					<Button onPress={onSave}>Save to History</Button>
				</View>
			)}
		</ScrollView>
	);
}
