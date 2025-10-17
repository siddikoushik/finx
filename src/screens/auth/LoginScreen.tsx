import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text, Card } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import FormTextInput from '../../components/FormTextInput';
import CenteredContainer from '../../components/CenteredContainer';
import { useAuthStore } from '../../store';

const schema = z.object({
	email: z.string().email('Please enter a valid email'),
	password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormData = z.infer<typeof schema>;

interface LoginScreenProps {
	navigation: any;
}

export default function LoginScreen({ navigation }: LoginScreenProps) {
	const { signIn, loading, error } = useAuthStore();
	const { control, handleSubmit, formState: { errors } } = useForm<FormData>({ 
		resolver: zodResolver(schema) 
	});

	const onSubmit = handleSubmit(async (data) => {
		await signIn(data.email, data.password);
	});

	return (
		<CenteredContainer>
			<View style={styles.container}>
				<Card style={styles.card}>
					<Card.Content>
						<Text variant="headlineMedium" style={styles.title}>FinX</Text>
						<Text variant="bodyLarge" style={styles.subtitle}>Simplify Every Rupee</Text>
						
						<View style={styles.form}>
							<Controller 
								name="email" 
								control={control} 
								render={({ field: { onChange, value } }) => (
									<FormTextInput 
										label="Email" 
										value={value ?? ''} 
										onChangeText={onChange}
										keyboardType="email-address"
										error={errors.email?.message}
									/>
								)} 
							/>
							
							<View style={styles.spacing} />
							
							<Controller 
								name="password" 
								control={control} 
								render={({ field: { onChange, value } }) => (
									<FormTextInput 
										label="Password" 
										value={value ?? ''} 
										onChangeText={onChange}
										secureTextEntry
										error={errors.password?.message}
									/>
								)} 
							/>
							
							{(error || errors.email || errors.password) && (
								<Text style={styles.errorText}>
									{error || errors.email?.message || errors.password?.message}
								</Text>
							)}
							
							<View style={styles.spacing} />
							
							<Button 
								mode="contained" 
								onPress={onSubmit} 
								loading={loading}
								style={styles.loginButton}
								labelStyle={styles.buttonLabel}
							>
								Login
							</Button>
							
							<View style={styles.spacing} />
							
							<View style={styles.linkContainer}>
								<Button 
									mode="text" 
									onPress={() => navigation.navigate('Signup')}
									style={styles.linkButton}
								>
									Sign Up
								</Button>
								
								<Button 
									mode="text" 
									onPress={() => navigation.navigate('ForgotPassword')}
									style={styles.linkButton}
								>
									Forgot Password
								</Button>
							</View>
						</View>
					</Card.Content>
				</Card>
			</View>
		</CenteredContainer>
	);
}

const styles = StyleSheet.create({
	container: {
		width: '100%',
		maxWidth: 400,
		paddingHorizontal: 20,
	},
	card: {
		elevation: 4,
		borderRadius: 12,
	},
	title: {
		textAlign: 'center',
		fontWeight: 'bold',
		color: '#1E3A8A',
		marginBottom: 8,
	},
	subtitle: {
		textAlign: 'center',
		color: '#666',
		marginBottom: 32,
	},
	form: {
		width: '100%',
	},
	spacing: {
		height: 16,
	},
	errorText: {
		color: '#EF4444',
		textAlign: 'center',
		marginTop: 8,
		fontSize: 14,
	},
	loginButton: {
		borderRadius: 8,
		paddingVertical: 4,
	},
	buttonLabel: {
		fontWeight: 'bold',
		fontSize: 16,
	},
	linkContainer: {
		flexDirection: 'row',
		justifyContent: 'space-around',
	},
	linkButton: {
		flex: 1,
		marginHorizontal: 8,
	},
});
