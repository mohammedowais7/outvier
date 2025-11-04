import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Switch,
  Alert,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

import { useTheme } from '../contexts/ThemeContext';
import { apiService } from '../services/api';
import { NotificationPreference } from '../types/outvier';
import LoadingScreen from '../components/LoadingScreen';
import ErrorScreen from '../components/ErrorScreen';

interface NotificationSettingsScreenProps {
  navigation: any;
}

const NotificationSettingsScreen: React.FC<NotificationSettingsScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const queryClient = useQueryClient();
  const [preferences, setPreferences] = useState<NotificationPreference | null>(null);

  // Fetch notification preferences
  const { data: preferencesData, isLoading, error, refetch } = useQuery<NotificationPreference>({
    queryKey: ['notification-preferences'],
    queryFn: () => apiService.get('/outvier/notification-preferences/my_preferences/').then(res => res.data),
  });

  // Update preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: (data: Partial<NotificationPreference>) =>
      apiService.post('/outvier/notification-preferences/update_preferences/', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
      Alert.alert('Success', 'Notification preferences updated successfully');
    },
    onError: (error: any) => {
      Alert.alert('Error', error?.response?.data?.detail || 'Failed to update preferences');
    },
  });

  const handleToggle = (field: keyof NotificationPreference) => {
    if (!preferences) return;
    
    const newValue = !preferences[field];
    const updatedPreferences = { ...preferences, [field]: newValue };
    
    setPreferences(updatedPreferences);
    updatePreferencesMutation.mutate(updatedPreferences);
  };

  const handleFrequencyChange = (frequency: string) => {
    if (!preferences) return;
    
    const updatedPreferences = { ...preferences, reminder_frequency: frequency };
    setPreferences(updatedPreferences);
    updatePreferencesMutation.mutate(updatedPreferences);
  };

  React.useEffect(() => {
    if (preferencesData) {
      setPreferences(preferencesData);
    }
  }, [preferencesData]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      padding: 20,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
    },
    content: {
      flex: 1,
      padding: 20,
    },
    section: {
      marginBottom: 32,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: 16,
    },
    settingItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 16,
      paddingHorizontal: 16,
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      marginBottom: 12,
    },
    settingInfo: {
      flex: 1,
      marginRight: 16,
    },
    settingTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 4,
    },
    settingDescription: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      lineHeight: 20,
    },
    pickerContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      marginBottom: 12,
      overflow: 'hidden',
    },
    picker: {
      backgroundColor: theme.colors.surface,
      color: theme.colors.text,
    },
    pickerLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 8,
      paddingHorizontal: 16,
      paddingTop: 16,
    },
    timeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 16,
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      marginBottom: 12,
    },
    timeLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      flex: 1,
    },
    timeValue: {
      fontSize: 16,
      color: theme.colors.primary,
      fontWeight: '600',
    },
    infoCard: {
      backgroundColor: theme.colors.primaryContainer + '20',
      borderRadius: 12,
      padding: 16,
      marginBottom: 20,
    },
    infoTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.primary,
      marginBottom: 8,
    },
    infoText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      lineHeight: 20,
    },
  });

  if (isLoading) return <LoadingScreen />;
  if (error) return <ErrorScreen onRetry={refetch} />;
  if (!preferences) return <LoadingScreen />;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notification Settings</Text>
        <Text style={styles.subtitle}>
          Customize how and when you receive notifications
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>💡 Notification Tips</Text>
          <Text style={styles.infoText}>
            Enable notifications to stay motivated and on track with your goals. 
            You can always adjust these settings later.
          </Text>
        </View>

        {/* Goal Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Goal Notifications</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Goal Reminders</Text>
              <Text style={styles.settingDescription}>
                Get reminded to work on your goals
              </Text>
            </View>
            <Switch
              value={preferences.goal_reminders}
              onValueChange={() => handleToggle('goal_reminders')}
              trackColor={{ false: theme.colors.outline, true: theme.colors.primary }}
              thumbColor={preferences.goal_reminders ? theme.colors.onPrimary : theme.colors.surface}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Goal Deadlines</Text>
              <Text style={styles.settingDescription}>
                Alerts when goals are due or overdue
              </Text>
            </View>
            <Switch
              value={preferences.goal_deadlines}
              onValueChange={() => handleToggle('goal_deadlines')}
              trackColor={{ false: theme.colors.outline, true: theme.colors.primary }}
              thumbColor={preferences.goal_deadlines ? theme.colors.onPrimary : theme.colors.surface}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Goal Milestones</Text>
              <Text style={styles.settingDescription}>
                Celebrate when you reach milestones
              </Text>
            </View>
            <Switch
              value={preferences.goal_milestones}
              onValueChange={() => handleToggle('goal_milestones')}
              trackColor={{ false: theme.colors.outline, true: theme.colors.primary }}
              thumbColor={preferences.goal_milestones ? theme.colors.onPrimary : theme.colors.surface}
            />
          </View>
        </View>

        {/* Pathway Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Learning Notifications</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Pathway Reminders</Text>
              <Text style={styles.settingDescription}>
                Reminders to continue your learning journey
              </Text>
            </View>
            <Switch
              value={preferences.pathway_reminders}
              onValueChange={() => handleToggle('pathway_reminders')}
              trackColor={{ false: theme.colors.outline, true: theme.colors.primary }}
              thumbColor={preferences.pathway_reminders ? theme.colors.onPrimary : theme.colors.surface}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Step Completion</Text>
              <Text style={styles.settingDescription}>
                Notifications when you complete learning steps
              </Text>
            </View>
            <Switch
              value={preferences.pathway_steps}
              onValueChange={() => handleToggle('pathway_steps')}
              trackColor={{ false: theme.colors.outline, true: theme.colors.primary }}
              thumbColor={preferences.pathway_steps ? theme.colors.onPrimary : theme.colors.surface}
            />
          </View>
        </View>

        {/* Achievement Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Achievement Notifications</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Achievements</Text>
              <Text style={styles.settingDescription}>
                Celebrate when you unlock new achievements
              </Text>
            </View>
            <Switch
              value={preferences.achievements}
              onValueChange={() => handleToggle('achievements')}
              trackColor={{ false: theme.colors.outline, true: theme.colors.primary }}
              thumbColor={preferences.achievements ? theme.colors.onPrimary : theme.colors.surface}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Learning Streaks</Text>
              <Text style={styles.settingDescription}>
                Reminders to maintain your learning streak
              </Text>
            </View>
            <Switch
              value={preferences.streak_reminders}
              onValueChange={() => handleToggle('streak_reminders')}
              trackColor={{ false: theme.colors.outline, true: theme.colors.primary }}
              thumbColor={preferences.streak_reminders ? theme.colors.onPrimary : theme.colors.surface}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Streak Broken</Text>
              <Text style={styles.settingDescription}>
                Alerts when your learning streak is broken
              </Text>
            </View>
            <Switch
              value={preferences.streak_broken}
              onValueChange={() => handleToggle('streak_broken')}
              trackColor={{ false: theme.colors.outline, true: theme.colors.primary }}
              thumbColor={preferences.streak_broken ? theme.colors.onPrimary : theme.colors.surface}
            />
          </View>
        </View>

        {/* Delivery Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Preferences</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Push Notifications</Text>
              <Text style={styles.settingDescription}>
                Receive notifications on your device
              </Text>
            </View>
            <Switch
              value={preferences.push_notifications}
              onValueChange={() => handleToggle('push_notifications')}
              trackColor={{ false: theme.colors.outline, true: theme.colors.primary }}
              thumbColor={preferences.push_notifications ? theme.colors.onPrimary : theme.colors.surface}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>In-App Notifications</Text>
              <Text style={styles.settingDescription}>
                Show notifications within the app
              </Text>
            </View>
            <Switch
              value={preferences.in_app_notifications}
              onValueChange={() => handleToggle('in_app_notifications')}
              trackColor={{ false: theme.colors.outline, true: theme.colors.primary }}
              thumbColor={preferences.in_app_notifications ? theme.colors.onPrimary : theme.colors.surface}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Email Notifications</Text>
              <Text style={styles.settingDescription}>
                Receive notifications via email
              </Text>
            </View>
            <Switch
              value={preferences.email_notifications}
              onValueChange={() => handleToggle('email_notifications')}
              trackColor={{ false: theme.colors.outline, true: theme.colors.primary }}
              thumbColor={preferences.email_notifications ? theme.colors.onPrimary : theme.colors.surface}
            />
          </View>
        </View>

        {/* Frequency Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Frequency</Text>
          
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>Reminder Frequency</Text>
            <Picker
              selectedValue={preferences.reminder_frequency}
              onValueChange={handleFrequencyChange}
              style={styles.picker}
            >
              <Picker.Item label="Immediate" value="immediate" />
              <Picker.Item label="Daily Digest" value="daily" />
              <Picker.Item label="Weekly Digest" value="weekly" />
              <Picker.Item label="Custom" value="custom" />
            </Picker>
          </View>
        </View>

        {/* Quiet Hours */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quiet Hours</Text>
          
          <View style={styles.timeContainer}>
            <Text style={styles.timeLabel}>Start Time</Text>
            <Text style={styles.timeValue}>{preferences.quiet_hours_start}</Text>
          </View>
          
          <View style={styles.timeContainer}>
            <Text style={styles.timeLabel}>End Time</Text>
            <Text style={styles.timeValue}>{preferences.quiet_hours_end}</Text>
          </View>
        </View>

        {/* System Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Notifications</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Progress Insights</Text>
              <Text style={styles.settingDescription}>
                AI-generated insights about your progress
              </Text>
            </View>
            <Switch
              value={preferences.insights}
              onValueChange={() => handleToggle('insights')}
              trackColor={{ false: theme.colors.outline, true: theme.colors.primary }}
              thumbColor={preferences.insights ? theme.colors.onPrimary : theme.colors.surface}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>System Updates</Text>
              <Text style={styles.settingDescription}>
                Important app updates and announcements
              </Text>
            </View>
            <Switch
              value={preferences.system_updates}
              onValueChange={() => handleToggle('system_updates')}
              trackColor={{ false: theme.colors.outline, true: theme.colors.primary }}
              thumbColor={preferences.system_updates ? theme.colors.onPrimary : theme.colors.surface}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default NotificationSettingsScreen;

