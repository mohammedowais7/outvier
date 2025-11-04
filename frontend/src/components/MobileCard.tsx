import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { createMobileStyles, getResponsiveDimensions } from '../styles/mobileLayout';

interface MobileCardProps {
  children?: React.ReactNode;
  title?: string;
  subtitle?: string;
  icon?: string;
  iconColor?: string;
  onPress?: () => void;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
  showArrow?: boolean;
  disabled?: boolean;
}

const MobileCard: React.FC<MobileCardProps> = ({
  children,
  title,
  subtitle,
  icon,
  iconColor,
  onPress,
  style,
  contentStyle,
  titleStyle,
  subtitleStyle,
  showArrow = false,
  disabled = false,
}) => {
  const { theme } = useTheme();
  const dims = getResponsiveDimensions();
  const mobileStyles = createMobileStyles(theme);

  const cardStyle = [
    mobileStyles.card,
    onPress && !disabled && styles.pressable,
    disabled && styles.disabled,
    style,
  ];

  const content = (
    <View style={[styles.content, contentStyle]}>
      {(icon || title || subtitle) && (
        <View style={styles.header}>
          {icon && (
            <View style={[styles.iconContainer, { backgroundColor: iconColor || theme.colors.primaryContainer }]}>
              <Icon 
                name={icon} 
                size={dims.components.icon.medium} 
                color={iconColor || theme.colors.primary} 
              />
            </View>
          )}
          <View style={styles.textContainer}>
            {title && (
              <Text style={[mobileStyles.bodyText, styles.title, titleStyle]} numberOfLines={2}>
                {title}
              </Text>
            )}
            {subtitle && (
              <Text style={[mobileStyles.captionText, styles.subtitle, subtitleStyle]} numberOfLines={1}>
                {subtitle}
              </Text>
            )}
          </View>
          {showArrow && (
            <Icon 
              name="chevron-right" 
              size={dims.components.icon.small} 
              color={theme.colors.textSecondary} 
            />
          )}
        </View>
      )}
      {children}
    </View>
  );

  if (onPress && !disabled) {
    return (
      <TouchableOpacity style={cardStyle} onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <View style={cardStyle}>
      {content}
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontWeight: '600',
    marginBottom: 2,
  },
  subtitle: {
    opacity: 0.8,
  },
  pressable: {
    // Add any pressable-specific styles here
  },
  disabled: {
    opacity: 0.6,
  },
});

export default MobileCard;






