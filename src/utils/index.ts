import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { printToFileAsync } from 'expo-print';
import { supabase } from '../lib/supabase';

// Types
export type CalculatorType =
	| 'chit_fund'
	| 'daily_deposit'
	| 'rd'
	| 'fd'
	| 'loan_emi'
	| 'interest'
	| 'goal_planner';

export interface CalculationRecord {
	id: string;
	user_id: string;
	calculator_type: CalculatorType;
	input_json: Record<string, any>;
	output_json: Record<string, any>;
	summary_text: string;
	created_at: string;
}

// Export functions
export async function exportCSV(filename: string, rows: Array<Record<string, any>>) {
	if (!rows.length) return;
	const headers = Object.keys(rows[0]);
	const content = headers.join(',') + '\n' + rows.map(r => headers.map(h => JSON.stringify(r[h] ?? '')).join(',')).join('\n');
	const path = FileSystem.cacheDirectory + filename;
	await FileSystem.writeAsStringAsync(path, content);
	await Sharing.shareAsync(path);
}

export async function exportPDF(filename: string, html: string) {
	const file = await printToFileAsync({ html });
	await Sharing.shareAsync(file.uri);
}

// Save function
export async function saveCalculation(userId: string, calculator_type: CalculatorType, input_json: any, output_json: any, summary_text: string) {
	if (!userId) throw new Error('No user');
	const { error } = await supabase.from('calculations').insert({ user_id: userId, calculator_type, input_json, output_json, summary_text });
	if (error) throw error;
}