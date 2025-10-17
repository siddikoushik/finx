import React from 'react';
import { ScrollView, StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface CenteredContainerProps {
	children: React.ReactNode;
	style?: ViewStyle;
	scrollable?: boolean;
}

export default function CenteredContainer({ children, style, scrollable = true }: CenteredContainerProps) {
	const containerStyle = [styles.container, style];

	if (scrollable) {
		return (
			<SafeAreaView style={containerStyle}>
				<ScrollView 
					contentContainerStyle={styles.scrollContent}
					showsVerticalScrollIndicator={false}
					keyboardShouldPersistTaps="handled"
				>
					{children}
				</ScrollView>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={containerStyle}>
			{children}
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#f5f5f5',
	},
	scrollContent: {
		flexGrow: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 20,
		minHeight: '100%',
	},
});
