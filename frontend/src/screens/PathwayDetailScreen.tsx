import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Progress from 'react-native-progress';

import { useTheme } from '../contexts/ThemeContext';
import { apiService } from '../services/api';
import { GrowthPathway } from '../types/outvier';
import LoadingScreen from '../components/LoadingScreen';
import ErrorScreen from '../components/ErrorScreen';

const { width } = Dimensions.get('window');

interface Props { route: any; navigation: any; }

const PathwayDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { pathwayId } = route.params;
  const { theme } = useTheme();
  const { data, isLoading, error, refetch } = useQuery<GrowthPathway>({
    queryKey: ['pathway', pathwayId],
    queryFn: () => apiService.get(`/outvier/pathways/${pathwayId}/`).then(res => res.data)
  });

  const handleContinue = () => {
    navigation.navigate('LearningProcess', { pathwayId: pathway.id });
  };

  const handleStart = () => {
    navigation.navigate('LearningProcess', { pathwayId: pathway.id });
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return theme.colors.success;
      case 'intermediate': return theme.colors.warning;
      case 'advanced': return theme.colors.error;
      case 'expert': return theme.colors.primary;
      default: return theme.colors.textSecondary;
    }
  };

  const getPathwayIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'ai_ml': return 'psychology';
      case 'devops': return 'settings';
      case 'web_dev': return 'code';
      case 'mobile_dev': return 'phone-android';
      case 'data_science': return 'analytics';
      case 'cybersecurity': return 'security';
      case 'digital_marketing': return 'trending-up';
      case 'ui_ux': return 'palette';
      case 'blockchain': return 'account-balance-wallet';
      case 'iot': return 'sensors';
      case 'leadership': return 'group';
      case 'entrepreneurship': return 'business';
      default: return 'school';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return theme.colors.success;
      case 'in_progress': return theme.colors.primary;
      case 'paused': return theme.colors.warning;
      case 'abandoned': return theme.colors.error;
      default: return theme.colors.textSecondary;
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
    subtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      marginBottom: 16,
    },
    metaContainer: {
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
    skillsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    skillChip: {
      backgroundColor: theme.colors.primaryContainer,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 16,
      marginRight: 8,
      marginBottom: 8,
    },
    skillChipText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.primary,
    },
    resourceItem: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.primary,
    },
    resourceTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 4,
    },
    resourceDescription: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
    },
    statItem: {
      alignItems: 'center',
    },
    statValue: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.colors.primary,
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    actions: {
      padding: 20,
      backgroundColor: theme.colors.surface,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline,
    },
    primaryButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: 'center',
      marginBottom: 12,
    },
    primaryButtonText: {
      color: theme.colors.onPrimary,
      fontSize: 16,
      fontWeight: '700',
    },
    secondaryButton: {
      backgroundColor: theme.colors.outline,
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: 'center',
    },
    secondaryButtonText: {
      color: theme.colors.text,
      fontSize: 14,
      fontWeight: '600',
    },
  });

  if (isLoading) return <LoadingScreen />;
  if (error || !data) return <ErrorScreen onRetry={refetch} />;

  const pathway = data;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>{pathway.title}</Text>
          <Text style={styles.subtitle}>{pathway.description}</Text>
          
          <View style={styles.metaContainer}>
            <View style={styles.metaChip}>
              <Icon name={getPathwayIcon(pathway.pathway_type)} size={16} color={theme.colors.primary} />
              <Text style={styles.metaChipText}>{pathway.pathway_type.replace('_', ' ').toUpperCase()}</Text>
            </View>
            
            <View style={[styles.metaChip, { backgroundColor: getDifficultyColor(pathway.difficulty_level) + '20' }]}>
              <Icon name="trending-up" size={16} color={getDifficultyColor(pathway.difficulty_level)} />
              <Text style={[styles.metaChipText, { color: getDifficultyColor(pathway.difficulty_level) }]}>
                {pathway.difficulty_level.toUpperCase()}
              </Text>
            </View>
            
            <View style={[styles.metaChip, { backgroundColor: getStatusColor(pathway.status) + '20' }]}>
              <Icon name="circle" size={16} color={getStatusColor(pathway.status)} />
              <Text style={[styles.metaChipText, { color: getStatusColor(pathway.status) }]}>
                {pathway.status.replace('_', ' ').toUpperCase()}
              </Text>
            </View>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Progress</Text>
              <Text style={styles.progressValue}>{pathway.progress_percentage}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${pathway.progress_percentage}%` }
                ]} 
              />
            </View>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{pathway.current_step}</Text>
              <Text style={styles.statLabel}>Current Step</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{pathway.total_steps}</Text>
              <Text style={styles.statLabel}>Total Steps</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{pathway.estimated_duration}</Text>
              <Text style={styles.statLabel}>Days</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{Math.round(pathway.total_time_spent / 60)}</Text>
              <Text style={styles.statLabel}>Hours</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Required Skills</Text>
            <View style={styles.skillsContainer}>
              {pathway.required_skills_names?.length ? pathway.required_skills_names.map((skill, index) => (
                <View key={index} style={styles.skillChip}>
                  <Text style={styles.skillChipText}>{skill}</Text>
                </View>
              )) : (
                <Text style={{ color: theme.colors.textSecondary }}>No specific skills required</Text>
              )}
            </View>
          </View>

          {pathway.learning_resources && pathway.learning_resources.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Learning Resources</Text>
              {pathway.learning_resources.map((resource, index) => (
                <View key={index} style={styles.resourceItem}>
                  <Text style={styles.resourceTitle}>Resource {index + 1}</Text>
                  <Text style={styles.resourceDescription}>{resource}</Text>
                </View>
              ))}
            </View>
          )}

          {pathway.estimated_completion_date && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Estimated Completion</Text>
              <Text style={styles.description}>
                Based on your current progress, you should complete this pathway by {new Date(pathway.estimated_completion_date).toLocaleDateString()}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.actions}>
        {pathway.is_completed ? (
          <View style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>🎉 Pathway Completed!</Text>
          </View>
        ) : pathway.current_step > 0 ? (
          <TouchableOpacity style={styles.primaryButton} onPress={handleContinue}>
            <Text style={styles.primaryButtonText}>Continue Learning</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.primaryButton} onPress={handleStart}>
            <Text style={styles.primaryButtonText}>Start Learning</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.secondaryButtonText}>Back to Pathways</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PathwayDetailScreen;


