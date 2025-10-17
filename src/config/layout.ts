// Centralized Layout Configuration
// Change all app styling from this single file

export const LayoutConfig = {
  // Colors
  colors: {
    primary: '#1E3A8A',
    secondary: '#10B981', 
    error: '#EF4444',
    profit: '#10B981',    // Green for profits
    loss: '#EF4444',      // Red for losses
    background: '#f5f5f5',
    surface: '#ffffff',
    text: '#333333',
    textSecondary: '#666666',
  },
  
  // Dark theme colors
  darkColors: {
    primary: '#1E3A8A',
    secondary: '#10B981',
    error: '#EF4444', 
    profit: '#EF4444',    // Red for profits in dark theme
    loss: '#10B981',      // Green for losses in dark theme
    background: '#121212',
    surface: '#1e1e1e',
    text: '#ffffff',
    textSecondary: '#b3b3b3',
  },

  // Spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },

  // Border radius
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
  },

  // Font sizes
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
  },

  // Profile icon
  profileIcon: {
    size: 40,
    backgroundColor: '#1E3A8A',
    position: 'absolute',
    top: 50,
    right: 16,
    zIndex: 1000,
  },

  // Card styles
  card: {
    elevation: 4,
    borderRadius: 12,
    marginBottom: 16,
    padding: 20,
  },

  // Button styles
  button: {
    primary: {
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 24,
    },
    secondary: {
      borderRadius: 8,
      paddingVertical: 8,
      paddingHorizontal: 16,
    },
  },

  // Container styles
  container: {
    maxWidth: 400,
    paddingHorizontal: 20,
  },
};
