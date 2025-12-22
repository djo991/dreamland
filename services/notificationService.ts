import * as Notifications from 'expo-notifications';
import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 1. Configure how notifications appear when the app is open
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const STORAGE_KEY = 'dream-journal-reminder';

export const NotificationService = {
  
  // Request Permissions
  requestPermissions: async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      Alert.alert("Permission Required", "Please enable notifications to receive reminders.");
      return false;
    }
    return true;
  },

  // Schedule the Daily Reminder
  scheduleDailyReminder: async (date: Date) => {
    // Cancel existing subscriptions first to avoid duplicates
    await Notifications.cancelAllScheduledNotificationsAsync();

    const hour = date.getHours();
    const minute = date.getMinutes();

    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Dream Journal 🌙",
        body: "Did you dream about anything last night? Record it now!",
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY, // <--- ADD THIS
        hour: hour,
        minute: minute,
      },
    });
    
    // Persist settings
    const settings = { enabled: true, time: date.toISOString() };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    
    return identifier;
  },

  // Cancel Reminders
  cancelReminder: async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
    const settings = { enabled: false, time: null };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  },

  // Get Saved Settings
  getSettings: async () => {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    if (json) {
      return JSON.parse(json);
    }
    return { enabled: false, time: null };
  }
};