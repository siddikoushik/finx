import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';
import { useAuthStore, useSettingsStore } from '../store';

export default function ProfileScreen() {
	const { session, signOut } = useAuthStore();
	const { darkModeOverride, setDarkMode } = useSettingsStore();
	const [displayName, setDisplayName] = useState('');
	useEffect(() => {
		(async () => {
			if (!session?.user?.id) return;
			const { data } = await supabase.from('profiles').select('display_name').eq('user_id', session.user.id).maybeSingle();
			if (data?.display_name) setDisplayName(data.display_name);
		})();
	}, [session?.user?.id]);
	const save = async () => {
		if (!session?.user?.id) return;
		await supabase.from('profiles').upsert({ user_id: session.user.id, display_name: displayName });
	};
	return (
		<View style={{ flex: 1, padding: 16 }}>
			<Text variant="titleMedium">Email</Text>
			<Text style={{ marginBottom: 8 }}>{session?.user?.email}</Text>
			<TextInput label="Display Name" mode="outlined" value={displayName} onChangeText={setDisplayName} />
			<View style={{ height: 12 }} />
			<Button mode="contained" onPress={save}>Save</Button>
			<View style={{ height: 12 }} />
			<Text variant="titleMedium">Dark Mode</Text>
			<View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
				<Button mode={darkModeOverride==='light'?'contained':'outlined'} onPress={() => setDarkMode('light')}>Light</Button>
				<Button mode={darkModeOverride==='dark'?'contained':'outlined'} onPress={() => setDarkMode('dark')}>Dark</Button>
				<Button mode={darkModeOverride==='system'?'contained':'outlined'} onPress={() => setDarkMode('system')}>System</Button>
			</View>
			<View style={{ height: 12 }} />
			<Button onPress={signOut}>Logout</Button>
		</View>
	);
}
