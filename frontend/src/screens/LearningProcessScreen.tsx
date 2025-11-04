import React, { useState, useEffect } from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '../contexts/ThemeContext';
import { apiService } from '../services/api';
import { GrowthPathway, PathwayStep } from '../types/outvier';
import LoadingScreen from '../components/LoadingScreen';
import ErrorScreen from '../components/ErrorScreen';
import { 
  mockPathway, 
  getMockPathway,
  getMockStepsForPathway, 
  updateStepCompletion, 
  calculatePathwayProgress, 
  getNextAvailableStep, 
  arePrerequisitesMet, 
  mockLearningContent 
} from '../services/mockData';

const { width } = Dimensions.get('window');

interface LearningProcessScreenProps {
  route: {
    params: {
      pathwayId: number;
    };
  };
  navigation: any;
}

const LearningProcessScreen: React.FC<LearningProcessScreenProps> = ({ route, navigation }) => {
  const { pathwayId } = route.params;
  const { theme } = useTheme();
  const queryClient = useQueryClient();
  const [selectedStep, setSelectedStep] = useState<PathwayStep | null>(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showLearningModal, setShowLearningModal] = useState(false);
  const [completionData, setCompletionData] = useState({
    time_spent: '',
    quiz_score: '',
    difficulty_rating: 0,
    helpfulness_rating: 0,
    notes: '',
  });
  const [localPathway, setLocalPathway] = useState<GrowthPathway | null>(null);
  const [localSteps, setLocalSteps] = useState<PathwayStep[]>([]);
  const [useMockData, setUseMockData] = useState(false);

  // Use real API data with fallback to mock data
  const { data: apiPathway, isLoading: pathwayLoading, error: pathwayError } = useQuery<GrowthPathway>({
    queryKey: ['pathway', pathwayId],
    queryFn: () => apiService.get(`/outvier/pathways/${pathwayId}/`).then(res => res.data),
    retry: 1,
    onError: () => {
      console.log('API failed, falling back to mock data');
      setUseMockData(true);
      setLocalPathway(getMockPathway(Number(pathwayId)));
      setLocalSteps(getMockStepsForPathway(Number(pathwayId)));
    }
  });

  const { data: apiSteps, isLoading: stepsLoading, error: stepsError } = useQuery<PathwayStep[]>({
    queryKey: ['pathway-steps', pathwayId],
    queryFn: () => apiService.get(`/outvier/pathway-steps/?pathway_id=${pathwayId}`).then(res => res.data.results || res.data),
    enabled: !!pathwayId && !useMockData,
    retry: 1,
    onError: () => {
      console.log('Steps API failed, falling back to mock data');
      setUseMockData(true);
      setLocalSteps(getMockStepsForPathway(Number(pathwayId)));
    }
  });

  // Use API data if available, otherwise use local/mock data
  const pathway = apiPathway || localPathway;
  const steps = apiSteps || localSteps || [];
  const isLoading = pathwayLoading || stepsLoading;
  const error = pathwayError || stepsError;

  // Debug logging
  console.log('LearningProcessScreen - pathwayId:', pathwayId, 'type:', typeof pathwayId);
  console.log('LearningProcessScreen - pathway:', pathway?.title);
  console.log('LearningProcessScreen - steps count:', steps?.length);
  console.log('LearningProcessScreen - useMockData:', useMockData);
  console.log('LearningProcessScreen - mock steps:', getMockStepsForPathway(Number(pathwayId)));


  // Complete step mutation - works with both API and mock data
  const completeStepMutation = useMutation({
    mutationFn: ({ stepId, data }: { stepId: number; data: any }) => {
      if (useMockData) {
        // Use mock data logic
        const updatedStep = updateStepCompletion(stepId, data);
        if (updatedStep) {
          // Update local steps
          setLocalSteps(prevSteps => 
            prevSteps.map(step => 
              step.id === stepId ? updatedStep : step
            )
          );
          
          // Calculate new progress
          const newProgress = calculatePathwayProgress(pathwayId);
          
          // Update pathway progress
          setLocalPathway(prevPathway => ({
            ...prevPathway,
            progress_percentage: newProgress,
            completion_rate: newProgress / 100,
            current_step: Math.max(prevPathway?.current_step || 0, updatedStep.step_number),
            is_completed: newProgress === 100,
            completed_at: newProgress === 100 ? new Date().toISOString() : null,
            last_activity: new Date().toISOString()
          }));
          
          return Promise.resolve(updatedStep);
        }
        throw new Error('Step not found');
      } else {
        // Use API - complete step using the correct endpoint
        return apiService.post(`/outvier/pathway-steps/${stepId}/complete_step/`, {
          time_spent: data.time_spent,
          quiz_score: data.quiz_score,
          difficulty_rating: data.difficulty_rating,
          helpfulness_rating: data.helpfulness_rating,
          notes: data.notes
        }).then(res => res.data);
      }
    },
    onSuccess: () => {
      setShowCompletionModal(false);
      setSelectedStep(null);
      setCompletionData({
        time_spent: '',
        quiz_score: '',
        difficulty_rating: 0,
        helpfulness_rating: 0,
        notes: '',
      });
      
      if (useMockData) {
        Alert.alert('Success!', 'Step completed successfully! 🎉');
      } else {
        // Invalidate queries to refresh data from API
        queryClient.invalidateQueries({ queryKey: ['pathway', pathwayId] });
        queryClient.invalidateQueries({ queryKey: ['pathway-steps', pathwayId] });
        Alert.alert('Success!', 'Step completed successfully! 🎉');
      }
    },
    onError: (error: any) => {
      Alert.alert('Error', error?.response?.data?.detail || error?.message || 'Failed to complete step');
    },
  });

  const handleCompleteStep = (step: PathwayStep) => {
    setSelectedStep(step);
    setShowCompletionModal(true);
  };

  const handleOpenLearningContent = (step: PathwayStep) => {
    setSelectedStep(step);
    setShowLearningModal(true);
  };

  const handleContinueLearning = () => {
    console.log('handleContinueLearning - steps:', steps);
    console.log('handleContinueLearning - steps length:', steps?.length);
    
    // Check if steps are loaded
    if (!steps || steps.length === 0) {
      Alert.alert(
        'No Steps Available',
        'No learning steps are available for this pathway yet. Please try again later.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }
    
    // Find the next incomplete step from the actual steps data
    const nextStep = steps.find(step => !step.is_completed);
    console.log('handleContinueLearning - nextStep:', nextStep);
    
    if (nextStep) {
      Alert.alert(
        'Continue Learning',
        `Next step: ${nextStep.title}\n\n${nextStep.description}`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Start Step', onPress: () => {
            // Mark this step as the current step and show success
            Alert.alert(
              'Step Started! 🚀', 
              `You can now work on: ${nextStep.title}\n\nEstimated time: ${nextStep.estimated_duration} minutes`,
              [{ text: 'Got it!', style: 'default' }]
            );
          }}
        ]
      );
    } else {
      Alert.alert(
        '🎉 Congratulations!', 
        'You have completed all steps in this pathway!\n\nYou are now ready to apply your new skills!',
        [
          { text: 'View Achievements', onPress: () => navigation.navigate('Achievements') },
          { text: 'Back to Dashboard', onPress: () => navigation.navigate('Dashboard', { screen: 'DashboardMain' }) }
        ]
      );
    }
  };

  const getNextStep = () => {
    return steps?.find(step => !step.is_completed);
  };

  const getCurrentStep = () => {
    return steps.find(step => step.step_number === pathway.current_step + 1);
  };

  const submitCompletion = () => {
    if (!selectedStep) return;

    const data = {
      time_spent: parseInt(completionData.time_spent) || 0,
      quiz_score: completionData.quiz_score ? parseInt(completionData.quiz_score) : null,
      difficulty_rating: completionData.difficulty_rating,
      helpfulness_rating: completionData.helpfulness_rating,
      notes: completionData.notes,
    };

    completeStepMutation.mutate({ stepId: selectedStep.id, data });
  };

  const getStepIcon = (stepType: string) => {
    switch (stepType) {
      case 'reading': return 'menu-book';
      case 'video': return 'play-circle';
      case 'exercise': return 'fitness-center';
      case 'quiz': return 'quiz';
      case 'project': return 'build';
      case 'discussion': return 'forum';
      default: return 'school';
    }
  };

  const getStepColor = (step: PathwayStep) => {
    if (step.is_completed) return theme.colors.success;
    if (step.step_number === (pathway?.current_step || 0) + 1) return theme.colors.primary;
    return theme.colors.outline;
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
    subtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      marginBottom: 16,
    },
    progressContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    progressBar: {
      flex: 1,
      height: 8,
      backgroundColor: theme.colors.outline,
      borderRadius: 4,
      marginRight: 12,
    },
    progressFill: {
      height: '100%',
      backgroundColor: theme.colors.primary,
      borderRadius: 4,
    },
    progressText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.primary,
    },
    continueButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 16,
    },
    continueButtonText: {
      color: theme.colors.onPrimary,
      fontSize: 16,
      fontWeight: '700',
      marginLeft: 8,
    },
    completedButton: {
      backgroundColor: theme.colors.success + '20',
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 16,
      borderWidth: 2,
      borderColor: theme.colors.success,
    },
    completedButtonText: {
      color: theme.colors.success,
      fontSize: 16,
      fontWeight: '700',
      marginLeft: 8,
    },
    content: {
      flex: 1,
      padding: 20,
    },
    stepCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      borderWidth: 2,
      borderColor: theme.colors.outline,
    },
    stepHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    stepIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.primaryContainer,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    stepInfo: {
      flex: 1,
    },
    stepTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 4,
    },
    stepMeta: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    stepDuration: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginRight: 12,
    },
    stepType: {
      fontSize: 12,
      color: theme.colors.primary,
      textTransform: 'uppercase',
      fontWeight: '600',
    },
    stepDescription: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      lineHeight: 20,
      marginBottom: 12,
    },
    stepActions: {
      flexDirection: 'column',
      gap: 8,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
    },
    actionButtonText: {
      fontSize: 14,
      fontWeight: '600',
      marginLeft: 6,
    },
    primaryActionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 12,
      marginBottom: 8,
    },
    primaryActionButtonText: {
      fontSize: 16,
      fontWeight: '700',
      marginLeft: 8,
    },
    secondaryActionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
    },
    secondaryActionButtonText: {
      fontSize: 14,
      fontWeight: '600',
      marginLeft: 6,
    },
    lockedStep: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
      backgroundColor: 'rgba(0,0,0,0.05)',
    },
    lockedStepText: {
      fontSize: 14,
      fontWeight: '500',
      marginLeft: 6,
    },
    completedStep: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
      backgroundColor: 'rgba(76, 175, 80, 0.1)',
    },
    completedStepText: {
      fontSize: 14,
      fontWeight: '600',
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
    ratingContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    ratingButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: theme.colors.outline,
    },
    ratingButtonActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
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
    learningSection: {
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: 12,
    },
    learningText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      lineHeight: 20,
      marginBottom: 12,
    },
    contentButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 8,
      alignItems: 'center',
    },
    contentButtonText: {
      color: theme.colors.onPrimary,
      fontSize: 14,
      fontWeight: '600',
    },
    tutorialStep: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    stepNumber: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: theme.colors.primary,
      color: theme.colors.onPrimary,
      fontSize: 12,
      fontWeight: '700',
      textAlign: 'center',
      lineHeight: 24,
      marginRight: 12,
    },
    stepText: {
      flex: 1,
      fontSize: 14,
      color: theme.colors.text,
    },
    requirementItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    requirementText: {
      flex: 1,
      fontSize: 14,
      color: theme.colors.text,
      marginLeft: 8,
    },
    resourceItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 12,
      backgroundColor: theme.colors.primaryContainer,
      borderRadius: 8,
      marginBottom: 8,
    },
    resourceText: {
      flex: 1,
      fontSize: 14,
      color: theme.colors.primary,
      marginLeft: 8,
    },
    fab: {
      position: 'absolute',
      bottom: 20,
      right: 20,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 8,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
    },
    emptyText: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: 8,
    },
    emptySubtext: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
  });

  if (isLoading) return <LoadingScreen />;
  if (error) return <ErrorScreen onRetry={() => {}} />;
  if (!pathway || !steps) return <ErrorScreen message="Pathway not found" onRetry={() => {}} />;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{pathway.title}</Text>
        <Text style={styles.subtitle}>{pathway.description}</Text>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${pathway.progress_percentage || (pathway.completion_rate * 100)}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>{pathway.progress_percentage || Math.round(pathway.completion_rate * 100)}%</Text>
        </View>

        {/* Pathway Status */}
        {pathway.is_completed && (
          <View style={styles.completedButton}>
            <Icon name="check-circle" size={20} color={theme.colors.success} />
            <Text style={styles.completedButtonText}>Pathway Completed!</Text>
          </View>
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {!steps || steps.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No learning steps available yet.</Text>
            <Text style={styles.emptySubtext}>Please check back later or contact support.</Text>
          </View>
        ) : (
          steps.map((step) => (
          <View 
            key={step.id} 
            style={[
              styles.stepCard,
              { borderColor: getStepColor(step) }
            ]}
          >
            <View style={styles.stepHeader}>
              <View style={styles.stepIcon}>
                <Icon 
                  name={getStepIcon(step.step_type)} 
                  size={20} 
                  color={getStepColor(step)} 
                />
              </View>
              <View style={styles.stepInfo}>
                <Text style={styles.stepTitle}>Step {step.step_number}: {step.title}</Text>
                <View style={styles.stepMeta}>
                  <Text style={styles.stepDuration}>{step.estimated_duration} min</Text>
                  <Text style={styles.stepType}>{step.step_type}</Text>
                </View>
              </View>
            </View>

            <Text style={styles.stepDescription}>{step.description}</Text>

            <View style={styles.stepActions}>
              {/* Primary action: Open Content */}
              <TouchableOpacity 
                style={[styles.primaryActionButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => handleOpenLearningContent(step)}
              >
                <Icon name="open-in-new" size={18} color={theme.colors.onPrimary} />
                <Text style={[styles.primaryActionButtonText, { color: theme.colors.onPrimary }]}>
                  Open Content
                </Text>
              </TouchableOpacity>

              {/* Secondary action: Complete (if accessible) */}
              {!step.is_completed && arePrerequisitesMet(step) && (step.step_number <= pathway.current_step + 1) && (
                <TouchableOpacity 
                  style={[styles.secondaryActionButton, { backgroundColor: theme.colors.secondary }]}
                  onPress={() => handleCompleteStep(step)}
                >
                  <Icon name="check" size={16} color={theme.colors.onSecondary} />
                  <Text style={[styles.secondaryActionButtonText, { color: theme.colors.onSecondary }]}>
                    Mark Complete
                  </Text>
                </TouchableOpacity>
              )}

              {/* Locked state */}
              {!step.is_completed && !arePrerequisitesMet(step) && (
                <View style={styles.lockedStep}>
                  <Icon name="lock" size={16} color={theme.colors.outline} />
                  <Text style={[styles.lockedStepText, { color: theme.colors.outline }]}>
                    Complete previous steps first
                  </Text>
                </View>
              )}

              {/* Completed state */}
              {step.is_completed && (
                <View style={styles.completedStep}>
                  <Icon name="check-circle" size={16} color={theme.colors.success} />
                  <Text style={[styles.completedStepText, { color: theme.colors.success }]}>
                    Completed
                  </Text>
                </View>
              )}
            </View>
          </View>
        ))
        )}
      </ScrollView>

      {/* Floating Action Button for Continue Learning */}
      {!pathway.is_completed && (
        <TouchableOpacity 
          style={styles.fab}
          onPress={handleContinueLearning}
        >
          <Icon name="play-arrow" size={24} color={theme.colors.onPrimary} />
        </TouchableOpacity>
      )}

      {/* Completion Modal */}
      <Modal
        visible={showCompletionModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCompletionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Complete Step</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Time Spent (minutes)</Text>
              <TextInput
                style={styles.input}
                value={completionData.time_spent}
                onChangeText={(text) => setCompletionData({ ...completionData, time_spent: text })}
                placeholder="Enter time spent"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Quiz Score (optional)</Text>
              <TextInput
                style={styles.input}
                value={completionData.quiz_score}
                onChangeText={(text) => setCompletionData({ ...completionData, quiz_score: text })}
                placeholder="Enter quiz score (0-100)"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Difficulty Rating</Text>
              <View style={styles.ratingContainer}>
                {[1, 2, 3, 4, 5].map((rating) => (
                  <TouchableOpacity
                    key={rating}
                    style={[
                      styles.ratingButton,
                      completionData.difficulty_rating === rating && styles.ratingButtonActive
                    ]}
                    onPress={() => setCompletionData({ ...completionData, difficulty_rating: rating })}
                  >
                    <Text style={{
                      color: completionData.difficulty_rating === rating 
                        ? theme.colors.onPrimary 
                        : theme.colors.textSecondary
                    }}>
                      {rating}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Helpfulness Rating</Text>
              <View style={styles.ratingContainer}>
                {[1, 2, 3, 4, 5].map((rating) => (
                  <TouchableOpacity
                    key={rating}
                    style={[
                      styles.ratingButton,
                      completionData.helpfulness_rating === rating && styles.ratingButtonActive
                    ]}
                    onPress={() => setCompletionData({ ...completionData, helpfulness_rating: rating })}
                  >
                    <Text style={{
                      color: completionData.helpfulness_rating === rating 
                        ? theme.colors.onPrimary 
                        : theme.colors.textSecondary
                    }}>
                      {rating}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Notes (optional)</Text>
              <TextInput
                style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                value={completionData.notes}
                onChangeText={(text) => setCompletionData({ ...completionData, notes: text })}
                placeholder="Add any notes about this step..."
                multiline
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.colors.outline }]}
                onPress={() => setShowCompletionModal(false)}
              >
                <Text style={[styles.modalButtonText, { color: theme.colors.text }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.colors.primary }]}
                onPress={submitCompletion}
                disabled={completeStepMutation.isPending}
              >
                <Text style={[styles.modalButtonText, { color: theme.colors.onPrimary }]}>
                  {completeStepMutation.isPending ? 'Completing...' : 'Complete Step'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Learning Content Modal */}
      <Modal
        visible={showLearningModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLearningModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {selectedStep?.title}
            </Text>
            
            {selectedStep && mockLearningContent[selectedStep.id as keyof typeof mockLearningContent] && (
              <ScrollView style={{ maxHeight: 400 }}>
                {selectedStep.step_type === 'video' && (
                  <View style={styles.learningSection}>
                    <Text style={styles.sectionTitle}>📹 Video Content</Text>
                    <Text style={styles.learningText}>
                      {mockLearningContent[selectedStep.id as keyof typeof mockLearningContent].transcript}
                    </Text>
                    <TouchableOpacity style={styles.contentButton}>
                      <Text style={styles.contentButtonText}>Watch Video</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {selectedStep.step_type === 'tutorial' && (
                  <View style={styles.learningSection}>
                    <Text style={styles.sectionTitle}>📚 Tutorial Steps</Text>
                    {mockLearningContent[selectedStep.id as keyof typeof mockLearningContent].tutorialSteps?.map((step, index) => (
                      <View key={index} style={styles.tutorialStep}>
                        <Text style={styles.stepNumber}>{index + 1}</Text>
                        <Text style={styles.stepText}>{step}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {selectedStep.step_type === 'project' && (
                  <View style={styles.learningSection}>
                    <Text style={styles.sectionTitle}>🛠️ Project Requirements</Text>
                    {mockLearningContent[selectedStep.id as keyof typeof mockLearningContent].requirements?.map((req, index) => (
                      <View key={index} style={styles.requirementItem}>
                        <Icon name="check" size={16} color={theme.colors.success} />
                        <Text style={styles.requirementText}>{req}</Text>
                      </View>
                    ))}
                  </View>
                )}

                <View style={styles.learningSection}>
                  <Text style={styles.sectionTitle}>📖 Resources</Text>
                  {mockLearningContent[selectedStep.id as keyof typeof mockLearningContent].resources?.map((resource, index) => (
                    <TouchableOpacity key={index} style={styles.resourceItem}>
                      <Icon name="link" size={16} color={theme.colors.primary} />
                      <Text style={styles.resourceText}>{resource}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {selectedStep.has_quiz && mockLearningContent[selectedStep.id as keyof typeof mockLearningContent].quiz && (
                  <View style={styles.learningSection}>
                    <Text style={styles.sectionTitle}>🧠 Quiz</Text>
                    <Text style={styles.learningText}>
                      Take the quiz to test your understanding. Passing score: {selectedStep.passing_score}%
                    </Text>
                    <TouchableOpacity style={styles.contentButton}>
                      <Text style={styles.contentButtonText}>Start Quiz</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </ScrollView>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: theme.colors.outline }]}
                onPress={() => setShowLearningModal(false)}
              >
                <Text style={[styles.modalButtonText, { color: theme.colors.text }]}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => {
                  setShowLearningModal(false);
                  if (selectedStep) {
                    handleCompleteStep(selectedStep);
                  }
                }}
              >
                <Text style={[styles.modalButtonText, { color: theme.colors.onPrimary }]}>Mark Complete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default LearningProcessScreen;
