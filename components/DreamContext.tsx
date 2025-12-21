import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initDatabase, getDreams, insertDream, removeDream, updateDreamInDb, clearDatabase } from '../utils/database';

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
}

export interface UserProfile {
  name: string;
  gender: string;
  age: string;
}

interface DreamContextType {
  dreams: Dream[];
  userProfile: UserProfile; // <--- NEW
  updateUserProfile: (profile: UserProfile) => void; // <--- NEW
  importData: (jsonData: string) => Promise<boolean>; // <--- NEW
  addDream: (dream: any) => void;
  updateDream: (dream: any) => void;
  deleteDream: (id: string) => void;
  clearAllData: () => void;
}

const DreamContext = createContext<DreamContextType | undefined>(undefined);

export function DreamProvider({ children }: { children: React.ReactNode }) {
  const [dreams, setDreams] = useState<Dream[]>([]);
  
  // New User Profile State
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
      loadUserProfile(); // <--- Load Profile
    } catch (e) {
      console.error("Initialization Error:", e);
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

  const loadDreams = () => {
    try {
      const rawDreams = getDreams();
      const formattedDreams: Dream[] = rawDreams.map((row: any) => {
        const parsedImages = JSON.parse(row.images || '[]');
        return {
          id: row.id.toString(),
          title: row.title,
          body: row.body,
          date: row.date,
          mood: row.mood,
          isLucid: row.isLucid === 1,
          isNightmare: row.isNightmare === 1,
          tags: JSON.parse(row.tags || '[]'),
          images: parsedImages,
          hasImages: parsedImages.length > 0,
          imageCount: parsedImages.length,
          thumbnail: parsedImages.length > 0 ? parsedImages[0] : undefined,
        };
      });
      setDreams(formattedDreams);
    } catch (e) {
      console.error("Failed to load dreams:", e);
    }
  };

  // NEW: Import Data Function
  const importData = async (jsonData: string): Promise<boolean> => {
    try {
      const parsed = JSON.parse(jsonData);
      if (!Array.isArray(parsed)) throw new Error("Invalid Format");

      // Loop through and insert each dream
      parsed.forEach((d: any) => {
        // Basic validation
        if (!d.title) return; 

        insertDream({
          title: d.title,
          body: d.body || '',
          date: d.date || new Date().toLocaleDateString(),
          mood: d.mood || 0,
          isLucid: d.isLucid ? 1 : 0,
          isNightmare: d.isNightmare ? 1 : 0,
          tags: JSON.stringify(d.tags || []),
          images: JSON.stringify(d.images || [])
        });
      });

      loadDreams(); // Refresh UI
      return true;
    } catch (e) {
      console.error("Import Failed:", e);
      return false;
    }
  };

  const addDream = (newDream: any) => {
    insertDream({
      title: newDream.title,
      body: newDream.body,
      date: newDream.date,
      mood: newDream.mood,
      isLucid: newDream.isLucid ? 1 : 0,
      isNightmare: newDream.isNightmare ? 1 : 0,
      tags: JSON.stringify(newDream.tags),
      images: JSON.stringify(newDream.images)
    });
    loadDreams();
  };

  const updateDream = (updatedDream: any) => {
    updateDreamInDb({
      id: parseInt(updatedDream.id),
      title: updatedDream.title,
      body: updatedDream.body,
      date: updatedDream.date,
      mood: updatedDream.mood,
      isLucid: updatedDream.isLucid ? 1 : 0,
      isNightmare: updatedDream.isNightmare ? 1 : 0,
      tags: JSON.stringify(updatedDream.tags),
      images: JSON.stringify(updatedDream.images)
    });
    loadDreams();
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
    </DreamContext.Provider>
  );
}

export const useDreams = () => {
  const context = useContext(DreamContext);
  if (!context) throw new Error('useDreams must be used within a DreamProvider');
  return context;
};