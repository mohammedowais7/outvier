import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { MaterialIcons as Icon } from '@expo/vector-icons';

import { useTheme } from '../contexts/ThemeContext';
import { apiService } from '../services/api';
import { TeamMatch } from '../types/outvier';
import LoadingScreen from '../components/LoadingScreen';
import ErrorScreen from '../components/ErrorScreen';

interface Props { route: any; navigation: any; }

const MatchDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { matchId } = route.params;
  const { theme } = useTheme();
  const { data, isLoading, error, refetch } = useQuery<TeamMatch>({
    queryKey: ['match', matchId],
    queryFn: () => apiService.get(`/outvier/matches/${matchId}/`).then(res => res.data)
  });

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: { padding: 20 },
    title: { fontSize: 22, fontWeight: '700', color: theme.colors.text, marginBottom: 6 },
    subtitle: { color: theme.colors.textSecondary },
    section: { paddingHorizontal: 20, paddingVertical: 12 },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: theme.colors.text, marginBottom: 8 },
    chip: { backgroundColor: theme.colors.primaryContainer, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, marginRight: 6, marginBottom: 6 },
    chipText: { color: theme.colors.primary, fontWeight: '600' },
    actions: { flexDirection: 'row', justifyContent: 'space-between', padding: 20 },
    button: { flex: 1, backgroundColor: theme.colors.primary, borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginRight: 8 },
    buttonText: { color: theme.colors.onPrimary, fontWeight: '700' },
    secondaryButton: { flex: 1, backgroundColor: theme.colors.surface, borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginLeft: 8, borderWidth: 1, borderColor: theme.colors.outline },
    secondaryText: { color: theme.colors.text, fontWeight: '700' },
  });

  if (isLoading) return <LoadingScreen />;
  if (error || !data) return <ErrorScreen onRetry={refetch} />;

  const match = data;

  const accept = async () => {
    try {
      await apiService.acceptMatch(match.id);
      Alert.alert('Success', 'Match accepted');
      refetch();
    } catch (e) {
      Alert.alert('Error', 'Failed to accept match');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>{match.match_type.replace('_', ' ').toUpperCase()}</Text>
          <Text style={styles.subtitle}>{match.compatibility_score}/10 compatibility</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Matched Members</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {match.matched_users_names?.length ? match.matched_users_names.map((n, i) => (
              <View key={i} style={styles.chip}><Text style={styles.chipText}>{n}</Text></View>
            )) : <Text style={{ color: theme.colors.textSecondary }}>None</Text>}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reason</Text>
          <Text style={{ color: theme.colors.text }}>{match.match_reason || 'No reason provided'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Suggested Roles</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {match.suggested_roles?.length ? match.suggested_roles.map((r, i) => (
              <View key={i} style={styles.chip}><Text style={styles.chipText}>{r}</Text></View>
            )) : <Text style={{ color: theme.colors.textSecondary }}>None</Text>}
          </View>
        </View>
      </ScrollView>

      <View style={styles.actions}>
        {!match.is_accepted && (
          <TouchableOpacity style={styles.button} onPress={accept}>
            <Text style={styles.buttonText}>Accept Match</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.secondaryText}>Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default MatchDetailScreen;


