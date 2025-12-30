import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  StatusBar,
  StatusBarStyle,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';
import DateTimePicker from '@react-native-community/datetimepicker';

import { useDreams } from '../components/DreamContext';
import { useTheme } from '../components/ThemeContext';
// Updated Import to include Interpretation logic
import { generateDreamImage, interpretDream, DreamStyle } from '../utils/aiService';

interface DreamImage { uri: string; }

export default function EditorScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { addDream, updateDream, dreams } = useDreams();
  const { colors } = useTheme();
  const { t } = useTranslation();

  // State
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [images, setImages] = useState<DreamImage[]>([]);
  const [mood, setMood] = useState<number>(3);
  const [isLucid, setIsLucid] = useState(false);
  const [isNightmare, setIsNightmare] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  // Date Picker State
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // AI State (Image)
  const [isGeneratingImg, setIsGeneratingImg] = useState(false);

  // AI State (Interpretation)
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [interpretation, setInterpretation] = useState('');
  const [interpretationStyle, setInterpretationStyle] = useState<DreamStyle>('psychologist');

  // 1. CALCULATE EXISTING TAGS
  const existingTags = useMemo(() => {
    const all = dreams.flatMap(d => d.tags || []);
    return Array.from(new Set(all)).sort();
  }, [dreams]);

  // 2. FILTER SUGGESTIONS
  const tagSuggestions = useMemo(() => {
    if (!tagInput.trim()) return [];
    const lowerInput = tagInput.toLowerCase().replace(/^#/, '');
    const standardTypes = ["Erotic", "Recurring", "Prophetic", "False Awakening", "Healing"];
    const allSuggestions = Array.from(new Set([...existingTags, ...standardTypes]));

    return allSuggestions.filter(tag =>
      tag.toLowerCase().includes(lowerInput) &&
      !tags.includes(tag)
    );
  }, [tagInput, existingTags, tags]);

  // Load data if editing
  useEffect(() => {
    if (id) {
      const dreamToEdit = dreams.find(d => d.id === id);
      if (dreamToEdit) {
        setIsEditing(true);
        setTitle(dreamToEdit.title);
        setBody(dreamToEdit.body);
        setMood(dreamToEdit.mood || 3);
        setIsLucid(dreamToEdit.isLucid);
        setIsNightmare(dreamToEdit.isNightmare);
        setTags(dreamToEdit.tags || []);
        if (dreamToEdit.images) {
          setImages(dreamToEdit.images.map(uri => ({ uri })));
        }
        // Date parsing logic
        const parsedDate = new Date(dreamToEdit.date);
        if (!isNaN(parsedDate.getTime())) {
          setDate(parsedDate);
        }
        // Load Interpretation if it exists (Using 'any' cast to access dynamic property if not yet in interface)
        if ((dreamToEdit as any).interpretation) {
          setInterpretation((dreamToEdit as any).interpretation);
        }
      }
    }
  }, [id, dreams]);

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 10 - images.length,
      quality: 0.7,
    });

    if (!result.canceled) {
      const newImages = result.assets.map(asset => ({ uri: asset.uri }));
      setImages([...images, ...newImages]);
    }
  };

  // --- AI HANDLERS ---

  const handleGenerateImage = async () => {
    if (!body.trim()) {
      Alert.alert(t('alert_wait'), t('alert_write_desc_img'));
      return;
    }

    if (images.length >= 10) {
      Alert.alert(t('alert_limit_reached'), t('alert_limit_img_msg'));
      return;
    }

    setIsGeneratingImg(true);
    try {
      const localUri = await generateDreamImage(body, id as string);
      setImages(prev => [...prev, { uri: localUri }]);
    } catch (e) {
      Alert.alert(t('alert_error'), t('alert_img_gen_failed'));
    } finally {
      setIsGeneratingImg(false);
    }
  };

  const handleAnalyzeDream = async () => {
    if (!body.trim()) {
      Alert.alert(t('alert_wait'), t('alert_write_desc_analyze'));
      return;
    }
    setIsAnalyzing(true);
    try {
      // Calls updated service with title, body, tags AND STYLE
      const result = await interpretDream(title || 'Untitled', body, tags, interpretationStyle);
      setInterpretation(result);
    } catch (e) {
      Alert.alert(t('alert_error'), t('alert_analyze_failed'));
    } finally {
      setIsAnalyzing(false);
    }
  };

  // -------------------

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const addTag = (tagToAdd?: string) => {
    const text = tagToAdd || tagInput;
    if (text.trim().length > 0) {
      const cleanTag = text.trim().replace(/^#/, '');
      if (!tags.includes(`#${cleanTag}`) && !tags.includes(cleanTag)) {
        setTags([...tags, cleanTag]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSave = () => {
    if (!title && !body) return;

    const dreamData = {
      title: title || 'Untitled Dream',
      body,
      date: date.toLocaleDateString(), // Use the picker date
      mood,
      isLucid,
      isNightmare,
      tags,
      hasImages: images.length > 0,
      imageCount: images.length,
      thumbnail: images.length > 0 ? images[0].uri : undefined,
      images: images.map(img => img.uri),
      interpretation // Save the AI result
    };

    if (isEditing && id) {
      updateDream({ ...dreamData, id: id as string });
    } else {
      addDream(dreamData);
    }

    router.back();
  };

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
          <Text style={{ color: colors.textSecondary }} className="ml-1 font-medium">{t('cancel')}</Text>
        </TouchableOpacity>
        <Text style={{ color: colors.text }} className="font-bold text-lg hidden sm:block">
          {isEditing ? t('editor_edit') : t('editor_new')}
        </Text>
        <TouchableOpacity
          className="px-4 py-2 rounded-lg shadow-lg"
          style={{ backgroundColor: colors.primary, shadowColor: colors.primary, shadowOpacity: 0.3 }}
          onPress={handleSave}
        >
          <Text className="text-white font-bold text-sm">{t('save')}</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView className="flex-1 p-4">

          {/* Title & Body Card */}
          <View
            className="rounded-xl p-4 mb-6 border"
            style={{ backgroundColor: colors.card, borderColor: colors.border }}
          >
            {/* DATE PICKER ROW */}
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              className="flex-row items-center gap-2 mb-4 opacity-70"
            >
              <MaterialIcons name="calendar-today" size={16} color={colors.textSecondary} />
              <Text style={{ color: colors.textSecondary, fontWeight: '500' }}>
                {date.toLocaleDateString()}
              </Text>
              <MaterialIcons name="edit" size={14} color={colors.textSecondary} />
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onDateChange}
                textColor={colors.text}
                maximumDate={new Date()} // Optional: Prevent future dreams?
              />
            )}

            <TextInput
              className="text-2xl font-bold mb-4"
              style={{ color: colors.text }}
              placeholder={t('placeholder_title')}
              placeholderTextColor={colors.textSecondary}
              value={title}
              onChangeText={setTitle}
            />
            <View className="h-px mb-4" style={{ backgroundColor: colors.border }} />
            <TextInput
              className="text-lg leading-relaxed min-h-[150px]"
              style={{ color: colors.text }}
              placeholder={t('placeholder_body')}
              placeholderTextColor={colors.textSecondary}
              multiline
              textAlignVertical="top"
              value={body}
              onChangeText={setBody}
            />
          </View>

          {/* --- AI INTERPRETATION SECTION (NEW) --- */}
          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-2">
              <Text style={{ color: colors.textSecondary }} className="text-xs font-bold uppercase tracking-wider">{t('style_label') || "Interpreter Persona"}</Text>
            </View>

            {/* Style Selector */}
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

            {/* Analyze Button */}
            <TouchableOpacity
              onPress={handleAnalyzeDream}
              disabled={isAnalyzing}
              className="w-full py-3 rounded-xl border border-dashed flex-row items-center justify-center gap-2 mb-4"
              style={{ borderColor: colors.primary, backgroundColor: colors.primary + '05' }}
            >
              {isAnalyzing ? <ActivityIndicator color={colors.primary} /> : (
                <>
                  <MaterialCommunityIcons name="brain" size={20} color={colors.primary} />
                  <Text style={{ color: colors.primary, fontWeight: '600' }}>{t('btn_interpret') || "Analyze Dream"}</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Interpretation Result */}
            {interpretation ? (
              <View className="p-4 rounded-xl border bg-yellow-500/5 border-yellow-500/20 mb-2">
                <View className="flex-row items-center gap-2 mb-2">
                  <MaterialIcons name="auto-awesome" size={16} color="#eab308" />
                  <Text className="text-yellow-600 font-bold text-xs uppercase">Analysis ({t(`style_${interpretationStyle}`) || interpretationStyle})</Text>
                </View>
                <Text style={{ color: colors.text }} className="leading-relaxed">{interpretation}</Text>
              </View>
            ) : null}
          </View>

          {/* Attachments */}
          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-3">
              <Text style={{ color: colors.textSecondary }} className="text-xs font-bold uppercase tracking-wider">
                {t('attachments')}
              </Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-3">

              {/* Upload Button */}
              <TouchableOpacity
                onPress={images.length < 10 ? pickImage : undefined}
                className="w-24 h-24 rounded-lg border-2 border-dashed items-center justify-center"
                style={{
                  borderColor: colors.border,
                  backgroundColor: colors.input + '40',
                  opacity: images.length >= 10 ? 0.5 : 1
                }}
              >
                {images.length >= 10 ? (
                  <Text style={{ color: colors.textSecondary, fontSize: 10, textAlign: 'center' }}>{t('btn_add_image_limit')}</Text>
                ) : (
                  <MaterialIcons name="add-photo-alternate" size={24} color={colors.textSecondary} />
                )}
              </TouchableOpacity>

              {/* AI Generator Button */}
              <TouchableOpacity
                onPress={handleGenerateImage}
                disabled={isGeneratingImg}
                className="w-24 h-24 rounded-lg border-2 border-dashed items-center justify-center"
                style={{
                  borderColor: colors.primary,
                  backgroundColor: isGeneratingImg ? colors.card : colors.primary + '10'
                }}
              >
                {isGeneratingImg ? (
                  <ActivityIndicator color={colors.primary} />
                ) : (
                  <>
                    <MaterialIcons name="brush" size={24} color={colors.primary} />
                    <Text style={{ color: colors.primary, fontSize: 10, fontWeight: 'bold', marginTop: 4 }}>PAINT</Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Existing Images */}
              {images.map((img, index) => (
                <View key={index} className="w-24 h-24 relative">
                  <Image source={{ uri: img.uri }} className="w-full h-full rounded-lg" resizeMode="cover" style={{ backgroundColor: colors.input }} />
                  <TouchableOpacity onPress={() => removeImage(index)} className="absolute -top-2 -right-2 bg-black/80 rounded-full p-1 border border-white/20">
                    <MaterialIcons name="close" size={12} color="white" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Mood Selector */}
          <View
            className="p-4 rounded-xl border mb-4"
            style={{ backgroundColor: colors.card, borderColor: colors.border }}
          >
            <Text style={{ color: colors.textSecondary }} className="text-xs font-bold uppercase tracking-wider mb-3">{t('mood')}</Text>
            <View className="flex-row justify-between p-2 rounded-lg" style={{ backgroundColor: colors.input }}>
              {[1, 2, 3, 4, 5].map((level) => {
                const icons = ['sentiment-very-dissatisfied', 'sentiment-dissatisfied', 'sentiment-neutral', 'sentiment-satisfied', 'sentiment-very-satisfied'];
                const moodColors = ['#ef4444', '#fdba74', colors.textSecondary, '#86efac', '#22c55e'];
                const isActive = mood === level;
                return (
                  <TouchableOpacity
                    key={level}
                    onPress={() => setMood(level)}
                    className="p-2 rounded-md"
                    style={{ backgroundColor: isActive ? colors.background : 'transparent' }}
                  >
                    <MaterialIcons
                      name={icons[level - 1] as any}
                      size={28}
                      color={isActive ? (level === 3 ? colors.text : moodColors[level - 1]) : colors.textSecondary}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Toggles */}
          <View className="flex-col gap-3 mb-6">
            <TouchableOpacity
              onPress={() => setIsLucid(!isLucid)}
              className="flex-row items-center justify-between p-4 rounded-xl border"
              style={{
                backgroundColor: isLucid ? colors.primary + '15' : colors.card,
                borderColor: isLucid ? colors.primary : colors.border
              }}
            >
              <Text style={{ color: colors.text }} className="font-semibold">{t('filter_lucid')}</Text>
              <Switch
                value={isLucid}
                onValueChange={setIsLucid}
                trackColor={{ false: colors.input, true: colors.primary }}
                thumbColor={'#ffffff'}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setIsNightmare(!isNightmare)}
              className="flex-row items-center justify-between p-4 rounded-xl border"
              style={{
                backgroundColor: isNightmare ? '#ef444415' : colors.card,
                borderColor: isNightmare ? '#ef4444' : colors.border
              }}
            >
              <Text style={{ color: colors.text }} className="font-semibold">{t('filter_nightmare')}</Text>
              <Switch
                value={isNightmare}
                onValueChange={setIsNightmare}
                trackColor={{ false: colors.input, true: '#ef4444' }}
                thumbColor={'#ffffff'}
              />
            </TouchableOpacity>
          </View>

          {/* Tags with Autocomplete */}
          <View
            className="p-4 rounded-xl border mb-20"
            style={{ backgroundColor: colors.card, borderColor: colors.border }}
          >
            <Text style={{ color: colors.textSecondary }} className="text-xs font-bold uppercase tracking-wider mb-3">{t('tags')}</Text>

            <View className="flex-row gap-2 mb-3">
              <TextInput
                className="flex-1 px-3 py-2 rounded-lg border"
                style={{
                  backgroundColor: colors.input,
                  color: colors.text,
                  borderColor: colors.border
                }}
                placeholder={t('placeholder_tag')}
                placeholderTextColor={colors.textSecondary}
                value={tagInput}
                onChangeText={setTagInput}
                onSubmitEditing={() => addTag()}
              />
              <TouchableOpacity
                onPress={() => addTag()}
                className="px-4 items-center justify-center rounded-lg"
                style={{ backgroundColor: colors.input }}
              >
                <MaterialIcons name="add" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* SUGGESTIONS LIST */}
            {tagSuggestions.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2 mb-3">
                {tagSuggestions.map((suggestion) => (
                  <TouchableOpacity
                    key={suggestion}
                    onPress={() => addTag(suggestion)}
                    className="px-3 py-1.5 rounded-full border border-dashed"
                    style={{ borderColor: colors.primary, backgroundColor: colors.primary + '10' }}
                  >
                    <Text style={{ color: colors.primary, fontSize: 12 }}>+ {suggestion}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            <View className="flex-row flex-wrap gap-2">
              {tags.map((tag, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => removeTag(tag)}
                  className="flex-row items-center gap-1 px-2 py-1 rounded-md border"
                  style={{
                    backgroundColor: colors.primary + '15',
                    borderColor: colors.primary + '30'
                  }}
                >
                  <Text style={{ color: colors.primary }} className="text-xs font-medium">{tag}</Text>
                  <MaterialIcons name="close" size={12} color={colors.primary} />
                </TouchableOpacity>
              ))}
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}