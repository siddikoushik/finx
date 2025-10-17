import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Button } from 'react-native-paper';
import FormTextInput from '../../components/FormTextInput';
import ResultCard from '../../components/ResultCard';
import { goalPlanner } from '../../utils/calculations';
import { useAuthStore } from '../../store';
import { saveCalculation } from '../../utils';

export default function GoalPlannerScreen() {
	const { session } = useAuthStore();
	const [goal, setGoal] = useState('');
	const [months, setMonths] = useState('');
	const [existing, setExisting] = useState('0');
	const [res, setRes] = useState<any>(null);
	const onSave = async () => { if (session?.user?.id && res) { await saveCalculation(session.user.id, 'goal_planner', { goal, months, existing }, res, `Monthly ${res.requiredMonthly.toFixed(2)}`); } };
	return (
		<ScrollView contentContainerStyle={{ padding: 16 }}>
			<FormTextInput label="Goal Amount" value={goal} onChangeText={setGoal} keyboardType="numeric" />
			<View style={{ height: 8 }} />
			<FormTextInput label="Duration (months)" value={months} onChangeText={setMonths} keyboardType="numeric" />
			<View style={{ height: 8 }} />
			<FormTextInput label="Existing Savings" value={existing} onChangeText={setExisting} keyboardType="numeric" />
			<Button mode="contained" onPress={() => setRes(goalPlanner(Number(goal), Number(months), Number(existing)))}>Calculate</Button>
			{res && (
				<View>
					<ResultCard title="Required Monthly Saving" value={res.requiredMonthly.toFixed(2)} />
					<Button onPress={onSave}>Save to History</Button>
				</View>
			)}
		</ScrollView>
	);
}
