import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Image, FlatList, StatusBar, ListRenderItem } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useDreams, Dream } from '../components/DreamContext';

export default function DreamListScreen() {
  const router = useRouter();
  const { dreams } = useDreams(); // <--- Get real data
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // FILTER LOGIC
  const filteredDreams = dreams.filter((dream: Dream) => {
    // 1. Check Search Text
    const matchesSearch = dream.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          dream.body.toLowerCase().includes(searchQuery.toLowerCase());
    
    // 2. Check Chips
    if (activeFilter === 'All') return matchesSearch;
    if (activeFilter === 'Lucid') return matchesSearch && dream.isLucid;
    if (activeFilter === 'Nightmare') return matchesSearch && dream.isNightmare;
    if (activeFilter === 'Images') return matchesSearch && dream.hasImages;
    
    return matchesSearch;
  });

  const renderDreamItem: ListRenderItem<Dream> = ({ item }) => (
    <TouchableOpacity 
      onPress={() => router.push(`/dream/${item.id}`)}
      className="group flex-col bg-card-dark rounded-xl border border-white/5 mb-6 overflow-hidden active:opacity-90"
    >
      <View className="flex-row">
        <View className="flex-1 p-5 gap-4">
          <View className="flex-col gap-2">
            <View className="flex-row items-center gap-2">
              {item.isLucid && (
                <View className="flex-row items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20">
                  <MaterialIcons name="auto-awesome" size={12} color="#c084fc" />
                  <Text className="text-purple-400 text-xs font-semibold">Lucid</Text>
                </View>
              )}
              {item.isNightmare && (
                <View className="flex-row items-center gap-1 px-2 py-0.5 rounded-md bg-red-500/10 border border-red-500/20">
                  <MaterialCommunityIcons name="emoticon-sad-outline" size={12} color="#f87171" />
                  <Text className="text-red-400 text-xs font-semibold">Nightmare</Text>
                </View>
              )}
              <Text className="text-text-secondary text-xs font-medium">{item.date}</Text>
            </View>

            <Text className="text-white text-lg font-semibold leading-tight">{item.title}</Text>
            <Text className="text-text-secondary text-sm leading-relaxed" numberOfLines={3}>
              {item.body}
            </Text>
          </View>

          <View className="flex-row items-center justify-between mt-2">
            <View className="flex-row gap-2">
              {item.tags.map((tag, index) => (
                <Text key={index} className="text-xs text-[#6e738b] bg-[#111218] px-2 py-1 rounded overflow-hidden">
                  {tag}
                </Text>
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
                <Text className="text-white text-[10px] font-bold">{item.imageCount}</Text>
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
          data={filteredDreams} // <--- Using filtered data now!
          keyExtractor={(item) => item.id}
          renderItem={renderDreamItem}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListHeaderComponent={
            <View className="flex-col gap-6 mb-6">
              {/* FIXED HEADER WITH GRID ICON */}
              <View className="flex-row justify-between items-start pt-2">
                <View className="flex-1">
                  <Text className="text-3xl font-bold text-white tracking-tight">Good Morning</Text>
                  <Text className="text-text-secondary text-base mt-1">
                    You've recorded <Text className="text-primary font-semibold">{dreams.length} dreams</Text>.
                  </Text>
                </View>
                
                {/* GALLERY BUTTON */}
                <TouchableOpacity 
                  onPress={() => router.push('/gallery')}
                  className="bg-[#1c1d27] p-2.5 rounded-full border border-white/10 active:bg-white/10 ml-4"
                >
                  <MaterialIcons name="grid-view" size={24} color="#9da1b9" />
                </TouchableOpacity>
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
                  onChangeText={setSearchQuery} // <--- Wired up
                />
              </View>

              {/* Filters */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row pb-2">
                <FilterChip label="All Dreams" icon="view-list" isActive={activeFilter === 'All'} onPress={() => setActiveFilter('All')} />
                <FilterChip label="Lucid" icon="auto-awesome" isActive={activeFilter === 'Lucid'} onPress={() => setActiveFilter('Lucid')} />
                <FilterChip label="Nightmare" icon="sentiment-very-dissatisfied" isActive={activeFilter === 'Nightmare'} onPress={() => setActiveFilter('Nightmare')} />
                <FilterChip label="Has Images" icon="image" isActive={activeFilter === 'Images'} onPress={() => setActiveFilter('Images')} />
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

// Chip Component
const FilterChip = ({ label, icon, isActive, onPress }: any) => (
  <TouchableOpacity 
    onPress={onPress}
    className={`flex-row items-center justify-center px-4 h-9 rounded-full mr-3 border ${isActive ? 'bg-primary border-primary' : 'bg-input-dark border-white/5'}`}
  >
    <MaterialIcons name={icon} size={18} color={isActive ? 'white' : '#9da1b9'} style={{ marginRight: 6 }} />
    <Text className={`text-sm font-medium ${isActive ? 'text-white' : 'text-text-secondary'}`}>{label}</Text>
  </TouchableOpacity>
);