import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  Switch,
  Share,
  Alert,
  ActivityIndicator
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useTheme } from './ThemeContext';
import { Dream } from './DreamContext';

interface Props {
  visible: boolean;
  onClose: () => void;
  dream: Dream | null;
}

export default function DreamShareModal({ visible, onClose, dream }: Props) {
  const { colors, mode } = useTheme();
  const { t } = useTranslation();
  const viewShotRef = useRef<ViewShot>(null);

  const [shareMode, setShareMode] = useState<'text' | 'image'>('text');
  const [includeTags, setIncludeTags] = useState(true);
  const [selectedBg, setSelectedBg] = useState<string | 'gradient'>('gradient');
  const [isSharing, setIsSharing] = useState(false);

  if (!dream) return null;

  // 1. Text Share Logic
  const handleTextShare = async () => {
    try {
      const tagsString = includeTags && dream.tags
        ? `\n\n${dream.tags.map(tag => `#${tag.replace(/\s/g, '')}`).join(' ')}`
        : '';

      const message = `🌙 ${dream.title}\n\n${dream.body}${tagsString}`;

      await Share.share({
        message: message,
      });
      onClose();
    } catch (error) {
      console.log(error);
    }
  };

  // 2. Image Share Logic
  const handleImageShare = async () => {
    if (viewShotRef.current && viewShotRef.current.capture) {
      setIsSharing(true);
      try {
        const uri = await viewShotRef.current.capture();
        if (!(await Sharing.isAvailableAsync())) {
          Alert.alert(t('alert_error'), t('alert_share_not_available'));
          setIsSharing(false);
          return;
        }
        await Sharing.shareAsync(uri);
        onClose();
      } catch (e) {
        console.error(e);
        Alert.alert(t('alert_error'), t('alert_img_gen_failed'));
      } finally {
        setIsSharing(false);
      }
    }
  };

  // The Card Component that gets captured
  const DreamCard = () => (
    <View
      className="w-full aspect-[4/5] rounded-xl overflow-hidden relative bg-black"
    >
      {/* Background Layer */}
      <View className="absolute inset-0 w-full h-full">
        {selectedBg === 'gradient' ? (
          <LinearGradient
            colors={[colors.primary, '#0f172a']}
            style={{ width: '100%', height: '100%' }}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        ) : (
          <Image
            source={{ uri: selectedBg }}
            className="w-full h-full opacity-60"
            resizeMode="cover"
          />
        )}
      </View>

      {/* Overlay Gradient for Readability */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={{ position: 'absolute', width: '100%', height: '100%' }}
      />

      {/* Content Layer */}
      <View className="flex-1 p-6 justify-between">
        <View>
          <View className="flex-row items-center gap-2 mb-2 opacity-80">
            <MaterialIcons name="calendar-today" size={12} color="white" />
            <Text className="text-white text-xs font-medium">{dream.date}</Text>
          </View>
          <Text className="text-white text-2xl font-bold leading-tight mb-4">
            {dream.title}
          </Text>
          <Text
            className="text-white/90 text-base leading-relaxed"
            numberOfLines={10}
          >
            {dream.body}
          </Text>
        </View>

        <View>
          {includeTags && dream.tags && (
            <View className="flex-row flex-wrap gap-2 mb-4">
              {dream.tags.map((tag, i) => (
                <Text key={i} className="text-white/80 text-xs font-bold bg-white/10 px-2 py-1 rounded overflow-hidden">
                  #{tag.replace(/\s/g, '')}
                </Text>
              ))}
            </View>
          )}
          <View className="flex-row items-center gap-2 opacity-60 border-t border-white/20 pt-3">
            <MaterialCommunityIcons name="moon-waning-crescent" size={16} color="white" />
            <Text className="text-white text-xs">{t('app_name')}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/60">
        <View
          className="rounded-t-3xl p-6 h-[85%]"
          style={{ backgroundColor: colors.background }}
        >
          {/* Header */}
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-xl font-bold" style={{ color: colors.text }}>{t('share_dream')}</Text>
            <TouchableOpacity onPress={onClose} className="p-2 bg-gray-500/10 rounded-full">
              <MaterialIcons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>

            {/* Mode Switcher (Updated to match Settings Style) */}
            <View
              className="flex-row p-1 rounded-xl mb-6 border"
              style={{ backgroundColor: colors.card, borderColor: colors.border }}
            >
              <TouchableOpacity
                onPress={() => setShareMode('text')}
                className="flex-1 py-2 items-center rounded-lg"
                style={{
                  backgroundColor: shareMode === 'text' ? colors.primary + '20' : 'transparent',
                }}
              >
                <Text style={{
                  color: shareMode === 'text' ? colors.primary : colors.textSecondary,
                  fontWeight: shareMode === 'text' ? 'bold' : 'normal'
                }}>
                  {t('share_mode_text')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShareMode('image')}
                className="flex-1 py-2 items-center rounded-lg"
                style={{
                  backgroundColor: shareMode === 'image' ? colors.primary + '20' : 'transparent',
                }}
              >
                <Text style={{
                  color: shareMode === 'image' ? colors.primary : colors.textSecondary,
                  fontWeight: shareMode === 'image' ? 'bold' : 'normal'
                }}>
                  {t('share_mode_image')}
                </Text>
              </TouchableOpacity>
            </View>

            {/* PREVIEW AREA */}
            <View className="mb-6 items-center">
              {shareMode === 'text' ? (
                <View className="w-full p-4 rounded-xl border border-dashed" style={{ borderColor: colors.border }}>
                  <Text style={{ color: colors.text, fontSize: 16, fontWeight: 'bold' }}>{dream.title}</Text>
                  <Text style={{ color: colors.textSecondary, marginTop: 8 }} numberOfLines={4}>{dream.body}</Text>

                  {/* Updated Text Tags to be Subtle (Not Blue) */}
                  {includeTags && dream.tags && (
                    <Text style={{ color: colors.textSecondary, marginTop: 12, fontWeight: '600', opacity: 0.7 }}>
                      {dream.tags.map(t => `#${t}`).join(' ')}
                    </Text>
                  )}
                </View>
              ) : (
                <ViewShot ref={viewShotRef} options={{ format: 'jpg', quality: 0.9 }}>
                  <DreamCard />
                </ViewShot>
              )}
            </View>

            {/* OPTIONS */}
            <View className="gap-4 mb-8">
              {/* Tags Toggle */}
              <View className="flex-row justify-between items-center">
                <Text style={{ color: colors.text }}>{t('share_include_tags')}</Text>
                <Switch
                  value={includeTags}
                  onValueChange={setIncludeTags}
                  trackColor={{ false: colors.input, true: colors.primary }}
                />
              </View>

              {/* Background Carousel (Image Mode Only) */}
              {shareMode === 'image' && (
                <View>
                  <Text style={{ color: colors.textSecondary, fontSize: 12, marginBottom: 8, fontWeight: 'bold', textTransform: 'uppercase' }}>
                    {t('share_bg')}
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-3">
                    {/* Default Gradient Option */}
                    <TouchableOpacity
                      onPress={() => setSelectedBg('gradient')}
                      className={`w-16 h-16 rounded-lg overflow-hidden border-2 ${selectedBg === 'gradient' ? 'border-primary' : 'border-transparent'}`}
                      style={{ borderColor: selectedBg === 'gradient' ? colors.primary : 'transparent' }}
                    >
                      <LinearGradient colors={[colors.primary, '#0f172a']} style={{ flex: 1 }} />
                      {selectedBg === 'gradient' && (
                        <View className="absolute inset-0 bg-black/30 justify-center items-center">
                          <MaterialIcons name="check" color="white" size={20} />
                        </View>
                      )}
                    </TouchableOpacity>

                    {/* User Images */}
                    {dream.images && dream.images.map((uri, idx) => (
                      <TouchableOpacity
                        key={idx}
                        onPress={() => setSelectedBg(uri)}
                        className={`w-16 h-16 rounded-lg overflow-hidden border-2`}
                        style={{ borderColor: selectedBg === uri ? colors.primary : 'transparent' }}
                      >
                        <Image source={{ uri }} className="w-full h-full" resizeMode="cover" />
                        {selectedBg === uri && (
                          <View className="absolute inset-0 bg-black/30 justify-center items-center">
                            <MaterialIcons name="check" color="white" size={20} />
                          </View>
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          </ScrollView>

          {/* Action Button */}
          <TouchableOpacity
            onPress={shareMode === 'text' ? handleTextShare : handleImageShare}
            disabled={isSharing}
            className="w-full py-4 rounded-xl items-center justify-center shadow-lg flex-row gap-2"
            style={{ backgroundColor: colors.primary, shadowColor: colors.primary, shadowOpacity: 0.3 }}
          >
            {isSharing ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <MaterialIcons name="share" size={20} color="white" />
                <Text className="text-white font-bold text-lg">{isSharing ? t('share_preparing') : t('share_btn')}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}