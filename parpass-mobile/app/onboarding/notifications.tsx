import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Alert } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  defaultSurveyData,
  saveSurveyData,
  getSurveyData,
  setOnboardingComplete,
} from '../../lib/onboarding';
import {
  registerForPushNotifications,
  sendTestNotification,
  saveNotificationPreferences,
  defaultNotificationPrefs,
} from '../../lib/notifications';

export default function NotificationsScreen() {
  const [loading, setLoading] = useState(false);
  const [prefs, setPrefs] = useState(defaultNotificationPrefs);

  const togglePref = (key: keyof typeof prefs) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleEnableNotifications = async () => {
    setLoading(true);
    try {
      const token = await registerForPushNotifications();

      if (token) {
        // Save preferences
        await saveNotificationPreferences(prefs);

        // Update survey data
        const existing = await getSurveyData() || defaultSurveyData;
        await saveSurveyData({ ...existing, notificationsEnabled: true });

        // Send test notification
        await sendTestNotification();

        // Complete onboarding
        await setOnboardingComplete();

        Alert.alert(
          'Notifications Enabled! 🎉',
          'You\'ll receive a test notification shortly.',
          [{ text: 'OK', onPress: () => router.replace('/(tabs)/home') }]
        );
      } else {
        Alert.alert(
          'Permissions Required',
          'Please enable notifications in your device settings to receive updates.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
      Alert.alert('Error', 'Failed to enable notifications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    const existing = await getSurveyData() || defaultSurveyData;
    await saveSurveyData({ ...existing, notificationsEnabled: false });
    await setOnboardingComplete();
    router.replace('/(tabs)/home');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <View style={styles.progress}>
          <View style={[styles.progressDot, styles.progressDotComplete]} />
          <View style={[styles.progressDot, styles.progressDotComplete]} />
          <View style={[styles.progressDot, styles.progressDotComplete]} />
          <View style={[styles.progressDot, styles.progressDotActive]} />
        </View>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="notifications" size={48} color="#10b981" />
        </View>

        <Text style={styles.title}>Stay in the loop</Text>
        <Text style={styles.subtitle}>
          Get notified about your rounds, new courses, and exclusive offers
        </Text>

        <View style={styles.prefsCard}>
          <View style={styles.prefRow}>
            <View style={styles.prefInfo}>
              <View style={styles.prefIcon}>
                <Ionicons name="alarm" size={20} color="#6b7280" />
              </View>
              <View>
                <Text style={styles.prefLabel}>Round Reminders</Text>
                <Text style={styles.prefDesc}>Before your tee times</Text>
              </View>
            </View>
            <Switch
              value={prefs.roundReminders}
              onValueChange={() => togglePref('roundReminders')}
              trackColor={{ false: '#e5e7eb', true: '#a7f3d0' }}
              thumbColor={prefs.roundReminders ? '#10b981' : '#fff'}
            />
          </View>

          <View style={styles.prefDivider} />

          <View style={styles.prefRow}>
            <View style={styles.prefInfo}>
              <View style={styles.prefIcon}>
                <Ionicons name="golf" size={20} color="#6b7280" />
              </View>
              <View>
                <Text style={styles.prefLabel}>New Courses</Text>
                <Text style={styles.prefDesc}>When new courses are added</Text>
              </View>
            </View>
            <Switch
              value={prefs.newCourses}
              onValueChange={() => togglePref('newCourses')}
              trackColor={{ false: '#e5e7eb', true: '#a7f3d0' }}
              thumbColor={prefs.newCourses ? '#10b981' : '#fff'}
            />
          </View>

          <View style={styles.prefDivider} />

          <View style={styles.prefRow}>
            <View style={styles.prefInfo}>
              <View style={styles.prefIcon}>
                <Ionicons name="pricetag" size={20} color="#6b7280" />
              </View>
              <View>
                <Text style={styles.prefLabel}>Promotions</Text>
                <Text style={styles.prefDesc}>Deals and special offers</Text>
              </View>
            </View>
            <Switch
              value={prefs.promotions}
              onValueChange={() => togglePref('promotions')}
              trackColor={{ false: '#e5e7eb', true: '#a7f3d0' }}
              thumbColor={prefs.promotions ? '#10b981' : '#fff'}
            />
          </View>

          <View style={styles.prefDivider} />

          <View style={styles.prefRow}>
            <View style={styles.prefInfo}>
              <View style={styles.prefIcon}>
                <Ionicons name="calendar" size={20} color="#6b7280" />
              </View>
              <View>
                <Text style={styles.prefLabel}>Weekly Digest</Text>
                <Text style={styles.prefDesc}>Summary of your activity</Text>
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
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.button}
          onPress={handleEnableNotifications}
          disabled={loading}
        >
          <Ionicons name="notifications" size={20} color="#fff" />
          <Text style={styles.buttonText}>
            {loading ? 'Enabling...' : 'Enable Notifications'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Maybe later</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progress: {
    flexDirection: 'row',
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e5e7eb',
  },
  progressDotActive: {
    backgroundColor: '#10b981',
    width: 24,
  },
  progressDotComplete: {
    backgroundColor: '#10b981',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  iconContainer: {
    width: 88,
    height: 88,
    borderRadius: 24,
    backgroundColor: '#ecfdf5',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  prefsCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 4,
  },
  prefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  prefInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  prefIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  prefLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  prefDesc: {
    fontSize: 13,
    color: '#6b7280',
  },
  prefDivider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginLeft: 68,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  button: {
    backgroundColor: '#10b981',
    borderRadius: 14,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  skipButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  skipText: {
    color: '#9ca3af',
    fontSize: 15,
  },
});
