import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { showMessage } from 'react-native-flash-message';

import { useTheme } from '../../contexts/ThemeContext';
import { apiService } from '../../services/api';

interface ForgotPasswordForm {
  email: string;
}

const ForgotPasswordScreen: React.FC<any> = ({ navigation }) => {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ForgotPasswordForm>({
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordForm) => {
    try {
      setIsLoading(true);
      
      const response = await apiService.post('/auth/forgot-password/', {
        email: data.email,
      });
      
      if (response.data) {
        setEmailSent(true);
        showMessage({
          message: 'Password reset instructions sent to your email',
          type: 'success',
          duration: 4000,
        });
      }
    } catch (error: any) {
      console.error('Forgot password failed:', error);
      
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.email?.[0] ||
                          'Failed to send reset instructions. Please try again.';
      
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
      borderWidth: errors.email ? 1 : 0,
      borderColor: errors.email ? theme.colors.error : 'transparent',
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
  });

  if (emailSent) {
    return (
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <LinearGradient colors={[theme.colors.primary, theme.colors.secondary]} style={styles.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.successContainer}>
              <View style={styles.successIcon}>
                <Icon name="check" size={40} color={theme.colors.onPrimary} />
              </View>
              <Text style={styles.successTitle}>Check Your Email</Text>
              <Text style={styles.successSubtitle}>
                We've sent password reset instructions to {watch('email')}
              </Text>
              
              <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Login')}>
                <Text style={styles.buttonText}>Back to Sign In</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </LinearGradient>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <LinearGradient colors={[theme.colors.primary, theme.colors.secondary]} style={styles.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.logo}>
              <Icon name="lock-reset" size={36} color={theme.colors.onPrimary} />
            </View>
            <Text style={styles.title}>Forgot Password</Text>
            <Text style={styles.subtitle}>Enter your email to receive reset instructions</Text>
          </View>

          <Controller
            control={control}
            name="email"
            rules={{
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Please enter a valid email address',
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <View>
                <View style={styles.inputWrapper}>
                  <Icon name="email" size={20} color="#fff" style={styles.icon} />
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    style={styles.input}
                    placeholder="you@example.com"
                    placeholderTextColor="rgba(255,255,255,0.7)"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoComplete="email"
                  />
                </View>
                {errors.email && (
                  <Text style={styles.errorText}>{errors.email.message}</Text>
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
              {isLoading ? 'Sending...' : 'Send Reset Link'}
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

export default ForgotPasswordScreen;


