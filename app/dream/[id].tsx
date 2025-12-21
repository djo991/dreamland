import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useDreams, Dream } from '../../components/DreamContext';

export default function DreamDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { dreams, deleteDream } = useDreams();

  const [dream, setDream] = useState<Dream | undefined>(undefined);

  useEffect(() => {
    if (id && dreams.length > 0) {
      const found = dreams.find((d) => d.id === id);
      setDream(found);
    }
  }, [id, dreams]);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const openImage = (uri: string) => {
    setSelectedImage(uri);
    setModalVisible(true);
  };

  const handleDelete = () => {
    Alert.alert('Delete Entry', 'Are you sure? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteDream(id as string);
          router.back();
        },
      },
    ]);
  };

  if (!dream) {
    return (
      <SafeAreaView className="flex-1 bg-background-dark items-center justify-center">
        <Text className="text-text-secondary">Dream not found...</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4">
          <Text className="text-primary font-bold">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background-dark">
      <StatusBar barStyle="light-content" />

      {/* Top Navigation */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-[#111218] border-b border-white/5">
        {/* Back Button - Fixed Square */}
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 -ml-2 items-center justify-center rounded-full active:bg-white/10">
          <MaterialIcons name="arrow-back" size={24} color="#9da1b9" />
        </TouchableOpacity>

        <View className="flex-row gap-2">
          {/* Edit Button - FIXED SQUARE ALIGNMENT */}
          <TouchableOpacity
            onPress={() => router.push({ pathname: '/editor', params: { id: dream.id } })}
            className="w-10 h-10 rounded-full bg-white/5 active:bg-white/10 items-center justify-center"
          >
            <MaterialIcons name="edit" size={20} color="#9da1b9" />
          </TouchableOpacity>

          {/* Delete Button - FIXED SQUARE ALIGNMENT */}
          <TouchableOpacity
            onPress={handleDelete}
            className="w-10 h-10 rounded-full bg-red-500/10 active:bg-red-500/20 items-center justify-center"
          >
            <MaterialIcons name="delete" size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1">
        <View className="px-6 py-8 flex-col gap-6">
          <View className="flex-col gap-4">
            
             {/* ... Date Section ... */}

            <Text className="text-3xl font-black text-white leading-tight tracking-tight">
              {dream.title}
            </Text>

            {/* Badges - NEGATIVE MARGIN APPLIED */}
            <View className="flex-row gap-3">
              {dream.isLucid && (
                <View className="flex-row items-center justify-center gap-2 px-3 h-7 rounded-full bg-primary shadow-lg shadow-blue-900/40">
                  <MaterialIcons name="auto-awesome" size={16} color="white" />
                  <Text
                    className="text-white text-xs font-bold uppercase tracking-wider"
                    // PULL TEXT UP
                    style={{ includeFontPadding: false, textAlignVertical: 'center', marginTop: -2 }}
                  >
                    Lucid Dream
                  </Text>
                </View>
              )}

              {dream.isNightmare && (
                <View className="flex-row items-center justify-center gap-2 px-3 h-7 rounded-full bg-[#1c1d27] border border-white/10">
                  <MaterialCommunityIcons name="spider-web" size={16} color="#9da1b9" />
                  <Text
                    className="text-text-secondary text-xs font-bold uppercase tracking-wider"
                    // PULL TEXT UP
                    style={{ includeFontPadding: false, textAlignVertical: 'center', marginTop: -2 }}
                  >
                    Nightmare
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View className="h-px bg-white/10 w-full" />

          <Text className="text-lg text-slate-300 leading-relaxed font-normal">
            {dream.body}
          </Text>

          {/* Tags */}
          <View className="flex-row flex-wrap gap-2 pt-2">
            {dream.tags.map((tag, i) => (
              <View
                key={`${dream.id}:${tag}:${i}`}
                className="bg-card-dark border border-white/5 rounded-lg px-3 h-7 justify-center"
              >
                <Text
                  className="text-sm font-medium text-text-secondary -mt-[2px]"
                  style={{ includeFontPadding: false, textAlignVertical: 'center' }}
                >
                  {tag}
                </Text>
              </View>
            ))}
          </View>

          {/* Gallery Section */}
          <View className="mt-6 pt-6 border-t border-white/10">
            <View className="flex-row items-center gap-2 mb-4">
              <MaterialIcons name="photo-library" size={20} color="#1337ec" />
              <Text className="text-xl font-bold text-white -mt-[1px]">Dream Visuals</Text>
              <Text className="text-sm text-text-secondary -mt-[1px]">({dream.images?.length || 0})</Text>
            </View>

            <View className="flex-row flex-wrap gap-3">
              {dream.images &&
                dream.images.map((img, index) => (
                  <TouchableOpacity
                    key={`${dream.id}:img:${index}`}
                    onPress={() => openImage(img)}
                    className="w-[48%] aspect-square rounded-xl overflow-hidden border border-white/10 bg-[#111218] relative"
                  >
                    <Image source={{ uri: img }} className="w-full h-full opacity-90" resizeMode="cover" />
                  </TouchableOpacity>
                ))}

              <TouchableOpacity
                onPress={() => router.push({ pathname: '/editor', params: { id: dream.id } })}
                className="w-[48%] aspect-square rounded-xl border-2 border-dashed border-white/10 bg-white/5 flex-col items-center justify-center gap-2 active:bg-white/10"
              >
                <View className="w-10 h-10 rounded-full bg-white/10 items-center justify-center">
                  <MaterialIcons name="add" size={20} color="#9da1b9" />
                </View>
                <Text 
                  className="text-xs font-bold text-text-secondary uppercase -mt-[2px]"
                  style={{ includeFontPadding: false, textAlignVertical: 'center' }}
                >
                  Upload
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Modal */}
      <Modal visible={modalVisible} transparent={true} animationType="fade">
        <View className="flex-1 bg-black/95 relative justify-center items-center">
          <TouchableOpacity
            onPress={() => setModalVisible(false)}
            className="absolute top-12 right-6 z-50 p-2 bg-white/10 rounded-full"
          >
            <MaterialIcons name="close" size={24} color="white" />
          </TouchableOpacity>
          {selectedImage && (
            <Image source={{ uri: selectedImage }} className="w-full h-3/4" resizeMode="contain" />
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}