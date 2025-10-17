import React from 'react';
import { View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import FormTextInput from '../components/FormTextInput';
import { useAuthStore } from '../store';

const schema = z.object({ email: z.string().email() });

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordScreen({ navigation }: any) {
	const { control, handleSubmit } = useForm<FormData>({ resolver: zodResolver(schema) });
	const { resetPassword } = useAuthStore();
	const onSubmit = handleSubmit(async ({ email }) => {
		await resetPassword(email);
		navigation.goBack();
	});
	return (
		<View style={{ flex: 1, padding: 16, justifyContent: 'center' }}>
			<Text variant="headlineMedium" style={{ marginBottom: 16 }}>Reset Password</Text>
			<Controller name="email" control={control} render={({ field: { onChange, value } }) => (
				<FormTextInput label="Email" value={value ?? ''} onChangeText={onChange} keyboardType="email-address" />
			)} />
			<View style={{ height: 16 }} />
			<Button mode="contained" onPress={onSubmit}>Send Reset Email</Button>
		</View>
	);
}
