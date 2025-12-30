import React, { createContext, useContext, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initDatabase, getDreams, insertDream, removeDream, updateDreamInDb, clearDatabase, DreamData } from '../utils/database';
import i18n from '../i18n';

// 1. Types
export interface Dream {
  id: string;
  title: string;
  date: string;
  body: string;
  tags: string[];
  isLucid: boolean;
  isNightmare: boolean;
  hasImages: boolean;
  thumbnail?: string;
  imageCount?: number;
  images?: string[];
  mood?: number;
  interpretation?: string; // New Field
}

export interface UserProfile {
  name: string;
  gender: string;
  age: string;
}

interface DreamContextType {
  dreams: Dream[];
  userProfile: UserProfile;
  updateUserProfile: (profile: UserProfile) => void;
  importData: (jsonData: string) => Promise<boolean>;
  addDream: (dream: Omit<Dream, 'id'> | Dream) => void;
  updateDream: (dream: Dream) => void;
  deleteDream: (id: string) => void;
  clearAllData: () => void;
}

const DreamContext = createContext<DreamContextType | undefined>(undefined);

export function DreamProvider({ children }: { children: React.ReactNode }) {
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [error, setError] = useState<string | null>(null);

  // User Profile State
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: '',
    gender: '',
    age: ''
  });

  // 1. Load Data (DB + Profile) on Startup
  useEffect(() => {
    try {
      initDatabase();
      loadDreams();
      loadUserProfile();
    } catch (e) {
      console.error("Initialization Error:", e);
      setError("Failed to initialize database. Please restart the app.");
    }
  }, []);

  const loadUserProfile = async () => {
    try {
      const stored = await AsyncStorage.getItem('user_profile');
      if (stored) {
        setUserProfile(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load profile", e);
    }
  };

  const updateUserProfile = async (profile: UserProfile) => {
    try {
      setUserProfile(profile);
      await AsyncStorage.setItem('user_profile', JSON.stringify(profile));
    } catch (e) {
      console.error("Failed to save profile", e);
    }
  };

  // Helper for safe parsing
  const safeParse = (jsonString: string, fallback: any) => {
    try {
      if (!jsonString) return fallback;
      return JSON.parse(jsonString);
    } catch (e) {
      console.warn("JSON Parse Error:", e);
      return fallback;
    }
  };



  const loadDreams = () => {
    try {
      const rawDreams = getDreams();
      // Explicitly map DB types (numbers/strings) to UI types (booleans/dates)
      const formattedDreams: Dream[] = rawDreams.map((row: DreamData) => {
        const parsedImages = safeParse(row.images, []);
        return {
          id: row.id!.toString(), // ID is guaranteed from DB fetch
          title: row.title,
          body: row.body,
          date: row.date,
          mood: row.mood,
          isLucid: row.isLucid === 1,
          isNightmare: row.isNightmare === 1,
          tags: safeParse(row.tags, []),
          images: parsedImages,
          hasImages: parsedImages.length > 0,
          imageCount: parsedImages.length,
          thumbnail: parsedImages.length > 0 ? parsedImages[0] : undefined,
          interpretation: row.interpretation || undefined,
        };
      });
      setDreams(formattedDreams);
      setError(null); // Clear error on success
    } catch (e) {
      console.error("Failed to load dreams:", e);
      setError(i18n.t('error_load_dreams')); // I18n fix
    }
  };

  // Import Data Function
  const importData = async (jsonData: string): Promise<boolean> => {
    try {
      // 1. JSON Parse Safety
      let parsed;
      try {
        parsed = JSON.parse(jsonData);
      } catch (e) {
        throw new Error(i18n.t('error_import_failed'));
      }

      if (!Array.isArray(parsed)) throw new Error(i18n.t('error_import_failed'));

      // Loop through and insert each dream
      parsed.forEach((d: any) => {
        // 2. Schema Validation
        if (!d.title || typeof d.title !== 'string') return; // Skip invalid entries

        insertDream({
          title: d.title,
          body: d.body || '',
          date: d.date || new Date().toLocaleDateString(),
          mood: d.mood || 0,
          isLucid: d.isLucid ? 1 : 0,
          isNightmare: d.isNightmare ? 1 : 0,
          tags: JSON.stringify(d.tags || []),
          images: JSON.stringify(d.images || []),
          interpretation: d.interpretation || ''
        });
      });

      loadDreams(); // Refresh UI
      return true;
    } catch (e) {
      console.error("Import Failed:", e);
      return false;
    }
  };

  const addDream = (newDream: Omit<Dream, 'id'>) => {
    try {
      insertDream({
        title: newDream.title,
        body: newDream.body,
        date: newDream.date,
        mood: newDream.mood || 0,
        isLucid: newDream.isLucid ? 1 : 0,
        isNightmare: newDream.isNightmare ? 1 : 0,
        tags: JSON.stringify(newDream.tags),
        images: JSON.stringify(newDream.images),
        interpretation: newDream.interpretation || ''
      });
      loadDreams();
    } catch (e) {
      console.error("Failed to add dream:", e);
      setError(i18n.t('error_save_dream'));
    }
  };

  const updateDream = (updatedDream: Dream) => {
    try {
      updateDreamInDb({
        id: parseInt(updatedDream.id),
        title: updatedDream.title,
        body: updatedDream.body,
        date: updatedDream.date,
        mood: updatedDream.mood || 0,
        isLucid: updatedDream.isLucid ? 1 : 0,
        isNightmare: updatedDream.isNightmare ? 1 : 0,
        tags: JSON.stringify(updatedDream.tags),
        images: JSON.stringify(updatedDream.images),
        interpretation: updatedDream.interpretation || ''
      });
      loadDreams();
    } catch (e) {
      console.error("Failed to update dream:", e);
      setError(i18n.t('error_save_dream'));
    }
  };

  const deleteDream = (id: string) => {
    removeDream(parseInt(id));
    loadDreams();
  };

  const clearAllData = () => {
    clearDatabase();
    loadDreams();
  };

  return (
    <DreamContext.Provider value={{ dreams, userProfile, updateUserProfile, importData, addDream, deleteDream, updateDream, clearAllData }}>
      {children}
      {error && (
        <View style={{ position: 'absolute', bottom: 20, left: 20, right: 20, backgroundColor: '#ef4444', padding: 16, borderRadius: 8, elevation: 5 }}>
          <Text style={{ color: 'white', fontWeight: 'bold' }}>Error</Text>
          <Text style={{ color: 'white' }}>{error}</Text>
          <TouchableOpacity onPress={() => setError(null)} style={{ marginTop: 8 }}>
            <Text style={{ color: 'white', textDecorationLine: 'underline' }}>Dismiss</Text>
          </TouchableOpacity>
        </View>
      )}
    </DreamContext.Provider>
  );
}

export const useDreams = () => {
  const context = useContext(DreamContext);
  if (!context) throw new Error('useDreams must be used within a DreamProvider');
  return context;
};