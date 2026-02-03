import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  getNotificationPreferences,
  saveNotificationPreferences,
  NotificationPreferences,
  sendTestNotification,
  registerForPushNotifications,
} from '../../lib/notifications';

export default function NotificationSettingsScreen() {
  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPrefs();
  }, []);

  const loadPrefs = async () => {
    const storedPrefs = await getNotificationPreferences();
    setPrefs(storedPrefs);
  };

  const togglePref = async (key: keyof NotificationPreferences) => {
    if (!prefs) return;

    const newPrefs = { ...prefs, [key]: !prefs[key] };
    setPrefs(newPrefs);

    setSaving(true);
    await saveNotificationPreferences(newPrefs);
    setSaving(false);
  };

  const handleTestNotification = async () => {
    try {
      await registerForPushNotifications();
      await sendTestNotification();
      Alert.alert('Success', 'Test notification sent! Check your notifications.');
    } catch (error) {
      Alert.alert('Error', 'Failed to send test notification.');
    }
  };

  if (!prefs) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Notification Types</Text>

        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowInfo}>
              <View style={[styles.icon, { backgroundColor: '#fef3c7' }]}>
                <Ionicons name="alarm" size={20} color="#f59e0b" />
              </View>
              <View>
                <Text style={styles.rowLabel}>Round Reminders</Text>
                <Text style={styles.rowDesc}>Before your tee times</Text>
              </View>
            </View>
            <Switch
              value={prefs.roundReminders}
              onValueChange={() => togglePref('roundReminders')}
              trackColor={{ false: '#e5e7eb', true: '#a7f3d0' }}
              thumbColor={prefs.roundReminders ? '#10b981' : '#fff'}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={styles.rowInfo}>
              <View style={[styles.icon, { backgroundColor: '#ecfdf5' }]}>
                <Ionicons name="golf" size={20} color="#10b981" />
              </View>
              <View>
                <Text style={styles.rowLabel}>New Courses</Text>
                <Text style={styles.rowDesc}>When new courses are added</Text>
              </View>
            </View>
            <Switch
              value={prefs.newCourses}
              onValueChange={() => togglePref('newCourses')}
              trackColor={{ false: '#e5e7eb', true: '#a7f3d0' }}
              thumbColor={prefs.newCourses ? '#10b981' : '#fff'}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={styles.rowInfo}>
              <View style={[styles.icon, { backgroundColor: '#faf5ff' }]}>
                <Ionicons name="pricetag" size={20} color="#9333ea" />
              </View>
              <View>
                <Text style={styles.rowLabel}>Promotions</Text>
                <Text style={styles.rowDesc}>Deals and special offers</Text>
              </View>
            </View>
            <Switch
              value={prefs.promotions}
              onValueChange={() => togglePref('promotions')}
              trackColor={{ false: '#e5e7eb', true: '#a7f3d0' }}
              thumbColor={prefs.promotions ? '#10b981' : '#fff'}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={styles.rowInfo}>
              <View style={[styles.icon, { backgroundColor: '#eff6ff' }]}>
                <Ionicons name="calendar" size={20} color="#3b82f6" />
              </View>
              <View>
                <Text style={styles.rowLabel}>Weekly Digest</Text>
                <Text style={styles.rowDesc}>Summary of your activity</Text>
              </View>
            </View>
            <Switch
              value={prefs.weeklyDigest}
              onValueChange={() => togglePref('weeklyDigest')}
              trackColor={{ false: '#e5e7eb', true: '#a7f3d0' }}
              thumbColor={prefs.weeklyDigest ? '#10b981' : '#fff'}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.testButton} onPress={handleTestNotification}>
          <Ionicons name="paper-plane" size={20} color="#10b981" />
          <Text style={styles.testButtonText}>Send Test Notification</Text>
        </TouchableOpacity>

        {saving && (
          <Text style={styles.savingText}>Saving...</Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  content: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  rowInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  rowDesc: {
    fontSize: 13,
    color: '#6b7280',
  },
  divider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginLeft: 68,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
    backgroundColor: '#ecfdf5',
    paddingVertical: 16,
    borderRadius: 12,
  },
  testButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10b981',
  },
  savingText: {
    textAlign: 'center',
    marginTop: 12,
    color: '#9ca3af',
    fontSize: 14,
  },
});
