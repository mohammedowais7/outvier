import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { apiService } from '../services/api';

const AssessmentScreen: React.FC<any> = ({ navigation }) => {
  const { theme } = useTheme();
  const [form, setForm] = useState({
    personality_type: '',
    communication_style: '',
    work_preference: '',
    strengths: '',
    weaknesses: '',
    opportunities: '',
    growth_areas: '',
    leadership_score: '6',
    technical_score: '6',
    creativity_score: '6',
    collaboration_score: '6',
  });

  const onSubmit = async () => {
    try {
      await apiService.completeAssessment({
        ...form,
        strengths: form.strengths.split(',').map(s => s.trim()).filter(Boolean),
        weaknesses: form.weaknesses.split(',').map(s => s.trim()).filter(Boolean),
        opportunities: form.opportunities.split(',').map(s => s.trim()).filter(Boolean),
        growth_areas: form.growth_areas.split(',').map(s => s.trim()).filter(Boolean),
        leadership_score: Number(form.leadership_score),
        technical_score: Number(form.technical_score),
        creativity_score: Number(form.creativity_score),
        collaboration_score: Number(form.collaboration_score),
      });
      Alert.alert('Success', 'Assessment completed successfully!');
      navigation.goBack();
    } catch (e: any) {
      const errorMessage = e?.response?.data?.detail || e?.message || 'Failed to submit assessment';
      Alert.alert('Error', errorMessage);
    }
  };

  const styles = StyleSheet.create({
    container: { 
      flex: 1, 
      backgroundColor: theme.colors.background 
    },
    content: { 
      padding: 20,
      paddingBottom: 40
    },
    label: { 
      color: theme.colors.text, 
      fontWeight: '700', 
      marginBottom: 6,
      fontSize: 16
    },
    input: { 
      backgroundColor: theme.colors.surface, 
      borderWidth: 1, 
      borderColor: theme.colors.outline, 
      borderRadius: 12, 
      padding: 12, 
      color: theme.colors.text, 
      marginBottom: 12,
      fontSize: 16,
      minHeight: 48
    },
    button: { 
      backgroundColor: theme.colors.primary, 
      borderRadius: 12, 
      paddingVertical: 14, 
      alignItems: 'center', 
      marginTop: 20,
      marginBottom: 20
    },
    buttonText: { 
      color: theme.colors.onPrimary, 
      fontWeight: '700',
      fontSize: 16
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: 8,
      textAlign: 'center'
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      marginBottom: 24,
      textAlign: 'center'
    }
  });

  const set = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 100}
      >
        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          <Text style={styles.title}>Complete Your Assessment</Text>
          <Text style={styles.subtitle}>
            Help us understand your skills and preferences to provide better matches and insights
          </Text>
          
          {Object.entries({
            personality_type: 'Personality Type',
            communication_style: 'Communication Style',
            work_preference: 'Work Preference',
            strengths: 'Strengths (comma separated)',
            weaknesses: 'Weaknesses (comma separated)',
            opportunities: 'Opportunities (comma separated)',
            growth_areas: 'Growth Areas (comma separated)',
            leadership_score: 'Leadership (1-10)',
            technical_score: 'Technical (1-10)',
            creativity_score: 'Creativity (1-10)',
            collaboration_score: 'Collaboration (1-10)',
          }).map(([key, label]) => (
            <View key={key}>
              <Text style={styles.label}>{label}</Text>
              <TextInput
                style={[styles.input, (key.includes('score') ? { keyboardType: 'numeric' } : {})] as any}
                placeholder={label as string}
                placeholderTextColor={theme.colors.textSecondary}
                value={(form as any)[key]}
                onChangeText={(v) => set(key, v)}
                multiline={key.includes('strengths') || key.includes('weaknesses') || key.includes('opportunities') || key.includes('growth_areas')}
                numberOfLines={key.includes('strengths') || key.includes('weaknesses') || key.includes('opportunities') || key.includes('growth_areas') ? 3 : 1}
              />
            </View>
          ))}

          <TouchableOpacity style={styles.button} onPress={onSubmit}>
            <Text style={styles.buttonText}>Submit Assessment</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AssessmentScreen;


