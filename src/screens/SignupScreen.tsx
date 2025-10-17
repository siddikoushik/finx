import React from 'react';
import { View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import FormTextInput from '../components/FormTextInput';
import { useAuthStore } from '../store';

const schema = z.object({
	email: z.string().email(),
	password: z.string().min(6),
});

type FormData = z.infer<typeof schema>;

export default function SignupScreen({ navigation }: any) {
	const { signUp, loading, error } = useAuthStore();
	const { control, handleSubmit } = useForm<FormData>({ resolver: zodResolver(schema) });

	const onSubmit = handleSubmit(async (data) => {
		await signUp(data.email, data.password);
		navigation.goBack();
	});

	return (
		<View style={{ flex: 1, padding: 16, justifyContent: 'center' }}>
			<Text variant="headlineMedium" style={{ marginBottom: 16 }}>Create Account</Text>
			<Controller name="email" control={control} render={({ field: { onChange, value } }) => (
				<FormTextInput label="Email" value={value ?? ''} onChangeText={onChange} keyboardType="email-address" />
			)} />
			<View style={{ height: 12 }} />
			<Controller name="password" control={control} render={({ field: { onChange, value } }) => (
				<FormTextInput label="Password" value={value ?? ''} onChangeText={onChange} secureTextEntry />
			)} />
			{error ? <Text style={{ color: 'red', marginTop: 8 }}>{error}</Text> : null}
			<View style={{ height: 16 }} />
			<Button mode="contained" onPress={onSubmit} loading={loading}>Sign Up</Button>
		</View>
	);
}
