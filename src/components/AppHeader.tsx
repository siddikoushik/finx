import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Appbar } from 'react-native-paper';
import { LayoutConfig } from '../config/layout';
import RoundProfileIcon from './RoundProfileIcon';

interface AppHeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
}

export default function AppHeader({ title, showBack = true, onBack }: AppHeaderProps) {
  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.header}>
        {showBack && (
          <Appbar.BackAction onPress={onBack} />
        )}
        <Appbar.Content 
          title={title} 
          titleStyle={styles.title}
        />
      </Appbar.Header>
      <RoundProfileIcon />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
  },
  header: {
    backgroundColor: LayoutConfig.colors.primary,
    elevation: 4,
  },
  title: {
    fontSize: LayoutConfig.fontSize.lg,
    fontWeight: 'bold',
    color: 'white',
  },
});