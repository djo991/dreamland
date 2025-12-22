import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';

// Import translation files
import en from './locales/en.json';
import es from './locales/es.json';
import rs from './locales/rs.json';

const resources = {
  en: { translation: en },
  es: { translation: es },
  rs: { translation: rs },
};

const initI18n = async () => {
  try {
    // 1. Check if user has a saved language preference
    const savedLanguage = await AsyncStorage.getItem('user-language');

    // 2. If not, use device locale (defaulting to 'en' if not Spanish)
    // expo-localization returns 'en-US', 'es-ES' etc. We just need the first 2 chars.
    const deviceLanguage = Localization.getLocales()[0].languageCode;
    const defaultLanguage = savedLanguage || (deviceLanguage === 'es' ? 'es' : 'en');

    await i18n.use(initReactI18next).init({
      compatibilityJSON: 'v4', // Required for Android
      resources,
      lng: defaultLanguage,
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false, // React already safeguards against XSS
      },
    });
  } catch (error) {
    console.error('Failed to init i18n', error);
  }
};

initI18n();

export default i18n;