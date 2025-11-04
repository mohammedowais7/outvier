import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useTheme } from '../contexts/ThemeContext';
import { apiService } from '../services/api';
import { TeamMatch } from '../types/outvier';
import LoadingScreen from '../components/LoadingScreen';
import ErrorScreen from '../components/ErrorScreen';
import MatchCard from '../components/MatchCard';
import SearchBar from '../components/SearchBar';
import FilterModal, { FilterOptions } from '../components/FilterModal';

const MatchesScreen: React.FC<any> = ({ navigation, route }) => {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({});
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filteredMatches, setFilteredMatches] = useState<TeamMatch[]>([]);
  
  const { data, isLoading, error, refetch, isRefetching } = useQuery<TeamMatch[]>({
    queryKey: ['matches'],
    staleTime: 0, // Always fetch fresh data
    cacheTime: 0, // Don't cache
    queryFn: async () => {
      // console.log('Fetching matches...');
      try {
        // Check authentication token
        const sessionId = await AsyncStorage.getItem('sessionId');
        // console.log('Session ID from storage:', sessionId);
        
        const response = await apiService.getMatches();
        // console.log('Matches API response:', response);
        // console.log('Matches API response data:', response.data);
        // console.log('Response status:', response.status);
        // console.log('Response headers:', response.headers);
        // console.log('Full response object keys:', Object.keys(response));
        
        // Handle paginated response
        const data = response.data.results || response.data;
        // console.log('Matches data (after pagination handling):', data);
        return data;
      } catch (error) {
        // console.error('Matches API error:', error);
        // console.error('Error details:', error.response?.data);
        // console.error('Error status:', error.response?.status);
        throw error;
      }
    }
  });

  // Filter matches based on search and filters
  React.useEffect(() => {
    if (!data) {
      console.log('No data available for filtering');
      setFilteredMatches([]);
      return;
    }
    
    console.log('Filtering matches. Original data length:', data.length);
    console.log('Search query:', searchQuery);
    console.log('Filters:', filters);
    
    let filtered = [...data];
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(match => {
        const matchesSearch = 
          match.match_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
          match.match_reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (match.suggested_roles && match.suggested_roles.some(role => 
            role.toLowerCase().includes(searchQuery.toLowerCase())
          )) ||
          (match.required_skills_names && match.required_skills_names.some(skill => 
            skill.toLowerCase().includes(searchQuery.toLowerCase())
          ));
        
        console.log(`Match ${match.id} search result:`, matchesSearch);
        return matchesSearch;
      });
    }
    
    // Apply match type filter
    if (filters.matchType && filters.matchType.length > 0) {
      filtered = filtered.filter(match => {
        const matchesType = filters.matchType!.includes(match.match_type);
        console.log(`Match ${match.id} type filter result:`, matchesType);
        return matchesType;
      });
    }
    
    // Apply compatibility score filter
    if (filters.compatibilityScore) {
      filtered = filtered.filter(match => {
        const matchesScore = 
          match.compatibility_score >= (filters.compatibilityScore!.min || 0) &&
          match.compatibility_score <= (filters.compatibilityScore!.max || 100);
        console.log(`Match ${match.id} score filter result:`, matchesScore);
        return matchesScore;
      });
    }
    
    // Apply sorting
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        let aValue, bValue;
        
        switch (filters.sortBy) {
          case 'compatibility_score':
            aValue = a.compatibility_score;
            bValue = b.compatibility_score;
            break;
          case 'created_at':
          case 'updated_at':
          default:
            aValue = new Date(a[filters.sortBy as keyof TeamMatch] as string).getTime();
            bValue = new Date(b[filters.sortBy as keyof TeamMatch] as string).getTime();
            break;
        }
        
        if (filters.sortOrder === 'desc') {
          return bValue > aValue ? 1 : -1;
        }
        return aValue > bValue ? 1 : -1;
      });
    }
    
    console.log('Filtered matches length:', filtered.length);
    setFilteredMatches(filtered);
  }, [data, searchQuery, filters]);

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: { paddingHorizontal: 20, paddingVertical: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    title: { fontSize: 22, fontWeight: '700', color: theme.colors.text },
    findButton: { backgroundColor: theme.colors.primary, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center' },
    findButtonText: { color: theme.colors.onPrimary, fontWeight: '600', marginLeft: 6 },
    content: { paddingHorizontal: 20 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    empty: { alignItems: 'center', paddingVertical: 40 },
    emptyText: { color: theme.colors.textSecondary, marginTop: 8 },
  });

  if (isLoading) return <LoadingScreen />;
  if (error) return <ErrorScreen onRetry={refetch} />;

  const matches = filteredMatches.length > 0 ? filteredMatches : (data || []);
  
  // console.log('MatchesScreen - data:', data);
  // console.log('MatchesScreen - matches length:', matches.length);
  // console.log('MatchesScreen - isLoading:', isLoading);
  // console.log('MatchesScreen - error:', error);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Matches</Text>
        <TouchableOpacity style={styles.findButton} onPress={() => navigation.navigate('FindMatches')}>
          <Icon name="search" size={18} color={theme.colors.onPrimary} />
          <Text style={styles.findButtonText}>Find Matches</Text>
        </TouchableOpacity>
      </View>

      <SearchBar
        placeholder="Search matches..."
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
      >
        {matches.length ? (
          <View style={styles.grid}>
            {matches.map(match => (
              <MatchCard 
                key={match.id} 
                match={match} 
                navigation={navigation}
                onViewActions={() => navigation.navigate('MatchActions', { match })}
              />
            ))}
          </View>
        ) : (
          <View style={styles.empty}>
            <Icon name="people" size={48} color={theme.colors.textSecondary} />
            <Text style={styles.emptyText}>
              {searchQuery || Object.keys(filters).length > 0 
                ? 'No matches match your search' 
                : 'No matches yet. Find your first match!'
              }
            </Text>
            <Text style={styles.emptyText}>
              {searchQuery || Object.keys(filters).length > 0
                ? 'Try adjusting your search or filters'
                : 'Find matches to start collaborating'
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
        filterType="matches"
      />
    </View>
  );
};

export default MatchesScreen;


