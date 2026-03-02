import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { showMessage } from 'react-native-flash-message';

import { useTheme } from '../contexts/ThemeContext';
import { apiService } from '../services/api';
import { Goal, GoalMilestone } from '../types/outvier';
import { createMobileStyles, getResponsiveDimensions } from '../styles/mobileLayout';

interface MilestoneForm {
  title: string;
  description: string;
  target_date: string;
}

interface GoalMilestonesScreenProps {
  navigation: any;
  route: {
    params: {
      goal: Goal;
    };
  };
}

const GoalMilestonesScreen: React.FC<GoalMilestonesScreenProps> = ({ navigation, route }) => {
  const { theme } = useTheme();
  
  // FIX 1: Goal ko sab se pehle destructure karein
  const { goal } = route.params;

  // FIX 2: Ab milestones state sahi initialize hogi kyunke 'goal' ooper define ho chuka hai
  const [milestones, setMilestones] = useState<GoalMilestone[]>(goal?.milestones || []);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<GoalMilestone | null>(null);

  const dims = getResponsiveDimensions();
  const mobileStyles = createMobileStyles(theme);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<MilestoneForm>({
    defaultValues: {
      title: '',
      description: '',
      target_date: new Date().toISOString().slice(0, 10), // Default aaj ki date
    },
  });

  const onSubmit = async (data: MilestoneForm) => {
    try {
      setIsLoading(true);
      
      const milestoneData = {
        ...data,
        target_date: new Date(data.target_date).toISOString(),
        goal: goal.id,
      };

      let response;
      if (editingMilestone) {
        // API Endpoint check: ensure it matches your backend
        response = await apiService.patch(`/projects/goals/${goal.id}/milestones/${editingMilestone.id}/`, milestoneData);
      } else {
        response = await apiService.post(`/projects/goals/${goal.id}/milestones/`, milestoneData);
      }
      
      if (response.data) {
        if (editingMilestone) {
          setMilestones(prev => prev.map(m => m.id === editingMilestone.id ? response.data : m));
        } else {
          setMilestones(prev => [...prev, response.data]);
        }
        
        showMessage({
          message: `Milestone ${editingMilestone ? 'updated' : 'created'} successfully`,
          type: 'success',
        });
        
        closeModal();
      }
    } catch (error: any) {
      console.error('Operation failed:', error);
      showMessage({
        message: error.response?.data?.detail || "Operation failed",
        type: 'danger',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (milestone: GoalMilestone) => {
    setEditingMilestone(milestone);
    reset({
      title: milestone.title,
      description: milestone.description,
      target_date: milestone.target_date.split('T')[0],
    });
    setShowAddModal(true);
  };

  const handleDelete = (milestone: GoalMilestone) => {
    Alert.alert('Delete', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteMilestone(milestone.id) },
    ]);
  };

  const deleteMilestone = async (milestoneId: number) => {
    try {
      await apiService.delete(`/projects/goals/${goal.id}/milestones/${milestoneId}/`);
      setMilestones(prev => prev.filter(m => m.id !== milestoneId));
      showMessage({ message: 'Deleted', type: 'success' });
    } catch (error) {
      showMessage({ message: 'Delete failed', type: 'danger' });
    }
  };

  const toggleMilestoneCompletion = async (milestone: GoalMilestone) => {
    try {
      const response = await apiService.patch(`/projects/goals/${goal.id}/milestones/${milestone.id}/`, {
        is_completed: !milestone.is_completed,
        completed_date: !milestone.is_completed ? new Date().toISOString() : null,
      });
      if (response.data) {
        setMilestones(prev => prev.map(m => m.id === milestone.id ? response.data : m));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const openAddModal = () => {
    setEditingMilestone(null);
    reset({
        title: '',
        description: '',
        target_date: new Date().toISOString().slice(0, 10),
    });
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingMilestone(null);
    reset();
  };

  // Styles logic (unchanged but ensured to be within component)
  const styles = StyleSheet.create({
    container: { ...mobileStyles.container, backgroundColor: theme.colors.background },
    header: {
      ...mobileStyles.sectionHeader,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 15,
      paddingTop: 10,
    },
    backButton: { padding: dims.spacing.s },
    title: { ...mobileStyles.sectionTitle, color: theme.colors.text },
    addButton: {
      padding: 8,
      backgroundColor: theme.colors.primary,
      borderRadius: 8,
    },
    content: { flex: 1, paddingHorizontal: 20, marginTop: 10 },
    milestoneCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 15,
      marginBottom: 15,
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.primary,
      elevation: 2,
    },
    milestoneCardCompleted: { borderLeftColor: theme.colors.success, opacity: 0.6 },
    milestoneHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    milestoneTitle: { fontSize: 16, fontWeight: '700', color: theme.colors.text, flex: 1 },
    milestoneTitleCompleted: { textDecorationLine: 'line-through', color: theme.colors.textSecondary },
    milestoneActions: { flexDirection: 'row', gap: 10 },
    milestoneDescription: { color: theme.colors.textSecondary, marginTop: 5, fontSize: 14 },
    milestoneDate: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 8 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modal: { backgroundColor: theme.colors.surface, borderRadius: 16, padding: 20 },
    input: { ...mobileStyles.input, backgroundColor: theme.colors.background, color: theme.colors.text, marginBottom: 10, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: theme.colors.outline },
    button: { ...mobileStyles.primaryButton, backgroundColor: theme.colors.primary, padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
    buttonText: { color: theme.colors.onPrimary, fontWeight: 'bold' },
    label: { color: theme.colors.text, marginBottom: 5, fontWeight: '600' }
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Milestones</Text>
        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Icon name="add" size={24} color={theme.colors.onPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {milestones.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 50 }}>
            <Icon name="flag" size={50} color={theme.colors.textSecondary} />
            <Text style={{ color: theme.colors.textSecondary, marginTop: 10 }}>No milestones found.</Text>
          </View>
        ) : (
          milestones.map((milestone) => (
            <View key={milestone.id} style={[styles.milestoneCard, milestone.is_completed && styles.milestoneCardCompleted]}>
              <View style={styles.milestoneHeader}>
                <Text style={[styles.milestoneTitle, milestone.is_completed && styles.milestoneTitleCompleted]}>
                  {milestone.title}
                </Text>
                <View style={styles.milestoneActions}>
                  <TouchableOpacity onPress={() => toggleMilestoneCompletion(milestone)}>
                    <Icon name={milestone.is_completed ? "undo" : "check-circle"} size={22} color={milestone.is_completed ? theme.colors.warning : theme.colors.success} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleEdit(milestone)}>
                    <Icon name="edit" size={22} color={theme.colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(milestone)}>
                    <Icon name="delete" size={22} color={theme.colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
              {milestone.description && <Text style={styles.milestoneDescription}>{milestone.description}</Text>}
              <Text style={styles.milestoneDate}>Target: {new Date(milestone.target_date).toLocaleDateString()}</Text>
            </View>
          ))
        )}
      </ScrollView>

      <Modal visible={showAddModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.colors.text, marginBottom: 15 }}>
              {editingMilestone ? 'Edit' : 'Add'} Milestone
            </Text>
            
            <Text style={styles.label}>Title</Text>
            <Controller control={control} name="title" rules={{ required: true }} render={({ field: { onChange, value } }) => (
              <TextInput style={styles.input} value={value} onChangeText={onChange} placeholder="Title" placeholderTextColor="#999" />
            )} />

            <Text style={styles.label}>Description</Text>
            <Controller control={control} name="description" render={({ field: { onChange, value } }) => (
              <TextInput style={[styles.input, { height: 80 }]} multiline value={value} onChangeText={onChange} placeholder="Description" placeholderTextColor="#999" />
            )} />

            <Text style={styles.label}>Target Date (YYYY-MM-DD)</Text>
            <Controller control={control} name="target_date" render={({ field: { onChange, value } }) => (
              <TextInput style={styles.input} value={value} onChangeText={onChange} placeholder="2024-12-31" placeholderTextColor="#999" />
            )} />

            <TouchableOpacity style={styles.button} onPress={handleSubmit(onSubmit)} disabled={isLoading}>
              {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Save Milestone</Text>}
            </TouchableOpacity>

            <TouchableOpacity style={{ marginTop: 10, alignItems: 'center' }} onPress={closeModal}>
              <Text style={{ color: theme.colors.textSecondary }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default GoalMilestonesScreen;