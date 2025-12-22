import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, Image, FlatList, StatusBar, Modal, Dimensions, StatusBarStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useDreams } from '../components/DreamContext';
import { useTheme } from '../components/ThemeContext'; // <--- Import Theme Hook

// Get screen width for grid calculation
const { width } = Dimensions.get('window');
const COLUMN_COUNT = 3;
const IMAGE_SIZE = width / COLUMN_COUNT;

export default function GalleryScreen() {
  const router = useRouter();
  const { dreams } = useDreams();
  const { colors } = useTheme(); // <--- Get Colors
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<any>(null);

  // Flatten all images from all dreams into one list
  const allImages = useMemo(() => {
    return dreams.flatMap((dream) => {
      if (!dream.images || dream.images.length === 0) return [];
      return dream.images.map((uri, index) => ({
        id: `${dream.id}_${index}`,
        uri: uri,
        dreamId: dream.id,
      }));
    });
  }, [dreams]);

  const openImage = (img: any) => {
    setSelectedImage(img);
    setModalVisible(true);
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      onPress={() => openImage(item)}
      activeOpacity={0.8}
      style={{ 
        width: IMAGE_SIZE, 
        height: IMAGE_SIZE, 
        borderColor: colors.background // Dynamic grid border
      }}
      className="border p-0.5"
    >
      <Image 
        source={{ uri: item.uri }} 
        className="w-full h-full"
        style={{ backgroundColor: colors.card }} // Placeholder color
        resizeMode="cover"
      />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <StatusBar 
        barStyle={colors.statusBarStyle as StatusBarStyle} 
        backgroundColor={colors.background}
      />

      {/* Header */}
      <View 
        className="flex-row items-center justify-between px-4 py-3 border-b"
        style={{ 
          backgroundColor: colors.background, 
          borderColor: colors.border 
        }}
      >
        <TouchableOpacity onPress={() => router.back()} className="flex-row items-center">
          <MaterialIcons name="arrow-back" size={24} color={colors.textSecondary} />
          <Text 
            className="ml-1 font-medium"
            style={{ color: colors.textSecondary }}
          >
            Back
          </Text>
        </TouchableOpacity>
        <Text 
          className="font-bold text-lg"
          style={{ color: colors.text }}
        >
          Dream Gallery
        </Text>
        <View className="w-16" />
      </View>

      {/* Grid */}
      {allImages.length === 0 ? (
        <View className="flex-1 items-center justify-center p-8 opacity-50">
          <MaterialIcons name="collections" size={48} color={colors.textSecondary} />
          <Text 
            className="text-base mt-4 text-center"
            style={{ color: colors.textSecondary }}
          >
            No images yet.{'\n'}Add images to your dreams to see them here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={allImages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          numColumns={COLUMN_COUNT}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Full Screen Viewer Modal */}
      {/* Kept Dark (bg-black/95) intentionally for better image viewing experience */}
      <Modal visible={modalVisible} transparent={true} animationType="fade">
        <View className="flex-1 bg-black/95 relative justify-center items-center">
          
          <TouchableOpacity 
            onPress={() => setModalVisible(false)}
            className="absolute top-12 left-6 z-50 p-2 bg-white/10 rounded-full"
          >
            <MaterialIcons name="close" size={24} color="white" />
          </TouchableOpacity>

          {selectedImage && (
            <TouchableOpacity 
              onPress={() => {
                setModalVisible(false);
                router.push(`/dream/${selectedImage.dreamId}`);
              }}
              className="absolute top-12 right-6 z-50 px-4 py-2 rounded-full flex-row items-center gap-2"
              style={{ backgroundColor: colors.primary }}
            >
              <Text className="text-white font-bold text-xs uppercase">View Dream</Text>
              <MaterialIcons name="arrow-forward" size={16} color="white" />
            </TouchableOpacity>
          )}

          {selectedImage && (
            <Image 
              source={{ uri: selectedImage.uri }} 
              className="w-full h-3/4" 
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>

    </SafeAreaView>
  );
}