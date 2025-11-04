import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';

export class FullscreenManager {
  private static isFullscreen = false;

  /**
   * Enable fullscreen mode - hide status bar and navigation bar
   */
  static enableFullscreen() {
    if (Platform.OS === 'android') {
      this.isFullscreen = true;
      // Status bar will be hidden by StatusBar component
    }
  }

  /**
   * Disable fullscreen mode - show status bar and navigation bar
   */
  static disableFullscreen() {
    if (Platform.OS === 'android') {
      this.isFullscreen = false;
    }
  }

  /**
   * Toggle fullscreen mode
   */
  static toggleFullscreen() {
    if (this.isFullscreen) {
      this.disableFullscreen();
    } else {
      this.enableFullscreen();
    }
  }

  /**
   * Check if currently in fullscreen mode
   */
  static getIsFullscreen(): boolean {
    return this.isFullscreen;
  }

  /**
   * Get StatusBar props for current fullscreen state
   */
  static getStatusBarProps() {
    return {
      style: 'light' as const,
      hidden: this.isFullscreen,
      backgroundColor: 'transparent',
      translucent: true,
    };
  }
}

/**
 * Hook to manage fullscreen mode
 */
export const useFullscreen = () => {
  return {
    enableFullscreen: FullscreenManager.enableFullscreen,
    disableFullscreen: FullscreenManager.disableFullscreen,
    toggleFullscreen: FullscreenManager.toggleFullscreen,
    isFullscreen: FullscreenManager.getIsFullscreen(),
    statusBarProps: FullscreenManager.getStatusBarProps(),
  };
};






