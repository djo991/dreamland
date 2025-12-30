import * as FileSystem from 'expo-file-system';

const API_URL = 'https://dream-be.vercel.app/api/dream'; 

// Define types for TypeScript safety
export type DreamStyle = 'psychologist' | 'freud' | 'mystic' | 'bestie';

export const interpretDream = async (title: string, content: string, tags: string[], style: DreamStyle = 'psychologist') => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'interpretation',
        payload: { 
          title, 
          content, 
          tags,
          style // <--- Passing the chosen persona
        }
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Interpretation failed");
    return data.result as string;
  } catch (error) {
    console.error("Interpretation Error:", error);
    throw error;
  }
};

export const generateDreamImage = async (description: string, dreamId?: string) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'image',
        payload: { description }
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Image generation failed");

    const idPart = dreamId || `new-${Date.now()}`; 
    const fileName = `dream-${idPart}.png`;
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;

    await FileSystem.writeAsStringAsync(fileUri, data.result, {
      encoding: FileSystem.EncodingType.Base64,
    });

    return fileUri; 
  } catch (error) {
    console.error("Image Gen Error:", error);
    throw error;
  }
};