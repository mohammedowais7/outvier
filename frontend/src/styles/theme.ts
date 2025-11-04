import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#6366F1', // Indigo
    primaryContainer: '#E0E7FF',
    secondary: '#8B5CF6', // Purple
    secondaryContainer: '#EDE9FE',
    tertiary: '#06B6D4', // Cyan
    tertiaryContainer: '#CFFAFE',
    surface: '#FFFFFF',
    surfaceVariant: '#F8FAFC',
    background: '#F8FAFC',
    error: '#EF4444',
    errorContainer: '#FEE2E2',
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onTertiary: '#FFFFFF',
    onSurface: '#1E293B',
    onBackground: '#1E293B',
    onError: '#FFFFFF',
    outline: '#E2E8F0',
    outlineVariant: '#F1F5F9',
    shadow: '#000000',
    scrim: '#000000',
    inverseSurface: '#334155',
    inverseOnSurface: '#F1F5F9',
    inversePrimary: '#A5B4FC',
    elevation: {
      level0: 'transparent',
      level1: '#FFFFFF',
      level2: '#FFFFFF',
      level3: '#FFFFFF',
      level4: '#FFFFFF',
      level5: '#FFFFFF',
    },
    // Custom colors for Outvier
    success: '#10B981',
    warning: '#F59E0B',
    info: '#3B82F6',
    accent: '#EC4899',
    card: '#FFFFFF',
    text: '#1E293B',
    textSecondary: '#64748B',
    border: '#E2E8F0',
    divider: '#F1F5F9',
  },
  roundness: 12,
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#818CF8',
    primaryContainer: '#3730A3',
    secondary: '#A78BFA',
    secondaryContainer: '#5B21B6',
    tertiary: '#22D3EE',
    tertiaryContainer: '#0E7490',
    surface: '#1E293B',
    surfaceVariant: '#334155',
    background: '#0F172A',
    error: '#F87171',
    errorContainer: '#7F1D1D',
    onPrimary: '#000000',
    onSecondary: '#000000',
    onTertiary: '#000000',
    onSurface: '#F1F5F9',
    onBackground: '#F1F5F9',
    onError: '#000000',
    outline: '#475569',
    outlineVariant: '#334155',
    shadow: '#000000',
    scrim: '#000000',
    inverseSurface: '#F1F5F9',
    inverseOnSurface: '#1E293B',
    inversePrimary: '#3730A3',
    elevation: {
      level0: 'transparent',
      level1: '#1E293B',
      level2: '#334155',
      level3: '#475569',
      level4: '#64748B',
      level5: '#94A3B8',
    },
    // Custom colors for Outvier
    success: '#34D399',
    warning: '#FBBF24',
    info: '#60A5FA',
    accent: '#F472B6',
    card: '#1E293B',
    text: '#F1F5F9',
    textSecondary: '#94A3B8',
    border: '#475569',
    divider: '#334155',
  },
  roundness: 12,
};

export const theme = lightTheme;

export const gradients = {
  primary: ['#6366F1', '#8B5CF6'],
  secondary: ['#8B5CF6', '#EC4899'],
  success: ['#10B981', '#059669'],
  warning: ['#F59E0B', '#D97706'],
  error: ['#EF4444', '#DC2626'],
  info: ['#3B82F6', '#2563EB'],
  sunset: ['#F59E0B', '#EC4899', '#8B5CF6'],
  ocean: ['#06B6D4', '#3B82F6', '#6366F1'],
  forest: ['#10B981', '#059669', '#047857'],
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
  },
  h2: {
    fontSize: 28,
    fontWeight: '600' as const,
    lineHeight: 36,
  },
  h3: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
  },
  h4: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  h5: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  h6: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 22,
  },
  body1: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  body2: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
};
