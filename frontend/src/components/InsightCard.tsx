import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';

import { useTheme } from '../contexts/ThemeContext';
import { ProgressInsight } from '../types/outvier';

interface InsightCardProps {
  insight: ProgressInsight;
}

const InsightCard: React.FC<InsightCardProps> = ({ insight }) => {
  const { theme } = useTheme();

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'progress':
        return 'trending-up';
      case 'achievement':
        return 'emoji-events';
      case 'recommendation':
        return 'lightbulb';
      default:
        return 'info';
    }
  };

  const getInsightColor = (type: string, isPositive: boolean) => {
    if (!isPositive) return theme.colors.error;
    
    switch (type) {
      case 'progress':
        return theme.colors.info;
      case 'achievement':
        return theme.colors.success;
      case 'recommendation':
        return theme.colors.warning;
      default:
        return theme.colors.primary;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
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
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    iconContainer: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: getInsightColor(insight.insight_type, insight.is_positive) + '20',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    headerContent: {
      flex: 1,
    },
    type: {
      fontSize: 10,
      color: getInsightColor(insight.insight_type, insight.is_positive),
      fontWeight: '600',
      textTransform: 'uppercase',
      marginBottom: 2,
    },
    title: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 4,
    },
    message: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      lineHeight: 16,
      marginBottom: 8,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    timestamp: {
      fontSize: 10,
      color: theme.colors.textSecondary,
    },
    confidenceContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    confidenceText: {
      fontSize: 10,
      color: theme.colors.textSecondary,
      marginLeft: 4,
    },
    unreadIndicator: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.colors.primary,
      marginTop: 4,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Icon 
            name={getInsightIcon(insight.insight_type)} 
            size={16} 
            color={getInsightColor(insight.insight_type, insight.is_positive)} 
          />
        </View>
        <View style={styles.headerContent}>
          <Text style={styles.type}>
            {insight.insight_type}
          </Text>
          <Text style={styles.title} numberOfLines={2}>
            {insight.title}
          </Text>
        </View>
        {!insight.is_read && <View style={styles.unreadIndicator} />}
      </View>

      <Text style={styles.message} numberOfLines={3}>
        {insight.message}
      </Text>

      <View style={styles.footer}>
        <Text style={styles.timestamp}>
          {formatDate(insight.created_at)}
        </Text>
        <View style={styles.confidenceContainer}>
          <Icon 
            name="star" 
            size={12} 
            color={insight.confidence_score > 0.7 ? theme.colors.warning : theme.colors.textSecondary} 
          />
          <Text style={styles.confidenceText}>
            {Math.round(insight.confidence_score * 100)}%
          </Text>
        </View>
      </View>
    </View>
  );
};

export default InsightCard;
