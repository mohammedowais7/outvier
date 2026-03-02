import React, { useEffect } from 'react';
import { LogBox, Alert, Platform } from 'react-native'; // Alert aur Platform add kiya
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import FlashMessage, { showMessage } from 'react-native-flash-message';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Notifications from 'expo-notifications';

import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { FullscreenProvider } from './src/contexts/FullscreenContext';
import { theme } from './src/styles/theme';
import AppNavigator from './src/navigation/AppNavigator';
import AuthNavigator from './src/navigation/AuthNavigator';
import LoadingScreen from './src/components/LoadingScreen';

// Notification Service Import
import { registerForPushNotificationsAsync } from './src/services/notificationService';

// --- IMPORTANT: Notification Handler ---
// Yeh batata hai ke jab app foreground mein ho to kya karna hai
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Warnings ignore karein
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'VirtualizedLists should never be nested',
  'setBehaviorAsync` is not supported with edge-to-edge enabled',
]);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, 
    },
  },
});

const AppContent: React.FC = () => {
  const { isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    const setupNotifications = async () => {
      if (isAuthenticated) {
        // 1. Register for notifications aur token nikalna
        const token = await registerForPushNotificationsAsync();
        
        // --- TESTING ONLY: Token ko screen par dikhao ---
        if (token) {
          console.log("Mera Push Token:", token);
          // Alert.alert("Copy this Token for Django Admin", token); 
        }

        // 2. Foreground Listener (Jab app khuli ho tab flash message dikhao)
        const notificationListener = Notifications.addNotificationReceivedListener(notification => {
          const { title, body } = notification.request.content;
          
          showMessage({
            message: title || "New Update",
            description: body || "Something has changed.",
            type: "info",
            icon: "info",
            backgroundColor: "#007bff",
            color: "#fff",
            duration: 5000,
          });
        });

        // 3. Response Listener (Jab user notification par click kare)
        const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
          const data = response.notification.request.content.data;
          console.log('User clicked notification:', data);
          // Yahan aap navigation logic daal sakte hain
        });

        return () => {
          Notifications.removeNotificationSubscription(notificationListener);
          Notifications.removeNotificationSubscription(responseListener);
        };
      }
    };

    setupNotifications();
  }, [isAuthenticated]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

const App: React.FC = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider> 
          <ThemeProvider>
            <PaperProvider theme={theme}>
              <FullscreenProvider>
                <AppContent />
                <FlashMessage position="top" statusBarHeight={40} />
              </FullscreenProvider>
            </PaperProvider>
          </ThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
};

export default App;