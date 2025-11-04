import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '../contexts/ThemeContext';
import { apiService } from '../services/api';
import { GrowthPathway } from '../types/outvier';
import LoadingScreen from '../components/LoadingScreen';
import ErrorScreen from '../components/ErrorScreen';
import ProgressCard from '../components/ProgressCard';

const PathwaysScreen: React.FC<any> = ({ navigation }) => {
  const { theme } = useTheme();
  const { data, isLoading, error, refetch, isRefetching } = useQuery<GrowthPathway[]>({
    queryKey: ['pathways'],
    queryFn: async () => {
      const response = await apiService.getPathways();
      // Handle paginated response - extract results array
      return response.data.results || response.data;
    }
  });

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: { paddingHorizontal: 20, paddingVertical: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    title: { fontSize: 22, fontWeight: '700', color: theme.colors.text },
    recButton: { backgroundColor: theme.colors.primary, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center' },
    recButtonText: { color: theme.colors.onPrimary, fontWeight: '600', marginLeft: 6 },
    content: { paddingHorizontal: 20 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    empty: { alignItems: 'center', paddingVertical: 40 },
    emptyText: { color: theme.colors.textSecondary, marginTop: 8 },
  });

  if (isLoading) return <LoadingScreen />;
  if (error) return <ErrorScreen onRetry={refetch} />;

  const pathways = data || [];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Growth Pathways</Text>
        <TouchableOpacity style={styles.recButton} onPress={() => {
          apiService.getRecommendedPathways();
          refetch();
        }}>
          <Icon name="bolt" size={18} color={theme.colors.onPrimary} />
          <Text style={styles.recButtonText}>Recommend</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {pathways.length ? (
          <View style={styles.grid}>
            {pathways.map(pathway => (
              <ProgressCard key={pathway.id} pathway={pathway} navigation={navigation} />
            ))}
          </View>
        ) : (
          <View style={styles.empty}>
            <Icon name="school" size={48} color={theme.colors.textSecondary} />
            <Text style={styles.emptyText}>No pathways yet. Get recommendations!</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default PathwaysScreen;


