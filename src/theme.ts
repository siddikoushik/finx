import { MD3DarkTheme, MD3LightTheme, ThemeProp } from 'react-native-paper';
import { LayoutConfig } from './config/layout';

export const lightTheme: ThemeProp = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: LayoutConfig.colors.primary,
    secondary: LayoutConfig.colors.secondary,
    error: LayoutConfig.colors.error,
    background: LayoutConfig.colors.background,
    surface: LayoutConfig.colors.surface,
    onBackground: LayoutConfig.colors.text,
    onSurface: LayoutConfig.colors.text,
  },
};

export const darkTheme: ThemeProp = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: LayoutConfig.darkColors.primary,
    secondary: LayoutConfig.darkColors.secondary,
    error: LayoutConfig.darkColors.error,
    background: LayoutConfig.darkColors.background,
    surface: LayoutConfig.darkColors.surface,
    onBackground: LayoutConfig.darkColors.text,
    onSurface: LayoutConfig.darkColors.text,
  },
};