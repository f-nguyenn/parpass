import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PUSH_TOKEN_KEY = 'parpass_push_token';
const NOTIFICATION_PREFS_KEY = 'parpass_notification_prefs';

export interface NotificationPreferences {
  roundReminders: boolean;
  newCourses: boolean;
  promotions: boolean;
  weeklyDigest: boolean;
}

export const defaultNotificationPrefs: NotificationPreferences = {
  roundReminders: true,
  newCourses: true,
  promotions: false,
  weeklyDigest: true,
};

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotifications(): Promise<string | null> {
  let token: string | null = null;

  // Check if it's a physical device
  if (!Device.isDevice) {
    console.log('Push notifications require a physical device');
    return null;
  }

  // Check existing permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Request permissions if not already granted
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Failed to get push notification permissions');
    return null;
  }

  // Get the Expo push token
  try {
    const response = await Notifications.getExpoPushTokenAsync({
      projectId: 'your-project-id', // Replace with actual project ID if using EAS
    });
    token = response.data;

    // Store token locally
    await AsyncStorage.setItem(PUSH_TOKEN_KEY, token);

    console.log('Push token:', token);
  } catch (error) {
    console.error('Error getting push token:', error);
  }

  // Configure Android channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#10b981',
    });
  }

  return token;
}

export async function getStoredPushToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(PUSH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  try {
    const stored = await AsyncStorage.getItem(NOTIFICATION_PREFS_KEY);
    return stored ? JSON.parse(stored) : defaultNotificationPrefs;
  } catch {
    return defaultNotificationPrefs;
  }
}

export async function saveNotificationPreferences(prefs: NotificationPreferences): Promise<void> {
  await AsyncStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(prefs));
}

// Schedule a local notification (for reminders)
export async function scheduleRoundReminder(courseName: string, date: Date): Promise<string> {
  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Tee Time Reminder ⛳',
      body: `Your round at ${courseName} is coming up!`,
      sound: true,
      data: { type: 'round_reminder' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: date,
    },
  });
  return identifier;
}

// Send an immediate local notification (for testing)
export async function sendTestNotification(): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'ParPass 🏌️',
      body: 'Notifications are working! You\'ll receive updates about your golf rounds.',
      sound: true,
      data: { type: 'test' },
    },
    trigger: null, // Send immediately
  });
}

// Cancel a scheduled notification
export async function cancelNotification(identifier: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(identifier);
}

// Cancel all notifications
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

// Get all scheduled notifications
export async function getScheduledNotifications() {
  return await Notifications.getAllScheduledNotificationsAsync();
}
