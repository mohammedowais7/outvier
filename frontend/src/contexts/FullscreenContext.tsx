import React, { createContext, useContext, useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';

// Safely import NavigationBar with error handling
let NavigationBar: any = null;
try {
  NavigationBar = require('expo-navigation-bar');
} catch (error) {
  console.warn('expo-navigation-bar not available:', error);
}

interface FullscreenContextType {
  isFullscreen: boolean;
  enableFullscreen: () => void;
  disableFullscreen: () => void;
  toggleFullscreen: () => void;
}

const FullscreenContext = createContext<FullscreenContextType | undefined>(undefined);

export const useFullscreen = () => {
  const context = useContext(FullscreenContext);
  if (!context) {
    throw new Error('useFullscreen must be used within a FullscreenProvider');
  }
  return context;
};

interface FullscreenProviderProps {
  children: React.ReactNode;
}

export const FullscreenProvider: React.FC<FullscreenProviderProps> = ({ children }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isNavigationBarAvailable, setIsNavigationBarAvailable] = useState(false);

  // Check if NavigationBar is available
  useEffect(() => {
    if (Platform.OS === 'android' && NavigationBar) {
      setIsNavigationBarAvailable(true);
    }
  }, []);

  // Listen for navigation bar visibility changes
  useEffect(() => {
    if (Platform.OS === 'android' && NavigationBar && isNavigationBarAvailable) {
      try {
        const subscription = NavigationBar.addVisibilityListener(({ visibility }) => {
          if (visibility === 'visible' && isFullscreen) {
            // User swiped to show navigation bar, exit fullscreen
            setIsFullscreen(false);
          }
        });

        return () => subscription?.remove();
      } catch (error) {
        console.warn('Failed to add navigation bar visibility listener:', error);
      }
    }
  }, [isFullscreen, isNavigationBarAvailable]);

  const enableFullscreen = async () => {
    if (Platform.OS === 'android' && NavigationBar) {
      try {
        // Hide navigation bar
        await NavigationBar.setVisibilityAsync('hidden');
        // Only set behavior if not in edge-to-edge mode
        try {
          await NavigationBar.setBehaviorAsync('overlay-swipe');
        } catch (behaviorError) {
          // Ignore behavior errors in edge-to-edge mode
          console.warn('setBehaviorAsync not supported in edge-to-edge mode');
        }
        setIsFullscreen(true);
      } catch (error) {
        console.warn('Failed to enable fullscreen mode:', error);
        setIsFullscreen(true);
      }
    }
  };

  const disableFullscreen = async () => {
    if (Platform.OS === 'android' && NavigationBar) {
      try {
        // Show navigation bar
        await NavigationBar.setVisibilityAsync('visible');
        // Only reset behavior if not in edge-to-edge mode
        try {
          await NavigationBar.setBehaviorAsync('inset-swipe');
        } catch (behaviorError) {
          // Ignore behavior errors in edge-to-edge mode
          console.warn('setBehaviorAsync not supported in edge-to-edge mode');
        }
        setIsFullscreen(false);
      } catch (error) {
        console.warn('Failed to disable fullscreen mode:', error);
        setIsFullscreen(false);
      }
    }
  };

  const toggleFullscreen = () => {
    if (isFullscreen) {
      disableFullscreen();
    } else {
      enableFullscreen();
    }
  };

  const value = {
    isFullscreen,
    enableFullscreen,
    disableFullscreen,
    toggleFullscreen,
  };

  return (
    <FullscreenContext.Provider value={value}>
      <StatusBar
        style="light"
        hidden={isFullscreen}
        translucent={true}
      />
      {children}
    </FullscreenContext.Provider>
  );
};
