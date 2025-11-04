import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';

import { useTheme } from '../contexts/ThemeContext';
import { apiService } from '../services/api';

interface FormData {
  title: string;
  description?: string;
  goal_type: 'personal' | 'professional' | 'skill' | 'project' | 'network';
  priority: 'low' | 'medium' | 'high' | 'critical';
  start_date: string;
  target_date: string;
}

const CreateGoalScreen: React.FC<any> = ({ navigation }) => {
  const { theme } = useTheme();
  const { control, handleSubmit } = useForm<FormData>({
    defaultValues: {
      title: '',
      description: '',
      goal_type: 'skill',
      priority: 'medium',
      start_date: new Date().toISOString().slice(0, 10),
      target_date: new Date(Date.now() + 30*24*60*60*1000).toISOString().slice(0, 10),
    }
  });

  const onSubmit = async (data: FormData) => {
    try {
      await apiService.createGoal(data);
      Alert.alert('Success', 'Goal created successfully');
      navigation.goBack();
    } catch (e: any) {
      const errorMessage = e?.response?.data?.detail || e?.message || 'Failed to create goal';
      Alert.alert('Error', errorMessage);
    }
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    content: { padding: 20 },
    label: { color: theme.colors.text, fontWeight: '700', marginBottom: 6 },
    input: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.outline, borderRadius: 12, padding: 12, color: theme.colors.text, marginBottom: 16 },
    row: { flexDirection: 'row', justifyContent: 'space-between' },
    col: { width: '48%' },
    button: { backgroundColor: theme.colors.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
    buttonText: { color: theme.colors.onPrimary, fontWeight: '700' },
  });

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>Title</Text>
        <Controller control={control} name="title" rules={{ required: true }} render={({ field: { onChange, value } }) => (
          <TextInput style={styles.input} placeholder="Goal title" placeholderTextColor={theme.colors.textSecondary} value={value} onChangeText={onChange} />
        )} />

        <Text style={styles.label}>Description</Text>
        <Controller control={control} name="description" render={({ field: { onChange, value } }) => (
          <TextInput style={[styles.input, { height: 100 }]} multiline placeholder="Describe your goal" placeholderTextColor={theme.colors.textSecondary} value={value} onChangeText={onChange} />
        )} />

        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Type</Text>
            <Controller control={control} name="goal_type" render={({ field: { onChange, value } }) => (
              <TextInput style={styles.input} value={value} onChangeText={onChange} placeholder="skill | project | personal" placeholderTextColor={theme.colors.textSecondary} />
            )} />
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Priority</Text>
            <Controller control={control} name="priority" render={({ field: { onChange, value } }) => (
              <TextInput style={styles.input} value={value} onChangeText={onChange} placeholder="low | medium | high" placeholderTextColor={theme.colors.textSecondary} />
            )} />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Start Date</Text>
            <Controller control={control} name="start_date" render={({ field: { onChange, value } }) => (
              <TextInput style={styles.input} value={value} onChangeText={onChange} placeholder="YYYY-MM-DD" placeholderTextColor={theme.colors.textSecondary} />
            )} />
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Target Date</Text>
            <Controller control={control} name="target_date" render={({ field: { onChange, value } }) => (
              <TextInput style={styles.input} value={value} onChangeText={onChange} placeholder="YYYY-MM-DD" placeholderTextColor={theme.colors.textSecondary} />
            )} />
          </View>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSubmit(onSubmit)}>
          <Text style={styles.buttonText}>Create Goal</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default CreateGoalScreen;


