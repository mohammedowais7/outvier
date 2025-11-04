import { Dimensions, Platform } from 'react-native';

// Check if React Native is properly initialized
const isReactNativeReady = () => {
  try {
    return typeof Dimensions !== 'undefined' && typeof Dimensions.get === 'function';
  } catch {
    return false;
  }
};

// Get screen dimensions function
const getScreenDimensions = () => {
  try {
    // Check if React Native is ready
    if (!isReactNativeReady()) {
      throw new Error('React Native not ready');
    }
    
    const dimensions = Dimensions.get('window');
    // Ensure we have valid dimensions
    if (dimensions && typeof dimensions.width === 'number' && typeof dimensions.height === 'number') {
      return dimensions;
    }
    throw new Error('Invalid dimensions');
  } catch (error) {
    console.warn('Failed to get screen dimensions, using fallback:', error);
    // Fallback dimensions if Dimensions is not available
    return { width: 375, height: 812 };
  }
};

// Mobile breakpoints function
export const getMobileBreakpoints = () => {
  const screenDimensions = getScreenDimensions();
  const width = screenDimensions?.width || 375;
  const height = screenDimensions?.height || 812;
  
  return {
    small: height < 700,
    medium: height >= 700 && height < 800,
    large: height >= 800,
    isLandscape: width > height,
  };
};

// Responsive dimensions
export const getResponsiveDimensions = () => {
  const { small, medium, large } = getMobileBreakpoints();
  const screenDimensions = getScreenDimensions();
  const width = screenDimensions?.width || 375;
  
  return {
    // Spacing
    spacing: {
      xs: 4,
      s: small ? 6 : 8,
      m: small ? 12 : 16,
      l: small ? 16 : 24,
      xl: small ? 20 : 32,
      xxl: small ? 32 : 48,
    },
    
    // Typography
    typography: {
      h1: small ? 24 : large ? 32 : 28,
      h2: small ? 20 : large ? 24 : 22,
      h3: small ? 16 : large ? 20 : 18,
      body: small ? 14 : large ? 16 : 15,
      caption: small ? 12 : large ? 14 : 13,
      small: small ? 10 : large ? 12 : 11,
    },
    
    // Component sizes
    components: {
      logo: {
        small: small ? 50 : large ? 80 : 60,
        large: small ? 60 : large ? 100 : 80,
      },
      avatar: {
        small: small ? 32 : large ? 48 : 40,
        medium: small ? 40 : large ? 56 : 48,
        large: small ? 48 : large ? 64 : 56,
      },
      button: {
        height: small ? 44 : large ? 56 : 48,
        borderRadius: 12,
        paddingHorizontal: small ? 16 : large ? 20 : 18,
        paddingVertical: small ? 12 : large ? 16 : 14,
      },
      input: {
        height: small ? 44 : large ? 56 : 48,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: small ? 12 : large ? 16 : 14,
      },
      card: {
        borderRadius: 16,
        padding: small ? 12 : large ? 20 : 16,
        margin: small ? 8 : large ? 16 : 12,
      },
      icon: {
        small: small ? 16 : large ? 24 : 20,
        medium: small ? 20 : large ? 28 : 24,
        large: small ? 24 : large ? 32 : 28,
      },
    },
    
    // Layout
    layout: {
      containerPadding: Math.min(20, width * 0.05),
      screenPadding: small ? 16 : large ? 24 : 20,
      sectionSpacing: small ? 16 : large ? 24 : 20,
      cardSpacing: small ? 12 : large ? 16 : 14,
    },
  };
};

