import React from 'react';
import { Card, Text, useTheme } from 'react-native-paper';
import { StyleSheet } from 'react-native';
import { LayoutConfig } from '../config/layout';

interface ResultCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  type?: 'profit' | 'loss' | 'neutral';
}

export default function ResultCard({ title, value, subtitle, type = 'neutral' }: ResultCardProps) {
  const theme = useTheme();
  
  const getValueColor = () => {
    switch (type) {
      case 'profit':
        return LayoutConfig.colors.profit;
      case 'loss':
        return LayoutConfig.colors.loss;
      default:
        return theme.colors.onSurface;
    }
  };

  return (
    <Card style={styles.card}>
      <Card.Content style={styles.content}>
        <Text variant="titleMedium" style={styles.title}>
          {title}
        </Text>
        {subtitle && (
          <Text variant="bodySmall" style={styles.subtitle}>
            {subtitle}
          </Text>
        )}
        <Text 
          variant="headlineSmall" 
          style={[styles.value, { color: getValueColor() }]}
        >
          {String(value)}
        </Text>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    ...LayoutConfig.card,
    marginVertical: LayoutConfig.spacing.sm,
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
    marginBottom: LayoutConfig.spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: LayoutConfig.spacing.sm,
    opacity: 0.7,
  },
  value: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
});