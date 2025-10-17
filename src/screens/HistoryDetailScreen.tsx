import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { supabase } from '../lib/supabase';
import { CalculationRecord } from '../utils';
import { exportCSV, exportPDF } from '../utils';

export default function HistoryDetailScreen({ route, navigation }: any) {
	const { id } = route.params || {};
	const [row, setRow] = useState<CalculationRecord | null>(null);
	useEffect(() => {
		(async () => {
			const { data } = await supabase.from('calculations').select('*').eq('id', id).maybeSingle();
			if (data) setRow(data as any);
		})();
	}, [id]);
	const remove = async () => {
		await supabase.from('calculations').delete().eq('id', id);
		navigation.goBack();
	};
	const onExportCSV = async () => {
		if (!row) return;
		await exportCSV(`finx_${id}.csv`, [{ ...row.input_json, ...row.output_json }]);
	};
	const onExportPDF = async () => {
		if (!row) return;
		const html = `<html><body><h1>FinX Report</h1><pre>${JSON.stringify(row, null, 2)}</pre></body></html>`;
		await exportPDF(`finx_${id}.pdf`, html);
	};
	return (
		<View style={{ flex: 1, padding: 16 }}>
			<Text variant="headlineSmall">Detail</Text>
			<Text selectable>{JSON.stringify(row, null, 2)}</Text>
			<View style={{ height: 12 }} />
			<Button onPress={onExportCSV}>Export CSV</Button>
			<Button onPress={onExportPDF}>Export PDF</Button>
			<Button textColor="#EF4444" onPress={remove}>Delete</Button>
		</View>
	);
}
