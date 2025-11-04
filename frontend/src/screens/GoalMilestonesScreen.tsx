import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { showMessage } from 'react-native-flash-message';

import { useTheme } from '../contexts/ThemeContext';
import { apiService } from '../services/api';
import { Goal, GoalMilestone } from '../types/outvier';
import { createMobileStyles, getResponsiveDimensions } from '../styles/mobileLayout';

interface MilestoneForm {
  title: string;
  description: string;
  target_date: string;
}

interface GoalMilestonesScreenProps {
  navigation: any;
  route: {
    params: {
      goal: Goal;
    };
  };
}

const GoalMilestonesScreen: React.FC<GoalMilestonesScreenProps> = ({ navigation, route }) => {
  const { theme } = useTheme();
  const [milestones, setMilestones] = useState<GoalMilestone[]>(goal.milestones || []);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<GoalMilestone | null>(null);

  const { goal } = route.params;

  const dims = getResponsiveDimensions();
  const mobileStyles = createMobileStyles(theme);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<MilestoneForm>({
    defaultValues: {
      title: '',
      description: '',
      target_date: '',
    },
  });

  const onSubmit = async (data: MilestoneForm) => {
    try {
      setIsLoading(true);
      
      const milestoneData = {
        ...data,
        target_date: new Date(data.target_date).toISOString(),
        goal: goal.id,
      };

      let response;
      if (editingMilestone) {
        // Update existing milestone
        response = await apiService.patch(`/outvier/goals/${goal.id}/milestones/${editingMilestone.id}/`, milestoneData);
      } else {
        // Create new milestone
        response = await apiService.post(`/outvier/goals/${goal.id}/milestones/`, milestoneData);
      }
      
      if (response.data) {
        if (editingMilestone) {
          setMilestones(prev => prev.map(m => m.id === editingMilestone.id ? response.data : m));
        } else {
          setMilestones(prev => [...prev, response.data]);
        }
        
        showMessage({
          message: `Milestone ${editingMilestone ? 'updated' : 'created'} successfully`,
          type: 'success',
          duration: 3000,
        });
        
        setShowAddModal(false);
        setEditingMilestone(null);
        reset();
      }
    } catch (error: any) {
      console.error('Milestone operation failed:', error);
      
      const errorMessage = error.response?.data?.detail || 
                          `Failed to ${editingMilestone ? 'update' : 'create'} milestone. Please try again.`;
      
      showMessage({
        message: errorMessage,
        type: 'danger',
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (milestone: GoalMilestone) => {
    setEditingMilestone(milestone);
    reset({
      title: milestone.title,
      description: milestone.description,
      target_date: milestone.target_date.split('T')[0],
    });
    setShowAddModal(true);
  };

  const handleDelete = (milestone: GoalMilestone) => {
    Alert.alert(
      'Delete Milestone',
      'Are you sure you want to delete this milestone?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteMilestone(milestone.id),
        },
      ]
    );
  };

  const deleteMilestone = async (milestoneId: number) => {
    try {
      await apiService.delete(`/outvier/goals/${goal.id}/milestones/${milestoneId}/`);
      
      setMilestones(prev => prev.filter(m => m.id !== milestoneId));
      
      showMessage({
        message: 'Milestone deleted successfully',
        type: 'success',
        duration: 3000,
      });
    } catch (error: any) {
      console.error('Milestone deletion failed:', error);
      
      showMessage({
        message: 'Failed to delete milestone. Please try again.',
        type: 'danger',
        duration: 4000,
      });
    }
  };

  const toggleMilestoneCompletion = async (milestone: GoalMilestone) => {
    try {
      const response = await apiService.patch(`/outvier/goals/${goal.id}/milestones/${milestone.id}/`, {
        is_completed: !milestone.is_completed,
        completed_date: !milestone.is_completed ? new Date().toISOString() : null,
      });
      
      if (response.data) {
        setMilestones(prev => prev.map(m => m.id === milestone.id ? response.data : m));
        
        showMessage({
          message: `Milestone ${milestone.is_completed ? 'reopened' : 'completed'}`,
          type: 'success',
          duration: 3000,
        });
      }
    } catch (error: any) {
      console.error('Milestone toggle failed:', error);
      
      showMessage({
        message: 'Failed to update milestone. Please try again.',
        type: 'danger',
        duration: 4000,
      });
    }
  };

  const openAddModal = () => {
    setEditingMilestone(null);
    reset();
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingMilestone(null);
    reset();
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
    addButton: {
      padding: dims.spacing.s,
      backgroundColor: theme.colors.primary,
      borderRadius: 8,
    },
    content: {
      flex: 1,
      paddingHorizontal: dims.layout.screenPadding,
    },
    milestoneCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: dims.spacing.m,
      marginBottom: dims.spacing.m,
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.primary,
    },
    milestoneCardCompleted: {
      borderLeftColor: theme.colors.success,
      opacity: 0.7,
    },
    milestoneHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: dims.spacing.s,
    },
    milestoneTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      flex: 1,
    },
    milestoneTitleCompleted: {
      textDecorationLine: 'line-through',
      color: theme.colors.textSecondary,
    },
    milestoneActions: {
      flexDirection: 'row',
      gap: dims.spacing.s,
    },
    actionButton: {
      padding: dims.spacing.xs,
    },
    milestoneDescription: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginBottom: dims.spacing.s,
    },
    milestoneDate: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    milestoneDateOverdue: {
      color: theme.colors.error,
      fontWeight: '600',
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: dims.spacing.xxl,
    },
    emptyIcon: {
      marginBottom: dims.spacing.m,
    },
    emptyText: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: dims.spacing.m,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      padding: dims.layout.screenPadding,
    },
    modal: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: dims.spacing.l,
      maxHeight: '80%',
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: dims.spacing.l,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.text,
    },
    closeButton: {
      padding: dims.spacing.s,
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
      backgroundColor: theme.colors.background,
    },
    textArea: {
      ...mobileStyles.input,
      backgroundColor: theme.colors.background,
      height: 80,
      textAlignVertical: 'top',
    },
    button: {
      ...mobileStyles.primaryButton,
      marginTop: dims.spacing.m,
    },
    buttonText: mobileStyles.buttonText,
    cancelButton: {
      ...mobileStyles.secondaryButton,
      marginTop: dims.spacing.s,
    },
    cancelButtonText: {
      ...mobileStyles.buttonText,
      color: theme.colors.text,
    },
    errorText: {
      color: theme.colors.error,
      fontSize: 12,
      marginTop: 4,
    },
  });

  const isOverdue = (targetDate: string) => {
    return new Date(targetDate) < new Date() && !milestones.find(m => m.target_date === targetDate)?.is_completed;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Milestones</Text>
        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Icon name="add" size={20} color={theme.colors.onPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {milestones.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="flag" size={48} color={theme.colors.textSecondary} style={styles.emptyIcon} />
            <Text style={styles.emptyText}>No milestones yet</Text>
            <Text style={styles.emptyText}>Add milestones to break down your goal into manageable steps</Text>
          </View>
        ) : (
          milestones.map((milestone) => (
            <View
              key={milestone.id}
              style={[
                styles.milestoneCard,
                milestone.is_completed && styles.milestoneCardCompleted,
              ]}
            >
              <View style={styles.milestoneHeader}>
                <Text
                  style={[
                    styles.milestoneTitle,
                    milestone.is_completed && styles.milestoneTitleCompleted,
                  ]}
                >
                  {milestone.title}
                </Text>
                <View style={styles.milestoneActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => toggleMilestoneCompletion(milestone)}
                  >
                    <Icon
                      name={milestone.is_completed ? "undo" : "check"}
                      size={20}
                      color={milestone.is_completed ? theme.colors.warning : theme.colors.success}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleEdit(milestone)}
                  >
                    <Icon name="edit" size={20} color={theme.colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDelete(milestone)}
                  >
                    <Icon name="delete" size={20} color={theme.colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
              
              {milestone.description && (
                <Text style={styles.milestoneDescription}>{milestone.description}</Text>
              )}
              
              <Text
                style={[
                  styles.milestoneDate,
                  isOverdue(milestone.target_date) && styles.milestoneDateOverdue,
                ]}
              >
                Target: {new Date(milestone.target_date).toLocaleDateString()}
                {milestone.is_completed && milestone.completed_date && (
                  ` • Completed: ${new Date(milestone.completed_date).toLocaleDateString()}`
                )}
              </Text>
            </View>
          ))
        )}
      </ScrollView>

      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingMilestone ? 'Edit Milestone' : 'Add Milestone'}
              </Text>
              <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                <Icon name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <Controller
              control={control}
              name="title"
              rules={{ required: 'Title is required' }}
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Title *</Text>
                  <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="Enter milestone title"
                    placeholderTextColor={theme.colors.textSecondary}
                  />
                  {errors.title && (
                    <Text style={styles.errorText}>{errors.title.message}</Text>
                  )}
                </View>
              )}
            />

            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Description</Text>
                  <TextInput
                    style={styles.textArea}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="Describe this milestone"
                    placeholderTextColor={theme.colors.textSecondary}
                    multiline
                    numberOfLines={3}
                  />
                </View>
              )}
            />

            <Controller
              control={control}
              name="target_date"
              rules={{ required: 'Target date is required' }}
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Target Date *</Text>
                  <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={theme.colors.textSecondary}
                  />
                  {errors.target_date && (
                    <Text style={styles.errorText}>{errors.target_date.message}</Text>
                  )}
                </View>
              )}
            />

            <TouchableOpacity
              style={styles.button}
              onPress={handleSubmit(onSubmit)}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Saving...' : (editingMilestone ? 'Update Milestone' : 'Add Milestone')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default GoalMilestonesScreen;
