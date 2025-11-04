import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Dimensions,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { showMessage } from 'react-native-flash-message';

import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { apiService } from '../services/api';
import { createMobileStyles, getResponsiveDimensions } from '../styles/mobileLayout';

interface ProfileSettingsForm {
  first_name: string;
  last_name: string;
  email: string;
  bio: string;
  location: string;
  website: string;
  linkedin: string;
  github: string;
  twitter: string;
}

interface NotificationSettings {
  goal_reminders: boolean;
  goal_deadlines: boolean;
  goal_milestones: boolean;
  pathway_reminders: boolean;
  pathway_steps: boolean;
  achievements: boolean;
  streak_reminders: boolean;
  streak_broken: boolean;
  matches: boolean;
  insights: boolean;
  system_updates: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
  in_app_notifications: boolean;
}

const ProfileSettingsScreen: React.FC<any> = ({ navigation }) => {
  const { user, updateProfile } = useAuth();
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'privacy' | 'account'>('profile');
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    goal_reminders: true,
    goal_deadlines: true,
    goal_milestones: true,
    pathway_reminders: true,
    pathway_steps: true,
    achievements: true,
    streak_reminders: true,
    streak_broken: true,
    matches: true,
    insights: true,
    system_updates: true,
    email_notifications: true,
    push_notifications: true,
    in_app_notifications: true,
  });

  const dims = getResponsiveDimensions();
  const mobileStyles = createMobileStyles(theme);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileSettingsForm>({
    defaultValues: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || '',
      bio: user?.bio || '',
      location: user?.location || '',
      website: user?.website || '',
      linkedin: user?.linkedin || '',
      github: user?.github || '',
      twitter: user?.twitter || '',
    },
  });

  const onSubmit = async (data: ProfileSettingsForm) => {
    try {
      setIsLoading(true);
      const success = await updateProfile(data);
      if (success) {
        showMessage({
          message: 'Profile updated successfully',
          type: 'success',
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Profile update failed:', error);
      showMessage({
        message: 'Failed to update profile. Please try again.',
        type: 'danger',
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // Implement account deletion
            Alert.alert('Account Deletion', 'Account deletion feature will be implemented soon.');
          },
        },
      ]
    );
  };

  const handleChangePassword = () => {
    navigation.navigate('ChangePassword');
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            // Implement logout
            await apiService.logout();
            // Navigation will be handled by AuthContext
          },
        },
      ]
    );
  };

  const updateNotificationSetting = (key: keyof NotificationSettings, value: boolean) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const styles = StyleSheet.create({
    container: mobileStyles.container,
    header: {
      ...mobileStyles.sectionHeader,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    backButton: {
      padding: dims.spacing.s,
    },
    title: mobileStyles.sectionTitle,
    tabContainer: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 4,
      marginBottom: dims.spacing.l,
    },
    tab: {
      flex: 1,
      paddingVertical: dims.spacing.s,
      alignItems: 'center',
      borderRadius: 8,
    },
    activeTab: {
      backgroundColor: theme.colors.primary,
    },
    tabText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },
    activeTabText: {
      color: theme.colors.onPrimary,
    },
    content: {
      flex: 1,
    },
    section: {
      marginBottom: dims.spacing.xl,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: dims.spacing.m,
    },
    inputGroup: {
      marginBottom: dims.spacing.m,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: dims.spacing.s,
    },
    input: {
      ...mobileStyles.input,
      backgroundColor: theme.colors.surface,
    },
    textArea: {
      ...mobileStyles.input,
      backgroundColor: theme.colors.surface,
      height: 80,
      textAlignVertical: 'top',
    },
    switchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: dims.spacing.m,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    switchLabel: {
      fontSize: 16,
      color: theme.colors.text,
      flex: 1,
    },
    switchDescription: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    button: {
      ...mobileStyles.primaryButton,
      marginTop: dims.spacing.m,
    },
    buttonText: mobileStyles.buttonText,
    dangerButton: {
      ...mobileStyles.primaryButton,
      backgroundColor: theme.colors.error,
      marginTop: dims.spacing.m,
    },
    dangerButtonText: {
      ...mobileStyles.buttonText,
      color: theme.colors.onError,
    },
    logoutButton: {
      ...mobileStyles.secondaryButton,
      marginTop: dims.spacing.m,
    },
    logoutButtonText: {
      ...mobileStyles.buttonText,
      color: theme.colors.text,
    },
  });

  const renderProfileTab = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>First Name</Text>
          <Controller
            control={control}
            name="first_name"
            rules={{ required: 'First name is required' }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={styles.input}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Enter your first name"
                placeholderTextColor={theme.colors.textSecondary}
              />
            )}
          />
          {errors.first_name && (
            <Text style={{ color: theme.colors.error, fontSize: 12, marginTop: 4 }}>
              {errors.first_name.message}
            </Text>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Last Name</Text>
          <Controller
            control={control}
            name="last_name"
            rules={{ required: 'Last name is required' }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={styles.input}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Enter your last name"
                placeholderTextColor={theme.colors.textSecondary}
              />
            )}
          />
          {errors.last_name && (
            <Text style={{ color: theme.colors.error, fontSize: 12, marginTop: 4 }}>
              {errors.last_name.message}
            </Text>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <Controller
            control={control}
            name="email"
            rules={{ 
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Please enter a valid email address',
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={styles.input}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Enter your email"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            )}
          />
          {errors.email && (
            <Text style={{ color: theme.colors.error, fontSize: 12, marginTop: 4 }}>
              {errors.email.message}
            </Text>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Bio</Text>
          <Controller
            control={control}
            name="bio"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={styles.textArea}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Tell us about yourself"
                placeholderTextColor={theme.colors.textSecondary}
                multiline
                numberOfLines={3}
              />
            )}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Location</Text>
          <Controller
            control={control}
            name="location"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={styles.input}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="City, Country"
                placeholderTextColor={theme.colors.textSecondary}
              />
            )}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Social Links</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Website</Text>
          <Controller
            control={control}
            name="website"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={styles.input}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="https://yourwebsite.com"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="url"
                autoCapitalize="none"
              />
            )}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>LinkedIn</Text>
          <Controller
            control={control}
            name="linkedin"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={styles.input}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="https://linkedin.com/in/yourprofile"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="url"
                autoCapitalize="none"
              />
            )}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>GitHub</Text>
          <Controller
            control={control}
            name="github"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={styles.input}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="https://github.com/yourusername"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="url"
                autoCapitalize="none"
              />
            )}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Twitter</Text>
          <Controller
            control={control}
            name="twitter"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={styles.input}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="https://twitter.com/yourusername"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="url"
                autoCapitalize="none"
              />
            )}
          />
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSubmit(onSubmit)} disabled={isLoading}>
        <Text style={styles.buttonText}>
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderNotificationsTab = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notification Preferences</Text>
        
        {Object.entries(notificationSettings).map(([key, value]) => (
          <View key={key} style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.switchLabel}>
                {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Text>
              <Text style={styles.switchDescription}>
                {key.includes('goal') && 'Get notified about goal-related updates'}
                {key.includes('pathway') && 'Get notified about learning pathway updates'}
                {key.includes('achievement') && 'Get notified when you unlock achievements'}
                {key.includes('streak') && 'Get notified about your learning streaks'}
                {key.includes('match') && 'Get notified about new team matches'}
                {key.includes('insight') && 'Get notified about new insights'}
                {key.includes('system') && 'Get notified about system updates'}
                {key.includes('email') && 'Receive notifications via email'}
                {key.includes('push') && 'Receive push notifications'}
                {key.includes('in_app') && 'Receive in-app notifications'}
              </Text>
            </View>
            <Switch
              value={value}
              onValueChange={(newValue) => updateNotificationSetting(key as keyof NotificationSettings, newValue)}
              trackColor={{ false: theme.colors.outline, true: theme.colors.primary }}
              thumbColor={value ? theme.colors.onPrimary : theme.colors.surface}
            />
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderPrivacyTab = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy Settings</Text>
        
        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.switchLabel}>Public Profile</Text>
            <Text style={styles.switchDescription}>
              Allow other users to view your profile
            </Text>
          </View>
          <Switch
            value={true}
            onValueChange={() => {}}
            trackColor={{ false: theme.colors.outline, true: theme.colors.primary }}
            thumbColor={theme.colors.onPrimary}
          />
        </View>

        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.switchLabel}>Show Activity</Text>
            <Text style={styles.switchDescription}>
              Show your recent activity to other users
            </Text>
          </View>
          <Switch
            value={true}
            onValueChange={() => {}}
            trackColor={{ false: theme.colors.outline, true: theme.colors.primary }}
            thumbColor={theme.colors.onPrimary}
          />
        </View>

        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.switchLabel}>Show Goals</Text>
            <Text style={styles.switchDescription}>
              Allow other users to see your public goals
            </Text>
          </View>
          <Switch
            value={false}
            onValueChange={() => {}}
            trackColor={{ false: theme.colors.outline, true: theme.colors.primary }}
            thumbColor={theme.colors.surface}
          />
        </View>
      </View>
    </ScrollView>
  );

  const renderAccountTab = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Management</Text>
        
        <TouchableOpacity style={styles.button} onPress={handleChangePassword}>
          <Text style={styles.buttonText}>Change Password</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Sign Out</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.dangerButton} onPress={handleDeleteAccount}>
          <Text style={styles.dangerButtonText}>Delete Account</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'profile' && styles.activeTab]}
          onPress={() => setActiveTab('profile')}
        >
          <Text style={[styles.tabText, activeTab === 'profile' && styles.activeTabText]}>
            Profile
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'notifications' && styles.activeTab]}
          onPress={() => setActiveTab('notifications')}
        >
          <Text style={[styles.tabText, activeTab === 'notifications' && styles.activeTabText]}>
            Notifications
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'privacy' && styles.activeTab]}
          onPress={() => setActiveTab('privacy')}
        >
          <Text style={[styles.tabText, activeTab === 'privacy' && styles.activeTabText]}>
            Privacy
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'account' && styles.activeTab]}
          onPress={() => setActiveTab('account')}
        >
          <Text style={[styles.tabText, activeTab === 'account' && styles.activeTabText]}>
            Account
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'profile' && renderProfileTab()}
      {activeTab === 'notifications' && renderNotificationsTab()}
      {activeTab === 'privacy' && renderPrivacyTab()}
      {activeTab === 'account' && renderAccountTab()}
    </SafeAreaView>
  );
};

export default ProfileSettingsScreen;
