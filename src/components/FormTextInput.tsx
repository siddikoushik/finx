import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, HelperText } from 'react-native-paper';
import { LayoutConfig } from '../config/layout';
import { formatIndianNumber, parseIndianNumber } from '../utils/formatting';

interface FormTextInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: 'default' | 'numeric' | 'email-address';
  placeholder?: string;
  secureTextEntry?: boolean;
  right?: React.ReactNode;
  error?: string;
  disabled?: boolean;
  formatNumbers?: boolean;
}

export default function FormTextInput({
  label,
  value,
  onChangeText,
  keyboardType = 'default',
  placeholder,
  secureTextEntry = false,
  right,
  error,
  disabled = false,
  formatNumbers = false,
}: FormTextInputProps) {
  
  const handleTextChange = (text: string) => {
    if (formatNumbers && keyboardType === 'numeric') {
      const numericValue = parseIndianNumber(text);
      const formatted = formatIndianNumber(numericValue);
      onChangeText(formatted);
    } else {
      onChangeText(text);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        label={label}
        value={value}
        onChangeText={handleTextChange}
        keyboardType={keyboardType}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        mode="outlined"
        right={right}
        disabled={disabled}
        error={!!error}
        style={styles.input}
        contentStyle={styles.inputContent}
        outlineStyle={styles.outline}
      />
      {error && (
        <HelperText type="error" visible={!!error} style={styles.helperText}>
          {error}
        </HelperText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: LayoutConfig.spacing.xs,
  },
  input: {
    backgroundColor: 'white',
  },
  inputContent: {
    fontSize: LayoutConfig.fontSize.md,
  },
  outline: {
    borderRadius: LayoutConfig.borderRadius.md,
  },
  helperText: {
    fontSize: LayoutConfig.fontSize.xs,
    marginTop: LayoutConfig.spacing.xs,
  },
});