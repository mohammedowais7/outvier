import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import Swiper from 'react-native-deck-swiper';
import { showMessage } from 'react-native-flash-message';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '../contexts/ThemeContext';
import { apiService, goalService } from '../services/api';
import { Goal } from '../types/outvier';
import LoadingScreen from '../components/LoadingScreen';
import ErrorScreen from '../components/ErrorScreen';
import SearchBar from '../components/SearchBar';
import FilterModal, { FilterOptions } from '../components/FilterModal';
import { createMobileStyles, getResponsiveDimensions } from '../styles/mobileLayout';

const { height } = Dimensions.get('window');

interface GoalsScreenProps {
  navigation: any;
}

const GoalsScreen: React.FC<GoalsScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const queryClient = useQueryClient();
  const dims = getResponsiveDimensions();
  const mobileStyles = createMobileStyles(theme);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({});
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filteredGoals, setFilteredGoals] = useState<Goal[]>([]);
  
  const { data, isLoading, error, refetch } = useQuery<Goal[]>({
    queryKey: ['goals'],
    queryFn: async () => {
      const response = await apiService.getGoals();
      const results = response.data.results || response.data;
      return results.filter((g: Goal) => !g.is_completed);
    }
  });

  const swipeMutation = useMutation({
    mutationFn: ({ id, completed }: { id: number, completed: boolean }) => 
      goalService.updateGoalStatus(id, completed),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      showMessage({
        message: "Goal Completed!",
        description: "Congratulations! Your progress has been updated.",
        type: "success",
        icon: "success",
        floating: true,
      });
    },
    onError: () => {
      showMessage({
        message: "Update Failed",
        description: "Unable to update goal. Please try again.",
        type: "danger",
        icon: "danger",
      });
    }
  });

  // Filter Logic
  React.useEffect(() => {
    if (!data) return;
    let filtered = [...data];
    if (searchQuery) {
      filtered = filtered.filter(goal =>
        goal.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredGoals(filtered);
  }, [data, searchQuery, filters]);

  const styles = StyleSheet.create({
    container: mobileStyles.container,
    header: {
      ...mobileStyles.sectionHeader,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 10,
    },
    title: mobileStyles.sectionTitle,
    addButton: {
      backgroundColor: theme.colors.primary,
      flexDirection: 'row',
      paddingHorizontal: 15,
      paddingVertical: 8,
      borderRadius: 12,
      alignItems: 'center',
    },
    addButtonText: { color: theme.colors.onPrimary, marginLeft: 8, fontWeight: 'bold' },
    swiperWrapper: { flex: 1, marginTop: 10 },
    card: {
      height: height * 0.55,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.colors.outlineVariant,
      justifyContent: "center",
      backgroundColor: theme.colors.elevation.level2,
      padding: 24,
      elevation: 5,
    },
    cardTitle: { fontSize: 26, fontWeight: 'bold', color: theme.colors.primary, textAlign: 'center', marginBottom: 12 },
    cardDesc: { fontSize: 16, color: theme.colors.onSurfaceVariant, textAlign: 'center', lineHeight: 22 },
    deadlineBadge: {
        marginTop: 30,
        padding: 10,
        backgroundColor: theme.colors.secondaryContainer,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    deadlineText: { color: theme.colors.onSecondaryContainer, fontWeight: 'bold', marginLeft: 8 },
    labelDone: { color: '#2E7D32', fontSize: 32, fontWeight: 'bold', borderWidth: 3, borderColor: '#2E7D32', padding: 10, borderRadius: 10 },
    labelNotDone: { color: '#E65100', fontSize: 32, fontWeight: 'bold', borderWidth: 3, borderColor: '#E65100', padding: 10, borderRadius: 10 },
  });

  if (isLoading) return <LoadingScreen />;
  if (error) return <ErrorScreen onRetry={refetch} />;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Goals</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('CreateGoal')}>
          <Icon name="add" size={20} color={theme.colors.onPrimary} />
          <Text style={styles.addButtonText}>Create New</Text>
        </TouchableOpacity>
      </View>

      <SearchBar
        placeholder="Search your goals..."
        onSearch={setSearchQuery}
        onFilterPress={() => setShowFilterModal(true)}
        showFilter={true}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <View style={styles.swiperWrapper}>
        {filteredGoals.length > 0 ? (
          <Swiper
            cards={filteredGoals}
            key={filteredGoals.length}
            renderCard={(goal) => (
              <View style={styles.card}>
                <Icon name="emoji-events" size={60} color={theme.colors.primary} style={{alignSelf: 'center', marginBottom: 20}} />
                <Text style={styles.cardTitle}>{goal.title}</Text>
                <Text style={styles.cardDesc} numberOfLines={4}>
                  {goal.description || "No detailed description available."}
                </Text>
                
                <View style={styles.deadlineBadge}>
                    <Icon name="event" size={20} color={theme.colors.onSecondaryContainer} />
                    <Text style={styles.deadlineText}>
                        Deadline: {new Date(goal.deadline).toLocaleDateString()}
                    </Text>
                </View>

                <TouchableOpacity 
                  style={{marginTop: 25, alignItems: 'center'}}
                  onPress={() => navigation.navigate('GoalMilestones', { goal })}
                >
                  <Text style={{color: theme.colors.primary, fontWeight: '600', textDecorationLine: 'underline'}}>
                    View Milestones
                  </Text>
                </TouchableOpacity>
              </View>
            )}
            onSwipedRight={(index) => {
              swipeMutation.mutate({ id: filteredGoals[index].id, completed: true });
            }}
            onSwipedLeft={(index) => {
              showMessage({
                message: "Goal Deferred",
                description: "This goal remains in your active list.",
                type: "info",
                icon: "info",
              });
            }}
            infinite={true} 
            disableBottomSwipe={true}
            disableTopSwipe={true}
            cardIndex={0}
            backgroundColor={'transparent'}
            stackSize={3}
            animateOverlayLabelsOpacity
            overlayLabels={{
              left: {
                title: 'LATER',
                style: { label: styles.labelNotDone, wrapper: { alignItems: 'flex-end', justifyContent: 'flex-start', marginTop: 30, marginLeft: -30 } }
              },
              right: {
                title: 'COMPLETED',
                style: { label: styles.labelDone, wrapper: { alignItems: 'flex-start', justifyContent: 'flex-start', marginTop: 30, marginLeft: 30 } }
              }
            }}
          />
        ) : (
          <View style={mobileStyles.emptyState}>
            <Icon name="flag" size={60} color={theme.colors.textSecondary} />
            <Text style={mobileStyles.emptyText}>No active goals found.</Text>
            <TouchableOpacity onPress={refetch} style={{marginTop: 20}}>
                <Text style={{color: theme.colors.primary}}>Refresh List</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

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