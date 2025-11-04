import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '../contexts/ThemeContext';
import { apiService } from '../services/api';
import { Achievement, LearningStreak } from '../types/outvier';
import LoadingScreen from '../components/LoadingScreen';
import ErrorScreen from '../components/ErrorScreen';

const { width } = Dimensions.get('window');

interface AchievementsScreenProps {
  navigation: any;
}

const AchievementsScreen: React.FC<AchievementsScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'achievements' | 'streaks' | 'progress'>('achievements');

  // Fetch achievements
  const { data: achievementsData, isLoading: achievementsLoading, error: achievementsError } = useQuery({
    queryKey: ['achievements'],
    queryFn: () => apiService.get('/outvier/achievements/my_achievements/').then(res => res.data),
  });

  // Fetch learning streak
  const { data: streakData, isLoading: streakLoading, error: streakError } = useQuery({
    queryKey: ['learning-streak'],
    queryFn: () => apiService.get('/outvier/learning-streaks/my_streak/').then(res => res.data),
  });

  // Fetch learning progress
  const { data: progressData, isLoading: progressLoading, error: progressError } = useQuery({
    queryKey: ['learning-progress'],
    queryFn: () => apiService.get('/outvier/learning-progress/my_progress/').then(res => res.data),
  });

  const getAchievementIcon = (achievementType: string) => {
    switch (achievementType) {
      case 'goal_completion': return 'flag';
      case 'pathway_completion': return 'school';
      case 'milestone_reached': return 'check-circle';
      case 'streak_achieved': return 'local-fire-department';
      case 'skill_mastered': return 'star';
      case 'community_contributor': return 'people';
      default: return 'star';
    }
  };

  const getAchievementColor = (achievementType: string) => {
    switch (achievementType) {
      case 'goal_completion': return '#4CAF50';
      case 'pathway_completion': return '#2196F3';
      case 'milestone_reached': return '#FF9800';
      case 'streak_achieved': return '#F44336';
      case 'skill_mastered': return '#9C27B0';
      case 'community_contributor': return '#00BCD4';
      default: return '#607D8B';
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
    },
    tabContainer: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    tab: {
      flex: 1,
      paddingVertical: 16,
      alignItems: 'center',
      borderBottomWidth: 2,
      borderBottomColor: 'transparent',
    },
    activeTab: {
      borderBottomColor: theme.colors.primary,
    },
    tabText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },
    activeTabText: {
      color: theme.colors.primary,
    },
    content: {
      flex: 1,
      padding: 20,
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: 24,
    },
    statCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      flex: 1,
      marginHorizontal: 4,
    },
    statValue: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.colors.primary,
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    achievementCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: theme.colors.outline,
    },
    unlockedAchievement: {
      borderColor: theme.colors.primary,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    achievementIcon: {
      width: 60,
      height: 60,
      borderRadius: 30,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16,
    },
    achievementInfo: {
      flex: 1,
    },
    achievementTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: 4,
    },
    achievementDescription: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      lineHeight: 20,
      marginBottom: 8,
    },
    achievementMeta: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    achievementPoints: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.primary,
      marginRight: 12,
    },
    achievementDate: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    lockedAchievement: {
      opacity: 0.6,
    },
    streakCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 24,
      marginBottom: 16,
      alignItems: 'center',
    },
    streakIcon: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.colors.primaryContainer,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    streakNumber: {
      fontSize: 36,
      fontWeight: '700',
      color: theme.colors.primary,
      marginBottom: 8,
    },
    streakLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 4,
    },
    streakSubtext: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    progressCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
    },
    progressHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    progressTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
    },
    progressStats: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    progressStat: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginLeft: 8,
    },
    progressBar: {
      height: 6,
      backgroundColor: theme.colors.outline,
      borderRadius: 3,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: theme.colors.primary,
      borderRadius: 3,
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: 40,
    },
    emptyIcon: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.colors.outline,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    emptyText: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
  });

  const renderAchievements = () => {
    if (achievementsLoading) return <LoadingScreen />;
    if (achievementsError) return <ErrorScreen onRetry={() => {}} />;

    const { unlocked_achievements = [], locked_achievements = [], total_points = 0 } = achievementsData || {};

    return (
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{unlocked_achievements.length}</Text>
            <Text style={styles.statLabel}>Unlocked</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{locked_achievements.length}</Text>
            <Text style={styles.statLabel}>Locked</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{total_points}</Text>
            <Text style={styles.statLabel}>Points</Text>
          </View>
        </View>

        {unlocked_achievements.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: theme.colors.text, fontSize: 18, fontWeight: '700', marginBottom: 12 }]}>
              Unlocked Achievements
            </Text>
            {unlocked_achievements.map((achievement: Achievement) => (
              <View key={achievement.id} style={[styles.achievementCard, styles.unlockedAchievement]}>
                <View style={[styles.achievementIcon, { backgroundColor: getAchievementColor(achievement.achievement_type) + '20' }]}>
                  <Icon 
                    name={getAchievementIcon(achievement.achievement_type)} 
                    size={24} 
                    color={getAchievementColor(achievement.achievement_type)} 
                  />
                </View>
                <View style={styles.achievementInfo}>
                  <Text style={styles.achievementTitle}>{achievement.title}</Text>
                  <Text style={styles.achievementDescription}>{achievement.description}</Text>
                  <View style={styles.achievementMeta}>
                    <Text style={styles.achievementPoints}>{achievement.points_earned} points</Text>
                    {achievement.unlocked_at && (
                      <Text style={styles.achievementDate}>
                        Unlocked {new Date(achievement.unlocked_at).toLocaleDateString()}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </>
        )}

        {locked_achievements.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: theme.colors.text, fontSize: 18, fontWeight: '700', marginBottom: 12, marginTop: 24 }]}>
              Locked Achievements
            </Text>
            {locked_achievements.map((achievement: Achievement) => (
              <View key={achievement.id} style={[styles.achievementCard, styles.lockedAchievement]}>
                <View style={[styles.achievementIcon, { backgroundColor: theme.colors.outline }]}>
                  <Icon name="lock" size={24} color={theme.colors.textSecondary} />
                </View>
                <View style={styles.achievementInfo}>
                  <Text style={styles.achievementTitle}>{achievement.title}</Text>
                  <Text style={styles.achievementDescription}>{achievement.description}</Text>
                  <View style={styles.achievementMeta}>
                    <Text style={styles.achievementPoints}>{achievement.points_earned} points</Text>
                  </View>
                </View>
              </View>
            ))}
          </>
        )}

        {unlocked_achievements.length === 0 && locked_achievements.length === 0 && (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Icon name="star" size={32} color={theme.colors.textSecondary} />
            </View>
            <Text style={styles.emptyText}>No achievements yet. Start learning to unlock your first achievement!</Text>
          </View>
        )}
      </ScrollView>
    );
  };

  const renderStreaks = () => {
    if (streakLoading) return <LoadingScreen />;
    if (streakError) return <ErrorScreen onRetry={() => {}} />;

    const streak = streakData || {};

    return (
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.streakCard}>
          <View style={styles.streakIcon}>
            <Icon name="local-fire-department" size={40} color={theme.colors.primary} />
          </View>
          <Text style={styles.streakNumber}>{streak.current_streak || 0}</Text>
          <Text style={styles.streakLabel}>Day Streak</Text>
          <Text style={styles.streakSubtext}>
            Keep learning to maintain your streak!
          </Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{streak.longest_streak || 0}</Text>
            <Text style={styles.statLabel}>Longest Streak</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{streak.target_streak || 7}</Text>
            <Text style={styles.statLabel}>Target</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{streak.streak_goal_achieved ? '✓' : '○'}</Text>
            <Text style={styles.statLabel}>Goal Met</Text>
          </View>
        </View>

        {streak.last_activity_date && (
          <View style={styles.progressCard}>
            <Text style={styles.progressTitle}>Last Activity</Text>
            <Text style={styles.streakSubtext}>
              {new Date(streak.last_activity_date).toLocaleDateString()}
            </Text>
          </View>
        )}
      </ScrollView>
    );
  };

  const renderProgress = () => {
    if (progressLoading) return <LoadingScreen />;
    if (progressError) return <ErrorScreen onRetry={() => {}} />;

    const progress = progressData || {};

    return (
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{progress.completed_steps || 0}</Text>
            <Text style={styles.statLabel}>Steps Completed</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{Math.round(progress.total_time_spent / 60) || 0}</Text>
            <Text style={styles.statLabel}>Hours Learned</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{progress.average_quiz_score || 0}%</Text>
            <Text style={styles.statLabel}>Avg Score</Text>
          </View>
        </View>

        {progress.pathway_progress && Object.keys(progress.pathway_progress).length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: theme.colors.text, fontSize: 18, fontWeight: '700', marginBottom: 12 }]}>
              Pathway Progress
            </Text>
            {Object.entries(progress.pathway_progress).map(([pathwayTitle, pathwayData]: [string, any]) => {
              const completionRate = pathwayData.total_steps > 0 
                ? (pathwayData.completed_steps / pathwayData.total_steps) * 100 
                : 0;
              
              return (
                <View key={pathwayTitle} style={styles.progressCard}>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressTitle}>{pathwayTitle}</Text>
                    <View style={styles.progressStats}>
                      <Text style={styles.progressStat}>
                        {pathwayData.completed_steps}/{pathwayData.total_steps} steps
                      </Text>
                      <Text style={styles.progressStat}>
                        {Math.round(pathwayData.time_spent / 60)}h
                      </Text>
                    </View>
                  </View>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { width: `${completionRate}%` }
                      ]} 
                    />
                  </View>
                </View>
              );
            })}
          </>
        )}

        {(!progress.pathway_progress || Object.keys(progress.pathway_progress).length === 0) && (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Icon name="trending-up" size={32} color={theme.colors.textSecondary} />
            </View>
            <Text style={styles.emptyText}>No learning progress yet. Start a pathway to track your progress!</Text>
          </View>
        )}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Achievements & Progress</Text>
        <Text style={styles.subtitle}>Track your learning journey and unlock achievements</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'achievements' && styles.activeTab]}
          onPress={() => setActiveTab('achievements')}
        >
          <Text style={[styles.tabText, activeTab === 'achievements' && styles.activeTabText]}>
            Achievements
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'streaks' && styles.activeTab]}
          onPress={() => setActiveTab('streaks')}
        >
          <Text style={[styles.tabText, activeTab === 'streaks' && styles.activeTabText]}>
            Streaks
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'progress' && styles.activeTab]}
          onPress={() => setActiveTab('progress')}
        >
          <Text style={[styles.tabText, activeTab === 'progress' && styles.activeTabText]}>
            Progress
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {activeTab === 'achievements' && renderAchievements()}
        {activeTab === 'streaks' && renderStreaks()}
        {activeTab === 'progress' && renderProgress()}
      </View>
    </SafeAreaView>
  );
};

export default AchievementsScreen;

