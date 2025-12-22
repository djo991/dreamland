import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar, StatusBarStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next'; // <--- Import

import { useDreams } from '../components/DreamContext';
import { useTheme } from '../components/ThemeContext'; 

export default function StatsScreen() {
  const router = useRouter();
  const { dreams } = useDreams();
  const { colors } = useTheme(); 
  const { t } = useTranslation(); // <--- Init Hook

  // Calculate Stats on the fly
  const stats = useMemo(() => {
    const totalDreams = dreams.length;
    const lucidCount = dreams.filter(d => d.isLucid).length;
    const nightmareCount = dreams.filter(d => d.isNightmare).length;
    
    // Count total images across all dreams
    const totalImages = dreams.reduce((acc, curr) => acc + (curr.images?.length || 0), 0);
    
    // Calculate average mood (1-5)
    const validMoods = dreams.filter(d => d.mood && d.mood > 0);
    const avgMood = validMoods.length > 0 
      ? (validMoods.reduce((acc, curr) => acc + (curr.mood || 0), 0) / validMoods.length).toFixed(1)
      : '-';

    return { totalDreams, lucidCount, nightmareCount, totalImages, avgMood };
  }, [dreams]);

  // Reusable Stat Card Component
  const StatCard = ({ label, value, icon, color, subtext, isCommunityIcon }: any) => (
    <View 
      className="w-[48%] p-4 rounded-xl border mb-4 items-center justify-center"
      style={{ backgroundColor: colors.card, borderColor: colors.border }}
    >
      {/* Icon Circle */}
      <View className={`w-10 h-10 rounded-full items-center justify-center mb-3 ${color}`}>
        {isCommunityIcon ? (
           <MaterialCommunityIcons name={icon} size={20} color="white" />
        ) : (
           <MaterialIcons name={icon} size={20} color="white" />
        )}
      </View>
      <Text 
        className="text-3xl font-bold mb-1"
        style={{ color: colors.text }}
      >
        {value}
      </Text>
      <Text 
        className="text-xs uppercase font-bold tracking-wider"
        style={{ color: colors.textSecondary }}
      >
        {label}
      </Text>
      {subtext && (
        <Text 
          className="text-[10px] mt-1"
          style={{ color: colors.textSecondary, opacity: 0.6 }}
        >
          {subtext}
        </Text>
      )}
    </View>
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
        style={{ backgroundColor: colors.background, borderColor: colors.border }}
      >
        <TouchableOpacity onPress={() => router.back()} className="flex-row items-center">
          <MaterialIcons name="arrow-back" size={24} color={colors.textSecondary} />
          <Text style={{ color: colors.textSecondary }} className="ml-1 font-medium">{t('back')}</Text>
        </TouchableOpacity>
        <Text style={{ color: colors.text }} className="font-bold text-lg">{t('stats_title')}</Text>
        <View className="w-16" />
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Main Grid */}
        <View className="flex-row flex-wrap justify-between mt-2">
          <StatCard 
            label={t('total_dreams')} 
            value={stats.totalDreams} 
            icon="book" 
            color="bg-blue-600" 
          />
          <StatCard 
            label={t('avg_mood')} 
            value={stats.avgMood} 
            icon="emoji-emotions" 
            color="bg-yellow-600"
            subtext="/ 5.0 scale"
          />
          <StatCard 
            label={t('filter_lucid')} 
            value={stats.lucidCount} 
            icon="auto-awesome" 
            color="bg-purple-600" 
            subtext={`${stats.totalDreams > 0 ? ((stats.lucidCount / stats.totalDreams) * 100).toFixed(0) : 0}% of total`}
          />
          <StatCard 
            label={t('filter_nightmare')} 
            value={stats.nightmareCount} 
            icon="spider-web" 
            color="bg-red-600"
            isCommunityIcon={true} 
          />
        </View>

        {/* Image Stats Section */}
        <View 
          className="mt-4 rounded-xl p-5 border flex-row items-center justify-between"
          style={{ backgroundColor: colors.card, borderColor: colors.border }}
        >
          <View>
            <Text style={{ color: colors.text }} className="font-bold text-lg">{t('visual_gallery')}</Text>
            <Text style={{ color: colors.textSecondary }} className="text-sm mt-1">
              {t('visual_gallery_desc')} <Text style={{ color: colors.primary }} className="font-bold">{stats.totalImages} {t('images_count')}</Text>.
            </Text>
          </View>
          <View 
            className="w-12 h-12 rounded-full items-center justify-center"
            style={{ backgroundColor: colors.primary + '20' }}
          >
            <MaterialIcons name="photo-library" size={24} color={colors.primary} />
          </View>
        </View>

        {/* Motivation Card */}
        <View 
          className="mt-6 rounded-xl p-6 border-l-4"
          style={{ 
            backgroundColor: colors.card, 
            borderColor: colors.border,
            borderLeftColor: colors.primary 
          }}
        >
          <View className="flex-row items-center gap-3 mb-2">
            <MaterialCommunityIcons name="lightbulb-on-outline" size={24} color="#fbbf24" />
            <Text style={{ color: colors.text }} className="font-bold text-lg">{t('did_you_know')}</Text>
          </View>
          <Text style={{ color: colors.textSecondary }} className="leading-relaxed">
            {t('tip_text')}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}