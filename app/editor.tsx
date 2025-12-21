import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Image, Switch, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useDreams } from '../components/DreamContext';

interface DreamImage { uri: string; }

export default function EditorScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); // Check if editing
  const { addDream, updateDream, dreams } = useDreams();
  
  // State
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [images, setImages] = useState<DreamImage[]>([]);
  const [mood, setMood] = useState<number>(3);
  const [isLucid, setIsLucid] = useState(false);
  const [isNightmare, setIsNightmare] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  // Load data if editing
  useEffect(() => {
    if (id) {
      const dreamToEdit = dreams.find(d => d.id === id);
      if (dreamToEdit) {
        setIsEditing(true);
        setTitle(dreamToEdit.title);
        setBody(dreamToEdit.body);
        setMood(dreamToEdit.mood || 3);
        setIsLucid(dreamToEdit.isLucid);
        setIsNightmare(dreamToEdit.isNightmare);
        setTags(dreamToEdit.tags || []);
        if (dreamToEdit.images) {
          setImages(dreamToEdit.images.map(uri => ({ uri })));
        }
      }
    }
  }, [id, dreams]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 10 - images.length,
      quality: 0.7,
    });

    if (!result.canceled) {
      const newImages = result.assets.map(asset => ({ uri: asset.uri }));
      setImages([...images, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const addTag = () => {
    if (tagInput.trim().length > 0 && !tags.includes(tagInput.trim())) {
      setTags([...tags, `#${tagInput.trim().replace(/^#/, '')}`]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSave = () => {
    if (!title && !body) return;
    
    const dreamData = {
      title: title || 'Untitled Dream',
      body,
      date: isEditing ? (dreams.find(d => d.id === id)?.date || new Date().toLocaleDateString()) : new Date().toLocaleDateString(),
      mood,
      isLucid,
      isNightmare,
      tags,
      hasImages: images.length > 0,
      imageCount: images.length,
      thumbnail: images.length > 0 ? images[0].uri : undefined,
      images: images.map(img => img.uri)
    };

    if (isEditing && id) {
      updateDream({ ...dreamData, id });
    } else {
      addDream(dreamData);
    }
    
    router.back();
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
        <Text className="text-white font-bold text-lg hidden sm:block">
          {isEditing ? 'Edit Dream' : 'New Dream'}
        </Text>
        <TouchableOpacity 
          className="bg-primary px-4 py-2 rounded-lg shadow-lg shadow-blue-900/20"
          onPress={handleSave}
        >
          <Text className="text-white font-bold text-sm">Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 p-4">
        <View className="bg-card-dark rounded-xl p-4 mb-6 border border-white/5">
          <TextInput
            className="text-2xl font-bold text-white mb-4 placeholder:text-white/20"
            placeholder="Title..."
            placeholderTextColor="#4b5563"
            value={title}
            onChangeText={setTitle}
          />
          <View className="h-px bg-white/5 mb-4" />
          <TextInput
            className="text-white text-lg leading-relaxed min-h-[150px] placeholder:text-white/20"
            placeholder="Describe your dream..."
            placeholderTextColor="#4b5563"
            multiline
            textAlignVertical="top"
            value={body}
            onChangeText={setBody}
          />
        </View>

        {/* Attachments */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-text-secondary text-xs font-bold uppercase tracking-wider">Attachments</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-3">
            <TouchableOpacity onPress={pickImage} className="w-24 h-24 rounded-lg border-2 border-dashed border-white/10 items-center justify-center bg-[#111218]">
              <MaterialIcons name="add-photo-alternate" size={24} color="#9da1b9" />
            </TouchableOpacity>
            {images.map((img, index) => (
              <View key={index} className="w-24 h-24 relative">
                <Image source={{ uri: img.uri }} className="w-full h-full rounded-lg bg-gray-800" resizeMode="cover" />
                <TouchableOpacity onPress={() => removeImage(index)} className="absolute -top-2 -right-2 bg-black/80 rounded-full p-1 border border-white/20">
                  <MaterialIcons name="close" size={12} color="white" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Toggles (Lucid/Nightmare/Tags/Mood) - Same as before... */}
        {/* For brevity, I am reusing the exact same UI code as your previous Editor, just with the new state logic above */}
        {/* ... Paste the rest of your UI here (Mood, Switches, Tags) ... */}
         
         {/* Mood Selector */}
          <View className="bg-card-dark p-4 rounded-xl border border-white/5 mb-4">
            <Text className="text-text-secondary text-xs font-bold uppercase tracking-wider mb-3">Mood</Text>
            <View className="flex-row justify-between bg-[#111218] p-2 rounded-lg">
              {[1, 2, 3, 4, 5].map((level) => {
                const icons = ['sentiment-very-dissatisfied', 'sentiment-dissatisfied', 'sentiment-neutral', 'sentiment-satisfied', 'sentiment-very-satisfied'];
                const colors = ['#ef4444', '#fdba74', '#9da1b9', '#86efac', '#22c55e'];
                const isActive = mood === level;
                return (
                  <TouchableOpacity key={level} onPress={() => setMood(level)} className={`p-2 rounded-md ${isActive ? 'bg-white/10' : ''}`}>
                    <MaterialIcons name={icons[level-1] as any} size={28} color={isActive ? colors[level-1] : '#4b5563'} />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Toggles */}
          <View className="flex-col gap-3 mb-6">
            <TouchableOpacity onPress={() => setIsLucid(!isLucid)} className={`flex-row items-center justify-between p-4 rounded-xl border ${isLucid ? 'bg-primary/10 border-primary' : 'bg-card-dark border-white/5'}`}>
              <Text className="text-white font-semibold">Lucid Dream</Text>
              <Switch value={isLucid} onValueChange={setIsLucid} trackColor={{ false: '#282b39', true: '#1337ec' }} thumbColor={'#ffffff'} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsNightmare(!isNightmare)} className={`flex-row items-center justify-between p-4 rounded-xl border ${isNightmare ? 'bg-red-500/10 border-red-500' : 'bg-card-dark border-white/5'}`}>
              <Text className="text-white font-semibold">Nightmare</Text>
              <Switch value={isNightmare} onValueChange={setIsNightmare} trackColor={{ false: '#282b39', true: '#dc2626' }} thumbColor={'#ffffff'} />
            </TouchableOpacity>
          </View>

          {/* Tags */}
          <View className="bg-card-dark p-4 rounded-xl border border-white/5 mb-10">
            <Text className="text-text-secondary text-xs font-bold uppercase tracking-wider mb-3">Tags</Text>
            <View className="flex-row gap-2 mb-3">
              <TextInput className="flex-1 bg-[#111218] text-white px-3 py-2 rounded-lg border border-white/5" placeholder="Add a tag..." placeholderTextColor="#4b5563" value={tagInput} onChangeText={setTagInput} onSubmitEditing={addTag} />
              <TouchableOpacity onPress={addTag} className="bg-white/10 px-4 items-center justify-center rounded-lg"><MaterialIcons name="add" size={20} color="white" /></TouchableOpacity>
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

      </ScrollView>
    </SafeAreaView>
  );
}