import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { ProgressChart, BarChart } from 'react-native-chart-kit';

import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useFullscreen } from '../contexts/FullscreenContext';
import { apiService } from '../services/api';
import FullscreenToggle from '../components/FullscreenToggle';
import { DashboardData } from '../types/outvier';
import LoadingScreen from '../components/LoadingScreen';
import ErrorScreen from '../components/ErrorScreen';
import ProgressCard from '../components/ProgressCard';
import GoalCard from '../components/GoalCard';
import MatchCard from '../components/MatchCard';
import InsightCard from '../components/InsightCard';

const { width } = Dimensions.get('window');

interface DashboardScreenProps {
  navigation: any;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { isFullscreen } = useFullscreen();
  const [refreshing, setRefreshing] = useState(false);
  
  // Get screen dimensions for responsive design
  const { width, height } = Dimensions.get('window');
  const isSmallScreen = height < 700;

  const {
    data: dashboardData,
    isLoading,
    error,
    refetch,
  } = useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: () => apiService.getDashboard().then(res => res.data),
    enabled: !!user,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleCompleteAssessment = () => {
    if (!dashboardData?.profile?.is_complete) {
      navigation.navigate('Assessment');
    }
  };

  const handleViewInsights = () => {
    navigation.navigate('Insights');
  };

  const handleViewAllGoals = () => {
    navigation.navigate('Goals');
  };

  const handleViewAllMatches = () => {
    navigation.navigate('Matches');
  };

  const handleViewAllPathways = () => {
    navigation.navigate('Pathways');
  };

  const handleViewAnalytics = () => {
    navigation.navigate('Analytics');
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <ErrorScreen onRetry={refetch} />;
  }

  if (!dashboardData) {
    return <ErrorScreen message="No data available" onRetry={refetch} />;
  }

  const { profile, active_goals, recent_matches, current_pathways, recent_insights, progress_summary } = dashboardData;

