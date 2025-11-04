import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { showMessage } from 'react-native-flash-message';
import { Picker } from '@react-native-picker/picker';

import { useTheme } from '../contexts/ThemeContext';
import { apiService } from '../services/api';
import { createMobileStyles, getResponsiveDimensions } from '../styles/mobileLayout';

interface FindMatchesForm {
  match_type: string;
  preferred_roles: string[];
  required_skills: string[];
  project_categories: string[];
  min_compatibility_score: number;
  max_distance?: number;
  availability: string;
  time_commitment: string;
  experience_level: string;
}

interface FindMatchesScreenProps {
  navigation: any;
}

const FindMatchesScreen: React.FC<FindMatchesScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const dims = getResponsiveDimensions();
  const mobileStyles = createMobileStyles(theme);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FindMatchesForm>({
    defaultValues: {
      match_type: 'project',
      preferred_roles: [],
      required_skills: [],
      project_categories: [],
      min_compatibility_score: 70,
      availability: 'flexible',
      time_commitment: 'part_time',
      experience_level: 'intermediate',
    },
  });

  const onSubmit = async (data: FindMatchesForm) => {
    try {
      setIsSearching(true);
      
      const response = await apiService.post('/outvier/matches/find/', {
        ...data,
        preferred_roles: data.preferred_roles.join(','),
        required_skills: data.required_skills.join(','),
        project_categories: data.project_categories.join(','),
      });
      
      if (response.data) {
        showMessage({
          message: `Found ${response.data.length} potential matches`,
          type: 'success',
          duration: 3000,
        });
        
        // Navigate to matches screen with results
        navigation.navigate('Matches', {
          screen: 'MatchesMain',
          params: { searchResults: response.data }
        });
      }
    } catch (error: any) {
      console.error('Find matches failed:', error);
      
      const errorMessage = error.response?.data?.detail || 
                          'Failed to find matches. Please try again.';
      
      showMessage({
        message: errorMessage,
        type: 'danger',
        duration: 4000,
      });
    } finally {
      setIsSearching(false);
    }
  };

  const addToArray = (field: keyof FindMatchesForm, value: string) => {
    const currentArray = watch(field) as string[];
    if (!currentArray.includes(value)) {
      // This would need to be handled with a custom hook or state management
      // For now, we'll show a placeholder
      Alert.alert('Add Item', `Add "${value}" to ${field}?`);
    }
  };

  const styles = StyleSheet.create({
    container: mobileStyles.container,
    header: {
      ...mobileStyles.sectionHeader,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    backButton: {
      padding: dims.spacing.s,
    },
    title: mobileStyles.sectionTitle,
    content: {
      flex: 1,
      paddingHorizontal: dims.layout.screenPadding,
    },
    section: {
      marginBottom: dims.spacing.l,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: dims.spacing.m,
    },
    inputGroup: {
      marginBottom: dims.spacing.m,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: dims.spacing.s,
    },
    input: {
      ...mobileStyles.input,
      backgroundColor: theme.colors.surface,
    },
    picker: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.outline,
    },
    sliderContainer: {
      marginBottom: dims.spacing.m,
    },
    sliderLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: dims.spacing.s,
    },
    sliderValue: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.primary,
      textAlign: 'center',
      marginBottom: dims.spacing.s,
    },
    chipContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: dims.spacing.s,
      marginBottom: dims.spacing.s,
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
    addChip: {
      borderStyle: 'dashed',
      borderColor: theme.colors.primary,
    },
    addChipText: {
      color: theme.colors.primary,
    },
    switchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: dims.spacing.s,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    switchLabel: {
      fontSize: 16,
      color: theme.colors.text,
      flex: 1,
    },
    switchDescription: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    button: {
      ...mobileStyles.primaryButton,
      marginTop: dims.spacing.l,
      marginBottom: dims.spacing.xl,
    },
    buttonText: mobileStyles.buttonText,
    errorText: {
      color: theme.colors.error,
      fontSize: 12,
      marginTop: 4,
    },
    infoCard: {
      backgroundColor: theme.colors.primary + '10',
      borderRadius: 12,
      padding: dims.spacing.m,
      marginBottom: dims.spacing.l,
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.primary,
    },
    infoTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: dims.spacing.s,
    },
    infoText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      lineHeight: 20,
    },
  });

  const matchTypes = [
    { value: 'project', label: 'Project Collaboration' },
    { value: 'mentorship', label: 'Mentorship' },
    { value: 'peer_learning', label: 'Peer Learning' },
    { value: 'skill_exchange', label: 'Skill Exchange' },
  ];

  const roleOptions = [
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'UI/UX Designer',
    'Product Manager',
    'Data Scientist',
    'DevOps Engineer',
    'Mobile Developer',
    'QA Engineer',
    'Technical Writer',
  ];

  const skillOptions = [
    'React',
    'Node.js',
    'Python',
    'JavaScript',
    'TypeScript',
    'Django',
    'PostgreSQL',
    'AWS',
    'Docker',
    'Git',
  ];

  const categoryOptions = [
    'Web Development',
    'Mobile Development',
    'Data Science',
    'Machine Learning',
    'DevOps',
    'UI/UX Design',
    'Product Management',
    'Marketing',
    'Content Creation',
    'Research',
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Find Matches</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>How it works</Text>
          <Text style={styles.infoText}>
            Tell us about your preferences and we'll find compatible team members 
            based on skills, availability, and project interests. The more specific 
            you are, the better matches we can find!
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Match Type</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>What type of collaboration are you looking for? *</Text>
            <Controller
              control={control}
              name="match_type"
              rules={{ required: 'Match type is required' }}
              render={({ field: { onChange, value } }) => (
                <View style={styles.picker}>
                  <Picker
                    selectedValue={value}
                    onValueChange={onChange}
                    style={{ color: theme.colors.text }}
                  >
                    {matchTypes.map(type => (
                      <Picker.Item key={type.value} label={type.label} value={type.value} />
                    ))}
                  </Picker>
                </View>
              )}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferred Roles</Text>
          
          <View style={styles.chipContainer}>
            {roleOptions.map(role => (
              <TouchableOpacity
                key={role}
                style={styles.chip}
                onPress={() => addToArray('preferred_roles', role)}
              >
                <Text style={styles.chipText}>{role}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.chip, styles.addChip]}
              onPress={() => Alert.alert('Add Role', 'Custom role addition coming soon!')}
            >
              <Text style={[styles.chipText, styles.addChipText]}>+ Add Custom</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Required Skills</Text>
          
          <View style={styles.chipContainer}>
            {skillOptions.map(skill => (
              <TouchableOpacity
                key={skill}
                style={styles.chip}
                onPress={() => addToArray('required_skills', skill)}
              >
                <Text style={styles.chipText}>{skill}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.chip, styles.addChip]}
              onPress={() => Alert.alert('Add Skill', 'Custom skill addition coming soon!')}
            >
              <Text style={[styles.chipText, styles.addChipText]}>+ Add Custom</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Project Categories</Text>
          
          <View style={styles.chipContainer}>
            {categoryOptions.map(category => (
              <TouchableOpacity
                key={category}
                style={styles.chip}
                onPress={() => addToArray('project_categories', category)}
              >
                <Text style={styles.chipText}>{category}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.chip, styles.addChip]}
              onPress={() => Alert.alert('Add Category', 'Custom category addition coming soon!')}
            >
              <Text style={[styles.chipText, styles.addChipText]}>+ Add Custom</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Compatibility</Text>
          
          <View style={styles.sliderContainer}>
            <Text style={styles.sliderLabel}>Minimum Compatibility Score</Text>
            <Text style={styles.sliderValue}>
              {watch('min_compatibility_score')}%
            </Text>
            <Controller
              control={control}
              name="min_compatibility_score"
              render={({ field: { onChange, value } }) => (
                <View style={{ paddingHorizontal: dims.spacing.s }}>
                  {/* Note: In a real implementation, you'd use a proper slider component */}
                  <TextInput
                    style={styles.input}
                    value={value.toString()}
                    onChangeText={(text) => onChange(parseInt(text) || 0)}
                    keyboardType="numeric"
                    placeholder="70"
                  />
                </View>
              )}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Availability</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Availability *</Text>
            <Controller
              control={control}
              name="availability"
              rules={{ required: 'Availability is required' }}
              render={({ field: { onChange, value } }) => (
                <View style={styles.picker}>
                  <Picker
                    selectedValue={value}
                    onValueChange={onChange}
                    style={{ color: theme.colors.text }}
                  >
                    <Picker.Item label="Flexible" value="flexible" />
                    <Picker.Item label="Part-time (10-20 hrs/week)" value="part_time" />
                    <Picker.Item label="Full-time (40+ hrs/week)" value="full_time" />
                    <Picker.Item label="Weekends only" value="weekends" />
                    <Picker.Item label="Evenings only" value="evenings" />
                  </Picker>
                </View>
              )}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Time Commitment *</Text>
            <Controller
              control={control}
              name="time_commitment"
              rules={{ required: 'Time commitment is required' }}
              render={({ field: { onChange, value } }) => (
                <View style={styles.picker}>
                  <Picker
                    selectedValue={value}
                    onValueChange={onChange}
                    style={{ color: theme.colors.text }}
                  >
                    <Picker.Item label="1-2 weeks" value="short" />
                    <Picker.Item label="1-3 months" value="medium" />
                    <Picker.Item label="3-6 months" value="long" />
                    <Picker.Item label="6+ months" value="extended" />
                  </Picker>
                </View>
              )}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Experience Level *</Text>
            <Controller
              control={control}
              name="experience_level"
              rules={{ required: 'Experience level is required' }}
              render={({ field: { onChange, value } }) => (
                <View style={styles.picker}>
                  <Picker
                    selectedValue={value}
                    onValueChange={onChange}
                    style={{ color: theme.colors.text }}
                  >
                    <Picker.Item label="Beginner" value="beginner" />
                    <Picker.Item label="Intermediate" value="intermediate" />
                    <Picker.Item label="Advanced" value="advanced" />
                    <Picker.Item label="Expert" value="expert" />
                  </Picker>
                </View>
              )}
            />
          </View>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit(onSubmit)}
          disabled={isSearching}
        >
          <Text style={styles.buttonText}>
            {isSearching ? 'Finding Matches...' : 'Find Matches'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default FindMatchesScreen;
