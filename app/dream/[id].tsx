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
  ActivityIndicator, 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { useDreams, Dream } from '../../components/DreamContext';
import { useTheme } from '../../components/ThemeContext'; 
import DreamShareModal from '../../components/DreamShareModal';
// Import DreamStyle type
import { interpretDream, DreamStyle } from '../../utils/aiService'; 

export default function DreamDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { dreams, deleteDream, updateDream } = useDreams(); 
  const { colors } = useTheme(); 
  const { t } = useTranslation(); 

  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [dream, setDream] = useState<Dream | undefined>(undefined);

  // AI State
  const [isInterpreting, setIsInterpreting] = useState(false);
  const [interpretationStyle, setInterpretationStyle] = useState<DreamStyle>('psychologist');

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
    Alert.alert(t('delete_title'), t('delete_msg'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('delete'),
        style: 'destructive',
        onPress: () => {
          deleteDream(id as string);
          router.back();
        },
      },
    ]);
  };

  // --- AI Interpretation Handler ---
  const handleInterpret = async () => {
    if (!dream) return;
    setIsInterpreting(true);
    try {
      // Call AI Service with the SELECTED STYLE
      const result = await interpretDream(dream.title, dream.body, dream.tags, interpretationStyle);
      
      // Save result
      const updatedDream = { ...dream, interpretation: result };
      updateDream(updatedDream);
      setDream(updatedDream); 
      
    } catch (e) {
      Alert.alert("Error", "Failed to interpret dream. Please check your connection.");
    } finally {
      setIsInterpreting(false);
    }
  };
  // --------------------------------------

  if (!dream) {
    return (
      <SafeAreaView 
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: colors.background }}
      >
        <Text style={{ color: colors.textSecondary }}>{t('not_found')}</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4">
          <Text style={{ color: colors.primary }} className="font-bold">{t('go_back')}</Text>
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
          style={{ backgroundColor: 'transparent' }} 
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.textSecondary} />
        </TouchableOpacity>

        <View className="flex-row gap-2">
          {/* SHARE BUTTON */}
          <TouchableOpacity
            onPress={() => setShareModalVisible(true)}
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: colors.input }}
          >
            <MaterialIcons name="share" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          {/* Edit Button */}
          <TouchableOpacity
            onPress={() => router.push({ pathname: '/editor', params: { id: dream.id } })}
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: colors.input }} 
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
          <View className="flex-col gap-1">
            
             {/* Date Section */}
            <View className="flex-row flex-wrap items-center gap-y-2">
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
                  className="flex-row items-center justify-center px-3 h-7 rounded-full shadow-lg"
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
                    {t('filter_lucid')}
                  </Text>
                </View>
              )}

              {dream.isNightmare && (
                <View 
                  className="flex-row items-center justify-center px-3 h-7 rounded-full border"
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
                    {t('filter_nightmare')}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View className="h-px w-full" style={{ backgroundColor: colors.border }} />

          <Text 
            className="text-lg leading-relaxed font-normal"
            style={{ color: colors.text }} 
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

          {/* --- ANALYSIS SECTION --- */}
          <View 
            className="mt-6 pt-6 border-t"
            style={{ borderColor: colors.border }}
          >
            <View className="flex-row items-center gap-2 mb-4">
              <MaterialIcons name="psychology" size={20} color={colors.primary} />
              <Text 
                className="text-xl font-bold -mt-[1px]"
                style={{ color: colors.text }}
              >
                Analysis
              </Text>
            </View>

            {/* 1. Style Selector (Visible to allow changing persona) */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2 mb-4">
              {(['psychologist', 'freud', 'mystic', 'bestie'] as DreamStyle[]).map((style) => (
                <TouchableOpacity
                  key={style}
                  onPress={() => setInterpretationStyle(style)}
                  className={`px-3 py-2 rounded-lg border`}
                  style={{ 
                    borderColor: interpretationStyle === style ? colors.primary : colors.border,
                    backgroundColor: interpretationStyle === style ? colors.primary + '20' : colors.card 
                  }}
                >
                  <Text style={{ 
                    color: interpretationStyle === style ? colors.primary : colors.textSecondary,
                    fontWeight: interpretationStyle === style ? 'bold' : 'normal',
                    fontSize: 12,
                    textTransform: 'capitalize'
                  }}>
                    {t(`style_${style}`) || style}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* 2. Analyze/Re-analyze Button */}
            <TouchableOpacity 
              onPress={handleInterpret}
              disabled={isInterpreting}
              className={`w-full py-3 rounded-xl border border-dashed flex-row items-center justify-center gap-2 mb-4`}
              style={{ 
                borderColor: colors.primary, 
                backgroundColor: dream.interpretation ? 'transparent' : colors.primary + '05' 
              }}
            >
               {isInterpreting ? (
                 <ActivityIndicator size="small" color={colors.primary} />
               ) : (
                 <>
                   <MaterialCommunityIcons name="brain" size={20} color={colors.primary} />
                   <Text style={{ color: colors.primary, fontWeight: '600' }}>
                     {dream.interpretation ? "Re-analyze Dream" : "Analyze Dream"}
                   </Text>
                 </>
               )}
            </TouchableOpacity>

            {/* 3. Result */}
            {dream.interpretation ? (
               <View 
                 className="p-4 rounded-xl border"
                 style={{ 
                   backgroundColor: colors.card,
                   borderColor: colors.border 
                 }}
               >
                 <Text style={{ color: colors.text, lineHeight: 24 }} className="italic">
                   {dream.interpretation}
                 </Text>
               </View>
            ) : (
              <Text style={{ color: colors.textSecondary }} className="italic text-sm text-center">
                 Select a persona and tap analyze to reveal the hidden meaning.
              </Text>
            )}
          </View>
          {/* ----------------------------- */}

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
                {t('dream_visuals')}
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
                  backgroundColor: colors.input + '40' 
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
                  {t('upload')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* RENDER THE SHARE MODAL */}
      <DreamShareModal 
        visible={shareModalVisible} 
        onClose={() => setShareModalVisible(false)} 
        dream={dream || null} 
      />

      {/* Modal for Viewing Images */}
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