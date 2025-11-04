import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Switch,
  TextInput,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { createMobileStyles, getResponsiveDimensions } from '../styles/mobileLayout';

export interface FilterOptions {
  // Goal filters
  goalStatus?: string[];
  goalPriority?: string[];
  goalType?: string[];
  dateRange?: {
    start?: string;
    end?: string;
  };
  
  // Match filters
  matchType?: string[];
  compatibilityScore?: {
    min: number;
    max: number;
  };
  
  // Pathway filters
  pathwayType?: string[];
  difficultyLevel?: string[];
  progressRange?: {
    min: number;
    max: number;
  };
  
  // General filters
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterOptions) => void;
  currentFilters?: FilterOptions;
  filterType: 'goals' | 'matches' | 'pathways' | 'general';
}

const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  onApply,
  currentFilters = {},
  filterType,
}) => {
  const { theme } = useTheme();
  const [filters, setFilters] = useState<FilterOptions>(currentFilters);
  const dims = getResponsiveDimensions();
  const mobileStyles = createMobileStyles(theme);

  const updateFilter = (key: keyof FilterOptions, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const toggleArrayFilter = (key: keyof FilterOptions, value: string) => {
    const currentArray = (filters[key] as string[]) || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    updateFilter(key, newArray);
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    setFilters({});
  };

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modal: {
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: '80%',
      paddingBottom: 34, // Safe area for home indicator
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: dims.layout.screenPadding,
      paddingVertical: dims.spacing.m,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    title: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.text,
    },
    closeButton: {
      padding: dims.spacing.s,
    },
    content: {
      paddingHorizontal: dims.layout.screenPadding,
      paddingTop: dims.spacing.m,
    },
    section: {
      marginBottom: dims.spacing.l,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: dims.spacing.s,
    },
    chipContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: dims.spacing.s,
    },
    chip: {
      paddingHorizontal: dims.spacing.m,
      paddingVertical: dims.spacing.s,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      backgroundColor: theme.colors.background,
    },
    chipActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    chipText: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text,
    },
    chipTextActive: {
      color: theme.colors.onPrimary,
    },
    rangeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: dims.spacing.s,
    },
    rangeInput: {
      flex: 1,
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      borderRadius: 8,
      paddingHorizontal: dims.spacing.s,
      paddingVertical: dims.spacing.s,
      fontSize: 16,
      color: theme.colors.text,
    },
    switchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: dims.spacing.s,
    },
    switchLabel: {
      fontSize: 16,
      color: theme.colors.text,
      flex: 1,
    },
    actions: {
      flexDirection: 'row',
      paddingHorizontal: dims.layout.screenPadding,
      paddingTop: dims.spacing.m,
      gap: dims.spacing.s,
    },
    button: {
      flex: 1,
      paddingVertical: dims.spacing.m,
      borderRadius: 12,
      alignItems: 'center',
    },
    resetButton: {
      backgroundColor: theme.colors.outline,
    },
    applyButton: {
      backgroundColor: theme.colors.primary,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
    },
    applyButtonText: {
      color: theme.colors.onPrimary,
    },
  });

  const renderGoalFilters = () => (
    <>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Status</Text>
        <View style={styles.chipContainer}>
          {['not_started', 'in_progress', 'on_hold', 'completed', 'cancelled'].map(status => (
            <TouchableOpacity
              key={status}
              style={[
                styles.chip,
                filters.goalStatus?.includes(status) && styles.chipActive,
              ]}
              onPress={() => toggleArrayFilter('goalStatus', status)}
            >
              <Text
                style={[
                  styles.chipText,
                  filters.goalStatus?.includes(status) && styles.chipTextActive,
                ]}
              >
                {status.replace('_', ' ').toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Priority</Text>
        <View style={styles.chipContainer}>
          {['low', 'medium', 'high', 'critical'].map(priority => (
            <TouchableOpacity
              key={priority}
              style={[
                styles.chip,
                filters.goalPriority?.includes(priority) && styles.chipActive,
              ]}
              onPress={() => toggleArrayFilter('goalPriority', priority)}
            >
              <Text
                style={[
                  styles.chipText,
                  filters.goalPriority?.includes(priority) && styles.chipTextActive,
                ]}
              >
                {priority.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Type</Text>
        <View style={styles.chipContainer}>
          {['personal', 'professional', 'skill', 'project', 'network', 'learning', 'fitness', 'financial'].map(type => (
            <TouchableOpacity
              key={type}
              style={[
                styles.chip,
                filters.goalType?.includes(type) && styles.chipActive,
              ]}
              onPress={() => toggleArrayFilter('goalType', type)}
            >
              <Text
                style={[
                  styles.chipText,
                  filters.goalType?.includes(type) && styles.chipTextActive,
                ]}
              >
                {type.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </>
  );

  const renderMatchFilters = () => (
    <>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Match Type</Text>
        <View style={styles.chipContainer}>
          {['project', 'mentorship', 'peer_learning', 'skill_exchange'].map(type => (
            <TouchableOpacity
              key={type}
              style={[
                styles.chip,
                filters.matchType?.includes(type) && styles.chipActive,
              ]}
              onPress={() => toggleArrayFilter('matchType', type)}
            >
              <Text
                style={[
                  styles.chipText,
                  filters.matchType?.includes(type) && styles.chipTextActive,
                ]}
              >
                {type.replace('_', ' ').toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Compatibility Score</Text>
        <View style={styles.rangeContainer}>
          <TextInput
            style={styles.rangeInput}
            placeholder="Min"
            placeholderTextColor={theme.colors.textSecondary}
            keyboardType="numeric"
            value={filters.compatibilityScore?.min?.toString() || ''}
            onChangeText={(text) => {
              const min = parseInt(text) || 0;
              updateFilter('compatibilityScore', {
                ...filters.compatibilityScore,
                min,
              });
            }}
          />
          <Text style={{ color: theme.colors.text }}>to</Text>
          <TextInput
            style={styles.rangeInput}
            placeholder="Max"
            placeholderTextColor={theme.colors.textSecondary}
            keyboardType="numeric"
            value={filters.compatibilityScore?.max?.toString() || ''}
            onChangeText={(text) => {
              const max = parseInt(text) || 100;
              updateFilter('compatibilityScore', {
                ...filters.compatibilityScore,
                max,
              });
            }}
          />
        </View>
      </View>
    </>
  );

  const renderPathwayFilters = () => (
    <>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Difficulty Level</Text>
        <View style={styles.chipContainer}>
          {['beginner', 'intermediate', 'advanced', 'expert'].map(level => (
            <TouchableOpacity
              key={level}
              style={[
                styles.chip,
                filters.difficultyLevel?.includes(level) && styles.chipActive,
              ]}
              onPress={() => toggleArrayFilter('difficultyLevel', level)}
            >
              <Text
                style={[
                  styles.chipText,
                  filters.difficultyLevel?.includes(level) && styles.chipTextActive,
                ]}
              >
                {level.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Progress Range</Text>
        <View style={styles.rangeContainer}>
          <TextInput
            style={styles.rangeInput}
            placeholder="Min %"
            placeholderTextColor={theme.colors.textSecondary}
            keyboardType="numeric"
            value={filters.progressRange?.min?.toString() || ''}
            onChangeText={(text) => {
              const min = parseInt(text) || 0;
              updateFilter('progressRange', {
                ...filters.progressRange,
                min,
              });
            }}
          />
          <Text style={{ color: theme.colors.text }}>to</Text>
          <TextInput
            style={styles.rangeInput}
            placeholder="Max %"
            placeholderTextColor={theme.colors.textSecondary}
            keyboardType="numeric"
            value={filters.progressRange?.max?.toString() || ''}
            onChangeText={(text) => {
              const max = parseInt(text) || 100;
              updateFilter('progressRange', {
                ...filters.progressRange,
                max,
              });
            }}
          />
        </View>
      </View>
    </>
  );

  const renderGeneralFilters = () => (
    <>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sort By</Text>
        <View style={styles.chipContainer}>
          {['created_at', 'updated_at', 'title', 'priority', 'progress'].map(sort => (
            <TouchableOpacity
              key={sort}
              style={[
                styles.chip,
                filters.sortBy === sort && styles.chipActive,
              ]}
              onPress={() => updateFilter('sortBy', sort)}
            >
              <Text
                style={[
                  styles.chipText,
                  filters.sortBy === sort && styles.chipTextActive,
                ]}
              >
                {sort.replace('_', ' ').toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sort Order</Text>
        <View style={styles.chipContainer}>
          {['asc', 'desc'].map(order => (
            <TouchableOpacity
              key={order}
              style={[
                styles.chip,
                filters.sortOrder === order && styles.chipActive,
              ]}
              onPress={() => updateFilter('sortOrder', order)}
            >
              <Text
                style={[
                  styles.chipText,
                  filters.sortOrder === order && styles.chipTextActive,
                ]}
              >
                {order.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Filter & Sort</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Icon name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {filterType === 'goals' && renderGoalFilters()}
            {filterType === 'matches' && renderMatchFilters()}
            {filterType === 'pathways' && renderPathwayFilters()}
            {filterType === 'general' && renderGeneralFilters()}
          </ScrollView>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.resetButton]}
              onPress={handleReset}
            >
              <Text style={styles.buttonText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.applyButton]}
              onPress={handleApply}
            >
              <Text style={[styles.buttonText, styles.applyButtonText]}>
                Apply Filters
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default FilterModal;
