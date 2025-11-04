import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { showMessage } from 'react-native-flash-message';
import { Picker } from '@react-native-picker/picker';

import { useTheme } from '../contexts/ThemeContext';
import { apiService } from '../services/api';
import { Goal } from '../types/outvier';
import { createMobileStyles, getResponsiveDimensions } from '../styles/mobileLayout';

interface EditGoalForm {
  title: string;
  description: string;
  goal_type: string;
  priority: string;
  target_date: string;
  target_value?: number;
  unit?: string;
  is_public: boolean;
  allow_mentorship: boolean;
  reminder_frequency: string;
}

interface EditGoalScreenProps {
  navigation: any;
  route: {
    params: {
      goal: Goal;
    };
  };
}

const EditGoalScreen: React.FC<EditGoalScreenProps> = ({ navigation, route }) => {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { goal } = route.params;

  const dims = getResponsiveDimensions();
  const mobileStyles = createMobileStyles(theme);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EditGoalForm>({
    defaultValues: {
      title: goal.title,
      description: goal.description,
      goal_type: goal.goal_type,
      priority: goal.priority,
      target_date: goal.target_date.split('T')[0], // Convert to YYYY-MM-DD format
      target_value: goal.target_value || 0,
      unit: goal.unit || '',
      is_public: goal.is_public,
      allow_mentorship: goal.allow_mentorship,
      reminder_frequency: goal.reminder_frequency,
    },
  });

  const onSubmit = async (data: EditGoalForm) => {
    try {
      setIsLoading(true);
      
      const response = await apiService.patch(`/outvier/goals/${goal.id}/`, {
        ...data,
        target_date: new Date(data.target_date).toISOString(),
      });
      
      if (response.data) {
        showMessage({
          message: 'Goal updated successfully',
          type: 'success',
          duration: 3000,
        });
        navigation.goBack();
      }
    } catch (error: any) {
      console.error('Goal update failed:', error);
      
      const errorMessage = error.response?.data?.detail || 
                          'Failed to update goal. Please try again.';
      
      showMessage({
        message: errorMessage,
        type: 'danger',
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Goal',
      'Are you sure you want to delete this goal? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: deleteGoal,
        },
      ]
    );
  };

  const deleteGoal = async () => {
    try {
      setIsDeleting(true);
      
      await apiService.delete(`/outvier/goals/${goal.id}/`);
      
      showMessage({
        message: 'Goal deleted successfully',
        type: 'success',
        duration: 3000,
      });
      
      navigation.goBack();
    } catch (error: any) {
      console.error('Goal deletion failed:', error);
      
      const errorMessage = error.response?.data?.detail || 
                          'Failed to delete goal. Please try again.';
      
      showMessage({
        message: errorMessage,
        type: 'danger',
        duration: 4000,
      });
    } finally {
      setIsDeleting(false);
    }
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
    deleteButton: {
      padding: dims.spacing.s,
    },
    content: {
      flex: 1,
      paddingHorizontal: dims.layout.screenPadding,
    },
    section: {
      marginBottom: dims.spacing.l,
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
      height: 100,
      textAlignVertical: 'top',
    },
    picker: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.outline,
    },
    switchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: dims.spacing.s,
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
    errorText: {
      color: theme.colors.error,
      fontSize: 12,
      marginTop: 4,
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Goal</Text>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Icon name="delete" size={24} color={theme.colors.error} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Title *</Text>
            <Controller
              control={control}
              name="title"
              rules={{ required: 'Title is required' }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Enter goal title"
                  placeholderTextColor={theme.colors.textSecondary}
                />
              )}
            />
            {errors.title && (
              <Text style={styles.errorText}>{errors.title.message}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.textArea}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Describe your goal"
                  placeholderTextColor={theme.colors.textSecondary}
                  multiline
                  numberOfLines={4}
                />
              )}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Goal Type *</Text>
            <Controller
              control={control}
              name="goal_type"
              rules={{ required: 'Goal type is required' }}
              render={({ field: { onChange, value } }) => (
                <View style={styles.picker}>
                  <Picker
                    selectedValue={value}
                    onValueChange={onChange}
                    style={{ color: theme.colors.text }}
                  >
                    <Picker.Item label="Personal" value="personal" />
                    <Picker.Item label="Professional" value="professional" />
                    <Picker.Item label="Skill" value="skill" />
                    <Picker.Item label="Project" value="project" />
                    <Picker.Item label="Network" value="network" />
                    <Picker.Item label="Learning" value="learning" />
                    <Picker.Item label="Fitness" value="fitness" />
                    <Picker.Item label="Financial" value="financial" />
                  </Picker>
                </View>
              )}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Priority *</Text>
            <Controller
              control={control}
              name="priority"
              rules={{ required: 'Priority is required' }}
              render={({ field: { onChange, value } }) => (
                <View style={styles.picker}>
                  <Picker
                    selectedValue={value}
                    onValueChange={onChange}
                    style={{ color: theme.colors.text }}
                  >
                    <Picker.Item label="Low" value="low" />
                    <Picker.Item label="Medium" value="medium" />
                    <Picker.Item label="High" value="high" />
                    <Picker.Item label="Critical" value="critical" />
                  </Picker>
                </View>
              )}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Target Date *</Text>
            <Controller
              control={control}
              name="target_date"
              rules={{ required: 'Target date is required' }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={theme.colors.textSecondary}
                />
              )}
            />
            {errors.target_date && (
              <Text style={styles.errorText}>{errors.target_date.message}</Text>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Target Value (Optional)</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Target Value</Text>
            <Controller
              control={control}
              name="target_value"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  value={value?.toString() || ''}
                  onChangeText={(text) => onChange(parseInt(text) || 0)}
                  onBlur={onBlur}
                  placeholder="Enter target value"
                  placeholderTextColor={theme.colors.textSecondary}
                  keyboardType="numeric"
                />
              )}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Unit</Text>
            <Controller
              control={control}
              name="unit"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="e.g., hours, days, books, etc."
                  placeholderTextColor={theme.colors.textSecondary}
                />
              )}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Reminder Frequency</Text>
            <Controller
              control={control}
              name="reminder_frequency"
              render={({ field: { onChange, value } }) => (
                <View style={styles.picker}>
                  <Picker
                    selectedValue={value}
                    onValueChange={onChange}
                    style={{ color: theme.colors.text }}
                  >
                    <Picker.Item label="None" value="none" />
                    <Picker.Item label="Daily" value="daily" />
                    <Picker.Item label="Weekly" value="weekly" />
                    <Picker.Item label="Monthly" value="monthly" />
                  </Picker>
                </View>
              )}
            />
          </View>

          <Controller
            control={control}
            name="is_public"
            render={({ field: { onChange, value } }) => (
              <View style={styles.switchRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.switchLabel}>Public Goal</Text>
                  <Text style={styles.switchDescription}>
                    Allow other users to see this goal
                  </Text>
                </View>
                <Switch
                  value={value}
                  onValueChange={onChange}
                  trackColor={{ false: theme.colors.outline, true: theme.colors.primary }}
                  thumbColor={value ? theme.colors.onPrimary : theme.colors.surface}
                />
              </View>
            )}
          />

          <Controller
            control={control}
            name="allow_mentorship"
            render={({ field: { onChange, value } }) => (
              <View style={styles.switchRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.switchLabel}>Allow Mentorship</Text>
                  <Text style={styles.switchDescription}>
                    Allow others to offer mentorship for this goal
                  </Text>
                </View>
                <Switch
                  value={value}
                  onValueChange={onChange}
                  trackColor={{ false: theme.colors.outline, true: theme.colors.primary }}
                  thumbColor={value ? theme.colors.onPrimary : theme.colors.surface}
                />
              </View>
            )}
          />
        </View>

        <TouchableOpacity 
          style={styles.button} 
          onPress={handleSubmit(onSubmit)}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EditGoalScreen;
