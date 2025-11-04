import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { showMessage } from 'react-native-flash-message';

import { useTheme } from '../../contexts/ThemeContext';
import { apiService } from '../../services/api';

interface ChangePasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ChangePasswordScreen: React.FC<any> = ({ navigation }) => {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ChangePasswordForm>({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const newPassword = watch('newPassword');

  const onSubmit = async (data: ChangePasswordForm) => {
    try {
      setIsLoading(true);
      
      const response = await apiService.post('/auth/change-password/', {
        current_password: data.currentPassword,
        new_password: data.newPassword,
        confirm_password: data.confirmPassword,
      });
      
      if (response.data) {
        showMessage({
          message: 'Password changed successfully',
          type: 'success',
          duration: 4000,
        });
        navigation.goBack();
      }
    } catch (error: any) {
      console.error('Password change failed:', error);
      
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.current_password?.[0] ||
                          error.response?.data?.new_password?.[0] ||
                          'Failed to change password. Please try again.';
      
      showMessage({
        message: errorMessage,
        type: 'danger',
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return strength;
  };

  const getStrengthColor = (strength: number) => {
    if (strength < 2) return theme.colors.error;
    if (strength < 4) return theme.colors.warning;
    return theme.colors.success;
  };

  const getStrengthText = (strength: number) => {
    if (strength < 2) return 'Weak';
    if (strength < 4) return 'Medium';
    return 'Strong';
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    gradient: { flex: 1 },
    content: { flex: 1, paddingHorizontal: 24, justifyContent: 'center' },
    header: { alignItems: 'center', marginBottom: 32 },
    logo: { width: 72, height: 72, borderRadius: 36, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    title: { fontSize: 28, fontWeight: '700', color: theme.colors.onPrimary, marginBottom: 6 },
    subtitle: { fontSize: 14, color: theme.colors.onPrimary, opacity: 0.9, textAlign: 'center' },
    inputWrapper: { 
      flexDirection: 'row', 
      alignItems: 'center', 
      backgroundColor: 'rgba(255,255,255,0.15)', 
      borderRadius: 12, 
      paddingHorizontal: 16, 
      marginTop: 16,
      borderWidth: 1,
      borderColor: 'transparent',
    },
    inputWrapperError: {
      borderColor: theme.colors.error,
    },
    input: { flex: 1, fontSize: 16, color: '#fff', paddingVertical: 14 },
    icon: { marginRight: 12 },
    eyeIcon: { padding: 4 },
    button: { 
      backgroundColor: theme.colors.surface, 
      borderRadius: 12, 
      paddingVertical: 14, 
      alignItems: 'center', 
      marginTop: 16,
      opacity: isLoading ? 0.7 : 1,
    },
    buttonText: { color: theme.colors.text, fontSize: 16, fontWeight: '700' },
    back: { alignItems: 'center', marginTop: 16 },
    backText: { color: '#fff', fontWeight: '700' },
    errorText: { color: theme.colors.error, fontSize: 12, marginTop: 4, marginLeft: 16 },
    passwordStrength: { marginTop: 8, marginLeft: 16 },
    strengthBar: { height: 4, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 2, marginBottom: 4 },
    strengthFill: { height: 4, borderRadius: 2 },
    strengthText: { color: theme.colors.onPrimary, fontSize: 12, opacity: 0.8 },
    requirements: { marginTop: 16, marginLeft: 16 },
    requirementText: { color: theme.colors.onPrimary, fontSize: 12, opacity: 0.8, marginBottom: 4 },
    requirementMet: { opacity: 1 },
    requirementUnmet: { opacity: 0.5 },
  });

  const passwordStrength = getPasswordStrength(newPassword);

  const requirements = [
    { text: 'At least 8 characters', met: newPassword.length >= 8 },
    { text: 'One uppercase letter', met: /[A-Z]/.test(newPassword) },
    { text: 'One lowercase letter', met: /[a-z]/.test(newPassword) },
    { text: 'One number', met: /[0-9]/.test(newPassword) },
    { text: 'One special character', met: /[^A-Za-z0-9]/.test(newPassword) },
  ];

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <LinearGradient colors={[theme.colors.primary, theme.colors.secondary]} style={styles.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.logo}>
              <Icon name="lock" size={36} color={theme.colors.onPrimary} />
            </View>
            <Text style={styles.title}>Change Password</Text>
            <Text style={styles.subtitle}>Enter your current password and choose a new one</Text>
          </View>

          <Controller
            control={control}
            name="currentPassword"
            rules={{
              required: 'Current password is required',
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <View>
                <View style={[styles.inputWrapper, errors.currentPassword && styles.inputWrapperError]}>
                  <Icon name="lock" size={20} color="#fff" style={styles.icon} />
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    style={styles.input}
                    placeholder="Current Password"
                    placeholderTextColor="rgba(255,255,255,0.7)"
                    secureTextEntry={!showCurrentPassword}
                    autoComplete="current-password"
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    <Icon 
                      name={showCurrentPassword ? "visibility-off" : "visibility"} 
                      size={20} 
                      color="rgba(255,255,255,0.7)" 
                    />
                  </TouchableOpacity>
                </View>
                {errors.currentPassword && (
                  <Text style={styles.errorText}>{errors.currentPassword.message}</Text>
                )}
              </View>
            )}
          />

          <Controller
            control={control}
            name="newPassword"
            rules={{
              required: 'New password is required',
              minLength: {
                value: 8,
                message: 'Password must be at least 8 characters',
              },
              pattern: {
                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                message: 'Password must contain uppercase, lowercase, and number',
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <View>
                <View style={[styles.inputWrapper, errors.newPassword && styles.inputWrapperError]}>
                  <Icon name="lock" size={20} color="#fff" style={styles.icon} />
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    style={styles.input}
                    placeholder="New Password"
                    placeholderTextColor="rgba(255,255,255,0.7)"
                    secureTextEntry={!showNewPassword}
                    autoComplete="new-password"
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowNewPassword(!showNewPassword)}
                  >
                    <Icon 
                      name={showNewPassword ? "visibility-off" : "visibility"} 
                      size={20} 
                      color="rgba(255,255,255,0.7)" 
                    />
                  </TouchableOpacity>
                </View>
                {newPassword && (
                  <View style={styles.passwordStrength}>
                    <View style={styles.strengthBar}>
                      <View 
                        style={[
                          styles.strengthFill, 
                          { 
                            width: `${(passwordStrength / 5) * 100}%`, 
                            backgroundColor: getStrengthColor(passwordStrength) 
                          }
                        ]} 
                      />
                    </View>
                    <Text style={[styles.strengthText, { color: getStrengthColor(passwordStrength) }]}>
                      {getStrengthText(passwordStrength)}
                    </Text>
                  </View>
                )}
                {newPassword && (
                  <View style={styles.requirements}>
                    {requirements.map((req, index) => (
                      <Text
                        key={index}
                        style={[
                          styles.requirementText,
                          req.met ? styles.requirementMet : styles.requirementUnmet,
                        ]}
                      >
                        {req.met ? '✓' : '○'} {req.text}
                      </Text>
                    ))}
                  </View>
                )}
                {errors.newPassword && (
                  <Text style={styles.errorText}>{errors.newPassword.message}</Text>
                )}
              </View>
            )}
          />

          <Controller
            control={control}
            name="confirmPassword"
            rules={{
              required: 'Please confirm your new password',
              validate: (value) => value === newPassword || 'Passwords do not match',
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <View>
                <View style={[styles.inputWrapper, errors.confirmPassword && styles.inputWrapperError]}>
                  <Icon name="lock" size={20} color="#fff" style={styles.icon} />
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    style={styles.input}
                    placeholder="Confirm New Password"
                    placeholderTextColor="rgba(255,255,255,0.7)"
                    secureTextEntry={!showConfirmPassword}
                    autoComplete="new-password"
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <Icon 
                      name={showConfirmPassword ? "visibility-off" : "visibility"} 
                      size={20} 
                      color="rgba(255,255,255,0.7)" 
                    />
                  </TouchableOpacity>
                </View>
                {errors.confirmPassword && (
                  <Text style={styles.errorText}>{errors.confirmPassword.message}</Text>
                )}
              </View>
            )}
          />

          <TouchableOpacity 
            style={styles.button} 
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Changing...' : 'Change Password'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>Cancel</Text>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

export default ChangePasswordScreen;
