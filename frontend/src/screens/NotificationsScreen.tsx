import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Alert,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MaterialIcons as Icon } from '@expo/vector-icons';

import { useTheme } from '../contexts/ThemeContext';
import { apiService } from '../services/api';
import { Notification } from '../types/outvier';
import LoadingScreen from '../components/LoadingScreen';
import ErrorScreen from '../components/ErrorScreen';

const { width } = Dimensions.get('window');

interface NotificationsScreenProps {
  navigation: any;
}

const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');

  // Fetch notifications
  const { data: notifications, isLoading, error, refetch } = useQuery<Notification[]>({
    queryKey: ['notifications', activeTab],
    queryFn: () => {
      const params = new URLSearchParams();
      if (activeTab === 'unread') {
        params.append('unread_only', 'true');
      }
      params.append('limit', '50');
      
      return apiService.get(`/outvier/notifications/my_notifications/?${params}`).then(res => res.data);
    },
  });

  // Fetch unread count
  const { data: unreadCount } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => apiService.get('/outvier/notifications/unread_count/').then(res => res.data),
  });

  // Mark notification as read
  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: number) =>
      apiService.post(`/outvier/notifications/${notificationId}/mark_read/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
  });

  // Mark all as read
  const markAllReadMutation = useMutation({
    mutationFn: () => apiService.post('/outvier/notifications/mark_all_read/'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
      Alert.alert('Success', 'All notifications marked as read');
    },
  });

  const handleNotificationPress = (notification: Notification) => {
    // Mark as read if unread
    if (!notification.is_read) {
      markAsReadMutation.mutate(notification.id);
    }

    // Navigate based on notification type
    if (notification.action_url) {
      // Handle navigation based on action_url
      if (notification.related_goal) {
        navigation.navigate('EnhancedGoal', { goalId: notification.related_goal });
      } else if (notification.related_pathway) {
        navigation.navigate('PathwayDetail', { pathwayId: notification.related_pathway });
      } else if (notification.related_achievement) {
        navigation.navigate('Achievements');
      }
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'goal_reminder':
      case 'goal_deadline':
      case 'goal_milestone':
        return 'flag';
      case 'pathway_reminder':
      case 'pathway_step':
        return 'school';
      case 'achievement_unlocked':
        return 'star';
      case 'streak_reminder':
      case 'streak_broken':
        return 'local-fire-department';
      case 'match_found':
        return 'people';
      case 'insight_available':
        return 'lightbulb';
      case 'system_update':
        return 'system-update';
      default:
        return 'notifications';
    }
  };

  const getNotificationColor = (type: string, priority: string) => {
    if (priority === 'urgent') return theme.colors.error;
    if (priority === 'high') return theme.colors.warning;
    
    switch (type) {
      case 'goal_deadline':
        return theme.colors.error;
      case 'achievement_unlocked':
        return theme.colors.success;
      case 'streak_broken':
        return theme.colors.error;
      default:
        return theme.colors.primary;
    }
  };

  const formatNotificationTime = (createdAt: string) => {
    const date = new Date(createdAt);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) { // 7 days
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    } else {
      return date.toLocaleDateString();
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
    tabBadge: {
      position: 'absolute',
      top: 8,
      right: 20,
      backgroundColor: theme.colors.error,
      borderRadius: 10,
      minWidth: 20,
      height: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tabBadgeText: {
      color: theme.colors.onPrimary,
      fontSize: 12,
      fontWeight: '600',
    },
    actionBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 12,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
      backgroundColor: theme.colors.primaryContainer,
    },
    actionButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.primary,
      marginLeft: 6,
    },
    content: {
      flex: 1,
    },
    notificationCard: {
      backgroundColor: theme.colors.surface,
      marginHorizontal: 16,
      marginVertical: 6,
      borderRadius: 12,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'flex-start',
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.primary,
    },
    unreadNotification: {
      backgroundColor: theme.colors.primaryContainer + '20',
      borderLeftColor: theme.colors.primary,
    },
    notificationIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.primaryContainer,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    notificationContent: {
      flex: 1,
    },
    notificationHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 4,
    },
    notificationTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      flex: 1,
      marginRight: 8,
    },
    notificationTime: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    notificationMessage: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      lineHeight: 20,
      marginBottom: 8,
    },
    notificationMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    notificationType: {
      fontSize: 12,
      color: theme.colors.primary,
      fontWeight: '600',
      textTransform: 'uppercase',
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderRadius: 6,
      backgroundColor: theme.colors.primary,
    },
    actionButtonText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.onPrimary,
      marginLeft: 4,
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: 60,
      paddingHorizontal: 40,
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
    emptyTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    emptyText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
    },
  });

  if (isLoading) return <LoadingScreen />;
  if (error) return <ErrorScreen onRetry={refetch} />;

  const unreadNotifications = notifications?.filter(n => !n.is_read) || [];
  const displayNotifications = activeTab === 'unread' ? unreadNotifications : notifications || [];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        <Text style={styles.subtitle}>
          Stay updated with your goals and learning progress
        </Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'all' && styles.activeTab]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
            All
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'unread' && styles.activeTab]}
          onPress={() => setActiveTab('unread')}
        >
          <Text style={[styles.tabText, activeTab === 'unread' && styles.activeTabText]}>
            Unread
          </Text>
          {unreadCount?.unread_count > 0 && (
            <View style={styles.tabBadge}>
              <Text style={styles.tabBadgeText}>
                {unreadCount.unread_count > 99 ? '99+' : unreadCount.unread_count}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {activeTab === 'all' && unreadCount?.unread_count > 0 && (
        <View style={styles.actionBar}>
          <Text style={[styles.tabText, { color: theme.colors.text }]}>
            {unreadCount.unread_count} unread notifications
          </Text>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending}
          >
            <Icon name="done-all" size={16} color={theme.colors.primary} />
            <Text style={styles.actionButtonText}>
              {markAllReadMutation.isPending ? 'Marking...' : 'Mark All Read'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {displayNotifications.length > 0 ? (
          displayNotifications.map((notification) => (
            <TouchableOpacity
              key={notification.id}
              style={[
                styles.notificationCard,
                !notification.is_read && styles.unreadNotification
              ]}
              onPress={() => handleNotificationPress(notification)}
            >
              <View style={[
                styles.notificationIcon,
                { backgroundColor: getNotificationColor(notification.notification_type, notification.priority) + '20' }
              ]}>
                <Icon 
                  name={getNotificationIcon(notification.notification_type)} 
                  size={20} 
                  color={getNotificationColor(notification.notification_type, notification.priority)} 
                />
              </View>
              
              <View style={styles.notificationContent}>
                <View style={styles.notificationHeader}>
                  <Text style={styles.notificationTitle} numberOfLines={2}>
                    {notification.title}
                  </Text>
                  <Text style={styles.notificationTime}>
                    {formatNotificationTime(notification.created_at)}
                  </Text>
                </View>
                
                <Text style={styles.notificationMessage} numberOfLines={3}>
                  {notification.message}
                </Text>
                
                <View style={styles.notificationMeta}>
                  <Text style={styles.notificationType}>
                    {notification.notification_type.replace('_', ' ')}
                  </Text>
                  
                  {notification.action_text && (
                    <View style={styles.actionButton}>
                      <Icon name="arrow-forward" size={12} color={theme.colors.onPrimary} />
                      <Text style={styles.actionButtonText}>
                        {notification.action_text}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Icon name="notifications-none" size={32} color={theme.colors.textSecondary} />
            </View>
            <Text style={styles.emptyTitle}>
              {activeTab === 'unread' ? 'No Unread Notifications' : 'No Notifications Yet'}
            </Text>
            <Text style={styles.emptyText}>
              {activeTab === 'unread' 
                ? 'You\'re all caught up! Check back later for new notifications.'
                : 'You\'ll receive notifications about your goals, learning progress, and achievements here.'
              }
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default NotificationsScreen;

