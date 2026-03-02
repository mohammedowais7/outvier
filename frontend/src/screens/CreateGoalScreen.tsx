import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Alert, 
  Platform,
  Pressable 
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialIcons as Icon } from '@expo/vector-icons';

import { useTheme } from '../contexts/ThemeContext';
import { apiService } from '../services/api';

interface FormData {
  title: string;
  description?: string;
  goal_type: string;
  priority: string;
  deadline: string;
}

const CreateGoalScreen: React.FC<any> = ({ navigation }) => {
  const { theme } = useTheme();
  const queryClient = useQueryClient();

  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');

  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      title: '',
      description: '',
      goal_type: 'skill',
      priority: 'medium',
      // Web input format ke liye slice zaroori hai (YYYY-MM-DDTHH:mm)
      deadline: new Date(Date.now() + 15 * 60 * 1000).toISOString().slice(0, 16),
    }
  });

  const deadlineValue = watch('deadline');

  // Mobile Picker Change Handler
  const onMobileDateChange = (event: any, selectedDate?: Date) => {
    if (event.type === 'dismissed') {
      setShowPicker(false);
      return;
    }
    if (selectedDate) {
      setValue('deadline', selectedDate.toISOString());
      if (Platform.OS === 'android' && pickerMode === 'date') {
        setShowPicker(false);
        setPickerMode('time');
        setTimeout(() => setShowPicker(true), 150);
      }
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      const response = await apiService.createGoal(data);
      if (response.status === 201 || response.status === 200) {
        Alert.alert('Success ✅', 'Goal create ho gaya!');
        queryClient.invalidateQueries({ queryKey: ['goals'] });
        navigation.goBack();
      }
    } catch (e: any) {
      Alert.alert('Error ❌', 'Goal save nahi ho saka.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView 
        contentContainerStyle={styles.content} 
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.label, { color: theme.colors.text }]}>Title *</Text>
        <Controller 
          control={control} 
          name="title" 
          rules={{ required: 'Title is required' }} 
          render={({ field: { onChange, value } }) => (
            <View>
              <TextInput 
                style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.outline }, errors.title && {borderColor: 'red'}]} 
                placeholder="E.g. Review Codebase" 
                placeholderTextColor={theme.colors.textSecondary} 
                value={value} 
                onChangeText={onChange} 
              />
              {errors.title && <Text style={styles.errorText}>{errors.title.message}</Text>}
            </View>
          )} 
        />

        <Text style={[styles.label, { color: theme.colors.text }]}>Description</Text>
        <Controller 
          control={control} 
          name="description" 
          render={({ field: { onChange, value } }) => (
            <TextInput 
              style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.outline, height: 80, textAlignVertical: 'top' }]} 
              multiline 
              placeholder="Goal details..." 
              placeholderTextColor={theme.colors.textSecondary} 
              value={value} 
              onChangeText={onChange} 
            />
          )} 
        />

        {/* DEADLINE SECTION: Platform Dependent */}
        <Text style={[styles.label, { color: theme.colors.text }]}>Deadline (Date & Time) *</Text>
        
        {Platform.OS === 'web' ? (
          <input
            type="datetime-local"
            value={deadlineValue}
            onChange={(e) => setValue('deadline', e.target.value)}
            style={{
              padding: '12px',
              borderRadius: '12px',
              border: `1px solid ${theme.colors.outline}`,
              backgroundColor: theme.colors.surface,
              color: theme.colors.text,
              fontSize: '16px',
              fontFamily: 'inherit',
              width: '100%',
              cursor: 'pointer',
              outline: 'none'
            }}
          />
        ) : (
          <Pressable 
            style={({ pressed }) => [
              styles.pickerButton, 
              { 
                borderColor: theme.colors.outline, 
                backgroundColor: pressed ? theme.colors.surfaceVariant : theme.colors.surface 
              }
            ]} 
            onPress={() => { setPickerMode('date'); setShowPicker(true); }}
          >
            <View pointerEvents="none">
              <Text style={{ color: theme.colors.text, fontSize: 16 }}>
                {new Date(deadlineValue).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
              </Text>
            </View>
            <Icon name="access-time" size={24} color={theme.colors.primary} />
          </Pressable>
        )}

        {showPicker && Platform.OS !== 'web' && (
          <DateTimePicker
            value={new Date(deadlineValue)}
            mode={pickerMode}
            is24Hour={false}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onMobileDateChange}
            minimumDate={new Date()}
          />
        )}

        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Type</Text>
            <Controller 
              control={control} 
              name="goal_type" 
              render={({ field: { onChange, value } }) => (
                <TextInput style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.outline }]} value={value} onChangeText={onChange} />
              )} 
            />
          </View>
          <View style={styles.col}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Priority</Text>
            <Controller 
              control={control} 
              name="priority" 
              render={({ field: { onChange, value } }) => (
                <TextInput style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.outline }]} value={value} onChangeText={onChange} />
              )} 
            />
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.button, { backgroundColor: theme.colors.primary }]} 
          onPress={handleSubmit(onSubmit)}
        >
          <Text style={styles.buttonText}>🚀 Create Goal & Start Timer</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20 },
  label: { fontWeight: '700', marginBottom: 8, marginTop: 15 },
  input: { borderWidth: 1, borderRadius: 12, padding: 12, fontSize: 16 },
  pickerButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, borderRadius: 12, borderWidth: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  col: { width: '48%' },
  button: { borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 40, marginBottom: 40 },
  buttonText: { fontWeight: '700', fontSize: 16, color: '#FFFFFF' },
  errorText: { color: 'red', fontSize: 12, marginTop: 4 },
});

export default CreateGoalScreen;