import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useDreams } from '../components/DreamContext';

export default function StatsScreen() {
  const router = useRouter();
  const { dreams } = useDreams();

  // Calculate Stats on the fly
  const stats = useMemo(() => {
    const totalDreams = dreams.length;
    const lucidCount = dreams.filter(d => d.isLucid).length;
    const nightmareCount = dreams.filter(d => d.isNightmare).length;
    
    // Count total images across all dreams
    // We check if images exists and has length, otherwise 0
    const totalImages = dreams.reduce((acc, curr) => acc + (curr.images?.length || 0), 0);
    
    // Calculate average mood (1-5)
    // Filter out dreams with no mood or mood 0
    const validMoods = dreams.filter(d => d.mood && d.mood > 0);
    const avgMood = validMoods.length > 0 
      ? (validMoods.reduce((acc, curr) => acc + (curr.mood || 0), 0) / validMoods.length).toFixed(1)
      : '-';

    return { totalDreams, lucidCount, nightmareCount, totalImages, avgMood };
  }, [dreams]);

  // Reusable Stat Card Component
  const StatCard = ({ label, value, icon, color, subtext, isCommunityIcon }: any) => (
    <View className="w-[48%] bg-card-dark p-4 rounded-xl border border-white/5 mb-4 items-center justify-center">
      <View className={`w-10 h-10 rounded-full items-center justify-center mb-3 ${color}`}>
        {isCommunityIcon ? (
           <MaterialCommunityIcons name={icon} size={20} color="white" />
        ) : (
           <MaterialIcons name={icon} size={20} color="white" />
        )}
      </View>
      <Text className="text-3xl font-bold text-white mb-1">{value}</Text>
      <Text className="text-text-secondary text-xs uppercase font-bold tracking-wider">{label}</Text>
      {subtext && <Text className="text-white/40 text-[10px] mt-1">{subtext}</Text>}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-background-dark">
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-[#111218] border-b border-white/5">
        <TouchableOpacity onPress={() => router.back()} className="flex-row items-center">
          <MaterialIcons name="arrow-back" size={24} color="#9da1b9" />
          <Text className="text-text-secondary ml-1 font-medium">Back</Text>
        </TouchableOpacity>
        <Text className="text-white font-bold text-lg">Insights</Text>
        <View className="w-16" />
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Main Grid */}
        <View className="flex-row flex-wrap justify-between mt-2">
          <StatCard 
            label="Total Dreams" 
            value={stats.totalDreams} 
            icon="book" 
            color="bg-blue-600" 
          />
          <StatCard 
            label="Avg Mood" 
            value={stats.avgMood} 
            icon="emoji-emotions" 
            color="bg-yellow-600"
            subtext="/ 5.0 scale"
          />
          <StatCard 
            label="Lucid Dreams" 
            value={stats.lucidCount} 
            icon="auto-awesome" 
            color="bg-purple-600" 
            subtext={`${stats.totalDreams > 0 ? ((stats.lucidCount / stats.totalDreams) * 100).toFixed(0) : 0}% of total`}
          />
          <StatCard 
            label="Nightmares" 
            value={stats.nightmareCount} 
            icon="spider-web"
            color="bg-red-600"
            isCommunityIcon={true} 
          />
        </View>

        {/* Image Stats Section */}
        <View className="mt-4 bg-[#111218] rounded-xl p-5 border border-white/10 flex-row items-center justify-between">
          <View>
            <Text className="text-white font-bold text-lg">Visual Gallery</Text>
            <Text className="text-text-secondary text-sm mt-1">
              You have collected <Text className="text-primary font-bold">{stats.totalImages} images</Text> from your dream world.
            </Text>
          </View>
          <View className="w-12 h-12 bg-primary/20 rounded-full items-center justify-center">
            <MaterialIcons name="photo-library" size={24} color="#1337ec" />
          </View>
        </View>

        {/* Motivation Card */}
        <View className="mt-6 bg-gradient-to-r from-indigo-900 to-slate-900 rounded-xl p-6 border border-white/10">
          <View className="flex-row items-center gap-3 mb-2">
            <MaterialCommunityIcons name="lightbulb-on-outline" size={24} color="#fbbf24" />
            <Text className="text-white font-bold text-lg">Did you know?</Text>
          </View>
          <Text className="text-indigo-200 leading-relaxed">
            Keeping a dream journal improves dream recall by 40% within the first two weeks. You are doing great!
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}