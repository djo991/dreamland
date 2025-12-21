import React, { useState, useMemo } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useDreams, Dream } from '../components/DreamContext';
import { DREAM_QUOTES, getGreeting } from '../constants/quotes';

export default function DreamListScreen() {
  const router = useRouter();
  const { dreams, userProfile } = useDreams();
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

const renderDreamItem: ListRenderItem<Dream> = ({ item }) => (
    <TouchableOpacity 
      onPress={() => router.push(`/dream/${item.id}`)}
      // 1. CHANGED p-5 to p-4 (Tightens the "Empty Space" inside the card)
      className="group flex-col bg-card-dark rounded-xl border border-white/5 mb-6 overflow-hidden active:opacity-90"
    >
      <View className="flex-row">
        {/* 2. Ensured p-4 here as well */}
        <View className="flex-1 p-4 gap-3">
          <View className="flex-col gap-2">
            
            {/* Metadata Row */}
            <View className="flex-row items-center gap-2">
              {/* Lucid Chip */}
              {item.isLucid && (
                <View className="flex-row items-center justify-center gap-1 px-2.5 h-6 rounded-md bg-purple-500/10 border border-purple-500/20">
                  <MaterialIcons name="auto-awesome" size={12} color="#c084fc" />
                  <Text 
                    className="text-purple-400 text-xs font-bold" 
                    // 3. NEGATIVE MARGIN FIX: -mt-[2px] pulls the text UP
                    style={{ includeFontPadding: false, textAlignVertical: 'center', marginTop: -2 }}
                  >
                    Lucid
                  </Text>
                </View>
              )}
              
              {/* Nightmare Chip */}
              {item.isNightmare && (
                <View className="flex-row items-center justify-center gap-1.5 px-2.5 h-6 rounded-md bg-red-500/10 border border-red-500/20">
                  <MaterialCommunityIcons name="spider-web" size={14} color="#f87171" />
                  <Text 
                    className="text-red-400 text-xs font-bold" 
                    // 3. NEGATIVE MARGIN FIX
                    style={{ includeFontPadding: false, textAlignVertical: 'center', marginTop: -2 }}
                  >
                    Nightmare
                  </Text>
                </View>
              )}
              
              {(item.isLucid || item.isNightmare) && (
                <Text className="text-text-secondary/30 text-xs">•</Text>
              )}
              {/* Added small negative margin to date to align with chips */}
              <Text className="text-text-secondary text-xs font-medium" style={{ marginTop: -1 }}>{item.date}</Text>
            </View>

            <Text className="text-white text-lg font-semibold leading-tight">{item.title}</Text>
            <Text className="text-text-secondary text-sm leading-relaxed" numberOfLines={3}>
              {item.body}
            </Text>
          </View>

          {/* Tags */}
          <View className="flex-row items-center justify-between mt-1">
            <View className="flex-row gap-2 flex-wrap">
              {item.tags.map((tag, index) => (
                <View 
                  key={`${item.id}:${tag}:${index}`} 
                  className="bg-[#111218] px-2 h-5 justify-center rounded overflow-hidden"
                >
                  <Text 
                    className="text-xs text-[#6e738b]" 
                    // 3. NEGATIVE MARGIN FIX for Tags
                    style={{ includeFontPadding: false, textAlignVertical: 'center', marginTop: -2 }}
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
          <View className="w-24 h-full bg-[#111218] relative hidden sm:flex">
             <Image source={{ uri: item.thumbnail }} className="w-full h-full opacity-80" resizeMode="cover" />
             <View className="absolute bottom-2 right-2 bg-black/60 px-1.5 py-0.5 rounded flex-row items-center gap-1">
                <MaterialIcons name="photo-library" size={10} color="white" />
                <Text className="text-white text-[10px] font-bold" style={{ includeFontPadding: false, marginTop: -1 }}>{item.imageCount}</Text>
             </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-background-dark">
      <StatusBar barStyle="light-content" />

      <View className="flex-1 px-4 pt-4">
        <FlatList
          data={filteredDreams}
          keyExtractor={(item) => item.id}
          renderItem={renderDreamItem}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListHeaderComponent={
            <View className="flex-col gap-6 mb-6">
              {/* HEADER */}
              <View className="flex-row justify-between items-start pt-2">
                <View className="flex-1 mr-4">
                  <Text className="text-3xl font-bold text-white tracking-tight leading-tight">
                    {greeting}
                    {userProfile?.name ? `,\n${userProfile.name}` : ''}
                  </Text>
                  <Text className="text-text-secondary text-base mt-2">
                    <Text className="text-primary font-semibold">{dreams.length}</Text> dreams
                    recorded.
                  </Text>
                </View>

                {/* BUTTON GROUP */}
                <View className="flex-row items-center gap-3 mt-1">
                  <TouchableOpacity
                    onPress={() => router.push('/stats')}
                    className="w-10 h-10 rounded-full bg-[#1c1d27] border border-white/10 items-center justify-center active:bg-white/10"
                  >
                    <MaterialIcons name="bar-chart" size={20} color="#9da1b9" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => router.push('/gallery')}
                    className="w-10 h-10 rounded-full bg-[#1c1d27] border border-white/10 items-center justify-center active:bg-white/10"
                  >
                    <MaterialIcons name="grid-view" size={20} color="#9da1b9" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => router.push('/settings')}
                    className="w-10 h-10 rounded-full bg-[#1c1d27] border border-white/10 items-center justify-center active:bg-white/10"
                  >
                    <MaterialIcons name="settings" size={20} color="#9da1b9" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* QUOTE CARD */}
              <View className="bg-primary/5 border border-primary/20 p-4 rounded-xl">
                <View className="flex-row gap-2 mb-1">
                  <MaterialCommunityIcons name="format-quote-open" size={16} color="#60a5fa" />
                  <Text className="text-blue-200 text-xs font-bold uppercase tracking-widest">
                    Daily Wisdom
                  </Text>
                </View>
                <Text className="text-white/80 text-sm italic leading-relaxed pl-2">
                  "{quote}"
                </Text>
              </View>

              {/* Search Bar */}
              <View className="relative w-full">
                <View className="absolute inset-y-0 left-0 flex-row items-center pl-4 z-10 h-full justify-center">
                  <MaterialIcons name="search" size={24} color="#9da1b9" />
                </View>
                <TextInput
                  className="w-full h-12 pl-12 pr-4 bg-input-dark text-white rounded-xl text-base"
                  placeholder="Search dreams..."
                  placeholderTextColor="#9da1b9"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>

              {/* Filters */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row pb-2">
                <FilterChip
                  label="All Dreams"
                  icon="view-list"
                  isActive={activeFilter === 'All'}
                  onPress={() => setActiveFilter('All')}
                />
                <FilterChip
                  label="Lucid"
                  icon="auto-awesome"
                  isActive={activeFilter === 'Lucid'}
                  onPress={() => setActiveFilter('Lucid')}
                />
                <FilterChip
                  label="Nightmare"
                  icon="spider-web"
                  isActive={activeFilter === 'Nightmare'}
                  onPress={() => setActiveFilter('Nightmare')}
                  isCommunityIcon={true}
                />
                <FilterChip
                  label="Has Images"
                  icon="image"
                  isActive={activeFilter === 'Images'}
                  onPress={() => setActiveFilter('Images')}
                />
              </ScrollView>
            </View>
          }
        />
      </View>

      <TouchableOpacity
        onPress={() => router.push('/editor')}
        className="absolute bottom-8 right-8 w-14 h-14 rounded-full bg-primary items-center justify-center shadow-lg shadow-blue-900/50"
      >
        <MaterialIcons name="add" size={32} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// FilterChip
const FilterChip = ({ label, icon, isActive, onPress, isCommunityIcon }: any) => (
  // Changed from py-2 to h-9 (Fixed Height) for consistent vertical centering
  <TouchableOpacity
    onPress={onPress}
    className={`flex-row items-center justify-center px-4 h-9 rounded-full mr-3 border ${
      isActive ? 'bg-primary border-primary' : 'bg-input-dark border-white/5'
    }`}
  >
    {isCommunityIcon ? (
      <MaterialCommunityIcons
        name={icon}
        size={18}
        color={isActive ? 'white' : '#9da1b9'}
        style={{ marginRight: 6 }}
      />
    ) : (
      <MaterialIcons
        name={icon}
        size={18}
        color={isActive ? 'white' : '#9da1b9'}
        style={{ marginRight: 6 }}
      />
    )}
    <Text
      className={`text-sm font-medium ${isActive ? 'text-white' : 'text-text-secondary'}`}
      style={{ 
        includeFontPadding: false, 
        textAlignVertical: 'center',
        lineHeight: 18 // Explicit line height for text-sm
      }}
    >
      {label}
    </Text>
  </TouchableOpacity>
);