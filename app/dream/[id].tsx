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
  StatusBarStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useDreams, Dream } from '../../components/DreamContext';
import { useTheme } from '../../components/ThemeContext'; // <--- Import Theme Hook

export default function DreamDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { dreams, deleteDream } = useDreams();
  const { colors } = useTheme(); // <--- Get Colors

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
      <SafeAreaView 
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: colors.background }}
      >
        <Text style={{ color: colors.textSecondary }}>Dream not found...</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4">
          <Text style={{ color: colors.primary }} className="font-bold">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <StatusBar 
        barStyle={colors.statusBarStyle as StatusBarStyle} 
        backgroundColor={colors.card}
      />

      {/* Top Navigation */}
      <View 
        className="flex-row items-center justify-between px-4 py-3 border-b"
        style={{ 
          backgroundColor: colors.card, 
          borderColor: colors.border 
        }}
      >
        <TouchableOpacity 
          onPress={() => router.back()} 
          className="w-10 h-10 -ml-2 items-center justify-center rounded-full"
          // Using a subtle background for the button hit area
          style={{ backgroundColor: 'transparent' }} 
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.textSecondary} />
        </TouchableOpacity>

        <View className="flex-row gap-2">
          {/* Edit Button */}
          <TouchableOpacity
            onPress={() => router.push({ pathname: '/editor', params: { id: dream.id } })}
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: colors.input }} // Using input color for button bg
          >
            <MaterialIcons name="edit" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          {/* Delete Button */}
          <TouchableOpacity
            onPress={handleDelete}
            className="w-10 h-10 rounded-full bg-red-500/10 items-center justify-center"
          >
            <MaterialIcons name="delete" size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1">
        <View className="px-6 py-8 flex-col gap-6">
          <View className="flex-col gap-4">
            
             {/* Date Section */}
            <View className="flex-row flex-wrap items-center gap-x-4 gap-y-2">
               <View className="flex-row items-center gap-1.5">
                  <MaterialIcons name="calendar-today" size={14} color={colors.textSecondary} />
                  <Text 
                    className="text-sm font-medium -mt-[1px]"
                    style={{ color: colors.textSecondary }}
                  >
                    {dream.date}
                  </Text>
               </View>
            </View>

            <Text 
              className="text-3xl font-black leading-tight tracking-tight"
              style={{ color: colors.text }}
            >
              {dream.title}
            </Text>

            {/* Badges */}
            <View className="flex-row gap-3">
              {dream.isLucid && (
                <View 
                  className="flex-row items-center justify-center gap-2 px-3 h-7 rounded-full shadow-lg"
                  style={{ 
                    backgroundColor: colors.primary, 
                    shadowColor: colors.primary, 
                    shadowOpacity: 0.4,
                    shadowRadius: 4,
                    shadowOffset: { width: 0, height: 2 }
                  }}
                >
                  <MaterialIcons name="auto-awesome" size={16} color="#ffffff" />
                  <Text
                    className="text-white text-xs font-bold uppercase tracking-wider -mt-[2px]"
                    style={{ includeFontPadding: false, textAlignVertical: 'center' }}
                  >
                    Lucid Dream
                  </Text>
                </View>
              )}

              {dream.isNightmare && (
                <View 
                  className="flex-row items-center justify-center gap-2 px-3 h-7 rounded-full border"
                  style={{ 
                    backgroundColor: colors.card, 
                    borderColor: colors.border 
                  }}
                >
                  <MaterialCommunityIcons name="spider-web" size={16} color={colors.textSecondary} />
                  <Text
                    className="text-xs font-bold uppercase tracking-wider -mt-[2px]"
                    style={{ 
                      color: colors.textSecondary,
                      includeFontPadding: false, 
                      textAlignVertical: 'center' 
                    }}
                  >
                    Nightmare
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View className="h-px w-full" style={{ backgroundColor: colors.border }} />

          <Text 
            className="text-lg leading-relaxed font-normal"
            style={{ color: colors.text }} // Main text color
          >
            {dream.body}
          </Text>

          {/* Tags */}
          <View className="flex-row flex-wrap gap-2 pt-2">
            {dream.tags.map((tag, i) => (
              <View
                key={`${dream.id}:${tag}:${i}`}
                className="border rounded-lg px-3 h-7 justify-center"
                style={{ 
                  backgroundColor: colors.card, 
                  borderColor: colors.border 
                }}
              >
                <Text
                  className="text-sm font-medium -mt-[2px]"
                  style={{ 
                    color: colors.textSecondary,
                    includeFontPadding: false, 
                    textAlignVertical: 'center' 
                  }}
                >
                  {tag}
                </Text>
              </View>
            ))}
          </View>

          {/* Gallery Section */}
          <View 
            className="mt-6 pt-6 border-t"
            style={{ borderColor: colors.border }}
          >
            <View className="flex-row items-center gap-2 mb-4">
              <MaterialIcons name="photo-library" size={20} color={colors.primary} />
              <Text 
                className="text-xl font-bold -mt-[1px]"
                style={{ color: colors.text }}
              >
                Dream Visuals
              </Text>
              <Text 
                className="text-sm -mt-[1px]"
                style={{ color: colors.textSecondary }}
              >
                ({dream.images?.length || 0})
              </Text>
            </View>

            <View className="flex-row flex-wrap gap-3">
              {dream.images &&
                dream.images.map((img, index) => (
                  <TouchableOpacity
                    key={`${dream.id}:img:${index}`}
                    onPress={() => openImage(img)}
                    className="w-[48%] aspect-square rounded-xl overflow-hidden border relative"
                    style={{ 
                      backgroundColor: colors.card,
                      borderColor: colors.border
                    }}
                  >
                    <Image source={{ uri: img }} className="w-full h-full opacity-90" resizeMode="cover" />
                  </TouchableOpacity>
                ))}

              <TouchableOpacity
                onPress={() => router.push({ pathname: '/editor', params: { id: dream.id } })}
                className="w-[48%] aspect-square rounded-xl border-2 border-dashed flex-col items-center justify-center gap-2"
                style={{ 
                  borderColor: colors.border,
                  backgroundColor: colors.input + '40' // 40 = 25% opacity
                }}
              >
                <View 
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={{ backgroundColor: colors.border }}
                >
                  <MaterialIcons name="add" size={20} color={colors.textSecondary} />
                </View>
                <Text 
                  className="text-xs font-bold uppercase -mt-[2px]"
                  style={{ 
                    color: colors.textSecondary,
                    includeFontPadding: false, 
                    textAlignVertical: 'center' 
                  }}
                >
                  Upload
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Modal - Kept dark intentionally for image viewing experience */}
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