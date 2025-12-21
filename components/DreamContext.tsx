import React, { createContext, useContext, useState } from 'react';

// 1. Define the Dream Type
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

// 2. Initial Mock Data
const INITIAL_DREAMS: Dream[] = [
  {
    id: '1',
    title: 'Flying over the Indigo Ocean',
    date: new Date().toLocaleDateString(),
    body: 'I was standing on a cliff edge, but instead of falling, I pushed off into the air...',
    tags: ['#flying', '#ocean'],
    isLucid: true,
    isNightmare: false,
    hasImages: true,
    thumbnail: 'https://images.unsplash.com/photo-1551244072-5d12893278ab',
    imageCount: 3,
    images: ['https://images.unsplash.com/photo-1551244072-5d12893278ab'],
    mood: 5
  },
];

// 3. Create Context
interface DreamContextType {
  dreams: Dream[];
  addDream: (dream: Dream) => void;
  deleteDream: (id: string) => void;
}

const DreamContext = createContext<DreamContextType | undefined>(undefined);

// 4. Provider Component
export function DreamProvider({ children }: { children: React.ReactNode }) {
  const [dreams, setDreams] = useState<Dream[]>(INITIAL_DREAMS);

  const addDream = (newDream: Dream) => {
    setDreams((prev) => [newDream, ...prev]);
  };

  const deleteDream = (id: string) => {
    setDreams((prev) => prev.filter(d => d.id !== id));
  };

  return (
    <DreamContext.Provider value={{ dreams, addDream, deleteDream }}>
      {children}
    </DreamContext.Provider>
  );
}

// 5. THE MISSING HOOK EXPORT
export const useDreams = () => {
  const context = useContext(DreamContext);
  if (!context) {
    throw new Error('useDreams must be used within a DreamProvider');
  }
  return context;
};