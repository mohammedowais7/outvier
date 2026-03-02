import React, { useState } from 'react';
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
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons as Icon } from '@expo/vector-icons';

import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { apiService } from '../services/api';
import { DashboardData, Goal } from '../types/outvier';
import LoadingScreen from '../components/LoadingScreen';
import ErrorScreen from '../components/ErrorScreen';
import GoalCard from '../components/GoalCard';

const { width } = Dimensions.get('window');

interface DashboardScreenProps {
  navigation: any;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  // 1. Dashboard General Stats Fetch
  const {
    data: dashboardData,
    isLoading: isDashLoading,
    error: dashError,
    refetch: refetchDash,
  } = useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: () => apiService.getDashboard().then(res => res.data),
    enabled: !!user,
  });

  // 2. Fetch Fresh Goals (Same as Goals Screen)
  const { 
    data: freshGoals, 
    isLoading: isGoalsLoading,
    refetch: refetchGoals 
  } = useQuery<Goal[]>({
    queryKey: ['goals'], // Same key as GoalsScreen for syncing
    queryFn: async () => {
      const response = await apiService.getGoals();
      const results = response.data.results || response.data;
      // Sirf active (uncompleted) goals filter karein
      return results.filter((g: Goal) => !g.is_completed);
    },
    enabled: !!user,
  });

  // 3. Unread Notification Count
  const { data: unreadData } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => apiService.get('/outvier/notifications/unread_count/').then(res => res.data),
    enabled: !!user,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
        refetchDash(), 
        refetchGoals(),
        queryClient.invalidateQueries({ queryKey: ['notifications'] })
    ]);
    setRefreshing(false);
  };

  if (isDashLoading || isGoalsLoading) return <LoadingScreen />;
  if (dashError || !dashboardData) return <ErrorScreen onRetry={refetchDash} />;

  // Ab hum freshGoals use karenge dashboardData.active_goals ki jagah
  const activeGoalsList = freshGoals || [];
  const currentStreak = dashboardData?.progress_summary?.current_streak || 0;

  const getRankDetails = (streak: number) => {
    if (streak >= 100) return { name: 'Legend', icon: 'military-tech', color: '#FFD700', badge: '👑' };
    if (streak >= 50) return { name: 'Achiever', icon: 'emoji-events', color: '#4CAF50', badge: '🏆' };
    if (streak >= 30) return { name: 'Consistent', icon: 'whatshot', color: '#FF9800', badge: '🔥' };
    return { name: 'Starter', icon: 'shutter-speed', color: theme.colors.primary, badge: '🛡️' };
  };

  const rank = getRankDetails(currentStreak);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* --- HEADER --- */}
        <View style={styles.header}>
          <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
            <Text style={{ color: theme.colors.onPrimary, fontSize: 18, fontWeight: 'bold' }}>
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </Text>
          </View>
          <View style={styles.welcomeText}>
            <Text style={{ fontSize: 14, color: theme.colors.textSecondary }}>Hello,</Text>
            <Text style={{ fontSize: 18, fontWeight: '700', color: theme.colors.text }}>
              {user?.first_name} {user?.last_name}
            </Text>
          </View>
          
          <TouchableOpacity 
            onPress={() => navigation.navigate('Notifications')}
            style={styles.notifButton}
          >
            <Icon name="notifications-none" size={28} color={theme.colors.text} />
            {unreadData?.unread_count > 0 && (
              <View style={[styles.notifBadge, { backgroundColor: theme.colors.error, borderColor: theme.colors.background }]} />
            )}
          </TouchableOpacity>
        </View>

        {/* 1. Rank Section */}
        <TouchableOpacity 
          style={styles.rankBadgeContainer} 
          onPress={() => navigation.navigate('Achievements')}
        >
          <LinearGradient
            colors={[rank.color, '#0f172a']}
            style={styles.rankGradient}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          >
            <View>
              <Text style={styles.rankTitle}>{rank.name} {rank.badge}</Text>
              <Text style={styles.rankSubtitle}>{currentStreak} Day Streak • Level 1</Text>
            </View>
            <Icon name={rank.icon as any} size={40} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>

        {/* 2. Progress Overview (Horizontal Flash Cards) */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Progress Overview</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={{ marginBottom: 20 }}
          contentContainerStyle={{ paddingRight: 20 }}
        >
          {activeGoalsList.length > 0 ? (
            activeGoalsList.map((goal: Goal) => (
              <TouchableOpacity 
                key={goal.id} 
                onPress={() => navigation.navigate('EnhancedGoal', { goalId: goal.id })}
                style={[styles.flashCard, { 
                  backgroundColor: theme.colors.elevation.level3, 
                  borderColor: theme.colors.outlineVariant,
                  width: width * 0.75,
                  marginRight: 15
                }]}
              >
                <Icon name="bolt" size={30} color={theme.colors.primary} />
                <Text style={{ fontSize: 17, fontWeight: 'bold', color: theme.colors.text, textAlign: 'center', marginTop: 10 }}>
                  {goal.title}
                </Text>
                <Text style={{ color: theme.colors.primary, fontWeight: 'bold', fontSize: 24, marginTop: 5 }}>
                  {goal.progress_percentage || 0}%
                </Text>
                <Text style={{ color: theme.colors.textSecondary, fontSize: 12, marginTop: 5 }}>Tap to manage</Text>
              </TouchableOpacity>
            ))
          ) : (
            <View style={[styles.flashCard, { width: width - 40, borderStyle: 'dashed' }]}>
              <Text style={{ color: theme.colors.textSecondary }}>No active goals to show</Text>
            </View>
          )}
        </ScrollView>

        {/* 3. Active Goals List (Vertical) */}
        <View style={{ marginTop: 10 }}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Active Goals</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Goals')}>
              <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {activeGoalsList.length > 0 ? (
            activeGoalsList.slice(0, 5).map((goal: Goal) => (
              <GoalCard key={goal.id} goal={goal} navigation={navigation} />
            ))
          ) : (
            <View style={{ alignItems: 'center', padding: 20 }}>
              <Text style={{ color: theme.colors.textSecondary }}>No active goals found</Text>
            </View>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

// ... Styles (Pehle wale hi rahenge)
const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { flex: 1, paddingHorizontal: 20 },
    header: { paddingVertical: 20, flexDirection: 'row', alignItems: 'center' },
    avatar: { width: 45, height: 45, borderRadius: 22.5, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    welcomeText: { flex: 1 },
    notifButton: { padding: 5, position: 'relative' },
    notifBadge: { position: 'absolute', right: 8, top: 8, width: 10, height: 10, borderRadius: 5, borderWidth: 2 },
    rankBadgeContainer: { marginBottom: 25, borderRadius: 20, overflow: 'hidden', elevation: 3 },
    rankGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
    rankTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
    rankSubtitle: { color: 'rgba(255,255,255,0.9)', fontSize: 13 },
    sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 15 },
    flashCard: {
      height: 180,
      borderRadius: 25,
      padding: 20,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      elevation: 4,
    },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
    scrollContainer: { paddingBottom: 100 }
  });

export default DashboardScreen;