import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Button, Text, TextInput, Card, Divider } from 'react-native-paper';
import { useAuthStore, useSettingsStore } from '../store';
import { supabase } from '../lib/supabase';
import AppHeader from '../components/AppHeader';
import CenteredContainer from '../components/CenteredContainer';

export default function ProfileScreen() {
	const { session, signOut } = useAuthStore();
	const { darkModeOverride, setDarkMode, locale, currency, setLocale, setCurrency } = useSettingsStore();
	const [displayName, setDisplayName] = useState('');

	useEffect(() => {
		(async () => {
			if (!session?.user?.id) return;
			const { data } = await supabase.from('profiles').select('display_name, locale, currency').eq('user_id', session.user.id).maybeSingle();
			if (data?.display_name) setDisplayName(data.display_name);
			if (data?.locale) await setLocale(data.locale);
			if (data?.currency) await setCurrency(data.currency);
		})();
	}, [session?.user?.id]);

	const save = async () => {
		if (!session?.user?.id) return;
		try {
			await supabase.from('profiles').upsert({
				user_id: session.user.id,
				display_name: displayName,
				locale: locale || null,
				currency: currency
			});
			alert('Profile saved successfully!');
		} catch (error) {
			alert('Failed to save profile: ' + error);
		}
	};

	const localeOptions = [
		{ value: 'en-IN', label: 'India (1,00,000)' },
		{ value: 'en-US', label: 'US (100,000)' },
		{ value: 'en-GB', label: 'UK (100,000)' },
	];

	const currencyOptions = [
		{ value: 'INR', label: '₹ INR' },
		{ value: 'USD', label: '$ USD' },
		{ value: 'EUR', label: '€ EUR' },
		{ value: 'GBP', label: '£ GBP' },
	];

	return (
		<CenteredContainer>
			<AppHeader title="Profile Settings" />
			<ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
				<Card style={styles.card}>
					<Card.Content>
						<Text variant="titleLarge" style={styles.sectionTitle}>Account Information</Text>

						<Text variant="labelMedium" style={styles.label}>Email</Text>
						<Text style={styles.emailText}>{session?.user?.email}</Text>

						<TextInput
							label="Display Name"
							mode="outlined"
							value={displayName}
							onChangeText={setDisplayName}
							style={styles.input}
						/>
					</Card.Content>
				</Card>

				<Card style={styles.card}>
					<Card.Content>
						<Text variant="titleLarge" style={styles.sectionTitle}>Locale & Currency</Text>

						<Text variant="labelMedium" style={styles.label}>Number Format</Text>
						<View style={styles.buttonGrid}>
							{localeOptions.map((opt) => (
								<Button
									key={opt.value}
									mode={locale === opt.value ? 'contained' : 'outlined'}
									onPress={() => setLocale(opt.value)}
									style={styles.gridButton}
								>
									{opt.label}
								</Button>
							))}
						</View>

						<Text variant="labelMedium" style={[styles.label, { marginTop: 16 }]}>Currency</Text>
						<View style={styles.buttonGrid}>
							{currencyOptions.map((opt) => (
								<Button
									key={opt.value}
									mode={currency === opt.value ? 'contained' : 'outlined'}
									onPress={() => setCurrency(opt.value)}
									style={styles.gridButton}
								>
									{opt.label}
								</Button>
							))}
						</View>
					</Card.Content>
				</Card>

				<Card style={styles.card}>
					<Card.Content>
						<Text variant="titleLarge" style={styles.sectionTitle}>Appearance</Text>

						<Text variant="labelMedium" style={styles.label}>Theme</Text>
						<View style={styles.buttonRow}>
							<Button
								mode={darkModeOverride === 'light' ? 'contained' : 'outlined'}
								onPress={() => setDarkMode('light')}
								style={styles.themeButton}
							>
								Light
							</Button>
							<Button
								mode={darkModeOverride === 'dark' ? 'contained' : 'outlined'}
								onPress={() => setDarkMode('dark')}
								style={styles.themeButton}
							>
								Dark
							</Button>
							<Button
								mode={darkModeOverride === 'system' ? 'contained' : 'outlined'}
								onPress={() => setDarkMode('system')}
								style={styles.themeButton}
							>
								System
							</Button>
						</View>
					</Card.Content>
				</Card>

				<Button mode="contained" onPress={save} style={styles.saveButton}>
					Save Settings
				</Button>

				<Button mode="outlined" onPress={signOut} style={styles.logoutButton}>
					Logout
				</Button>
			</ScrollView>
		</CenteredContainer>
	);
}

const styles = StyleSheet.create({
	scrollView: { flex: 1, width: '100%' },
	content: { padding: 16, alignItems: 'center' },
	card: { width: '100%', maxWidth: 400, marginBottom: 16, elevation: 4, borderRadius: 12 },
	sectionTitle: { fontWeight: 'bold', marginBottom: 16, color: '#1E3A8A' },
	label: { fontWeight: '600', marginBottom: 8, marginTop: 8 },
	emailText: { marginBottom: 16, fontSize: 14, color: '#666' },
	input: { marginBottom: 8 },
	buttonRow: { flexDirection: 'row', gap: 8, marginTop: 8, flexWrap: 'wrap' },
	buttonGrid: { flexDirection: 'row', gap: 8, marginTop: 8, flexWrap: 'wrap' },
	gridButton: { flexGrow: 1, minWidth: 100 },
	themeButton: { flex: 1 },
	saveButton: { width: '100%', maxWidth: 400, marginTop: 8, borderRadius: 8, backgroundColor: '#10B981' },
	logoutButton: { width: '100%', maxWidth: 400, marginTop: 8, borderRadius: 8 },
});
