import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';

import { useTheme } from '../contexts/ThemeContext';
import { apiService } from '../services/api';
import { createMobileStyles, getResponsiveDimensions } from '../styles/mobileLayout';
import LoadingScreen from '../components/LoadingScreen';
import ErrorScreen from '../components/ErrorScreen';

interface AnalyticsData {
  goals: {
    total_goals: number;
    completed_goals: number;
    overdue_goals: number;
    upcoming_deadlines: number;
    completion_rate?: number;
    by_type?: { [key: string]: number };
    by_priority?: { [key: string]: number };
    progress_trend?: Array<{ date: string; completed: number; created: number }>;
  };
  matches: {
    total_matches: number;
    accepted_matches: number;
    active_matches: number;
    rejected?: number;
    pending?: number;
    by_type?: { [key: string]: number };
    compatibility_trend?: Array<{ date: string; avg_score: number }>;
  };
  pathways: {
    total_pathways: number;
    completed_pathways: number;
    in_progress_pathways: number;
    by_difficulty?: { [key: string]: number };
    completion_trend?: Array<{ date: string; completed: number; started: number }>;
  };
  insights?: {
    top_skills?: Array<{ skill: string; count: number }>;
    productivity_score?: number;
    learning_velocity?: number;
    collaboration_index?: number;
  };
}

