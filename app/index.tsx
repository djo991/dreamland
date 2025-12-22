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
  Modal, 
  Alert, 
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import DateTimePicker from '@react-native-community/datetimepicker';

import { useDreams, Dream } from '../components/DreamContext';
import { DREAM_QUOTES, getGreeting } from '../constants/quotes';
import { useTheme } from '../components/ThemeContext'; 
import { NotificationService } from '../services/notificationService';

const GENDER_OPTIONS = ['Male', 'Female', 'Non-binary', 'Prefer not to say', 'Other'];

export default function DreamListScreen() {
  const router = useRouter();
  const { dreams, userProfile, updateUserProfile } = useDreams(); 
  const { colors } = useTheme(); 
  const { t } = useTranslation(); 
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // --- ONBOARDING STATE ---
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAge, setNewAge] = useState('');
  const [newGender, setNewGender] = useState('');
  const [wakeTime, setWakeTime] = useState(new Date(new Date().setHours(8, 0, 0, 0))); 
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isGenderPickerVisible, setGenderPickerVisible] = useState(false);

  React.useEffect(() => {
    if (!userProfile?.name) {
      setShowOnboarding(true);
    } else {
      setShowOnboarding(false);
    }
  }, [userProfile]);

  const handleFinishOnboarding = async () => {
    if (!newName.trim()) {
      Alert.alert("Required", "Please enter your name to continue.");
      return;
    }
    
    updateUserProfile({ name: newName, age: newAge, gender: newGender });
    
    // Auto-schedule notification if permission granted
    const granted = await NotificationService.requestPermissions();
    if (granted) {
      await NotificationService.scheduleDailyReminder(wakeTime);
    }
  };

  const onTimeChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    if (selectedDate) {
      setWakeTime(selectedDate);
    }
  };
  // ------------------------

  const greeting = getGreeting();
  const quote = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * DREAM_QUOTES.length);
    return DREAM_QUOTES[randomIndex];
  }, []);

  const allTags = useMemo(() => {
    const tags = dreams.flatMap(dream => dream.tags || []);
    return Array.from(new Set(tags)).sort();
  }, [dreams]);

  const filteredDreams = dreams.filter((dream: Dream) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      dream.title.toLowerCase().includes(query) ||
      dream.body.toLowerCase().includes(query) ||
      (dream.tags && dream.tags.some(tag => tag.toLowerCase().includes(query)));

    if (activeFilter === 'All') return matchesSearch;
    if (activeFilter === 'Lucid') return matchesSearch && dream.isLucid;
    if (activeFilter === 'Nightmare') return matchesSearch && dream.isNightmare;
    if (activeFilter === 'Images') return matchesSearch && dream.hasImages;

    if (allTags.includes(activeFilter)) {
      return matchesSearch && dream.tags && dream.tags.includes(activeFilter);
    }

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
            <View className="flex-row items-center gap-2">
              {item.isLucid && (
                <View className="flex-row items-center justify-center mb-2 px-2.5 h-6 rounded-md bg-purple-500/10 border border-purple-500/20">
                  <MaterialIcons name="auto-awesome" size={12} color="#c084fc" />
                  <Text className="text-purple-400 text-xs font-bold" style={{ includeFontPadding: false, textAlignVertical: 'center', marginTop: -2 }}>
                    {t('filter_lucid')}
                  </Text>
                </View>
              )}
              {item.isNightmare && (
                <View className="flex-row items-center justify-center mb-2 px-2.5 h-6 rounded-md bg-red-500/10 border border-red-500/20">
                  <MaterialCommunityIcons name="spider-web" size={14} color="#f87171" />
                  <Text className="text-red-400 text-xs font-bold" style={{ includeFontPadding: false, textAlignVertical: 'center', marginTop: -2 }}>
                    {t('filter_nightmare')}
                  </Text>
                </View>
              )}
              {(item.isLucid || item.isNightmare) && (
                <Text className="text-xs mb-2" style={{ color: colors.textSecondary, opacity: 0.3 }}>•</Text>
              )}
              <Text className="text-xs font-medium mb-2" style={{ color: colors.textSecondary, marginTop: -1 }}>
                {item.date}
              </Text>
            </View>
            <Text className="text-lg font-semibold leading-tight" style={{ color: colors.text }}>{item.title}</Text>
            <Text className="text-sm leading-relaxed" numberOfLines={3} style={{ color: colors.textSecondary }}>{item.body}</Text>
          </View>
          <View className="flex-row items-center justify-between mt-1">
            <View className="flex-row gap-2 flex-wrap">
              {item.tags.map((tag, index) => (
                <View key={`${item.id}:${tag}:${index}`} className="px-2 h-5 justify-center rounded overflow-hidden" style={{ backgroundColor: colors.input }}>
                  <Text className="text-xs" style={{ color: colors.textSecondary, includeFontPadding: false, textAlignVertical: 'center', marginTop: -2 }}>
                    {tag}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
        {item.hasImages && item.thumbnail && (
          <View className="w-24 h-full relative hidden sm:flex" style={{ backgroundColor: colors.input }}>
            <Image source={{ uri: item.thumbnail }} className="w-full h-full opacity-80" resizeMode="cover" />
            <View className="absolute bottom-2 right-2 bg-black/60 px-1.5 py-0.5 rounded flex-row items-center gap-1">
              <MaterialIcons name="photo-library" size={10} color="white" />
              <Text className="text-white text-[10px] font-bold" style={{ includeFontPadding: false, marginTop: -1 }}>{item.imageCount}</Text>
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  ), [colors, t]);

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <StatusBar barStyle={colors.statusBarStyle as StatusBarStyle} backgroundColor={colors.background} />

      {/* --- ONBOARDING MODAL --- */}
      <Modal visible={showOnboarding} transparent={false} animationType="fade">
        <SafeAreaView className="flex-1 items-center justify-center p-6" style={{ backgroundColor: colors.background }}>
          <View className="w-full max-w-sm">
            <View className="items-center mb-8">
              <View className="w-20 h-20 rounded-full bg-primary/20 items-center justify-center mb-4">
                <MaterialCommunityIcons name="moon-waning-crescent" size={48} color={colors.primary} />
              </View>
              <Text className="text-3xl font-bold text-center mb-2" style={{ color: colors.text }}>
                {t('onboarding_title')}
              </Text>
              <Text className="text-center" style={{ color: colors.textSecondary }}>
                {t('onboarding_sub')}
              </Text>
            </View>

            <View className="gap-4 w-full">
              {/* Name */}
              <View>
                <Text style={{ color: colors.textSecondary }} className="text-xs mb-1 ml-1">{t('label_name')} *</Text>
                <TextInput 
                  className="px-4 py-3 rounded-xl border"
                  style={{ backgroundColor: colors.input, color: colors.text, borderColor: colors.border }}
                  placeholder={t('placeholder_name')}
                  placeholderTextColor={colors.textSecondary}
                  value={newName}
                  onChangeText={setNewName}
                />
              </View>

              {/* Age & Gender */}
              <View className="flex-row gap-4">
                <View className="flex-1">
                  <Text style={{ color: colors.textSecondary }} className="text-xs mb-1 ml-1">{t('label_age')}</Text>
                  <TextInput 
                    className="px-4 py-3 rounded-xl border"
                    style={{ backgroundColor: colors.input, color: colors.text, borderColor: colors.border }}
                    placeholder={t('placeholder_age')}
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="number-pad"
                    value={newAge}
                    onChangeText={setNewAge}
                  />
                </View>
                <View className="flex-1">
                  <Text style={{ color: colors.textSecondary }} className="text-xs mb-1 ml-1">{t('label_gender')}</Text>
                  <TouchableOpacity
                    onPress={() => setGenderPickerVisible(true)}
                    className="px-4 py-3 rounded-xl border flex-row justify-between items-center"
                    style={{ backgroundColor: colors.input, borderColor: colors.border }}
                  >
                    <Text style={{ color: newGender ? colors.text : colors.textSecondary }}>
                      {newGender || t('gender_select')}
                    </Text>
                    <MaterialIcons name="arrow-drop-down" size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Wake Up Time */}
              <View>
                <Text style={{ color: colors.textSecondary }} className="text-xs mb-1 ml-1">{t('label_waketime')}</Text>
                <TouchableOpacity
                  onPress={() => setShowTimePicker(true)}
                  className="px-4 py-3 rounded-xl border flex-row justify-between items-center"
                  style={{ backgroundColor: colors.input, borderColor: colors.border }}
                >
                  <Text style={{ color: colors.text }}>
                    {wakeTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                  <MaterialIcons name="access-time" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                
                {showTimePicker && (
                  <DateTimePicker
                    value={wakeTime}
                    mode="time"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onTimeChange}
                    textColor={colors.text}
                  />
                )}
              </View>

              <TouchableOpacity 
                onPress={handleFinishOnboarding}
                className="w-full py-4 rounded-xl mt-4 items-center justify-center shadow-lg"
                style={{ backgroundColor: colors.primary, shadowColor: colors.primary, shadowOpacity: 0.3 }}
              >
                <Text className="text-white font-bold text-lg">{t('btn_start')}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Modal visible={isGenderPickerVisible} transparent={true} animationType="fade" onRequestClose={() => setGenderPickerVisible(false)}>
            <TouchableOpacity activeOpacity={1} onPress={() => setGenderPickerVisible(false)} className="flex-1 bg-black/60 justify-center items-center px-6">
              <View className="w-full rounded-xl p-2 border" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
                <Text style={{ color: colors.textSecondary }} className="text-xs font-bold uppercase tracking-wider p-4">{t('label_gender')}</Text>
                {GENDER_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option}
                    onPress={() => { setNewGender(option); setGenderPickerVisible(false); }}
                    className="p-4 border-t"
                    style={{ borderColor: colors.border }}
                  >
                    <Text style={{ color: newGender === option ? colors.primary : colors.text, fontWeight: newGender === option ? 'bold' : 'normal' }}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity onPress={() => setGenderPickerVisible(false)} className="p-4 mt-2 items-center">
                  <Text style={{ color: colors.textSecondary }}>{t('cancel')}</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Modal>
        </SafeAreaView>
      </Modal>

      <View className="flex-1 px-4 pt-4">
        <FlatList
          data={filteredDreams}
          keyExtractor={(item) => item.id}
          renderItem={renderDreamItem}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={
            <View className="items-center justify-center py-12 px-4 opacity-70">
              <View className="w-20 h-20 rounded-full items-center justify-center mb-4" style={{ backgroundColor: colors.card }}>
                <MaterialCommunityIcons name="moon-waning-crescent" size={40} color={colors.primary} />
              </View>
              <Text className="text-lg font-bold mb-2 text-center" style={{ color: colors.text }}>
                {searchQuery ? t('search_placeholder') : t('empty_title')}
              </Text>
              <Text className="text-center text-sm mb-6 max-w-[250px]" style={{ color: colors.textSecondary }}>
                {searchQuery ? "" : t('empty_body')}
              </Text>
            </View>
          }
          ListHeaderComponent={
            <View className="flex-col gap-6 mb-6">
              <View className="flex-row justify-between items-start pt-2">
                <View className="flex-1 mr-4">
                  <Text className="text-3xl font-bold tracking-tight leading-tight" style={{ color: colors.text }}>
                    {greeting}
                    {userProfile?.name ? `,\n${userProfile.name}` : ''}
                  </Text>
                  <Text className="text-base mt-2" style={{ color: colors.textSecondary }}>
                    <Text style={{ color: colors.primary }} className="font-semibold">{dreams.length}</Text> {t('dreams_recorded')}
                  </Text>
                </View>
                <View className="flex-row items-center gap-3 mt-1">
                  <TouchableOpacity onPress={() => router.push('/stats')} className="w-10 h-10 rounded-full border items-center justify-center" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
                    <MaterialIcons name="bar-chart" size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => router.push('/gallery')} className="w-10 h-10 rounded-full border items-center justify-center" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
                    <MaterialIcons name="grid-view" size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => router.push('/settings')} className="w-10 h-10 rounded-full border items-center justify-center" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
                    <MaterialIcons name="settings" size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              </View>
              <View className="border p-4 rounded-xl" style={{ backgroundColor: colors.primary + '10', borderColor: colors.primary + '20' }}>
                <View className="flex-row gap-2 mb-1">
                  <MaterialCommunityIcons name="format-quote-open" size={16} color={colors.primary} />
                  <Text style={{ color: colors.primary }} className="text-xs font-bold uppercase tracking-widest">{t('daily_wisdom')}</Text>
                </View>
                <Text className="text-sm italic leading-relaxed pl-2" style={{ color: colors.text, opacity: 0.8 }}>"{quote}"</Text>
              </View>
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
              <View>
                <Text className="text-xs font-bold uppercase tracking-wider mb-2 ml-1" style={{ color: colors.textSecondary }}>{t('filters')}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row pb-2">
                  <FilterChip label={t('filter_all')} icon="view-list" isActive={activeFilter === 'All'} onPress={() => setActiveFilter('All')} colors={colors} />
                  <FilterChip label={t('filter_lucid')} icon="auto-awesome" isActive={activeFilter === 'Lucid'} onPress={() => setActiveFilter('Lucid')} colors={colors} />
                  <FilterChip label={t('filter_nightmare')} icon="spider-web" isActive={activeFilter === 'Nightmare'} onPress={() => setActiveFilter('Nightmare')} isCommunityIcon={true} colors={colors} />
                  <FilterChip label={t('filter_images')} icon="image" isActive={activeFilter === 'Images'} onPress={() => setActiveFilter('Images')} colors={colors} />
                </ScrollView>
              </View>
              
              {/* TAGS SECTION */}
              {allTags.length > 0 && (
                <View className="mt-2">
                  <Text className="text-xs font-bold uppercase tracking-wider mb-2 ml-1" style={{ color: colors.textSecondary }}>{t('tags')}</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row pb-2">
                    {allTags.map((tag) => (
                      <FilterChip
                        key={tag}
                        label={tag}
                        icon="label-outline"
                        isActive={activeFilter === tag}
                        onPress={() => setActiveFilter(activeFilter === tag ? 'All' : tag)}
                        colors={colors}
                      />
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          }
        />
      </View>
      <TouchableOpacity onPress={() => router.push('/editor')} className="absolute bottom-8 right-8 w-14 h-14 rounded-full items-center justify-center shadow-lg" style={{ backgroundColor: colors.primary, shadowColor: colors.primary, shadowOpacity: 0.5 }}>
        <MaterialIcons name="add" size={32} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const FilterChip = ({ label, icon, isActive, onPress, isCommunityIcon, colors }: any) => (
  <TouchableOpacity onPress={onPress} className={`flex-row items-center justify-center px-4 h-9 rounded-full mr-3 border`} style={{ backgroundColor: isActive ? colors.primary : colors.input, borderColor: isActive ? colors.primary : colors.input }}>
    {isCommunityIcon ? (
      <MaterialCommunityIcons name={icon} size={18} color={isActive ? 'white' : colors.textSecondary} style={{ marginRight: 6 }} />
    ) : (
      <MaterialIcons name={icon} size={18} color={isActive ? 'white' : colors.textSecondary} style={{ marginRight: 6 }} />
    )}
    <Text className={`text-sm font-medium`} style={{ color: isActive ? 'white' : colors.textSecondary, includeFontPadding: false, textAlignVertical: 'center', marginTop: -2 }}>{label}</Text>
  </TouchableOpacity>
);