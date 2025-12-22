import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  StatusBar,
  ListRenderItem,
  StatusBarStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next'; // <--- Import

import { useDreams, Dream } from '../components/DreamContext';
import { DREAM_QUOTES, getGreeting } from '../constants/quotes';
import { useTheme } from '../components/ThemeContext'; 

export default function DreamListScreen() {
  const router = useRouter();
  const { dreams, userProfile } = useDreams();
  const { colors } = useTheme(); 
  const { t } = useTranslation(); // <--- Init
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Greeting & Quote
  const greeting = getGreeting();
  const quote = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * DREAM_QUOTES.length);
    return DREAM_QUOTES[randomIndex];
  }, []);

  // Filter Logic
  const filteredDreams = dreams.filter((dream: Dream) => {
    const matchesSearch =
      dream.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dream.body.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeFilter === 'All') return matchesSearch;
    if (activeFilter === 'Lucid') return matchesSearch && dream.isLucid;
    if (activeFilter === 'Nightmare') return matchesSearch && dream.isNightmare;
    if (activeFilter === 'Images') return matchesSearch && dream.hasImages;

    return matchesSearch;
  });

  const renderDreamItem: ListRenderItem<Dream> = useCallback(({ item }) => (
    <TouchableOpacity
      onPress={() => router.push(`/dream/${item.id}`)}
      className="group flex-col rounded-xl border mb-6 overflow-hidden active:opacity-90"
      style={{ backgroundColor: colors.card, borderColor: colors.border }}
    >
      <View className="flex-row">
        <View className="flex-1 p-4 gap-3">
          <View className="flex-col">
            
            {/* Metadata Row */}
            <View className="flex-row items-center gap-2">
              {item.isLucid && (
                <View className="flex-row items-center justify-center mb-2 px-2.5 h-6 rounded-md bg-purple-500/10 border border-purple-500/20">
                  <MaterialIcons name="auto-awesome" size={12} color="#c084fc" />
                  <Text
                    className="text-purple-400 text-xs font-bold"
                    style={{ includeFontPadding: false, textAlignVertical: 'center', marginTop: -2 }}
                  >
                    {t('filter_lucid')}
                  </Text>
                </View>
              )}

              {item.isNightmare && (
                <View className="flex-row items-center justify-center mb-2 px-2.5 h-6 rounded-md bg-red-500/10 border border-red-500/20">
                  <MaterialCommunityIcons name="spider-web" size={14} color="#f87171" />
                  <Text
                    className="text-red-400 text-xs font-bold"
                    style={{ includeFontPadding: false, textAlignVertical: 'center', marginTop: -2 }}
                  >
                    {t('filter_nightmare')}
                  </Text>
                </View>
              )}

              {(item.isLucid || item.isNightmare) && (
                <Text className="text-xs mb-2" style={{ color: colors.textSecondary, opacity: 0.3 }}>•</Text>
              )}

              <Text 
                className="text-xs font-medium mb-2" 
                style={{ color: colors.textSecondary, marginTop: -1 }}
              >
                {item.date}
              </Text>
            </View>

            {/* Title & Body */}
            <Text 
              className="text-lg font-semibold leading-tight"
              style={{ color: colors.text }}
            >
              {item.title}
            </Text>
            <Text 
              className="text-sm leading-relaxed" 
              numberOfLines={3}
              style={{ color: colors.textSecondary }}
            >
              {item.body}
            </Text>
          </View>

          {/* Tags */}
          <View className="flex-row items-center justify-between mt-1">
            <View className="flex-row gap-2 flex-wrap">
              {item.tags.map((tag, index) => (
                <View
                  key={`${item.id}:${tag}:${index}`}
                  className="px-2 h-5 justify-center rounded overflow-hidden"
                  style={{ backgroundColor: colors.input }} 
                >
                  <Text
                    className="text-xs"
                    style={{ 
                      color: colors.textSecondary,
                      includeFontPadding: false, 
                      textAlignVertical: 'center', 
                      marginTop: -2 
                    }}
                  >
                    {tag}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Thumbnail */}
        {item.hasImages && item.thumbnail && (
          <View 
            className="w-24 h-full relative hidden sm:flex"
            style={{ backgroundColor: colors.input }}
          >
            <Image
              source={{ uri: item.thumbnail }}
              className="w-full h-full opacity-80"
              resizeMode="cover"
            />
            <View className="absolute bottom-2 right-2 bg-black/60 px-1.5 py-0.5 rounded flex-row items-center gap-1">
              <MaterialIcons name="photo-library" size={10} color="white" />
              <Text
                className="text-white text-[10px] font-bold"
                style={{ includeFontPadding: false, marginTop: -1 }}
              >
                {item.imageCount}
              </Text>
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  ), [colors, t]);

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <StatusBar barStyle={colors.statusBarStyle as StatusBarStyle} backgroundColor={colors.background} />

      <View className="flex-1 px-4 pt-4">
        <FlatList
          data={filteredDreams}
          keyExtractor={(item) => item.id}
          renderItem={renderDreamItem}
          contentContainerStyle={{ paddingBottom: 100 }}
          
          // Empty State Component
          ListEmptyComponent={
            <View className="items-center justify-center py-12 px-4 opacity-70">
              <View 
                className="w-20 h-20 rounded-full items-center justify-center mb-4"
                style={{ backgroundColor: colors.card }}
              >
                <MaterialCommunityIcons name="moon-waning-crescent" size={40} color={colors.primary} />
              </View>
              <Text 
                className="text-lg font-bold mb-2 text-center"
                style={{ color: colors.text }}
              >
                {searchQuery ? t('search_placeholder') : t('empty_title')}
              </Text>
              <Text 
                className="text-center text-sm mb-6 max-w-[250px]"
                style={{ color: colors.textSecondary }}
              >
                {searchQuery 
                  ? "" 
                  : t('empty_body')}
              </Text>
            </View>
          }

          ListHeaderComponent={
            <View className="flex-col gap-6 mb-6">
              {/* HEADER */}
              <View className="flex-row justify-between items-start pt-2">
                <View className="flex-1 mr-4">
                  <Text 
                    className="text-3xl font-bold tracking-tight leading-tight"
                    style={{ color: colors.text }}
                  >
                    {greeting}
                    {userProfile?.name ? `,\n${userProfile.name}` : ''}
                  </Text>
                  <Text className="text-base mt-2" style={{ color: colors.textSecondary }}>
                    <Text style={{ color: colors.primary }} className="font-semibold">
                      {dreams.length}
                    </Text> {t('dreams_recorded')}
                  </Text>
                </View>

                {/* BUTTON GROUP */}
                <View className="flex-row items-center gap-3 mt-1">
                  <TouchableOpacity
                    onPress={() => router.push('/stats')}
                    className="w-10 h-10 rounded-full border items-center justify-center"
                    style={{ backgroundColor: colors.card, borderColor: colors.border }}
                  >
                    <MaterialIcons name="bar-chart" size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => router.push('/gallery')}
                    className="w-10 h-10 rounded-full border items-center justify-center"
                    style={{ backgroundColor: colors.card, borderColor: colors.border }}
                  >
                    <MaterialIcons name="grid-view" size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => router.push('/settings')}
                    className="w-10 h-10 rounded-full border items-center justify-center"
                    style={{ backgroundColor: colors.card, borderColor: colors.border }}
                  >
                    <MaterialIcons name="settings" size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* QUOTE CARD */}
              <View 
                className="border p-4 rounded-xl"
                style={{ backgroundColor: colors.primary + '10', borderColor: colors.primary + '20' }}
              >
                <View className="flex-row gap-2 mb-1">
                  <MaterialCommunityIcons name="format-quote-open" size={16} color={colors.primary} />
                  <Text style={{ color: colors.primary }} className="text-xs font-bold uppercase tracking-widest">
                    {t('daily_wisdom')}
                  </Text>
                </View>
                <Text 
                  className="text-sm italic leading-relaxed pl-2"
                  style={{ color: colors.text, opacity: 0.8 }}
                >
                  "{quote}"
                </Text>
              </View>

              {/* Search Bar */}
              <View className="relative w-full">
                <View className="absolute inset-y-0 left-0 flex-row items-center pl-4 z-10 h-full justify-center">
                  <MaterialIcons name="search" size={24} color={colors.textSecondary} />
                </View>
                <TextInput
                  className="w-full h-12 pl-12 pr-4 rounded-xl text-base"
                  style={{ backgroundColor: colors.input, color: colors.text }}
                  placeholder={t('search_placeholder')}
                  placeholderTextColor={colors.textSecondary}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>

              {/* Filters */}
              {/* Filter Section Title */}
              <View>
                <Text 
                  className="text-xs font-bold uppercase tracking-wider mb-2 ml-1"
                  style={{ color: colors.textSecondary }}
                >
                  {t('filters')}
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row pb-2">
                  <FilterChip
                    label={t('filter_all')}
                    icon="view-list"
                    isActive={activeFilter === 'All'}
                    onPress={() => setActiveFilter('All')}
                    colors={colors}
                  />
                  <FilterChip
                    label={t('filter_lucid')}
                    icon="auto-awesome"
                    isActive={activeFilter === 'Lucid'}
                    onPress={() => setActiveFilter('Lucid')}
                    colors={colors}
                  />
                  <FilterChip
                    label={t('filter_nightmare')}
                    icon="spider-web"
                    isActive={activeFilter === 'Nightmare'}
                    onPress={() => setActiveFilter('Nightmare')}
                    isCommunityIcon={true}
                    colors={colors}
                  />
                  <FilterChip
                    label={t('filter_images')}
                    icon="image"
                    isActive={activeFilter === 'Images'}
                    onPress={() => setActiveFilter('Images')}
                    colors={colors}
                  />
                </ScrollView>
              </View>
            </View>
          }
        />
      </View>

      <TouchableOpacity
        onPress={() => router.push('/editor')}
        className="absolute bottom-8 right-8 w-14 h-14 rounded-full items-center justify-center shadow-lg"
        style={{ backgroundColor: colors.primary, shadowColor: colors.primary, shadowOpacity: 0.5 }}
      >
        <MaterialIcons name="add" size={32} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const FilterChip = ({ label, icon, isActive, onPress, isCommunityIcon, colors }: any) => (
  <TouchableOpacity
    onPress={onPress}
    className={`flex-row items-center justify-center px-4 h-9 rounded-full mr-3 border`}
    style={{ 
      backgroundColor: isActive ? colors.primary : colors.input,
      borderColor: isActive ? colors.primary : colors.input
    }}
  >
    {isCommunityIcon ? (
      <MaterialCommunityIcons
        name={icon}
        size={18}
        color={isActive ? 'white' : colors.textSecondary}
        style={{ marginRight: 6 }}
      />
    ) : (
      <MaterialIcons
        name={icon}
        size={18}
        color={isActive ? 'white' : colors.textSecondary}
        style={{ marginRight: 6 }}
      />
    )}
    <Text
      className={`text-sm font-medium`}
      style={{ 
        color: isActive ? 'white' : colors.textSecondary,
        includeFontPadding: false, 
        textAlignVertical: 'center',
        marginTop: -2 
      }}
    >
      {label}
    </Text>
  </TouchableOpacity>
);