const AnalyticsScreen: React.FC<any> = ({ navigation }) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'overview' | 'goals' | 'matches' | 'pathways' | 'insights'>('overview');
  
  const dims = getResponsiveDimensions();
  const mobileStyles = createMobileStyles(theme);
  const screenWidth = Dimensions.get('window').width - 40;

  const { data, isLoading, error, refetch } = useQuery<AnalyticsData>({
    queryKey: ['analytics'],
    queryFn: async () => {
      // console.log('Fetching analytics data...');
      const response = await apiService.get('/outvier/dashboard/analytics/');
      // console.log('Analytics response:', response);
      return response.data;
    },
  });

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
      marginHorizontal: dims.layout.screenPadding,
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
      paddingHorizontal: dims.layout.screenPadding,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: dims.spacing.m,
      marginBottom: dims.spacing.m,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: dims.spacing.s,
    },
    statRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: dims.spacing.s,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    statLabel: {
      fontSize: 14,
      color: theme.colors.text,
    },
    statValue: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.primary,
    },
    chartContainer: {
      alignItems: 'center',
      marginVertical: dims.spacing.m,
    },
    insightCard: {
      backgroundColor: theme.colors.primary + '10',
      borderRadius: 12,
      padding: dims.spacing.m,
      marginBottom: dims.spacing.m,
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.primary,
    },
    insightTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: dims.spacing.s,
    },
    insightValue: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.colors.primary,
      marginBottom: dims.spacing.xs,
    },
    insightDescription: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    skillChip: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: dims.spacing.s,
      paddingVertical: dims.spacing.xs,
      borderRadius: 16,
      marginRight: dims.spacing.s,
      marginBottom: dims.spacing.s,
    },
    skillText: {
      fontSize: 12,
      color: theme.colors.onPrimary,
      fontWeight: '500',
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: dims.spacing.xxl,
    },
    emptyText: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginTop: dims.spacing.m,
    },
  });

  const chartConfig = {
    backgroundColor: theme.colors.surface,
    backgroundGradientFrom: theme.colors.surface,
    backgroundGradientTo: theme.colors.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => theme.colors.primary + Math.floor(opacity * 255).toString(16).padStart(2, '0'),
    labelColor: (opacity = 1) => theme.colors.text + Math.floor(opacity * 1).toString(16).padStart(2, '0'),
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: theme.colors.primary,
    },
  };

  const renderOverview = () => {
    if (!data) return null;

    // Calculate productivity score based on available data
    const goalCompletionRate = data.goals.total_goals > 0 
      ? Math.round((data.goals.completed_goals / data.goals.total_goals) * 100)
      : 0;
    
    const pathwayCompletionRate = data.pathways.total_pathways > 0
      ? Math.round((data.pathways.completed_pathways / data.pathways.total_pathways) * 100)
      : 0;
    
    const productivityScore = Math.round((goalCompletionRate + pathwayCompletionRate) / 2);
    const learningVelocity = data.pathways.in_progress_pathways || 0;
    const collaborationIndex = data.matches.accepted_matches > 0 
      ? Math.min(100, data.matches.accepted_matches * 25)
      : 0;

    return (
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.insightCard}>
          <Text style={styles.insightTitle}>Productivity Score</Text>
          <Text style={styles.insightValue}>{productivityScore}%</Text>
          <Text style={styles.insightDescription}>
            Based on goal completion and learning progress
          </Text>
        </View>

        <View style={styles.insightCard}>
          <Text style={styles.insightTitle}>Learning Velocity</Text>
          <Text style={styles.insightValue}>{learningVelocity}</Text>
          <Text style={styles.insightDescription}>
            Active learning pathways
          </Text>
        </View>

        <View style={styles.insightCard}>
          <Text style={styles.insightTitle}>Collaboration Index</Text>
          <Text style={styles.insightValue}>{collaborationIndex}%</Text>
          <Text style={styles.insightDescription}>
            Active matches and team participation
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Quick Stats</Text>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Goals Completed</Text>
            <Text style={styles.statValue}>{data.goals.completed_goals}/{data.goals.total_goals}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Active Matches</Text>
            <Text style={styles.statValue}>{data.matches.accepted_matches}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Pathways Completed</Text>
            <Text style={styles.statValue}>{data.pathways.completed_pathways}</Text>
          </View>
        </View>
      </ScrollView>
    );
  };

  const renderGoals = () => {
    if (!data) return null;

    const completionRate = data.goals.total_goals > 0 
      ? Math.round((data.goals.completed_goals / data.goals.total_goals) * 100)
      : 0;

    // Mock data for charts since API doesn't provide detailed breakdown
    const goalTypeData = [
      { name: 'Personal', population: Math.max(1, data.goals.total_goals), color: theme.colors.primary, legendFontColor: theme.colors.text, legendFontSize: 12 },
      { name: 'Professional', population: Math.max(0, data.goals.total_goals - 1), color: theme.colors.secondary, legendFontColor: theme.colors.text, legendFontSize: 12 },
    ];

    return (
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Goal Completion Rate</Text>
          <View style={styles.chartContainer}>
            <Text style={styles.insightValue}>{completionRate}%</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Goal Statistics</Text>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Total Goals</Text>
            <Text style={styles.statValue}>{data.goals.total_goals}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Completed</Text>
            <Text style={styles.statValue}>{data.goals.completed_goals}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Overdue</Text>
            <Text style={styles.statValue}>{data.goals.overdue_goals}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Upcoming Deadlines</Text>
            <Text style={styles.statValue}>{data.goals.upcoming_deadlines}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Goals by Type</Text>
          <View style={styles.chartContainer}>
            <PieChart
              data={goalTypeData}
              width={screenWidth}
              height={220}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
            />
          </View>
        </View>
      </ScrollView>
    );
  };

  const renderMatches = () => {
    if (!data) return null;

    const rejected = data.matches.total_matches - data.matches.accepted_matches;
    const pending = Math.max(0, data.matches.active_matches - data.matches.accepted_matches);

    return (
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Match Statistics</Text>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Total Matches</Text>
            <Text style={styles.statValue}>{data.matches.total_matches}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Accepted</Text>
            <Text style={styles.statValue}>{data.matches.accepted_matches}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Active</Text>
            <Text style={styles.statValue}>{data.matches.active_matches}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Rejected</Text>
            <Text style={styles.statValue}>{rejected}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Match Distribution</Text>
          <View style={styles.chartContainer}>
            <PieChart
              data={[
                { name: 'Accepted', population: data.matches.accepted_matches, color: theme.colors.success, legendFontColor: theme.colors.text, legendFontSize: 12 },
                { name: 'Active', population: data.matches.active_matches, color: theme.colors.primary, legendFontColor: theme.colors.text, legendFontSize: 12 },
                { name: 'Rejected', population: rejected, color: theme.colors.error, legendFontColor: theme.colors.text, legendFontSize: 12 },
              ]}
              width={screenWidth}
              height={220}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
            />
          </View>
        </View>
      </ScrollView>
    );
  };

  const renderPathways = () => {
    if (!data) return null;

    const completionRate = data.pathways.total_pathways > 0 
      ? Math.round((data.pathways.completed_pathways / data.pathways.total_pathways) * 100)
      : 0;

    return (
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Pathway Progress</Text>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Total Pathways</Text>
            <Text style={styles.statValue}>{data.pathways.total_pathways}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Completed</Text>
            <Text style={styles.statValue}>{data.pathways.completed_pathways}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>In Progress</Text>
            <Text style={styles.statValue}>{data.pathways.in_progress_pathways}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Completion Rate</Text>
            <Text style={styles.statValue}>{completionRate}%</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Pathway Distribution</Text>
          <View style={styles.chartContainer}>
            <PieChart
              data={[
                { name: 'Completed', population: data.pathways.completed_pathways, color: theme.colors.success, legendFontColor: theme.colors.text, legendFontSize: 12 },
                { name: 'In Progress', population: data.pathways.in_progress_pathways, color: theme.colors.primary, legendFontColor: theme.colors.text, legendFontSize: 12 },
              ]}
              width={screenWidth}
              height={220}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
            />
          </View>
        </View>
      </ScrollView>
    );
  };

  const renderInsights = () => {
    if (!data) return null;

    // Calculate insights based on available data
    const goalCompletionRate = data.goals.total_goals > 0 
      ? Math.round((data.goals.completed_goals / data.goals.total_goals) * 100)
      : 0;
    
    const pathwayCompletionRate = data.pathways.total_pathways > 0
      ? Math.round((data.pathways.completed_pathways / data.pathways.total_pathways) * 100)
      : 0;
    
    const productivityScore = Math.round((goalCompletionRate + pathwayCompletionRate) / 2);
    const learningVelocity = data.pathways.in_progress_pathways || 0;
    const collaborationIndex = data.matches.accepted_matches > 0 
      ? Math.min(100, data.matches.accepted_matches * 25)
      : 0;

    // Mock skills data
    const topSkills = [
      { skill: 'React Native', count: 3 },
      { skill: 'JavaScript', count: 2 },
      { skill: 'Teamwork', count: 2 },
      { skill: 'Problem Solving', count: 1 },
    ];

    return (
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Top Skills</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {topSkills.map((skill, index) => (
              <View key={index} style={styles.skillChip}>
                <Text style={styles.skillText}>{skill.skill} ({skill.count})</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.insightCard}>
          <Text style={styles.insightTitle}>Overall Performance</Text>
          <Text style={styles.insightValue}>{productivityScore}%</Text>
          <Text style={styles.insightDescription}>
            Your productivity score based on completed goals and learning progress
          </Text>
        </View>

        <View style={styles.insightCard}>
          <Text style={styles.insightTitle}>Learning Velocity</Text>
          <Text style={styles.insightValue}>{learningVelocity}</Text>
          <Text style={styles.insightDescription}>
            Active learning pathways
          </Text>
        </View>

        <View style={styles.insightCard}>
          <Text style={styles.insightTitle}>Collaboration Index</Text>
          <Text style={styles.insightValue}>{collaborationIndex}%</Text>
          <Text style={styles.insightDescription}>
            Your level of team collaboration and networking
          </Text>
        </View>
      </ScrollView>
    );
  };

  if (isLoading) return <LoadingScreen />;
  if (error) return <ErrorScreen onRetry={refetch} />;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Analytics</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
          onPress={() => setActiveTab('overview')}
        >
          <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>
            Overview
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'goals' && styles.activeTab]}
          onPress={() => setActiveTab('goals')}
        >
          <Text style={[styles.tabText, activeTab === 'goals' && styles.activeTabText]}>
            Goals
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'matches' && styles.activeTab]}
          onPress={() => setActiveTab('matches')}
        >
          <Text style={[styles.tabText, activeTab === 'matches' && styles.activeTabText]}>
            Matches
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'pathways' && styles.activeTab]}
          onPress={() => setActiveTab('pathways')}
        >
          <Text style={[styles.tabText, activeTab === 'pathways' && styles.activeTabText]}>
            Pathways
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'insights' && styles.activeTab]}
          onPress={() => setActiveTab('insights')}
        >
          <Text style={[styles.tabText, activeTab === 'insights' && styles.activeTabText]}>
            Insights
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'goals' && renderGoals()}
        {activeTab === 'matches' && renderMatches()}
        {activeTab === 'pathways' && renderPathways()}
        {activeTab === 'insights' && renderInsights()}
      </View>
    </SafeAreaView>
  );
};

export default AnalyticsScreen;