// Mobile-specific styles
export const createMobileStyles = (theme: any) => {
  const dims = getResponsiveDimensions();
  const breakpoints = getMobileBreakpoints();
  
  return {
    // Container styles
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    
    // Safe area container
    safeContainer: {
      flex: 1,
      backgroundColor: theme.colors.background,
      paddingTop: Platform.OS === 'ios' ? 0 : 0, // SafeAreaView handles this
    },
    
    // Content container
    content: {
      flex: 1,
      paddingHorizontal: dims.layout.containerPadding,
    },
    
    // Header styles
    header: {
      paddingHorizontal: dims.layout.screenPadding,
      paddingTop: breakpoints.small ? 10 : 20,
      paddingBottom: dims.spacing.m,
    },
    
    // Section styles
    section: {
      marginBottom: dims.layout.sectionSpacing,
    },
    
    sectionHeader: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
      marginBottom: dims.spacing.m,
    },
    
    sectionTitle: {
      fontSize: dims.typography.h2,
      fontWeight: '700' as const,
      color: theme.colors.text,
    },
    
    // Card styles
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: dims.components.card.borderRadius,
      padding: dims.components.card.padding,
      marginBottom: dims.components.card.margin,
      shadowColor: theme.colors.shadow || '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    
    // Button styles
    primaryButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: dims.components.button.borderRadius,
      paddingHorizontal: dims.components.button.paddingHorizontal,
      paddingVertical: dims.components.button.paddingVertical,
      minHeight: dims.components.button.height,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
    
    secondaryButton: {
      backgroundColor: theme.colors.surface,
      borderRadius: dims.components.button.borderRadius,
      paddingHorizontal: dims.components.button.paddingHorizontal,
      paddingVertical: dims.components.button.paddingVertical,
      minHeight: dims.components.button.height,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      borderWidth: 1,
      borderColor: theme.colors.outline,
    },
    
    buttonText: {
      fontSize: dims.typography.body,
      fontWeight: '600' as const,
      color: theme.colors.onPrimary,
    },
    
    secondaryButtonText: {
      fontSize: dims.typography.body,
      fontWeight: '600' as const,
      color: theme.colors.text,
    },
    
    // Input styles
    inputContainer: {
      marginBottom: dims.spacing.m,
    },
    
    inputLabel: {
      fontSize: dims.typography.caption,
      fontWeight: '600' as const,
      color: theme.colors.text,
      marginBottom: dims.spacing.s,
    },
    
    inputWrapper: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      backgroundColor: theme.colors.surface,
      borderRadius: dims.components.input.borderRadius,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      paddingHorizontal: dims.components.input.paddingHorizontal,
      minHeight: dims.components.input.height,
    },
    
    input: {
      flex: 1,
      fontSize: dims.typography.body,
      color: theme.colors.text,
      paddingVertical: dims.components.input.paddingVertical,
    },
    
    inputIcon: {
      marginRight: dims.spacing.m,
    },
    
    // Text styles
    title: {
      fontSize: dims.typography.h1,
      fontWeight: '700' as const,
      color: theme.colors.text,
      textAlign: 'center' as const,
    },
    
    subtitle: {
      fontSize: dims.typography.body,
      color: theme.colors.textSecondary,
      textAlign: 'center' as const,
    },
    
    bodyText: {
      fontSize: dims.typography.body,
      color: theme.colors.text,
      lineHeight: dims.typography.body * 1.5,
    },
    
    captionText: {
      fontSize: dims.typography.caption,
      color: theme.colors.textSecondary,
    },
    
    // Grid styles
    grid: {
      flexDirection: 'row' as const,
      flexWrap: 'wrap' as const,
      justifyContent: 'space-between' as const,
    },
    
    gridItem: {
      width: '48%',
      marginBottom: dims.spacing.m,
    },
    
    // List styles
    list: {
      flex: 1,
    },
    
    listItem: {
      paddingVertical: dims.spacing.m,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    
    // Empty state styles
    emptyState: {
      alignItems: 'center' as const,
      paddingVertical: dims.spacing.xxl,
    },
    
    emptyIcon: {
      marginBottom: dims.spacing.m,
    },
    
    emptyText: {
      fontSize: dims.typography.body,
      color: theme.colors.textSecondary,
      textAlign: 'center' as const,
    },
    
    // Loading styles
    loadingContainer: {
      flex: 1,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
    },
    
    // Error styles
    errorContainer: {
      flex: 1,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      paddingHorizontal: dims.layout.screenPadding,
    },
    
    errorText: {
      fontSize: dims.typography.body,
      color: theme.colors.error,
      textAlign: 'center' as const,
      marginBottom: dims.spacing.l,
    },
    
    // Fullscreen toggle
    fullscreenToggle: {
      position: 'absolute' as const,
      top: breakpoints.small ? 10 : 20,
      right: dims.layout.containerPadding,
      zIndex: 1000,
    },
  };
};

// Utility functions
export const getResponsiveValue = (small: any, medium: any, large: any) => {
  const { small: isSmall, medium: isMedium, large: isLarge } = getMobileBreakpoints();
  
  if (isSmall) return small;
  if (isMedium) return medium;
  if (isLarge) return large;
  return medium;
};

export const getScreenType = () => {
  const { small, medium, large } = getMobileBreakpoints();
  
  if (small) return 'small';
  if (medium) return 'medium';
  if (large) return 'large';
  return 'medium';
};
