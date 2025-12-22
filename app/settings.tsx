import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  StatusBar, 
  Alert, 
  TextInput, 
  ActivityIndicator, 
  StatusBarStyle,
  Modal 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useDreams } from '../components/DreamContext';
import { useTheme } from '../components/ThemeContext';
import { ThemeMode } from '../constants/theme';

const GENDER_OPTIONS = ['Male', 'Female', 'Non-binary', 'Prefer not to say', 'Other'];

export default function SettingsScreen() {
  const router = useRouter();
  const { dreams, userProfile, updateUserProfile, clearAllData, importData } = useDreams();
  const [isLoading, setIsLoading] = useState(false);
  const { mode, setMode, colors } = useTheme();

  // Local state for inputs
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  
  // State for Gender Dropdown
  const [isGenderPickerVisible, setGenderPickerVisible] = useState(false);

  // Sync local state with context on mount
  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name);
      setAge(userProfile.age);
      setGender(userProfile.gender);
    }
  }, [userProfile]);

  // Save when leaving the field (onBlur) or when button pressed
  const handleSaveProfile = () => {
    updateUserProfile({ name, age, gender });
  };

  // Helper to force numbers only for age
  const handleAgeChange = (text: string) => {
    const numericValue = text.replace(/[^0-9]/g, '');
    setAge(numericValue);
  };

  const ThemeOption = ({ label, value, icon }: { label: string, value: ThemeMode, icon: any }) => (
    <TouchableOpacity 
      onPress={() => setMode(value)}
      style={{ 
        backgroundColor: mode === value ? colors.primary + '20' : 'transparent', 
        borderColor: mode === value ? colors.primary : 'transparent'
      }}
      className="flex-row items-center justify-between p-3 rounded-lg border mb-1"
    >
      <View className="flex-row items-center gap-3">
        <MaterialIcons name={icon} size={20} color={mode === value ? colors.primary : colors.textSecondary} />
        <Text style={{ color: mode === value ? colors.primary : colors.text }}>{label}</Text>
      </View>
      {mode === value && <MaterialIcons name="check" size={20} color={colors.primary} />}
    </TouchableOpacity>
  );

  // 1. Export Logic
  const handleExport = async () => {
    try {
      if (dreams.length === 0) {
        Alert.alert("No Data", "You have no dreams to export yet.");
        return;
      }

      const fileName = `DreamJournal_Backup_${new Date().toISOString().split('T')[0]}.json`;
      const fileUri = FileSystem.documentDirectory + fileName;

      const dataStr = JSON.stringify(dreams, null, 2);
      await FileSystem.writeAsStringAsync(fileUri, dataStr, {
        encoding: FileSystem.EncodingType.UTF8
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: 'Save your Backup'
        });
      } else {
        Alert.alert("Error", "Sharing is not available on this device");
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Could not save file.');
    }
  };

  // 2. Import Logic
  const handleImport = async () => {
    try {
      setIsLoading(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true
      });

      if (result.canceled) {
        setIsLoading(false);
        return;
      }

      const fileUri = result.assets[0].uri;
      const fileContent = await FileSystem.readAsStringAsync(fileUri);
      
      const success = await importData(fileContent);
      
      if (success) {
        Alert.alert("Success", "Dreams imported successfully!");
      } else {
        Alert.alert("Error", "Invalid backup file.");
      }
    } catch (e) {
      Alert.alert("Error", "Failed to read file.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    Alert.alert(
      "Delete All Data",
      "This will permanently delete all dreams. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete Everything", 
          style: "destructive", 
          onPress: () => {
            clearAllData();
            Alert.alert("Reset Complete", "Your journal has been wiped.");
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={colors.statusBarStyle as StatusBarStyle} backgroundColor={colors.background} />

      {/* Header */}
      <View 
        className="flex-row items-center justify-between px-4 py-3 border-b"
        style={{ backgroundColor: colors.background, borderColor: colors.border }}
      >
        <TouchableOpacity onPress={() => router.back()} className="flex-row items-center">
          <MaterialIcons name="arrow-back" size={24} color={colors.textSecondary} />
          <Text style={{ color: colors.textSecondary }} className="ml-1 font-medium">Back</Text>
        </TouchableOpacity>
        <Text style={{ color: colors.text }} className="font-bold text-lg">Settings</Text>
        <View className="w-16" />
      </View>

      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ padding: 16 }} // Fix: Padding applied to content container avoids 'stuck' edges
      >
        
        {/* User Profile Section */}
        <Text 
          style={{ color: colors.textSecondary }} 
          className="text-xs font-bold uppercase tracking-wider mb-2"
        >
          My Profile
        </Text>
        <View 
          className="rounded-xl p-3 border mb-6"
          style={{ backgroundColor: colors.card, borderColor: colors.border }}
        >
          <View>
            <Text style={{ color: colors.textSecondary }} className="text-xs mb-1">Full Name</Text>
            <TextInput 
              className="px-3 py-3 rounded-lg border mb-2"
              style={{ 
                backgroundColor: colors.input, 
                color: colors.text,
                borderColor: colors.border
              }}
              placeholder="e.g. John Doe"
              placeholderTextColor={colors.textSecondary}
              value={name}
              onChangeText={setName}
              onBlur={handleSaveProfile}
            />
          </View>
          <View className="flex-row gap-4">
            <View className="flex-1">
              <Text style={{ color: colors.textSecondary }} className="text-xs mb-1">Age</Text>
              <TextInput 
                className="px-3 py-3 rounded-lg border"
                style={{ 
                  backgroundColor: colors.input, 
                  color: colors.text,
                  borderColor: colors.border
                }}
                placeholder="Years"
                placeholderTextColor={colors.textSecondary}
                keyboardType="number-pad" 
                value={age}
                onChangeText={handleAgeChange}
                onBlur={handleSaveProfile}
              />
            </View>
            <View className="flex-1">
              <Text style={{ color: colors.textSecondary }} className="text-xs mb-1">Gender</Text>
              {/* Gender Dropdown Trigger */}
              <TouchableOpacity
                onPress={() => setGenderPickerVisible(true)}
                className="px-3 py-3 rounded-lg border flex-row justify-between items-center"
                style={{ 
                  backgroundColor: colors.input, 
                  borderColor: colors.border
                }}
              >
                <Text style={{ color: gender ? colors.text : colors.textSecondary }}>
                  {gender || "Select"}
                </Text>
                <MaterialIcons name="arrow-drop-down" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

         {/* THEME SECTION */}
         <Text 
            style={{ color: colors.textSecondary }} 
            className="text-xs font-bold uppercase tracking-wider mb-2"
          >
            Appearance
          </Text>
          <View style={{ backgroundColor: colors.card, borderColor: colors.border }} className="rounded-xl p-2 border mb-6">
            <ThemeOption label="Dynamic (Time based)" value="dynamic" icon="schedule" />
            <ThemeOption label="Dark Mode" value="dark" icon="dark-mode" />
            <ThemeOption label="Light Mode" value="light" icon="light-mode" />
            <ThemeOption label="Sunset Mode" value="sunset" icon="wb-twilight" />
          </View>

        {/* Data Management Section */}
        <Text 
          style={{ color: colors.textSecondary }} 
          className="text-xs font-bold uppercase tracking-wider mb-2"
        >
          Data Management
        </Text>
        
        <View 
          className="rounded-xl overflow-hidden border mb-6"
          style={{ backgroundColor: colors.card, borderColor: colors.border }}
        >
          
          {/* Export */}
          <TouchableOpacity 
            onPress={handleExport}
            className="flex-row items-center justify-between p-4 border-b"
            style={{ 
                backgroundColor: colors.card, 
                borderColor: colors.border 
            }}
          >
            <View className="flex-row items-center gap-3">
              <View className="w-8 h-8 rounded-full bg-blue-500/20 items-center justify-center">
                <MaterialIcons name="file-download" size={18} color="#60a5fa" />
              </View>
              <View>
                <Text style={{ color: colors.text }} className="font-semibold">Export JSON Backup</Text>
                <Text style={{ color: colors.textSecondary }} className="text-xs">Save your dreams as text</Text>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={colors.textSecondary} />
          </TouchableOpacity>

          {/* Import */}
          <TouchableOpacity 
            onPress={handleImport}
            disabled={isLoading}
            className="flex-row items-center justify-between p-4"
            style={{ backgroundColor: colors.card }}
          >
            <View className="flex-row items-center gap-3">
              <View className="w-8 h-8 rounded-full bg-green-500/20 items-center justify-center">
                {isLoading ? (
                   <ActivityIndicator size="small" color="#4ade80" />
                ) : (
                   <MaterialIcons name="file-upload" size={18} color="#4ade80" />
                )}
              </View>
              <View>
                <Text style={{ color: colors.text }} className="font-semibold">Import Backup</Text>
                <Text style={{ color: colors.textSecondary }} className="text-xs">Restore from JSON file</Text>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Danger Zone */}
        <Text className="text-red-400 text-xs font-bold uppercase tracking-wider mb-2">Danger Zone</Text>
        <View className="bg-red-500/5 rounded-xl overflow-hidden border border-red-500/20">
          <TouchableOpacity 
            onPress={handleClear}
            className="flex-row items-center justify-between p-4 active:bg-red-500/10"
          >
            <View className="flex-row items-center gap-3">
              <View className="w-8 h-8 rounded-full bg-red-500/20 items-center justify-center">
                <MaterialIcons name="delete-forever" size={18} color="#f87171" />
              </View>
              <View>
                <Text className="text-red-400 font-semibold">Delete All Data</Text>
                <Text className="text-red-400/60 text-xs">This action cannot be undone</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        <Text style={{ color: colors.textSecondary }} className="text-center text-xs mt-8 pb-8">
          Dream Journal MVP v1.1.0
        </Text>

      </ScrollView>

      {/* Gender Selection Modal */}
      <Modal
        visible={isGenderPickerVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setGenderPickerVisible(false)}
      >
        <TouchableOpacity 
          activeOpacity={1} 
          onPress={() => setGenderPickerVisible(false)}
          className="flex-1 bg-black/60 justify-center items-center px-6"
        >
          <View 
            className="w-full rounded-xl p-2 border"
            style={{ backgroundColor: colors.card, borderColor: colors.border }}
          >
            <Text style={{ color: colors.textSecondary }} className="text-xs font-bold uppercase tracking-wider p-4">Select Gender</Text>
            {GENDER_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option}
                onPress={() => {
                  setGender(option);
                  handleSaveProfile(); 
                  setGenderPickerVisible(false);
                }}
                className="p-4 border-t"
                style={{ borderColor: colors.border }}
              >
                <Text style={{ color: gender === option ? colors.primary : colors.text, fontWeight: gender === option ? 'bold' : 'normal' }}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity 
              onPress={() => setGenderPickerVisible(false)}
              className="p-4 mt-2 items-center"
            >
              <Text style={{ color: colors.textSecondary }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

    </SafeAreaView>
  );
}