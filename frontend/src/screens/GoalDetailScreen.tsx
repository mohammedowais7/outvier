import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';

import { useTheme } from '../contexts/ThemeContext';
import { apiService } from '../services/api';
import { Goal } from '../types/outvier';
import LoadingScreen from '../components/LoadingScreen';
import ErrorScreen from '../components/ErrorScreen';

interface Props { route: any; navigation: any; }

const GoalDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { goalId } = route.params;
  const { theme } = useTheme();
  const { data, isLoading, error, refetch } = useQuery<Goal>({
    queryKey: ['goal', goalId],
    queryFn: () => apiService.get(`/outvier/goals/${goalId}/`).then(res => res.data)
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

  const goal = data;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>{goal.title}</Text>
          <Text style={styles.subtitle}>{goal.goal_type.toUpperCase()} • {goal.priority.toUpperCase()}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={{ color: theme.colors.text }}>{goal.description || 'No description'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Related Skills</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {goal.related_skills_names?.length ? goal.related_skills_names.map((s, i) => (
              <View key={i} style={styles.chip}><Text style={styles.chipText}>{s}</Text></View>
            )) : <Text style={{ color: theme.colors.textSecondary }}>None</Text>}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Milestones</Text>
          {goal.milestones?.length ? goal.milestones.map(m => (
            <View key={m.id} style={{ paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: theme.colors.outline }}>
              <Text style={{ color: theme.colors.text, fontWeight: '600' }}>{m.title}</Text>
              <Text style={{ color: theme.colors.textSecondary }}>{m.description}</Text>
            </View>
          )) : <Text style={{ color: theme.colors.textSecondary }}>No milestones yet</Text>}
        </View>
      </ScrollView>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.button} onPress={() => {
          apiService.updateGoalProgress(goal.id, Math.min(100, goal.progress_percentage + 10));
          refetch();
        }}>
          <Text style={styles.buttonText}>+10% Progress</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.secondaryText}>Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default GoalDetailScreen;


