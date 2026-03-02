import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { apiService } from './api';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const registerForPushNotificationsAsync = async () => {
  let token;

  if (!Device.isDevice) {
    console.log('DEBUG: Must use physical device for Push Notifications');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    console.log('DEBUG: Permission not granted!');
    return null;
  }

  try {
    const projectId = 
      Constants?.expoConfig?.extra?.eas?.projectId ?? 
      Constants?.easConfig?.projectId;

    if (!projectId) {
      console.error("DEBUG: Project ID not found in app.json");
      return null;
    }

    token = (await Notifications.getExpoPushTokenAsync({
      projectId: projectId,
    })).data;
    
    console.log("SUCCESS: Push Token Generated ->", token);

    // --- SECTION 5: FIXED BACKEND CONNECTION ---
    try {
      await apiService.post('/projects/save-token/', { 
          push_token: token, // Backend expects 'push_token'
          platform: Platform.OS 
      });
      console.log("DEBUG: Token saved to backend successfully.");
    } catch (apiError) {
      console.log("DEBUG: Token generated but failed to save on backend (Check URL/Network):", apiError);
    }

  } catch (error) {
    console.log("ERROR: During token registration:", error);
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
};