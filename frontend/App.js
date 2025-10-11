import * as React from "react";
import { useEffect } from "react";
import { Alert } from "react-native";
import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import HomeScreen from "./src/screens/HomeScreen";
import EventsScreen from "./src/screens/EventsScreen";
import CreateGoalScreen from "./src/screens/CreateGoalScreen";
import { StatusBar } from "expo-status-bar";
import { colors } from "./src/theme";
import { healthCheck, BASE_URL } from "./src/api/client";

const Stack = createStackNavigator();
export default function App(){
  const theme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: colors.bg,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      primary: colors.accent,
    }
  };
  useEffect(()=>{
    healthCheck().catch(()=>{
      if(__DEV__){
        // eslint-disable-next-line no-console
        console.warn("Backend unreachable at", BASE_URL);
      }
      Alert.alert(
        "Backend unreachable",
        `Cannot reach ${BASE_URL}. Ensure your phone and PC are on the same Wi‑Fi, backend runs on 0.0.0.0:8000, and firewall allows port 8000.`,
      );
    });
  },[]);
  return (
    <NavigationContainer theme={theme}>
      <StatusBar style="light" />
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerStyle: { backgroundColor: colors.bg },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: "600" },
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Events" component={EventsScreen} />
        <Stack.Screen name="CreateGoal" component={CreateGoalScreen} options={{ title: "New Goal" }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