  const chartData = {
    labels: ['Goals', 'Pathways', 'Matches', 'Insights'],
    data: [
      progress_summary.goal_completion_rate / 100,
      progress_summary.pathway_completion_rate / 100,
      recent_matches.length > 0 ? 0.8 : 0.2,
      recent_insights.length > 0 ? 0.9 : 0.3,
    ],
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      paddingHorizontal: Math.min(20, width * 0.05),
      paddingTop: isSmallScreen ? 10 : 20,
      paddingBottom: 16,
    },
    welcomeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    avatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    welcomeText: {
      flex: 1,
    },
    greeting: {
      fontSize: 16,
      color: theme.colors.textSecondary,
    },
    name: {
      fontSize: 20,
      fontWeight: '600',
      color: theme.colors.text,
    },
    role: {
      fontSize: 14,
      color: theme.colors.primary,
      fontWeight: '500',
    },
    assessmentBanner: {
      backgroundColor: theme.colors.warning,
      borderRadius: 12,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    assessmentIcon: {
      marginRight: 12,
    },
    assessmentText: {
      flex: 1,
      color: theme.colors.onPrimary,
    },
    assessmentTitle: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 4,
    },
    assessmentSubtitle: {
      fontSize: 14,
    },
    assessmentButton: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    assessmentButtonText: {
      color: theme.colors.onPrimary,
      fontSize: 14,
      fontWeight: '600',
    },
    content: {
      flex: 1,
      paddingHorizontal: Math.min(20, width * 0.05),
    },
    section: {
      marginBottom: 24,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
    },
    seeAllButton: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    seeAllText: {
      color: theme.colors.primary,
      fontSize: 14,
      fontWeight: '500',
      marginRight: 4,
    },
    progressContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
    },
    progressTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 16,
      textAlign: 'center',
    },
    chartContainer: {
      alignItems: 'center',
      marginBottom: 16,
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    statItem: {
      alignItems: 'center',
    },
    statValue: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.colors.primary,
    },
    statLabel: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginTop: 4,
    },
    goalsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    matchesContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    pathwaysContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    insightsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: 32,
    },
    emptyIcon: {
      marginBottom: 12,
    },
    emptyText: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    fullscreenToggle: {
      position: 'absolute',
      top: isSmallScreen ? 10 : 20,
      right: Math.min(20, width * 0.05),
      zIndex: 1000,
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View style={styles.header}>
          <View style={styles.welcomeContainer}>
            <View style={styles.avatar}>
              <Text style={{ color: theme.colors.onPrimary, fontSize: 20, fontWeight: '600' }}>
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </Text>
            </View>
            <View style={styles.welcomeText}>
              <Text style={styles.greeting}>Welcome back,</Text>
              <Text style={styles.name}>{user?.first_name} {user?.last_name}</Text>
              <Text style={styles.role}>{user?.role?.toUpperCase()}</Text>
            </View>
          </View>
          
          {/* Fullscreen Toggle */}
          <FullscreenToggle style={styles.fullscreenToggle} />

          {!profile?.is_complete && (
            <TouchableOpacity style={styles.assessmentBanner} onPress={handleCompleteAssessment}>
              <Icon name="psychology" size={24} color={theme.colors.onPrimary} style={styles.assessmentIcon} />
              <View style={styles.assessmentText}>
                <Text style={styles.assessmentTitle}>Complete Your Assessment</Text>
                <Text style={styles.assessmentSubtitle}>
                  Unlock personalized insights and better matches
                </Text>
              </View>
              <TouchableOpacity style={styles.assessmentButton} onPress={handleCompleteAssessment}>
                <Text style={styles.assessmentButtonText}>Start</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Progress Overview</Text>
          </View>
          <View style={styles.progressContainer}>
            <Text style={styles.progressTitle}>Your Growth Journey</Text>
            <View style={styles.chartContainer}>
              <ProgressChart
                data={chartData}
                width={width - 80}
                height={160}
                strokeWidth={8}
                radius={16}
                chartConfig={{
                  backgroundColor: theme.colors.surface,
                  backgroundGradientFrom: theme.colors.surface,
                  backgroundGradientTo: theme.colors.surface,
                  color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(30, 41, 59, ${opacity})`,
                }}
                hideLegend={false}
              />
            </View>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{progress_summary.completed_goals}</Text>
                <Text style={styles.statLabel}>Goals Done</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{progress_summary.completed_pathways}</Text>
                <Text style={styles.statLabel}>Pathways</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{recent_matches.length}</Text>
                <Text style={styles.statLabel}>Matches</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{recent_insights.length}</Text>
                <Text style={styles.statLabel}>Insights</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active Goals</Text>
            <TouchableOpacity style={styles.seeAllButton} onPress={handleViewAllGoals}>
              <Text style={styles.seeAllText}>See All</Text>
              <Icon name="arrow-forward" size={16} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
          {active_goals.length > 0 ? (
            <View style={styles.goalsContainer}>
              {active_goals.slice(0, 2).map((goal) => (
                <GoalCard key={goal.id} goal={goal} navigation={navigation} />
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Icon name="flag" size={48} color={theme.colors.textSecondary} style={styles.emptyIcon} />
              <Text style={styles.emptyText}>No active goals yet</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Matches</Text>
            <TouchableOpacity style={styles.seeAllButton} onPress={handleViewAllMatches}>
              <Text style={styles.seeAllText}>See All</Text>
              <Icon name="arrow-forward" size={16} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
          {recent_matches.length > 0 ? (
            <View style={styles.matchesContainer}>
              {recent_matches.slice(0, 2).map((match) => (
                <MatchCard key={match.id} match={match} navigation={navigation} />
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Icon name="people" size={48} color={theme.colors.textSecondary} style={styles.emptyIcon} />
              <Text style={styles.emptyText}>No matches yet</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Current Pathways</Text>
            <TouchableOpacity style={styles.seeAllButton} onPress={handleViewAllPathways}>
              <Text style={styles.seeAllText}>See All</Text>
              <Icon name="arrow-forward" size={16} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
          {current_pathways.length > 0 ? (
            <View style={styles.pathwaysContainer}>
              {current_pathways.slice(0, 2).map((pathway) => (
                <ProgressCard key={pathway.id} pathway={pathway} navigation={navigation} />
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Icon name="school" size={48} color={theme.colors.textSecondary} style={styles.emptyIcon} />
              <Text style={styles.emptyText}>No pathways yet</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Insights</Text>
            <TouchableOpacity style={styles.seeAllButton} onPress={handleViewInsights}>
              <Text style={styles.seeAllText}>See All</Text>
              <Icon name="arrow-forward" size={16} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Analytics & Progress</Text>
            <TouchableOpacity style={styles.seeAllButton} onPress={handleViewAnalytics}>
              <Text style={styles.seeAllText}>View Analytics</Text>
              <Icon name="arrow-forward" size={16} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
          {recent_insights.length > 0 ? (
            <View style={styles.insightsContainer}>
              {recent_insights.slice(0, 2).map((insight) => (
                <InsightCard key={insight.id} insight={insight} />
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Icon name="lightbulb" size={48} color={theme.colors.textSecondary} style={styles.emptyIcon} />
              <Text style={styles.emptyText}>No insights yet</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DashboardScreen;
