import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons as Icon } from '@expo/vector-icons';

import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useFullscreen } from '../../contexts/FullscreenContext';
import FullscreenToggle from '../../components/FullscreenToggle';
import { RegisterData } from '../../types/auth';
import { createAuthStyles } from '../../styles/authStyles';

const RegisterScreen: React.FC<any> = ({ navigation }) => {
  const { register, isLoading } = useAuth();
  const { theme } = useTheme();
  const { isFullscreen } = useFullscreen();
  const [showPassword, setShowPassword] = useState(false);
  
  // Get auth styles
  const authStyles = createAuthStyles(theme);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterData>({
    defaultValues: {
      username: '',
      email: '',
      password: '',
      password_confirm: '',
      first_name: '',
      last_name: '',
      role: 'member',
    },
  });

  const onSubmit = async (data: RegisterData) => {
    const success = await register(data);
    if (!success) {
      Alert.alert('Registration Failed', 'Please review your details and try again.');
    }
  };

  const styles = authStyles;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 100}
      >
        <LinearGradient colors={[theme.colors.primary, theme.colors.secondary]} style={styles.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <ScrollView 
            contentContainerStyle={styles.scrollContent} 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bounces={false}
          >
          {/* Fullscreen Toggle */}
          <FullscreenToggle style={styles.fullscreenToggle} />
          
          <View style={styles.header}>
            <View style={styles.logo}>
              <Icon name="rocket-launch" size={36} color={theme.colors.onPrimary} />
            </View>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join Outvier and start your growth journey</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>First Name</Text>
              <View style={styles.inputWrapper}>
                <Icon name="badge" size={20} color={theme.colors.textSecondary} style={styles.icon} />
                <Controller control={control} name="first_name" rules={{ required: 'First name is required' }} render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput style={styles.input} placeholder="John" placeholderTextColor="rgba(255,255,255,0.7)" value={value} onChangeText={onChange} onBlur={onBlur} />
                )} />
              </View>
              {errors.first_name && <Text style={styles.errorText}>{errors.first_name.message}</Text>}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Last Name</Text>
              <View style={styles.inputWrapper}>
                <Icon name="badge" size={20} color={theme.colors.textSecondary} style={styles.icon} />
                <Controller control={control} name="last_name" rules={{ required: 'Last name is required' }} render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput style={styles.input} placeholder="Doe" placeholderTextColor="rgba(255,255,255,0.7)" value={value} onChangeText={onChange} onBlur={onBlur} />
                )} />
              </View>
              {errors.last_name && <Text style={styles.errorText}>{errors.last_name.message}</Text>}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Username</Text>
              <View style={styles.inputWrapper}>
                <Icon name="person" size={20} color={theme.colors.textSecondary} style={styles.icon} />
                <Controller control={control} name="username" rules={{ required: 'Username is required', minLength: { value: 3, message: 'Username must be at least 3 characters' } }} render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput style={styles.input} placeholder="johndoe" placeholderTextColor="rgba(255,255,255,0.7)" value={value} onChangeText={onChange} onBlur={onBlur} autoCapitalize="none" />
                )} />
              </View>
              {errors.username && <Text style={styles.errorText}>{errors.username.message}</Text>}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputWrapper}>
                <Icon name="email" size={20} color={theme.colors.textSecondary} style={styles.icon} />
                <Controller control={control} name="email" rules={{ required: 'Email is required', pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Invalid email address' } }} render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput style={styles.input} placeholder="you@example.com" placeholderTextColor="rgba(255,255,255,0.7)" value={value} onChangeText={onChange} onBlur={onBlur} keyboardType="email-address" autoCapitalize="none" />
                )} />
              </View>
              {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <Icon name="lock" size={20} color={theme.colors.textSecondary} style={styles.icon} />
                <Controller control={control} name="password" rules={{ required: 'Password is required', minLength: { value: 6, message: 'Password must be at least 6 characters' } }} render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput style={styles.input} placeholder="Enter your password" placeholderTextColor="rgba(255,255,255,0.7)" value={value} onChangeText={onChange} onBlur={onBlur} secureTextEntry={!showPassword} autoCapitalize="none" />
                )} />
                <TouchableOpacity style={styles.passwordIcon} onPress={() => setShowPassword(!showPassword)}>
                  <Icon name={showPassword ? 'visibility-off' : 'visibility'} size={20} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={styles.inputWrapper}>
                <Icon name="lock" size={20} color={theme.colors.textSecondary} style={styles.icon} />
                <Controller control={control} name="password_confirm" rules={{ required: 'Password confirmation is required', validate: (value, formValues) => value === formValues.password || 'Passwords do not match' }} render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput style={styles.input} placeholder="Confirm your password" placeholderTextColor="rgba(255,255,255,0.7)" value={value} onChangeText={onChange} onBlur={onBlur} secureTextEntry={!showPassword} autoCapitalize="none" />
                )} />
                <TouchableOpacity style={styles.passwordIcon} onPress={() => setShowPassword(!showPassword)}>
                  <Icon name={showPassword ? 'visibility-off' : 'visibility'} size={20} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </View>
              {errors.password_confirm && <Text style={styles.errorText}>{errors.password_confirm.message}</Text>}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>User Type</Text>
              <View style={styles.inputWrapper}>
                <Icon name="work" size={20} color={theme.colors.textSecondary} style={styles.icon} />
                <Controller control={control} name="role" rules={{ required: 'User type is required' }} render={({ field: { onChange, value } }) => (
                  <View style={styles.pickerContainer}>
                    <TouchableOpacity style={styles.pickerButton} onPress={() => {
                      Alert.alert(
                        'Select User Type',
                        'Choose your primary role',
                        [
                          { text: 'Member', onPress: () => onChange('member') },
                          { text: 'Mentor', onPress: () => onChange('mentor') },
                          { text: 'Mentee', onPress: () => onChange('mentee') },
                          { text: 'Cancel', style: 'cancel' }
                        ]
                      );
                    }}>
                      <Text style={[styles.pickerText, !value && styles.placeholderText]}>
                        {value ? value.charAt(0).toUpperCase() + value.slice(1) : 'Select user type'}
                      </Text>
                      <Icon name="arrow-drop-down" size={20} color={theme.colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                )} />
              </View>
              {errors.role && <Text style={styles.errorText}>{errors.role.message}</Text>}
            </View>

            <TouchableOpacity style={styles.primaryButton} onPress={handleSubmit(onSubmit)} disabled={isLoading}>
              <Text style={styles.primaryButtonText}>{isLoading ? 'Creating...' : 'Create Account'}</Text>
            </TouchableOpacity>

            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.registerLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
          </ScrollView>
        </LinearGradient>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default RegisterScreen;


