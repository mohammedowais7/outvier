import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { MaterialIcons as Icon } from '@expo/vector-icons';

import { useTheme } from '../contexts/ThemeContext';
import { apiService } from '../services/api';
import { Goal } from '../types/outvier';
import LoadingScreen from '../components/LoadingScreen';
import ErrorScreen from '../components/ErrorScreen';
import GoalCard from '../components/GoalCard';
import SearchBar from '../components/SearchBar';
import FilterModal, { FilterOptions } from '../components/FilterModal';
import { createMobileStyles, getResponsiveDimensions } from '../styles/mobileLayout';
import { SafeAreaView } from 'react-native-safe-area-context';

interface GoalsScreenProps {
  navigation: any;
}

const GoalsScreen: React.FC<GoalsScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const dims = getResponsiveDimensions();
  const mobileStyles = createMobileStyles(theme);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({});
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filteredGoals, setFilteredGoals] = useState<Goal[]>([]);
  
  const { data, isLoading, error, refetch, isRefetching } = useQuery<Goal[]>({
    queryKey: ['goals'],
    queryFn: async () => {
      const response = await apiService.getGoals();
      // Handle paginated response - extract results array
      return response.data.results || response.data;
    }
  });

  // Filter goals based on search and filters
  React.useEffect(() => {
    if (!data) return;
    
    let filtered = [...data];
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(goal =>
        goal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        goal.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply status filter
    if (filters.goalStatus && filters.goalStatus.length > 0) {
      filtered = filtered.filter(goal => filters.goalStatus!.includes(goal.status));
    }
    
    // Apply priority filter
    if (filters.goalPriority && filters.goalPriority.length > 0) {
      filtered = filtered.filter(goal => filters.goalPriority!.includes(goal.priority));
    }
    
    // Apply type filter
    if (filters.goalType && filters.goalType.length > 0) {
      filtered = filtered.filter(goal => filters.goalType!.includes(goal.goal_type));
    }
    
    // Apply sorting
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        let aValue, bValue;
        
        switch (filters.sortBy) {
          case 'title':
            aValue = a.title.toLowerCase();
            bValue = b.title.toLowerCase();
            break;
          case 'priority':
            const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
            aValue = priorityOrder[a.priority as keyof typeof priorityOrder];
            bValue = priorityOrder[b.priority as keyof typeof priorityOrder];
            break;
          case 'progress':
            aValue = a.progress_percentage;
            bValue = b.progress_percentage;
            break;
          case 'created_at':
          case 'updated_at':
          default:
            aValue = new Date(a[filters.sortBy as keyof Goal] as string).getTime();
            bValue = new Date(b[filters.sortBy as keyof Goal] as string).getTime();
            break;
        }
        
        if (filters.sortOrder === 'desc') {
          return bValue > aValue ? 1 : -1;
        }
        return aValue > bValue ? 1 : -1;
      });
    }
    
    setFilteredGoals(filtered);
  }, [data, searchQuery, filters]);

  const styles = StyleSheet.create({
    container: mobileStyles.container,
    header: mobileStyles.sectionHeader,
    title: mobileStyles.sectionTitle,
    addButton: {
      ...mobileStyles.primaryButton,
      flexDirection: 'row',
      paddingHorizontal: dims.spacing.m,
      paddingVertical: dims.spacing.s,
    },
    addButtonText: {
      ...mobileStyles.buttonText,
      marginLeft: dims.spacing.s,
    },
    content: {
      flex: 1,
      paddingHorizontal: dims.layout.screenPadding,
    },
    list: mobileStyles.list,
    empty: mobileStyles.emptyState,
    emptyText: mobileStyles.emptyText,
  });

  if (isLoading) return <LoadingScreen />;
  if (error) return <ErrorScreen onRetry={refetch} />;

  const goals = filteredGoals.length > 0 ? filteredGoals : (data || []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Goals</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('CreateGoal')}>
          <Icon name="add" size={dims.components.icon.small} color={theme.colors.onPrimary} />
          <Text style={styles.addButtonText}>New Goal</Text>
        </TouchableOpacity>
      </View>

      <SearchBar
        placeholder="Search goals..."
        onSearch={setSearchQuery}
        onFilterPress={() => setShowFilterModal(true)}
        showFilter={true}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: dims.spacing.l }}
      >
        {goals.length ? (
          <View style={styles.list}>
            {goals.map(goal => (
              <GoalCard 
                key={goal.id} 
                goal={goal} 
                navigation={navigation}
                onEdit={() => navigation.navigate('EditGoal', { goal })}
                onViewMilestones={() => navigation.navigate('GoalMilestones', { goal })}
              />
            ))}
          </View>
        ) : (
          <View style={styles.empty}>
            <Icon name="flag" size={dims.components.icon.large} color={theme.colors.textSecondary} />
            <Text style={styles.emptyText}>
              {searchQuery || Object.keys(filters).length > 0 
                ? 'No goals match your search' 
                : 'No goals yet. Create your first goal!'
              }
            </Text>
          </View>
        )}
      </ScrollView>

      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={setFilters}
        currentFilters={filters}
        filterType="goals"
      />
    </SafeAreaView>
  );
};

export default GoalsScreen;


