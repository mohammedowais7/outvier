import { Dimensions, StyleSheet } from 'react-native';

// Simple auth styles that don't rely on complex responsive systems
export const createAuthStyles = (theme: any) => {
  const { width, height } = Dimensions.get('window');
  const isSmallScreen = height < 700;
  
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    gradient: {
      flex: 1,
    },
    content: {
      flex: 1,
      paddingHorizontal: Math.min(24, width * 0.05),
      justifyContent: isSmallScreen ? 'flex-start' : 'center',
      paddingTop: isSmallScreen ? 20 : 0,
      paddingBottom: 20,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: Math.min(24, width * 0.05),
      paddingTop: isSmallScreen ? 20 : 40,
      paddingBottom: 40,
    },
    header: {
      alignItems: 'center',
      marginBottom: isSmallScreen ? 20 : 32,
    },
    logo: {
      width: isSmallScreen ? 60 : 80,
      height: isSmallScreen ? 60 : 80,
      borderRadius: isSmallScreen ? 30 : 40,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: isSmallScreen ? 8 : 12,
    },
    title: {
      fontSize: isSmallScreen ? 24 : 32,
      fontWeight: '700',
      color: theme.colors.onPrimary,
      marginBottom: 8,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: isSmallScreen ? 12 : 16,
      color: theme.colors.onPrimary,
      opacity: 0.9,
      textAlign: 'center',
      paddingHorizontal: 20,
    },
    form: {
      marginBottom: isSmallScreen ? 12 : 16,
    },
    inputContainer: {
      marginBottom: isSmallScreen ? 12 : 16,
    },
    label: {
      fontSize: isSmallScreen ? 12 : 14,
      fontWeight: '600',
      color: theme.colors.onPrimary,
      marginBottom: 8,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.15)',
      borderRadius: 12,
      paddingHorizontal: 16,
      minHeight: isSmallScreen ? 44 : 52,
    },
    input: {
      flex: 1,
      fontSize: isSmallScreen ? 14 : 16,
      color: '#fff',
      paddingVertical: isSmallScreen ? 12 : 14,
    },
    icon: {
      marginRight: 12,
    },
    passwordIcon: {
      padding: 4,
    },
    errorText: {
      color: theme.colors.error,
      fontSize: 12,
      marginTop: 4,
    },
    primaryButton: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      paddingVertical: isSmallScreen ? 12 : 14,
      alignItems: 'center',
      marginTop: 8,
      minHeight: isSmallScreen ? 44 : 52,
      justifyContent: 'center',
    },
    primaryButtonText: {
      color: theme.colors.text,
      fontSize: isSmallScreen ? 14 : 16,
      fontWeight: '700',
    },
    footer: {
      alignItems: 'center',
      marginTop: isSmallScreen ? 12 : 16,
    },
    footerText: {
      color: theme.colors.onPrimary,
      fontSize: isSmallScreen ? 12 : 14,
    },
    footerLink: {
      color: '#fff',
      fontWeight: '700',
      fontSize: isSmallScreen ? 12 : 14,
    },
    forgotPassword: {
      alignSelf: 'center',
      marginBottom: 24,
    },
    forgotPasswordText: {
      color: theme.colors.primary,
      fontSize: 14,
      fontWeight: '500',
    },
    registerContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    registerText: {
      color: theme.colors.onPrimary,
      fontSize: 14,
      opacity: 0.9,
    },
    registerLink: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '600',
      marginLeft: 4,
    },
    fullscreenToggle: {
      position: 'absolute',
      top: isSmallScreen ? 10 : 20,
      right: Math.min(24, width * 0.05),
      zIndex: 1000,
    },
    pickerContainer: {
      flex: 1,
    },
    pickerButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      paddingHorizontal: 16,
    },
    pickerText: {
      color: theme.colors.text,
      fontSize: isSmallScreen ? 14 : 16,
      flex: 1,
    },
    placeholderText: {
      color: 'rgba(255,255,255,0.7)',
    },
  });
};
