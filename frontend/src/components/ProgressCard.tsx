import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import Progress from 'react-native-progress';

import { useTheme } from '../contexts/ThemeContext';
import { GrowthPathway } from '../types/outvier';

interface ProgressCardProps {
  pathway: GrowthPathway;
  navigation: any;
}

const ProgressCard: React.FC<ProgressCardProps> = ({ pathway, navigation }) => {
  const { theme } = useTheme();

  const handlePress = () => {
    // Navigate to learning process within the current stack
    if (navigation.getParent) {
      // If we're in a nested navigator, navigate to the parent's Pathways tab
      navigation.getParent()?.navigate('Pathways', {
        screen: 'LearningProcess',
        params: { pathwayId: pathway.id }
      });
    } else {
      // Direct navigation
      navigation.navigate('LearningProcess', { pathwayId: pathway.id });
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return theme.colors.success;
      case 'intermediate':
        return theme.colors.warning;
      case 'advanced':
        return theme.colors.error;
      case 'expert':
        return theme.colors.primary;
      default:
        return theme.colors.textSecondary;
    }
  };

  const getPathwayIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'ai':
        return 'psychology';
      case 'devops':
        return 'settings';
      case 'digital marketing':
        return 'trending-up';
      case 'analytics':
        return 'analytics';
      default:
        return 'school';
    }
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
    difficulty: {
      fontSize: 12,
      color: getDifficultyColor(pathway.difficulty_level),
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
    stepsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    stepsText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    continueButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: 8,
      paddingVertical: 8,
      paddingHorizontal: 12,
      alignItems: 'center',
      marginTop: 8,
    },
    continueButtonText: {
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
            name={getPathwayIcon(pathway.pathway_type)} 
            size={20} 
            color={theme.colors.primary} 
          />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title} numberOfLines={2}>
            {pathway.title}
          </Text>
          <Text style={styles.difficulty}>
            {pathway.difficulty_level}
          </Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Progress</Text>
          <Text style={styles.progressValue}>{pathway.progress_percentage}%</Text>
        </View>
        {Progress && Progress.Bar ? (
          <Progress.Bar
            progress={pathway.progress_percentage / 100}
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
                  width: `${pathway.progress_percentage}%`
                }
              ]} 
            />
          </View>
        )}
      </View>

      <View style={styles.stepsContainer}>
        <Text style={styles.stepsText}>
          Step {pathway.current_step} of {pathway.total_steps}
        </Text>
        {!pathway.is_completed && (
          <View style={styles.continueButton}>
            <Text style={styles.continueButtonText}>Continue</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default ProgressCard;
