import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialIcons as Icon } from '@expo/vector-icons';

import { useTheme } from '../contexts/ThemeContext';
import DashboardScreen from '../screens/DashboardScreen';
import GoalsScreen from '../screens/GoalsScreen';
import MatchesScreen from '../screens/MatchesScreen';
import PathwaysScreen from '../screens/PathwaysScreen';
import ProfileScreen from '../screens/ProfileScreen';
import GoalDetailScreen from '../screens/GoalDetailScreen';
import EnhancedGoalScreen from '../screens/EnhancedGoalScreen';
import CreateGoalScreen from '../screens/CreateGoalScreen';
import MatchDetailScreen from '../screens/MatchDetailScreen';
import PathwayDetailScreen from '../screens/PathwayDetailScreen';
import LearningProcessScreen from '../screens/LearningProcessScreen';
import AchievementsScreen from '../screens/AchievementsScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import NotificationSettingsScreen from '../screens/NotificationSettingsScreen';
import AssessmentScreen from '../screens/AssessmentScreen';
import InsightsScreen from '../screens/InsightsScreen';
import ProfileSettingsScreen from '../screens/ProfileSettingsScreen';
import ChangePasswordScreen from '../screens/auth/ChangePasswordScreen';
import EditGoalScreen from '../screens/EditGoalScreen';
import GoalMilestonesScreen from '../screens/GoalMilestonesScreen';
import MatchActionsScreen from '../screens/MatchActionsScreen';
import FindMatchesScreen from '../screens/FindMatchesScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen'; 
 
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const DashboardStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="DashboardMain" 
      component={DashboardScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="Assessment" 
      component={AssessmentScreen}
      options={{ title: 'Complete Assessment' }}
    />
    <Stack.Screen 
      name="Insights" 
      component={InsightsScreen}
      options={{ title: 'Progress Insights' }}
    />
    <Stack.Screen 
      name="PathwayDetail" 
      component={PathwayDetailScreen}
      options={{ title: 'Pathway Details' }}
    />
    <Stack.Screen 
      name="LearningProcess" 
      component={LearningProcessScreen}
      options={{ title: 'Learning Process' }}
    />
    <Stack.Screen 
      name="Achievements" 
      component={AchievementsScreen}
      options={{ title: 'Achievements & Progress' }}
    />
    <Stack.Screen 
      name="Notifications" 
      component={NotificationsScreen}
      options={{ title: 'Notifications' }}
    />
    <Stack.Screen 
      name="NotificationSettings" 
      component={NotificationSettingsScreen}
      options={{ title: 'Notification Settings' }}
    />
    <Stack.Screen 
      name="ProfileSettings" 
      component={ProfileSettingsScreen}
      options={{ title: 'Settings' }}
    />
    <Stack.Screen 
      name="ChangePassword" 
      component={ChangePasswordScreen}
      options={{ title: 'Change Password' }}
    />
    <Stack.Screen 
      name="Analytics" 
      component={AnalyticsScreen}
      options={{ title: 'Analytics' }}
    />
  </Stack.Navigator>
);

const GoalsStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="GoalsMain" 
      component={GoalsScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="GoalDetail" 
      component={GoalDetailScreen}
      options={{ title: 'Goal Details' }}
    />
    <Stack.Screen 
      name="EnhancedGoal" 
      component={EnhancedGoalScreen}
      options={{ title: 'Enhanced Goal Details' }}
    />
    <Stack.Screen 
      name="CreateGoal" 
      component={CreateGoalScreen}
      options={{ title: 'Create New Goal' }}
    />
    <Stack.Screen 
      name="EditGoal" 
      component={EditGoalScreen}
      options={{ title: 'Edit Goal' }}
    />
    <Stack.Screen 
      name="GoalMilestones" 
      component={GoalMilestonesScreen}
      options={{ title: 'Goal Milestones' }}
    />
  </Stack.Navigator>
);

const MatchesStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="MatchesMain" 
      component={MatchesScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="MatchDetail" 
      component={MatchDetailScreen}
      options={{ title: 'Match Details' }}
    />
    <Stack.Screen 
      name="MatchActions" 
      component={MatchActionsScreen}
      options={{ title: 'Match Actions' }}
    />
    <Stack.Screen 
      name="FindMatches" 
      component={FindMatchesScreen}
      options={{ title: 'Find Matches' }}
    />
  </Stack.Navigator>
);

const PathwaysStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="PathwaysMain" 
      component={PathwaysScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="PathwayDetail" 
      component={PathwayDetailScreen}
      options={{ title: 'Pathway Details' }}
    />
    <Stack.Screen 
      name="LearningProcess" 
      component={LearningProcessScreen}
      options={{ title: 'Learning Process' }}
    />
  </Stack.Navigator>
);

const AppNavigator: React.FC = () => {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Dashboard':
              iconName = 'dashboard';
              break;
            case 'Goals':
              iconName = 'flag';
              break;
            case 'Matches':
              iconName = 'people';
              break;
            case 'Pathways':
              iconName = 'school';
              break;
            case 'Profile':
              iconName = 'person';
              break;
            default:
              iconName = 'help';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outline,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: theme.colors.onPrimary,
        headerTitleStyle: {
          fontWeight: '600',
        },
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardStack}
        options={{ 
          title: 'Dashboard',
          headerShown: false,
        }}
      />
      <Tab.Screen 
        name="Goals" 
        component={GoalsStack}
        options={{ 
          title: 'Goals',
          headerShown: false,
        }}
      />
      <Tab.Screen 
        name="Matches" 
        component={MatchesStack}
        options={{ 
          title: 'Matches',
          headerShown: false,
        }}
      />
      <Tab.Screen 
        name="Pathways" 
        component={PathwaysStack}
        options={{ 
          title: 'Pathways',
          headerShown: false,
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ 
          title: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};

export default AppNavigator;
