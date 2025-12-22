import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Image, Switch, StatusBar, Alert, StatusBarStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useDreams } from '../components/DreamContext';
import { useTheme } from '../components/ThemeContext'; // <--- Import Theme Hook

interface DreamImage { uri: string; }

export default function EditorScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { addDream, updateDream, dreams } = useDreams();
  const { colors } = useTheme(); // <--- Get Colors
  
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
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <StatusBar 
        barStyle={colors.statusBarStyle as StatusBarStyle} 
        backgroundColor={colors.background} 
      />

      {/* Header */}
      <View 
        className="flex-row items-center justify-between px-4 py-3 border-b"
        style={{ backgroundColor: colors.background, borderColor: colors.border }}
      >
        <TouchableOpacity onPress={() => router.back()} className="flex-row items-center">
          <MaterialIcons name="arrow-back" size={24} color={colors.textSecondary} />
          <Text style={{ color: colors.textSecondary }} className="ml-1 font-medium">Cancel</Text>
        </TouchableOpacity>
        <Text style={{ color: colors.text }} className="font-bold text-lg hidden sm:block">
          {isEditing ? 'Edit Dream' : 'New Dream'}
        </Text>
        <TouchableOpacity 
          className="px-4 py-2 rounded-lg shadow-lg"
          style={{ backgroundColor: colors.primary, shadowColor: colors.primary, shadowOpacity: 0.3 }}
          onPress={handleSave}
        >
          <Text className="text-white font-bold text-sm">Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Title & Body Card */}
        <View 
          className="rounded-xl p-4 mb-6 border"
          style={{ backgroundColor: colors.card, borderColor: colors.border }}
        >
          <TextInput
            className="text-2xl font-bold mb-4"
            style={{ color: colors.text }}
            placeholder="Title..."
            placeholderTextColor={colors.textSecondary}
            value={title}
            onChangeText={setTitle}
          />
          <View className="h-px mb-4" style={{ backgroundColor: colors.border }} />
          <TextInput
            className="text-lg leading-relaxed min-h-[150px]"
            style={{ color: colors.text }}
            placeholder="Describe your dream..."
            placeholderTextColor={colors.textSecondary}
            multiline
            textAlignVertical="top"
            value={body}
            onChangeText={setBody}
          />
        </View>

        {/* Attachments */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-3">
            <Text style={{ color: colors.textSecondary }} className="text-xs font-bold uppercase tracking-wider">
              Attachments
            </Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-3">
            <TouchableOpacity 
              onPress={pickImage} 
              className="w-24 h-24 rounded-lg border-2 border-dashed items-center justify-center"
              style={{ borderColor: colors.border, backgroundColor: colors.input + '40' }}
            >
              <MaterialIcons name="add-photo-alternate" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
            {images.map((img, index) => (
              <View key={index} className="w-24 h-24 relative">
                <Image source={{ uri: img.uri }} className="w-full h-full rounded-lg" resizeMode="cover" style={{ backgroundColor: colors.input }} />
                <TouchableOpacity onPress={() => removeImage(index)} className="absolute -top-2 -right-2 bg-black/80 rounded-full p-1 border border-white/20">
                  <MaterialIcons name="close" size={12} color="white" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Mood Selector */}
        <View 
          className="p-4 rounded-xl border mb-4"
          style={{ backgroundColor: colors.card, borderColor: colors.border }}
        >
          <Text style={{ color: colors.textSecondary }} className="text-xs font-bold uppercase tracking-wider mb-3">Mood</Text>
          <View className="flex-row justify-between p-2 rounded-lg" style={{ backgroundColor: colors.input }}>
            {[1, 2, 3, 4, 5].map((level) => {
              const icons = ['sentiment-very-dissatisfied', 'sentiment-dissatisfied', 'sentiment-neutral', 'sentiment-satisfied', 'sentiment-very-satisfied'];
              const moodColors = ['#ef4444', '#fdba74', colors.textSecondary, '#86efac', '#22c55e'];
              const isActive = mood === level;
              return (
                <TouchableOpacity 
                  key={level} 
                  onPress={() => setMood(level)} 
                  className="p-2 rounded-md"
                  style={{ backgroundColor: isActive ? colors.background : 'transparent' }}
                >
                  <MaterialIcons 
                    name={icons[level-1] as any} 
                    size={28} 
                    color={isActive ? (level === 3 ? colors.text : moodColors[level-1]) : colors.textSecondary} 
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Toggles */}
        <View className="flex-col gap-3 mb-6">
          <TouchableOpacity 
            onPress={() => setIsLucid(!isLucid)} 
            className="flex-row items-center justify-between p-4 rounded-xl border"
            style={{ 
              backgroundColor: isLucid ? colors.primary + '15' : colors.card,
              borderColor: isLucid ? colors.primary : colors.border
            }}
          >
            <Text style={{ color: colors.text }} className="font-semibold">Lucid Dream</Text>
            <Switch 
              value={isLucid} 
              onValueChange={setIsLucid} 
              trackColor={{ false: colors.input, true: colors.primary }} 
              thumbColor={'#ffffff'} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => setIsNightmare(!isNightmare)} 
            className="flex-row items-center justify-between p-4 rounded-xl border"
            style={{ 
              backgroundColor: isNightmare ? '#ef444415' : colors.card,
              borderColor: isNightmare ? '#ef4444' : colors.border
            }}
          >
            <Text style={{ color: colors.text }} className="font-semibold">Nightmare</Text>
            <Switch 
              value={isNightmare} 
              onValueChange={setIsNightmare} 
              trackColor={{ false: colors.input, true: '#ef4444' }} 
              thumbColor={'#ffffff'} 
            />
          </TouchableOpacity>
        </View>

        {/* Tags */}
        <View 
          className="p-4 rounded-xl border mb-10"
          style={{ backgroundColor: colors.card, borderColor: colors.border }}
        >
          <Text style={{ color: colors.textSecondary }} className="text-xs font-bold uppercase tracking-wider mb-3">Tags</Text>
          <View className="flex-row gap-2 mb-3">
            <TextInput 
              className="flex-1 px-3 py-2 rounded-lg border"
              style={{ 
                backgroundColor: colors.input, 
                color: colors.text,
                borderColor: colors.border
              }}
              placeholder="Add a tag..." 
              placeholderTextColor={colors.textSecondary}
              value={tagInput} 
              onChangeText={setTagInput} 
              onSubmitEditing={addTag} 
            />
            <TouchableOpacity 
              onPress={addTag} 
              className="px-4 items-center justify-center rounded-lg"
              style={{ backgroundColor: colors.input }}
            >
              <MaterialIcons name="add" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
          <View className="flex-row flex-wrap gap-2">
            {tags.map((tag, idx) => (
              <TouchableOpacity 
                key={idx} 
                onPress={() => removeTag(tag)} 
                className="flex-row items-center gap-1 px-2 py-1 rounded-md border"
                style={{ 
                  backgroundColor: colors.primary + '15',
                  borderColor: colors.primary + '30'
                }}
              >
                <Text style={{ color: colors.primary }} className="text-xs font-medium">{tag}</Text>
                <MaterialIcons name="close" size={12} color={colors.primary} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}