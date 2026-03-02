import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { MaterialIcons as Icon } from '@expo/vector-icons';

import { useTheme } from '../contexts/ThemeContext';
import { apiService } from '../services/api';
import { Goal } from '../types/outvier';
import LoadingScreen from '../components/LoadingScreen';
import ErrorScreen from '../components/ErrorScreen';
import { createMobileStyles, getResponsiveDimensions } from '../styles/mobileLayout';

interface Props { route: any; navigation: any; }

const GoalDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  // FIX: Destructure both potential params for safety
  const { goalId, goal: initialGoal } = route.params || {};
  const { theme } = useTheme();
  
  const dims = getResponsiveDimensions();
  const mobileStyles = createMobileStyles(theme);

  // Fetch fresh data from API
  const { data, isLoading, error, refetch } = useQuery<Goal>({
    queryKey: ['goal', goalId || initialGoal?.id],
    queryFn: () => apiService.get(`/outvier/goals/${goalId || initialGoal?.id}/`).then(res => res.data),
    // Agar initial goal pass hua hai to pehle wo dikhao
    initialData: initialGoal,
  });

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: { padding: 20, paddingTop: 10 },
    title: { fontSize: 24, fontWeight: 'bold', color: theme.colors.text, marginBottom: 8 },
    typeTag: { 
        alignSelf: 'flex-start',
        paddingHorizontal: 12, 
        paddingVertical: 4, 
        borderRadius: 20, 
        backgroundColor: theme.colors.primaryContainer,
        marginBottom: 10
    },
    typeText: { color: theme.colors.primary, fontSize: 12, fontWeight: '700' },
    section: { paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: theme.colors.outlineVariant },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: theme.colors.text, marginBottom: 10 },
    chip: { backgroundColor: theme.colors.surfaceVariant, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginRight: 8, marginBottom: 8 },
    chipText: { color: theme.colors.onSurfaceVariant, fontSize: 13, fontWeight: '500' },
    milestoneItem: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        paddingVertical: 10, 
        paddingHorizontal: 15,
        backgroundColor: theme.colors.surface,
        borderRadius: 10,
        marginBottom: 8
    },
    footer: { padding: 20, flexDirection: 'row', gap: 10, backgroundColor: theme.colors.background },
    primaryButton: { ...mobileStyles.primaryButton, flex: 2 },
    manageButton: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'center', 
        backgroundColor: theme.colors.secondaryContainer,
        padding: 12,
        borderRadius: 12,
        marginTop: 10
    }
  });

  if (isLoading && !data) return <LoadingScreen />;
  if (error && !data) return <ErrorScreen onRetry={refetch} />;

  const goal = data!;

  return (
    <View style={styles.container}>
      {/* Custom Header with Back Button */}
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 15 }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={{ marginLeft: 15, fontSize: 18, fontWeight: '600', color: theme.colors.text }}>Goal Details</Text>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
      >
        <View style={styles.header}>
          <View style={styles.typeTag}>
            <Text style={styles.typeText}>{goal.goal_type.toUpperCase()}</Text>
          </View>
          <Text style={styles.title}>{goal.title}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Icon name="priority-high" size={16} color={theme.colors.error} />
            <Text style={{ color: theme.colors.textSecondary, marginLeft: 4 }}>{goal.priority.toUpperCase()} Priority</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Progress ({goal.progress_percentage}%)</Text>
          <View style={{ height: 8, backgroundColor: theme.colors.outline, borderRadius: 4 }}>
            <View style={{ width: `${goal.progress_percentage}%`, height: 8, backgroundColor: theme.colors.primary, borderRadius: 4 }} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={{ color: theme.colors.text, lineHeight: 20 }}>{goal.description || 'No description provided.'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills to Master</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {goal.related_skills_names?.map((skill, index) => (
              <View key={index} style={styles.chip}><Text style={styles.chipText}>{skill}</Text></View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={styles.sectionTitle}>Key Milestones</Text>
            <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>{goal.milestones?.length || 0} Total</Text>
          </View>
          
          {goal.milestones?.slice(0, 3).map(m => (
            <View key={m.id} style={styles.milestoneItem}>
              <Icon 
                name={m.is_completed ? "check-circle" : "radio-button-unchecked"} 
                size={20} 
                color={m.is_completed ? theme.colors.success : theme.colors.outline} 
              />
              <Text style={{ marginLeft: 10, color: theme.colors.text, flex: 1 }}>{m.title}</Text>
            </View>
          ))}

          <TouchableOpacity 
            style={styles.manageButton} 
            onPress={() => navigation.navigate('GoalMilestones', { goal })}
          >
            <Icon name="list" size={20} color={theme.colors.onSecondaryContainer} />
            <Text style={{ marginLeft: 8, color: theme.colors.onSecondaryContainer, fontWeight: '600' }}>Manage All Milestones</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.primaryButton} 
          onPress={async () => {
            const newProgress = Math.min(100, goal.progress_percentage + 10);
            await apiService.patch(`/outvier/goals/${goal.id}/`, { progress_percentage: newProgress });
            refetch();
          }}
        >
          <Text style={mobileStyles.buttonText}>Boost Progress +10%</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default GoalDetailScreen;