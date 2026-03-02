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

  // --- API Fetches (As per your original code) ---
  const { data: achievementsData, isLoading: achievementsLoading, error: achievementsError } = useQuery({
    queryKey: ['achievements'],
    queryFn: () => apiService.get('/outvier/achievements/my_achievements/').then(res => res.data),
  });

  const { data: streakData, isLoading: streakLoading, error: streakError } = useQuery({
    queryKey: ['learning-streak'],
    queryFn: () => apiService.get('/outvier/learning-streaks/my_streak/').then(res => res.data),
  });

  const { data: progressData, isLoading: progressLoading, error: progressError } = useQuery({
    queryKey: ['learning-progress'],
    queryFn: () => apiService.get('/outvier/learning-progress/my_progress/').then(res => res.data),
  });

  // --- Rank Logic (Added Feature) ---
  const getRankDetails = (streak: number) => {
    if (streak >= 100) return { name: 'Legend', icon: 'military-tech', color: '#FFD700', badge: '👑', next: 'Max Level' };
    if (streak >= 50) return { name: 'Achiever', icon: 'emoji-events', color: '#4CAF50', badge: '🏆', next: '100 days for Legend' };
    if (streak >= 30) return { name: 'Consistent', icon: 'whatshot', color: '#FF9800', badge: '🔥', next: '50 days for Achiever' };
    return { name: 'Starter', icon: 'shutter-speed', color: '#6366F1', badge: '🛡️', next: '30 days for Consistent' };
  };

  const currentStreakCount = streakData?.current_streak || 0;
  const rank = getRankDetails(currentStreakCount);

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
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: { padding: 20, backgroundColor: theme.colors.surface },
    title: { fontSize: 24, fontWeight: '700', color: theme.colors.text, marginBottom: 4 },
    subtitle: { fontSize: 14, color: theme.colors.textSecondary, marginBottom: 15 },
    
    // New Rank Card Styling
    rankCard: { borderRadius: 16, overflow: 'hidden', marginBottom: 10, elevation: 4 },
    rankGradient: { padding: 15, flexDirection: 'row', alignItems: 'center' },
    rankCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#fff' },

    tabContainer: { flexDirection: 'row', backgroundColor: theme.colors.surface, borderBottomWidth: 1, borderBottomColor: theme.colors.outline },
    tab: { flex: 1, paddingVertical: 16, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
    activeTab: { borderBottomColor: theme.colors.primary },
    tabText: { fontSize: 14, fontWeight: '600', color: theme.colors.textSecondary },
    activeTabText: { color: theme.colors.primary },
    
    content: { flex: 1, padding: 20 },
    statsContainer: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 24 },
    statCard: { backgroundColor: theme.colors.surface, borderRadius: 12, padding: 16, alignItems: 'center', flex: 1, marginHorizontal: 4 },
    statValue: { fontSize: 24, fontWeight: '700', color: theme.colors.primary, marginBottom: 4 },
    statLabel: { fontSize: 12, color: theme.colors.textSecondary, textAlign: 'center' },
    
    achievementCard: { backgroundColor: theme.colors.surface, borderRadius: 16, padding: 20, marginBottom: 16, flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderColor: theme.colors.outline },
    unlockedAchievement: { borderColor: theme.colors.primary },
    achievementIcon: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    achievementInfo: { flex: 1 },
    achievementTitle: { fontSize: 16, fontWeight: '700', color: theme.colors.text, marginBottom: 4 },
    achievementDescription: { fontSize: 14, color: theme.colors.textSecondary, lineHeight: 20, marginBottom: 8 },
    achievementMeta: { flexDirection: 'row', alignItems: 'center' },
    achievementPoints: { fontSize: 12, fontWeight: '600', color: theme.colors.primary, marginRight: 12 },
    achievementDate: { fontSize: 12, color: theme.colors.textSecondary },
    lockedAchievement: { opacity: 0.6 },
    
    streakCard: { backgroundColor: theme.colors.surface, borderRadius: 16, padding: 24, marginBottom: 16, alignItems: 'center' },
    streakIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: theme.colors.primaryContainer, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
    streakNumber: { fontSize: 36, fontWeight: '700', color: theme.colors.primary, marginBottom: 8 },
    streakLabel: { fontSize: 16, fontWeight: '600', color: theme.colors.text, marginBottom: 4 },
    streakSubtext: { fontSize: 14, color: theme.colors.textSecondary, textAlign: 'center' },
    
    progressCard: { backgroundColor: theme.colors.surface, borderRadius: 12, padding: 16, marginBottom: 12 },
    progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    progressTitle: { fontSize: 16, fontWeight: '600', color: theme.colors.text },
    progressStats: { flexDirection: 'row', alignItems: 'center' },
    progressStat: { fontSize: 12, color: theme.colors.textSecondary, marginLeft: 8 },
    progressBar: { height: 6, backgroundColor: theme.colors.outline, borderRadius: 3, overflow: 'hidden' },
    progressFill: { height: '100%', backgroundColor: theme.colors.primary, borderRadius: 3 },
    
    emptyState: { alignItems: 'center', paddingVertical: 40 },
    emptyIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: theme.colors.outline, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
    emptyText: { fontSize: 16, color: theme.colors.textSecondary, textAlign: 'center' },
    sectionTitle: { color: theme.colors.text, fontSize: 18, fontWeight: '700', marginBottom: 12 }
  });

  const renderRankHeader = () => (
    <View style={styles.rankCard}>
      <LinearGradient colors={[rank.color, '#1e293b']} style={styles.rankGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View style={styles.rankCircle}>
          <Icon name={rank.icon as any} size={30} color="#fff" />
        </View>
        <View style={{ marginLeft: 15, flex: 1 }}>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '800' }}>{rank.name} Rank {rank.badge}</Text>
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>{rank.next}</Text>
        </View>
      </LinearGradient>
    </View>
  );

  const renderAchievements = () => {
    if (achievementsLoading) return <LoadingScreen />;
    if (achievementsError) return <ErrorScreen onRetry={() => {}} />;
    const { unlocked_achievements = [], locked_achievements = [], total_points = 0 } = achievementsData || {};

    return (
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}><Text style={styles.statValue}>{unlocked_achievements.length}</Text><Text style={styles.statLabel}>Unlocked</Text></View>
          <View style={styles.statCard}><Text style={styles.statValue}>{locked_achievements.length}</Text><Text style={styles.statLabel}>Locked</Text></View>
          <View style={styles.statCard}><Text style={styles.statValue}>{total_points}</Text><Text style={styles.statLabel}>Points</Text></View>
        </View>

        {unlocked_achievements.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Unlocked Achievements</Text>
            {unlocked_achievements.map((achievement: Achievement) => (
              <View key={achievement.id} style={[styles.achievementCard, styles.unlockedAchievement]}>
                <View style={[styles.achievementIcon, { backgroundColor: getAchievementColor(achievement.achievement_type) + '20' }]}>
                  <Icon name={getAchievementIcon(achievement.achievement_type)} size={24} color={getAchievementColor(achievement.achievement_type)} />
                </View>
                <View style={styles.achievementInfo}>
                  <Text style={styles.achievementTitle}>{achievement.title}</Text>
                  <Text style={styles.achievementDescription}>{achievement.description}</Text>
                  <View style={styles.achievementMeta}>
                    <Text style={styles.achievementPoints}>{achievement.points_earned} points</Text>
                    {achievement.unlocked_at && <Text style={styles.achievementDate}>Unlocked {new Date(achievement.unlocked_at).toLocaleDateString()}</Text>}
                  </View>
                </View>
              </View>
            ))}
          </>
        )}
        {/* ... (Locked achievements logic same as your original) */}
        {locked_achievements.map((achievement: Achievement) => (
            <View key={achievement.id} style={[styles.achievementCard, styles.lockedAchievement]}>
                <View style={[styles.achievementIcon, { backgroundColor: theme.colors.outline }]}><Icon name="lock" size={24} color={theme.colors.textSecondary} /></View>
                <View style={styles.achievementInfo}>
                    <Text style={styles.achievementTitle}>{achievement.title}</Text>
                    <Text style={styles.achievementDescription}>{achievement.description}</Text>
                </View>
            </View>
        ))}
      </ScrollView>
    );
  };

  const renderStreaks = () => {
    if (streakLoading) return <LoadingScreen />;
    const streak = streakData || {};
    return (
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.streakCard}>
          <View style={styles.streakIcon}><Icon name="local-fire-department" size={40} color={theme.colors.primary} /></View>
          <Text style={styles.streakNumber}>{streak.current_streak || 0}</Text>
          <Text style={styles.streakLabel}>Day Streak</Text>
          <Text style={styles.streakSubtext}>Keep learning to maintain your streak!</Text>
        </View>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}><Text style={styles.statValue}>{streak.longest_streak || 0}</Text><Text style={styles.statLabel}>Longest</Text></View>
          <View style={styles.statCard}><Text style={styles.statValue}>{streak.target_streak || 7}</Text><Text style={styles.statLabel}>Target</Text></View>
        </View>
      </ScrollView>
    );
  };

  const renderProgress = () => {
    if (progressLoading) return <LoadingScreen />;
    const progress = progressData || {};
    return (
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.statsContainer}>
            <View style={styles.statCard}><Text style={styles.statValue}>{progress.completed_steps || 0}</Text><Text style={styles.statLabel}>Steps</Text></View>
            <View style={styles.statCard}><Text style={styles.statValue}>{Math.round(progress.total_time_spent / 60) || 0}</Text><Text style={styles.statLabel}>Hours</Text></View>
        </View>
        {/* Pathway progress mapping (same as your original) */}
        {progress.pathway_progress && Object.entries(progress.pathway_progress).map(([title, data]: [string, any]) => (
            <View key={title} style={styles.progressCard}>
                <Text style={styles.progressTitle}>{title}</Text>
                <View style={[styles.progressBar, {marginTop: 10}]}><View style={[styles.progressFill, {width: `${(data.completed_steps/data.total_steps)*100}%`}]} /></View>
            </View>
        ))}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Achievements & Progress</Text>
        <Text style={styles.subtitle}>Track your learning journey</Text>
        {renderRankHeader()}
      </View>

      <View style={styles.tabContainer}>
        {['achievements', 'streaks', 'progress'].map((tab) => (
          <TouchableOpacity 
            key={tab} 
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab as any)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab.charAt(0).toUpperCase() + tab.slice(1)}</Text>
          </TouchableOpacity>
        ))}
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