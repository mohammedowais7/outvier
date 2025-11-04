import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '../contexts/ThemeContext';
import { TeamMatch } from '../types/outvier';

interface MatchCardProps {
  match: TeamMatch;
  navigation: any;
  onViewActions?: () => void;
}

const MatchCard: React.FC<MatchCardProps> = ({ match, navigation, onViewActions }) => {
  const { theme } = useTheme();

  const handlePress = () => {
    // Navigate to match detail within the current stack
    if (navigation.getParent) {
      // If we're in a nested navigator, navigate to the parent's Matches tab
      navigation.getParent()?.navigate('Matches', {
        screen: 'MatchDetail',
        params: { matchId: match.id }
      });
    } else {
      // Direct navigation
      navigation.navigate('MatchDetail', { matchId: match.id });
    }
  };

  const getMatchIcon = (type: string) => {
    switch (type) {
      case 'project':
        return 'folder';
      case 'mentorship':
        return 'school';
      case 'peer_learning':
        return 'people';
      case 'skill_exchange':
        return 'swap-horiz';
      default:
        return 'people';
    }
  };

  const getMatchColor = (type: string) => {
    switch (type) {
      case 'project':
        return theme.colors.primary;
      case 'mentorship':
        return theme.colors.secondary;
      case 'peer_learning':
        return theme.colors.tertiary;
      case 'skill_exchange':
        return theme.colors.accent;
      default:
        return theme.colors.primary;
    }
  };

  const getCompatibilityColor = (score: number) => {
    if (score >= 8) return theme.colors.success;
    if (score >= 6) return theme.colors.warning;
    return theme.colors.error;
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
      backgroundColor: getMatchColor(match.match_type) + '20',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    headerText: {
      flex: 1,
    },
    type: {
      fontSize: 12,
      color: getMatchColor(match.match_type),
      fontWeight: '600',
      textTransform: 'uppercase',
      marginBottom: 2,
    },
    compatibility: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
    },
    membersContainer: {
      marginBottom: 12,
    },
    membersLabel: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginBottom: 4,
    },
    membersList: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    memberChip: {
      backgroundColor: theme.colors.primaryContainer,
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingVertical: 4,
      marginRight: 4,
      marginBottom: 4,
    },
    memberText: {
      fontSize: 10,
      color: theme.colors.primary,
      fontWeight: '500',
    },
    reasonContainer: {
      marginBottom: 12,
    },
    reasonLabel: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginBottom: 4,
    },
    reasonText: {
      fontSize: 12,
      color: theme.colors.text,
      lineHeight: 16,
    },
    statusContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    statusBadge: {
      backgroundColor: match.is_accepted ? theme.colors.success : theme.colors.warning,
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    statusText: {
      fontSize: 10,
      color: theme.colors.onPrimary,
      fontWeight: '600',
      textTransform: 'uppercase',
    },
    actionButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: 8,
      paddingVertical: 6,
      paddingHorizontal: 12,
    },
    actionButtonText: {
      color: theme.colors.onPrimary,
      fontSize: 10,
      fontWeight: '600',
    },
  });

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Icon 
            name={getMatchIcon(match.match_type)} 
            size={20} 
            color={getMatchColor(match.match_type)} 
          />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.type}>
            {match.match_type.replace('_', ' ')}
          </Text>
          <Text style={styles.compatibility}>
            {match.compatibility_score}/10 compatibility
          </Text>
        </View>
      </View>

      <View style={styles.membersContainer}>
        <Text style={styles.membersLabel}>Matched Members:</Text>
        <View style={styles.membersList}>
          {match.matched_users_names.slice(0, 2).map((name, index) => (
            <View key={index} style={styles.memberChip}>
              <Text style={styles.memberText}>{name}</Text>
            </View>
          ))}
          {match.matched_users_names.length > 2 && (
            <View style={styles.memberChip}>
              <Text style={styles.memberText}>+{match.matched_users_names.length - 2}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.reasonContainer}>
        <Text style={styles.reasonLabel}>Why this match:</Text>
        <Text style={styles.reasonText} numberOfLines={2}>
          {match.match_reason}
        </Text>
      </View>

      <View style={styles.statusContainer}>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>
            {match.is_accepted ? 'Accepted' : 'Pending'}
          </Text>
        </View>
        {!match.is_accepted && (
          <View style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Accept</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default MatchCard;
