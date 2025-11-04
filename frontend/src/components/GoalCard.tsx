import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import Progress from 'react-native-progress';

import { useTheme } from '../contexts/ThemeContext';
import { Goal } from '../types/outvier';

interface GoalCardProps {
  goal: Goal;
  navigation: any;
}

const GoalCard: React.FC<GoalCardProps> = ({ goal, navigation }) => {
  const { theme } = useTheme();

  const handlePress = () => {
    // Navigate to goal detail within the current stack
    if (navigation.getParent) {
      // If we're in a nested navigator, navigate to the parent's Goals tab
      navigation.getParent()?.navigate('Goals', {
        screen: 'EnhancedGoal',
        params: { goalId: goal.id }
      });
    } else {
      // Direct navigation
      navigation.navigate('EnhancedGoal', { goalId: goal.id });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return theme.colors.error;
      case 'high':
        return theme.colors.warning;
      case 'medium':
        return theme.colors.info;
      case 'low':
        return theme.colors.success;
      default:
        return theme.colors.textSecondary;
    }
  };

  const getGoalIcon = (type: string) => {
    switch (type) {
      case 'personal':
        return 'person';
      case 'professional':
        return 'work';
      case 'skill':
        return 'school';
      case 'project':
        return 'folder';
      case 'network':
        return 'people';
      default:
        return 'flag';
    }
  };

  const getDaysRemainingColor = (days: number) => {
    if (days <= 7) return theme.colors.error;
    if (days <= 30) return theme.colors.warning;
    return theme.colors.success;
  };

  const styles = StyleSheet.create({
    container: {
      width: '48%',
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      shadowColor: theme.colors.shadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.primaryContainer,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    headerText: {
      flex: 1,
    },
    title: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 2,
    },
    priority: {
      fontSize: 12,
      color: getPriorityColor(goal.priority),
      fontWeight: '500',
      textTransform: 'uppercase',
    },
    progressContainer: {
      marginBottom: 12,
    },
    progressHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    progressLabel: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    progressValue: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.primary,
    },
    progressBar: {
      height: 6,
      borderRadius: 3,
    },
    deadlineContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    deadlineText: {
      fontSize: 12,
      color: getDaysRemainingColor(goal.days_remaining),
      fontWeight: '500',
    },
    milestonesText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    viewButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: 8,
      paddingVertical: 8,
      paddingHorizontal: 12,
      alignItems: 'center',
      marginTop: 8,
    },
    viewButtonText: {
      color: theme.colors.onPrimary,
      fontSize: 12,
      fontWeight: '600',
    },
  });

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Icon 
            name={getGoalIcon(goal.goal_type)} 
            size={20} 
            color={theme.colors.primary} 
          />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title} numberOfLines={2}>
            {goal.title}
          </Text>
          <Text style={styles.priority}>
            {goal.priority}
          </Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Progress</Text>
          <Text style={styles.progressValue}>{goal.progress_percentage}%</Text>
        </View>
        {Progress && Progress.Bar ? (
          <Progress.Bar
            progress={goal.progress_percentage / 100}
            width={null}
            height={6}
            color={theme.colors.primary}
            unfilledColor={theme.colors.outline}
            borderWidth={0}
            borderRadius={3}
            style={styles.progressBar}
          />
        ) : (
          <View style={[styles.progressBar, { backgroundColor: theme.colors.outline }]}>
            <View 
              style={[
                styles.progressBar, 
                { 
                  backgroundColor: theme.colors.primary,
                  width: `${goal.progress_percentage}%`
                }
              ]} 
            />
          </View>
        )}
      </View>

      <View style={styles.deadlineContainer}>
        <Text style={styles.deadlineText}>
          {goal.days_remaining > 0 ? `${goal.days_remaining} days left` : 'Overdue'}
        </Text>
        <Text style={styles.milestonesText}>
          {goal.milestones.filter(m => m.is_completed).length}/{goal.milestones.length} milestones
        </Text>
      </View>

      <View style={styles.viewButton}>
        <Text style={styles.viewButtonText}>View Details</Text>
      </View>
    </TouchableOpacity>
  );
};

export default GoalCard;
