import React from 'react';
import { TouchableOpacity, StyleSheet, Platform, Text } from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { useFullscreen } from '../contexts/FullscreenContext';
import { useTheme } from '../contexts/ThemeContext';

interface FullscreenToggleProps {
  style?: any;
  size?: number;
  showLabel?: boolean;
}

const FullscreenToggle: React.FC<FullscreenToggleProps> = ({ 
  style, 
  size = 24,
  showLabel = false
}) => {
  const { isFullscreen, toggleFullscreen } = useFullscreen();
  const { theme } = useTheme();

  // Only show on Android
  if (Platform.OS !== 'android') {
    return null;
  }

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={toggleFullscreen}
      activeOpacity={0.7}
    >
      <Icon
        name={isFullscreen ? 'fullscreen-exit' : 'fullscreen'}
        size={size}
        color={theme.colors.onPrimary}
      />
      {showLabel && (
        <Text style={styles.label}>
          {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 40,
    minHeight: 40,
  },
  label: {
    color: 'white',
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
  },
});

export default FullscreenToggle;
