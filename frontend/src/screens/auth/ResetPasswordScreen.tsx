import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { showMessage } from 'react-native-flash-message';

import { useTheme } from '../../contexts/ThemeContext';
import { apiService } from '../../services/api';

interface ResetPasswordForm {
  password: string;
  confirmPassword: string;
}

interface ResetPasswordScreenProps {
  navigation: any;
  route: {
    params: {
      token: string;
      email: string;
    };
  };
}

const ResetPasswordScreen: React.FC<ResetPasswordScreenProps> = ({ navigation, route }) => {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [passwordReset, setPasswordReset] = useState(false);

  const { token, email } = route.params;

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ResetPasswordForm>({
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');

  const onSubmit = async (data: ResetPasswordForm) => {
    try {
      setIsLoading(true);
      
      const response = await apiService.post('/auth/reset-password/', {
        token,
        password: data.password,
        confirm_password: data.confirmPassword,
      });
      
      if (response.data) {
        setPasswordReset(true);
        showMessage({
          message: 'Password reset successfully',
          type: 'success',
          duration: 4000,
        });
      }
    } catch (error: any) {
      console.error('Password reset failed:', error);
      
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.password?.[0] ||
                          error.response?.data?.token?.[0] ||
                          'Failed to reset password. Please try again.';
      
      showMessage({
        message: errorMessage,
        type: 'danger',
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
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
    successContainer: { alignItems: 'center', marginTop: 32 },
    successIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: theme.colors.success, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
    successTitle: { fontSize: 24, fontWeight: '700', color: theme.colors.onPrimary, marginBottom: 8 },
    successSubtitle: { fontSize: 14, color: theme.colors.onPrimary, opacity: 0.9, textAlign: 'center', marginBottom: 24 },
    passwordStrength: { marginTop: 8, marginLeft: 16 },
    strengthBar: { height: 4, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 2, marginBottom: 4 },
    strengthFill: { height: 4, borderRadius: 2 },
    strengthText: { color: theme.colors.onPrimary, fontSize: 12, opacity: 0.8 },
  });

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

  if (passwordReset) {
    return (
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <LinearGradient colors={[theme.colors.primary, theme.colors.secondary]} style={styles.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.successContainer}>
              <View style={styles.successIcon}>
                <Icon name="check" size={40} color={theme.colors.onPrimary} />
              </View>
              <Text style={styles.successTitle}>Password Reset</Text>
              <Text style={styles.successSubtitle}>
                Your password has been successfully reset. You can now sign in with your new password.
              </Text>
              
              <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Login')}>
                <Text style={styles.buttonText}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </LinearGradient>
      </KeyboardAvoidingView>
    );
  }

  const passwordStrength = getPasswordStrength(password);

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <LinearGradient colors={[theme.colors.primary, theme.colors.secondary]} style={styles.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.logo}>
              <Icon name="lock-reset" size={36} color={theme.colors.onPrimary} />
            </View>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>Enter your new password for {email}</Text>
          </View>

          <Controller
            control={control}
            name="password"
            rules={{
              required: 'Password is required',
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
                <View style={[styles.inputWrapper, errors.password && styles.inputWrapperError]}>
                  <Icon name="lock" size={20} color="#fff" style={styles.icon} />
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    style={styles.input}
                    placeholder="New Password"
                    placeholderTextColor="rgba(255,255,255,0.7)"
                    secureTextEntry
                    autoComplete="new-password"
                  />
                </View>
                {password && (
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
                {errors.password && (
                  <Text style={styles.errorText}>{errors.password.message}</Text>
                )}
              </View>
            )}
          />

          <Controller
            control={control}
            name="confirmPassword"
            rules={{
              required: 'Please confirm your password',
              validate: (value) => value === password || 'Passwords do not match',
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
                    placeholder="Confirm Password"
                    placeholderTextColor="rgba(255,255,255,0.7)"
                    secureTextEntry
                    autoComplete="new-password"
                  />
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
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.back} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.backText}>Back to Sign In</Text>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

export default ResetPasswordScreen;
