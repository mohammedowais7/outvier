import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

import { useTheme } from '../contexts/ThemeContext';
import { apiService } from '../services/api';
import { Goal, GoalMilestone } from '../types/outvier';
import LoadingScreen from '../components/LoadingScreen';
import ErrorScreen from '../components/ErrorScreen';

const { width } = Dimensions.get('window');

interface EnhancedGoalScreenProps {
  route: {
    params: {
      goalId: number;
    };
  };
  navigation: any;
}

const EnhancedGoalScreen: React.FC<EnhancedGoalScreenProps> = ({ route, navigation }) => {
  const { goalId } = route.params;
  const { theme } = useTheme();
  const queryClient = useQueryClient();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<GoalMilestone | null>(null);

  // Fetch goal details
  const { data: goal, isLoading, error, refetch } = useQuery<Goal>({
    queryKey: ['goal', goalId],
    queryFn: () => apiService.get(`/outvier/goals/${goalId}/`).then(res => res.data),
  });

  // Update goal mutation
  const updateGoalMutation = useMutation({
    mutationFn: (data: any) => apiService.patch(`/outvier/goals/${goalId}/`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goal', goalId] });
      setShowEditModal(false);
      Alert.alert('Success', 'Goal updated successfully!');
    },
    onError: (error: any) => {
      Alert.alert('Error', error?.response?.data?.detail || 'Failed to update goal');
    },
  });

  // Update progress mutation
  const updateProgressMutation = useMutation({
    mutationFn: (data: any) => apiService.post(`/outvier/goals/${goalId}/update_progress/`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goal', goalId] });
      setShowProgressModal(false);
      Alert.alert('Success', 'Progress updated successfully!');
    },
    onError: (error: any) => {
      Alert.alert('Error', error?.response?.data?.detail || 'Failed to update progress');
    },
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return theme.colors.error;
      case 'high': return theme.colors.warning;
      case 'medium': return theme.colors.info;
      case 'low': return theme.colors.success;
      default: return theme.colors.textSecondary;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return theme.colors.success;
      case 'in_progress': return theme.colors.primary;
      case 'on_hold': return theme.colors.warning;
      case 'cancelled': return theme.colors.error;
      default: return theme.colors.textSecondary;
    }
  };

  const getProgressStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return theme.colors.success;
      case 'overdue': return theme.colors.error;
      case 'urgent': return theme.colors.warning;
      case 'almost_done': return theme.colors.info;
      default: return theme.colors.primary;
    }
  };

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
    metaInfo: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: 16,
    },
    metaChip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.primaryContainer,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      marginRight: 8,
      marginBottom: 8,
    },
    metaChipText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.primary,
      marginLeft: 4,
    },
    progressContainer: {
      marginBottom: 16,
    },
    progressHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    progressLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
    },
    progressValue: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.colors.primary,
    },
    progressBar: {
      height: 8,
      backgroundColor: theme.colors.outline,
      borderRadius: 4,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: theme.colors.primary,
      borderRadius: 4,
    },
    content: {
      flex: 1,
      padding: 20,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: 12,
    },
    description: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      lineHeight: 24,
    },
    milestoneCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.primary,
    },
    milestoneHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    milestoneTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      flex: 1,
    },
    milestoneStatus: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.success,
    },
    milestoneDate: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    actionButtons: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingVertical: 20,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 8,
      backgroundColor: theme.colors.primary,
    },
    actionButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.onPrimary,
      marginLeft: 6,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 24,
      width: width * 0.9,
      maxHeight: '80%',
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: 20,
      textAlign: 'center',
    },
    inputGroup: {
      marginBottom: 16,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 8,
    },
    input: {
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      color: theme.colors.text,
    },
    picker: {
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      borderRadius: 8,
    },
    modalActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 24,
    },
    modalButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
      marginHorizontal: 6,
    },
    modalButtonText: {
      fontSize: 16,
      fontWeight: '600',
    },
  });

  if (isLoading) return <LoadingScreen />;
  if (error) return <ErrorScreen onRetry={refetch} />;
  if (!goal) return <ErrorScreen message="Goal not found" onRetry={refetch} />;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{goal.title}</Text>
        
        <View style={styles.metaInfo}>
          <View style={[styles.metaChip, { backgroundColor: getPriorityColor(goal.priority) + '20' }]}>
            <Icon name="flag" size={12} color={getPriorityColor(goal.priority)} />
            <Text style={[styles.metaChipText, { color: getPriorityColor(goal.priority) }]}>
              {goal.priority.toUpperCase()}
            </Text>
          </View>
          
          <View style={[styles.metaChip, { backgroundColor: getStatusColor(goal.status) + '20' }]}>
            <Icon name="circle" size={12} color={getStatusColor(goal.status)} />
            <Text style={[styles.metaChipText, { color: getStatusColor(goal.status) }]}>
              {goal.status.replace('_', ' ').toUpperCase()}
            </Text>
          </View>
          
          <View style={[styles.metaChip, { backgroundColor: getProgressStatusColor(goal.progress_status) + '20' }]}>
            <Icon name="trending-up" size={12} color={getProgressStatusColor(goal.progress_status)} />
            <Text style={[styles.metaChipText, { color: getProgressStatusColor(goal.progress_status) }]}>
              {goal.progress_status.replace('_', ' ').toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Progress</Text>
            <Text style={styles.progressValue}>{goal.progress_percentage}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${goal.progress_percentage}%` }
              ]} 
            />
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{goal.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Timeline</Text>
          <View style={styles.metaInfo}>
            <View style={styles.metaChip}>
              <Icon name="play-arrow" size={12} color={theme.colors.primary} />
              <Text style={styles.metaChipText}>Start: {goal.start_date}</Text>
            </View>
            <View style={styles.metaChip}>
              <Icon name="flag" size={12} color={theme.colors.primary} />
              <Text style={styles.metaChipText}>Target: {goal.target_date}</Text>
            </View>
            <View style={styles.metaChip}>
              <Icon name="schedule" size={12} color={theme.colors.primary} />
              <Text style={styles.metaChipText}>{goal.days_remaining} days left</Text>
            </View>
          </View>
        </View>

        {goal.milestones && goal.milestones.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Milestones</Text>
            {goal.milestones.map((milestone) => (
              <View key={milestone.id} style={styles.milestoneCard}>
                <View style={styles.milestoneHeader}>
                  <Text style={styles.milestoneTitle}>{milestone.title}</Text>
                  {milestone.is_completed && (
                    <Text style={styles.milestoneStatus}>✓ Completed</Text>
                  )}
                </View>
                <Text style={styles.milestoneDate}>
                  Target: {milestone.target_date}
                  {milestone.completed_date && ` • Completed: ${milestone.completed_date}`}
                </Text>
              </View>
            ))}
          </View>
        )}

        {goal.related_skills_names && goal.related_skills_names.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Related Skills</Text>
            <View style={styles.metaInfo}>
              {goal.related_skills_names.map((skill, index) => (
                <View key={index} style={styles.metaChip}>
                  <Icon name="school" size={12} color={theme.colors.primary} />
                  <Text style={styles.metaChipText}>{skill}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => setShowProgressModal(true)}
        >
          <Icon name="trending-up" size={16} color={theme.colors.onPrimary} />
          <Text style={styles.actionButtonText}>Update Progress</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: theme.colors.secondary }]}
          onPress={() => setShowEditModal(true)}
        >
          <Icon name="edit" size={16} color={theme.colors.onPrimary} />
          <Text style={styles.actionButtonText}>Edit Goal</Text>
        </TouchableOpacity>
      </View>

      {/* Progress Update Modal */}
      <Modal
        visible={showProgressModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowProgressModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Progress</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Progress Percentage</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter progress percentage (0-100)"
                keyboardType="numeric"
                maxLength={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Time Spent (minutes)</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter time spent on this goal"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Notes</Text>
              <TextInput
                style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                placeholder="Add progress notes..."
                multiline
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.colors.outline }]}
                onPress={() => setShowProgressModal(false)}
              >
                <Text style={[styles.modalButtonText, { color: theme.colors.text }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => {
                  // Handle progress update
                  setShowProgressModal(false);
                }}
              >
                <Text style={[styles.modalButtonText, { color: theme.colors.onPrimary }]}>
                  Update Progress
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default EnhancedGoalScreen;

