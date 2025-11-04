import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, TextInput } from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

interface ProfileScreenProps {
  navigation: any;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { theme, isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: { padding: 20, flexDirection: 'row', alignItems: 'center' },
    avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    name: { fontSize: 20, fontWeight: '700', color: theme.colors.text },
    role: { color: theme.colors.primary, fontWeight: '600' },
    section: { paddingHorizontal: 20, paddingVertical: 12 },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: theme.colors.text, marginBottom: 8 },
    row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
    rowLabel: { color: theme.colors.text },
    input: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.outline, borderRadius: 12, padding: 12, color: theme.colors.text, marginBottom: 12 },
    button: { backgroundColor: theme.colors.primary, borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginTop: 8 },
    buttonText: { color: theme.colors.onPrimary, fontWeight: '700' },
    logoutButton: { backgroundColor: theme.colors.error, borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginTop: 12 },
  });

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={{ color: theme.colors.onPrimary, fontWeight: '700' }}>
              {user?.first_name?.[0]}
            </Text>
          </View>
          <View>
            <Text style={styles.name}>{user?.first_name} {user?.last_name}</Text>
            <Text style={styles.role}>{user?.role?.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Dark Mode</Text>
            <Switch value={isDark} onValueChange={toggleTheme} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <TouchableOpacity style={styles.row} onPress={() => {
            // Navigate to Dashboard tab first, then to ProfileSettings
            // console.log('ProfileScreen: Attempting to navigate to ProfileSettings');
            try {
              // Since ProfileScreen is directly in Tab.Navigator, we need to navigate to the tab first
              // console.log('ProfileScreen: Current navigation state:', navigation.getState());
              navigation.navigate('Dashboard', {
                screen: 'ProfileSettings'
              });
              // console.log('ProfileScreen: Navigation called successfully');
            } catch (error) {
              console.error('ProfileScreen: Navigation error:', error);
            }
          }}>
            <Text style={styles.rowLabel}>Settings</Text>
            <Icon name="chevron-right" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.row} onPress={() => {
            // Navigate to Dashboard tab first, then to Notifications
            // console.log('ProfileScreen: Attempting to navigate to Notifications');
            try {
              navigation.navigate('Dashboard', {
                screen: 'Notifications'
              });
              // console.log('ProfileScreen: Notifications navigation called successfully');
            } catch (error) {
              console.error('ProfileScreen: Notifications navigation error:', error);
            }
          }}>
            <Text style={styles.rowLabel}>Notifications</Text>
            <Icon name="chevron-right" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.row} onPress={() => {
            // Navigate to Dashboard tab first, then to Achievements
            // console.log('ProfileScreen: Attempting to navigate to Achievements');
            try {
              navigation.navigate('Dashboard', {
                screen: 'Achievements'
              });
              // console.log('ProfileScreen: Achievements navigation called successfully');
            } catch (error) {
              console.error('ProfileScreen: Achievements navigation error:', error);
            }
          }}>
            <Text style={styles.rowLabel}>Achievements</Text>
            <Icon name="chevron-right" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact</Text>
          <TextInput style={styles.input} placeholder="Email" placeholderTextColor={theme.colors.textSecondary} editable={false} value={user?.email} />
        </View>

        <View style={{ paddingHorizontal: 20, paddingBottom: 24 }}>
          <TouchableOpacity style={styles.logoutButton} onPress={logout}>
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default ProfileScreen;


