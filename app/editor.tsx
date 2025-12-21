import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Image, Switch, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useDreams, Dream } from '../components/DreamContext';

// Types
interface DreamImage {
  uri: string;
}

export default function EditorScreen() {
  const router = useRouter();
  const { addDream } = useDreams();
  // Form State
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [images, setImages] = useState<DreamImage[]>([]);
  const [mood, setMood] = useState<number>(3); // 1-5 scale
  const [isLucid, setIsLucid] = useState(false);
  const [isNightmare, setIsNightmare] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  // 1. Image Picker Function
  const pickImage = async () => {
    // Check permissions (optional on newer OS but good practice)
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "You need to allow access to your photos to add images.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false, // MVP requirement: no editing
      quality: 0.7, // Compress slightly for performance
      allowsMultipleSelection: true,
      selectionLimit: 10 - images.length, // Enforce cap of 10
    });

    if (!result.canceled) {
      const newImages = result.assets.map(asset => ({ uri: asset.uri }));
      setImages([...images, ...newImages]);
    }
  };

  // Remove Image
  const removeImage = (index: number) => {
    Alert.alert("Remove Image", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Remove", 
        style: "destructive", 
        onPress: () => {
          const newImages = [...images];
          newImages.splice(index, 1);
          setImages(newImages);
        }
      }
    ]);
  };

  // Add Tag
  const addTag = () => {
    if (tagInput.trim().length > 0 && !tags.includes(tagInput.trim())) {
      setTags([...tags, `#${tagInput.trim().replace(/^#/, '')}`]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <SafeAreaView className="flex-1 bg-background-dark">
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-white/5 bg-[#111218]">
        <TouchableOpacity onPress={() => router.back()} className="flex-row items-center">
          <MaterialIcons name="arrow-back" size={24} color="#9da1b9" />
          <Text className="text-text-secondary ml-1 font-medium">Cancel</Text>
        </TouchableOpacity>
        <Text className="text-white font-bold text-lg hidden sm:block">New Dream</Text>
        <TouchableOpacity 
          className="bg-primary px-4 py-2 rounded-lg shadow-lg shadow-blue-900/20"
          onPress={() => {
  if (!title && !body) return; // Prevent empty saves

  const newDream = {
    id: Date.now().toString(), // Simple ID generation
    title: title || 'Untitled Dream',
    body: body,
    date: new Date().toLocaleDateString(),
    mood,
    isLucid,
    isNightmare,
    tags,
    hasImages: images.length > 0,
    imageCount: images.length,
    thumbnail: images.length > 0 ? images[0].uri : undefined,
    images: images.map(img => img.uri)
  };

  addDream(newDream); // <--- Save to Context
  router.back();      // <--- Go back to Home
}}
        >
          <Text className="text-white font-bold text-sm">Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Main Inputs */}
        <View className="bg-card-dark rounded-xl p-4 mb-6 border border-white/5">
          <TextInput
            className="text-2xl font-bold text-white mb-4 placeholder:text-white/20"
            placeholder="Give your dream a title..."
            placeholderTextColor="#4b5563"
            value={title}
            onChangeText={setTitle}
          />
          <View className="flex-row gap-4 mb-4">
            <View className="flex-row items-center gap-2">
              <MaterialIcons name="calendar-today" size={16} color="#9da1b9" />
              <Text className="text-text-secondary text-sm">Today, {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
            </View>
          </View>
          
          <View className="h-px bg-white/5 mb-4" />
          
          <TextInput
            className="text-white text-lg leading-relaxed min-h-[150px] placeholder:text-white/20"
            placeholder="I was walking through a forest..."
            placeholderTextColor="#4b5563"
            multiline
            textAlignVertical="top"
            value={body}
            onChangeText={setBody}
          />
        </View>

        {/* Attachments Section */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-text-secondary text-xs font-bold uppercase tracking-wider">Attachments ({images.length}/10)</Text>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-3">
            {/* Upload Button */}
            <TouchableOpacity 
              onPress={pickImage}
              disabled={images.length >= 10}
              className="w-24 h-24 rounded-lg border-2 border-dashed border-white/10 items-center justify-center bg-[#111218] active:bg-white/5"
            >
              <MaterialIcons name="add-photo-alternate" size={24} color="#9da1b9" />
              <Text className="text-[10px] text-text-secondary mt-1 font-medium">Add Image</Text>
            </TouchableOpacity>

            {/* Image List */}
            {images.map((img, index) => (
              <View key={index} className="w-24 h-24 relative group">
                <Image 
                  source={{ uri: img.uri }} 
                  className="w-full h-full rounded-lg bg-gray-800"
                  resizeMode="cover"
                />
                <TouchableOpacity 
                  onPress={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-black/80 rounded-full p-1 border border-white/20"
                >
                  <MaterialIcons name="close" size={12} color="white" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Metadata Cards */}
        <View className="flex-col gap-4 mb-10">
          
          {/* Mood Selector */}
          <View className="bg-card-dark p-4 rounded-xl border border-white/5">
            <Text className="text-text-secondary text-xs font-bold uppercase tracking-wider mb-3">Mood</Text>
            <View className="flex-row justify-between bg-[#111218] p-2 rounded-lg">
              {[1, 2, 3, 4, 5].map((level) => {
                const icons = ['sentiment-very-dissatisfied', 'sentiment-dissatisfied', 'sentiment-neutral', 'sentiment-satisfied', 'sentiment-very-satisfied'];
                const colors = ['#ef4444', '#fdba74', '#9da1b9', '#86efac', '#22c55e'];
                const isActive = mood === level;
                
                return (
                  <TouchableOpacity 
                    key={level} 
                    onPress={() => setMood(level)}
                    className={`p-2 rounded-md transition-all ${isActive ? 'bg-white/10' : ''}`}
                  >
                    <MaterialIcons 
                      name={icons[level-1] as any} 
                      size={28} 
                      color={isActive ? colors[level-1] : '#4b5563'} 
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Properties Toggles */}
          <View className="flex-col gap-3">
            {/* Lucid Toggle */}
            <TouchableOpacity 
              onPress={() => setIsLucid(!isLucid)}
              className={`flex-row items-center justify-between p-4 rounded-xl border ${isLucid ? 'bg-primary/10 border-primary' : 'bg-card-dark border-white/5'}`}
            >
              <View className="flex-row items-center gap-3">
                <MaterialIcons name="auto-awesome" size={24} color={isLucid ? '#c084fc' : '#4b5563'} />
                <View>
                  <Text className="text-white font-semibold">Lucid Dream</Text>
                  <Text className="text-text-secondary text-xs">Were you aware?</Text>
                </View>
              </View>
              <Switch 
                value={isLucid} 
                onValueChange={setIsLucid}
                trackColor={{ false: '#282b39', true: '#1337ec' }}
                thumbColor={'#ffffff'}
              />
            </TouchableOpacity>

            {/* Nightmare Toggle */}
            <TouchableOpacity 
              onPress={() => setIsNightmare(!isNightmare)}
              className={`flex-row items-center justify-between p-4 rounded-xl border ${isNightmare ? 'bg-red-500/10 border-red-500' : 'bg-card-dark border-white/5'}`}
            >
              <View className="flex-row items-center gap-3">
                <MaterialCommunityIcons name="spider-web" size={24} color={isNightmare ? '#f87171' : '#4b5563'} />
                <View>
                  <Text className="text-white font-semibold">Nightmare</Text>
                  <Text className="text-text-secondary text-xs">Was it scary?</Text>
                </View>
              </View>
              <Switch 
                value={isNightmare} 
                onValueChange={setIsNightmare}
                trackColor={{ false: '#282b39', true: '#dc2626' }}
                thumbColor={'#ffffff'}
              />
            </TouchableOpacity>
          </View>

          {/* Tags Input */}
          <View className="bg-card-dark p-4 rounded-xl border border-white/5">
            <Text className="text-text-secondary text-xs font-bold uppercase tracking-wider mb-3">Tags</Text>
            <View className="flex-row gap-2 mb-3">
              <TextInput 
                className="flex-1 bg-[#111218] text-white px-3 py-2 rounded-lg border border-white/5"
                placeholder="Add a tag..."
                placeholderTextColor="#4b5563"
                value={tagInput}
                onChangeText={setTagInput}
                onSubmitEditing={addTag}
              />
              <TouchableOpacity onPress={addTag} className="bg-white/10 px-4 items-center justify-center rounded-lg">
                <MaterialIcons name="add" size={20} color="white" />
              </TouchableOpacity>
            </View>
            <View className="flex-row flex-wrap gap-2">
              {tags.map((tag, idx) => (
                <TouchableOpacity key={idx} onPress={() => removeTag(tag)} className="flex-row items-center gap-1 bg-primary/20 border border-primary/30 px-2 py-1 rounded-md">
                  <Text className="text-blue-200 text-xs font-medium">{tag}</Text>
                  <MaterialIcons name="close" size={12} color="#bfdbfe" />
                </TouchableOpacity>
              ))}
            </View>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}