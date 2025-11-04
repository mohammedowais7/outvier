import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { MaterialIcons as Icon } from '@expo/vector-icons';

import { useTheme } from '../contexts/ThemeContext';
import { apiService } from '../services/api';
import { ProgressInsight } from '../types/outvier';
import LoadingScreen from '../components/LoadingScreen';
import ErrorScreen from '../components/ErrorScreen';
import InsightCard from '../components/InsightCard';

const InsightsScreen: React.FC<any> = () => {
  const { theme } = useTheme();
  const { data, isLoading, error, refetch, isRefetching } = useQuery<ProgressInsight[]>({
    queryKey: ['insights'],
    queryFn: () => apiService.getInsights().then(res => res.data)
  });

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: { paddingHorizontal: 20, paddingVertical: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    title: { fontSize: 22, fontWeight: '700', color: theme.colors.text },
    markButton: { backgroundColor: theme.colors.primary, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center' },
    markButtonText: { color: theme.colors.onPrimary, fontWeight: '600', marginLeft: 6 },
    content: { paddingHorizontal: 20 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    empty: { alignItems: 'center', paddingVertical: 40 },
    emptyText: { color: theme.colors.textSecondary, marginTop: 8 },
  });

  if (isLoading) return <LoadingScreen />;
  if (error) return <ErrorScreen onRetry={refetch} />;

  const insights = data || [];

  const markAllRead = async () => {
    for (const ins of insights.filter(i => !i.is_read)) {
      await apiService.markInsightAsRead(ins.id);
    }
    refetch();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Insights</Text>
        <TouchableOpacity style={styles.markButton} onPress={markAllRead}>
          <Icon name="done-all" size={18} color={theme.colors.onPrimary} />
          <Text style={styles.markButtonText}>Mark All Read</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        showsVerticalScrollIndicator={false}
      >
        {insights.length ? (
          <View style={styles.grid}>
            {insights.map(ins => (
              <InsightCard key={ins.id} insight={ins} />
            ))}
          </View>
        ) : (
          <View style={styles.empty}>
            <Icon name="lightbulb" size={48} color={theme.colors.textSecondary} />
            <Text style={styles.emptyText}>No insights yet.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default InsightsScreen;


