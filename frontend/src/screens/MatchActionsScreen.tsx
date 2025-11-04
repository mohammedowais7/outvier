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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { showMessage } from 'react-native-flash-message';

import { useTheme } from '../contexts/ThemeContext';
import { apiService } from '../services/api';
import { TeamMatch } from '../types/outvier';
import { createMobileStyles, getResponsiveDimensions } from '../styles/mobileLayout';

interface MessageForm {
  message: string;
}

interface MatchActionsScreenProps {
  navigation: any;
  route: {
    params: {
      match: TeamMatch;
    };
  };
}

const MatchActionsScreen: React.FC<MatchActionsScreenProps> = ({ navigation, route }) => {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [actionType, setActionType] = useState<'accept' | 'reject' | 'message' | null>(null);

  const { match } = route.params;

  const dims = getResponsiveDimensions();
  const mobileStyles = createMobileStyles(theme);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<MessageForm>({
    defaultValues: {
      message: '',
    },
  });

  const handleAccept = async () => {
    try {
      setIsLoading(true);
      
      console.log('Accepting match:', match.id);
      const response = await apiService.post(`/outvier/matches/${match.id}/accept/`);
      console.log('Accept match response:', response);
      
      if (response.data) {
        showMessage({
          message: 'Match accepted successfully',
          type: 'success',
          duration: 3000,
        });
        navigation.goBack();
      }
    } catch (error: any) {
    //   console.error('Match acceptance failed:', error);
    //   console.error('Error response:', error.response);
    //   console.error('Error status:', error.response?.status);
    //   console.error('Error data:', error.response?.data);
      
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message ||
                          'Failed to accept match. Please try again.';
      
      showMessage({
        message: errorMessage,
        type: 'danger',
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    try {
      setIsLoading(true);
      
      console.log('Rejecting match:', match.id);
      const response = await apiService.post(`/outvier/matches/${match.id}/reject/`);
      console.log('Reject match response:', response);
      
      if (response.data) {
        showMessage({
          message: 'Match rejected',
          type: 'info',
          duration: 3000,
        });
        navigation.goBack();
      }
    } catch (error: any) {
    //   console.error('Match rejection failed:', error);
    //   console.error('Error response:', error.response);
    //   console.error('Error status:', error.response?.status);
    //   console.error('Error data:', error.response?.data);
      
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message ||
                          'Failed to reject match. Please try again.';
      
      showMessage({
        message: errorMessage,
        type: 'danger',
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (data: MessageForm) => {
    try {
      setIsLoading(true);
      
      const response = await apiService.post(`/outvier/matches/${match.id}/message/`, {
        message: data.message,
      });
      
      if (response.data) {
        showMessage({
          message: 'Message sent successfully',
          type: 'success',
          duration: 3000,
        });
        setShowMessageModal(false);
        reset();
      }
    } catch (error: any) {
      console.error('Message sending failed:', error);
      
      const errorMessage = error.response?.data?.detail || 
                          'Failed to send message. Please try again.';
      
      showMessage({
        message: errorMessage,
        type: 'danger',
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const confirmAction = (action: 'accept' | 'reject') => {
    const actionText = action === 'accept' ? 'accept' : 'reject';
    const actionColor = action === 'accept' ? theme.colors.success : theme.colors.error;
    
    Alert.alert(
      `${actionText.charAt(0).toUpperCase() + actionText.slice(1)} Match`,
      `Are you sure you want to ${actionText} this match?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: actionText.charAt(0).toUpperCase() + actionText.slice(1),
          style: action === 'accept' ? 'default' : 'destructive',
          onPress: action === 'accept' ? handleAccept : handleReject,
        },
      ]
    );
  };

  const openMessageModal = () => {
    setActionType('message');
    setShowMessageModal(true);
  };

  const closeMessageModal = () => {
    setShowMessageModal(false);
    setActionType(null);
    reset();
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
    matchCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: dims.spacing.l,
      marginBottom: dims.spacing.l,
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.primary,
    },
    matchHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: dims.spacing.m,
    },
    matchTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.text,
      flex: 1,
    },
    compatibilityScore: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.primary,
    },
    matchType: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: dims.spacing.s,
    },
    matchDescription: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginBottom: dims.spacing.m,
    },
    matchReason: {
      fontSize: 14,
      color: theme.colors.text,
      fontStyle: 'italic',
      marginBottom: dims.spacing.m,
    },
    skillsContainer: {
      marginBottom: dims.spacing.m,
    },
    skillsTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: dims.spacing.s,
    },
    skillsList: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: dims.spacing.s,
    },
    skillChip: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: dims.spacing.s,
      paddingVertical: dims.spacing.xs,
      borderRadius: 16,
    },
    skillText: {
      fontSize: 12,
      color: theme.colors.onPrimary,
      fontWeight: '500',
    },
    actionsContainer: {
      gap: dims.spacing.m,
    },
    actionButton: {
      ...mobileStyles.primaryButton,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    acceptButton: {
      backgroundColor: theme.colors.success,
    },
    rejectButton: {
      backgroundColor: theme.colors.error,
    },
    messageButton: {
      backgroundColor: theme.colors.primary,
    },
    buttonText: {
      ...mobileStyles.buttonText,
      marginLeft: dims.spacing.s,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      padding: dims.layout.screenPadding,
    },
    modal: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: dims.spacing.l,
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: dims.spacing.l,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.text,
    },
    closeButton: {
      padding: dims.spacing.s,
    },
    inputGroup: {
      marginBottom: dims.spacing.l,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: dims.spacing.s,
    },
    textArea: {
      ...mobileStyles.input,
      backgroundColor: theme.colors.background,
      height: 100,
      textAlignVertical: 'top',
    },
    modalActions: {
      flexDirection: 'row',
      gap: dims.spacing.s,
    },
    modalButton: {
      flex: 1,
      ...mobileStyles.primaryButton,
    },
    cancelButton: {
      ...mobileStyles.secondaryButton,
    },
    cancelButtonText: {
      ...mobileStyles.buttonText,
      color: theme.colors.text,
    },
    errorText: {
      color: theme.colors.error,
      fontSize: 12,
      marginTop: 4,
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Match Actions</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.matchCard}>
          <View style={styles.matchHeader}>
            <Text style={styles.matchTitle}>
              {match.match_type.replace('_', ' ').toUpperCase()} Match
            </Text>
            <Text style={styles.compatibilityScore}>
              {Math.round(match.compatibility_score)}% Match
            </Text>
          </View>

          <Text style={styles.matchType}>
            {match.match_type.replace('_', ' ').toUpperCase()}
          </Text>

          <Text style={styles.matchDescription}>
            {match.match_reason}
          </Text>

          {match.suggested_roles && match.suggested_roles.length > 0 && (
            <View style={styles.skillsContainer}>
              <Text style={styles.skillsTitle}>Suggested Roles:</Text>
              <View style={styles.skillsList}>
                {match.suggested_roles.map((role, index) => (
                  <View key={index} style={styles.skillChip}>
                    <Text style={styles.skillText}>{role}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {match.required_skills_names && match.required_skills_names.length > 0 && (
            <View style={styles.skillsContainer}>
              <Text style={styles.skillsTitle}>Required Skills:</Text>
              <View style={styles.skillsList}>
                {match.required_skills_names.map((skill, index) => (
                  <View key={index} style={styles.skillChip}>
                    <Text style={styles.skillText}>{skill}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.acceptButton]}
            onPress={() => confirmAction('accept')}
            disabled={isLoading}
          >
            <Icon name="check" size={20} color={theme.colors.onPrimary} />
            <Text style={styles.buttonText}>Accept Match</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.messageButton]}
            onPress={openMessageModal}
            disabled={isLoading}
          >
            <Icon name="message" size={20} color={theme.colors.onPrimary} />
            <Text style={styles.buttonText}>Send Message</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => confirmAction('reject')}
            disabled={isLoading}
          >
            <Icon name="close" size={20} color={theme.colors.onPrimary} />
            <Text style={styles.buttonText}>Reject Match</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        visible={showMessageModal}
        transparent
        animationType="slide"
        onRequestClose={closeMessageModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Send Message</Text>
              <TouchableOpacity style={styles.closeButton} onPress={closeMessageModal}>
                <Icon name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <Controller
              control={control}
              name="message"
              rules={{ required: 'Message is required' }}
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Message *</Text>
                  <TextInput
                    style={styles.textArea}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="Write your message..."
                    placeholderTextColor={theme.colors.textSecondary}
                    multiline
                    numberOfLines={4}
                  />
                  {errors.message && (
                    <Text style={styles.errorText}>{errors.message.message}</Text>
                  )}
                </View>
              )}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={closeMessageModal}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleSubmit(handleSendMessage)}
                disabled={isLoading}
              >
                <Text style={styles.buttonText}>
                  {isLoading ? 'Sending...' : 'Send Message'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default MatchActionsScreen;
