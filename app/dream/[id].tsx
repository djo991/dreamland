import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StatusBar, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

// Mock Data (In a real app, you'd fetch this by ID from SQLite)
const MOCK_DETAIL = {
  id: '1',
  title: 'The Underwater Library',
  date: 'Tuesday, Nov 14th',
  time: '03:45 AM',
  sleepDuration: '7h 20m',
  body: 'I was swimming through a library, but the water was breathable. The books were floating around me like jellyfish, their pages undulating in the current. I realized I was dreaming when I looked at my hands and saw they were translucent, glowing with a soft blue light.\n\nI kicked off from a shelf and floated towards the ceiling, which was actually the surface of the water, shimmering with moonlight. As I broke the surface, the sky was a deep violet...',
  tags: ['#water', '#books', '#flying', '#lucid_control'],
  isLucid: true,
  isNightmare: false,
  images: [
    'https://images.unsplash.com/photo-1551244072-5d12893278ab?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1518134346374-1849d2232542?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1507494553316-2f16ee08f164?auto=format&fit=crop&w=800&q=80',
  ]
};

export default function DreamDetailScreen() {
  const { id } = useLocalSearchParams(); // Grab ID from URL
  const router = useRouter();
  
  // State for Full Screen Image Viewer
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const openImage = (uri: string) => {
    setSelectedImage(uri);
    setModalVisible(true);
  };

  const handleDelete = () => {
    Alert.alert("Delete Entry", "Are you sure? This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => router.back() }
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-background-dark">
      <StatusBar barStyle="light-content" />

      {/* Top Navigation */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-[#111218] border-b border-white/5">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2 rounded-full active:bg-white/10">
          <MaterialIcons name="arrow-back" size={24} color="#9da1b9" />
        </TouchableOpacity>
        
        <View className="flex-row gap-2">
          <TouchableOpacity 
            onPress={() => router.push('/editor')}
            className="flex-row items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 active:bg-white/10"
          >
            <MaterialIcons name="edit" size={16} color="#9da1b9" />
            <Text className="text-text-secondary text-xs font-bold uppercase">Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={handleDelete}
            className="flex-row items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 active:bg-red-500/20"
          >
            <MaterialIcons name="delete" size={16} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1">
        <View className="px-6 py-8 flex-col gap-6">
          
          {/* Header Info */}
          <View className="flex-col gap-4">
            {/* Meta Row */}
            <View className="flex-row flex-wrap items-center gap-x-4 gap-y-2">
              <View className="flex-row items-center gap-1.5">
                <MaterialIcons name="calendar-today" size={14} color="#64748b" />
                <Text className="text-text-secondary text-sm font-medium">{MOCK_DETAIL.date}</Text>
              </View>
              <Text className="text-text-secondary/30">•</Text>
              <View className="flex-row items-center gap-1.5">
                <MaterialIcons name="schedule" size={14} color="#64748b" />
                <Text className="text-text-secondary text-sm font-medium">{MOCK_DETAIL.time}</Text>
              </View>
            </View>

            {/* Title */}
            <Text className="text-3xl font-black text-white leading-tight tracking-tight">
              {MOCK_DETAIL.title}
            </Text>

            {/* Badges */}
            <View className="flex-row gap-3">
              {MOCK_DETAIL.isLucid && (
                <View className="flex-row items-center gap-2 px-3 py-1.5 rounded-full bg-primary shadow-lg shadow-blue-900/40">
                  <MaterialIcons name="star" size={16} color="white" />
                  <Text className="text-white text-xs font-bold uppercase tracking-wider">Lucid Dream</Text>
                </View>
              )}
              {MOCK_DETAIL.isNightmare && (
                <View className="flex-row items-center gap-2 px-3 py-1.5 rounded-full bg-[#1c1d27] border border-white/10">
                  <MaterialCommunityIcons name="spider-web" size={16} color="#9da1b9" />
                  <Text className="text-text-secondary text-xs font-bold uppercase tracking-wider">Nightmare</Text>
                </View>
              )}
            </View>
          </View>

          <View className="h-px bg-white/10 w-full" />

          {/* Body Text */}
          <Text className="text-lg text-slate-300 leading-relaxed font-normal">
            {MOCK_DETAIL.body}
          </Text>

          {/* Tags */}
          <View className="flex-row flex-wrap gap-2 pt-2">
            {MOCK_DETAIL.tags.map((tag, i) => (
              <Text key={i} className="px-3 py-1.5 rounded-lg bg-card-dark border border-white/5 text-sm font-medium text-text-secondary">
                {tag}
              </Text>
            ))}
          </View>

          {/* Gallery Section */}
          <View className="mt-6 pt-6 border-t border-white/10">
            <View className="flex-row items-center gap-2 mb-4">
              <MaterialIcons name="photo-library" size={20} color="#1337ec" />
              <Text className="text-xl font-bold text-white">Dream Visuals</Text>
              <Text className="text-sm text-text-secondary">({MOCK_DETAIL.images.length})</Text>
            </View>

            <View className="flex-row flex-wrap gap-3">
              {MOCK_DETAIL.images.map((img, index) => (
                <TouchableOpacity 
                  key={index}
                  onPress={() => openImage(img)}
                  className="w-[48%] aspect-square rounded-xl overflow-hidden border border-white/10 bg-[#111218] relative"
                >
                  <Image 
                    source={{ uri: img }} 
                    className="w-full h-full opacity-90"
                    resizeMode="cover"
                  />
                  <View className="absolute bottom-2 right-2 bg-black/60 p-1.5 rounded-full backdrop-blur-sm">
                    <MaterialIcons name="fullscreen" size={16} color="white" />
                  </View>
                </TouchableOpacity>
              ))}
              
              {/* Add New Placeholder (Visual cue to edit) */}
              <TouchableOpacity 
                onPress={() => router.push('/editor')}
                className="w-[48%] aspect-square rounded-xl border-2 border-dashed border-white/10 bg-white/5 flex-col items-center justify-center gap-2 active:bg-white/10"
              >
                <View className="w-10 h-10 rounded-full bg-white/10 items-center justify-center">
                  <MaterialIcons name="add" size={20} color="#9da1b9" />
                </View>
                <Text className="text-xs font-bold text-text-secondary uppercase">Upload</Text>
              </TouchableOpacity>
            </View>
          </View>

        </View>
      </ScrollView>

      {/* Simple Full Screen Modal */}
      <Modal visible={modalVisible} transparent={true} animationType="fade">
        <View className="flex-1 bg-black/95 relative justify-center items-center">
          <TouchableOpacity 
            onPress={() => setModalVisible(false)}
            className="absolute top-12 right-6 z-50 p-2 bg-white/10 rounded-full"
          >
            <MaterialIcons name="close" size={24} color="white" />
          </TouchableOpacity>
          
          {selectedImage && (
            <Image 
              source={{ uri: selectedImage }} 
              className="w-full h-3/4" 
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>

    </SafeAreaView>
  );
}