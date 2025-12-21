import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StatusBar, Share, Alert, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useDreams } from '../components/DreamContext';

export default function SettingsScreen() {
  const router = useRouter();
  const { dreams, userProfile, updateUserProfile, clearAllData, importData } = useDreams();
  const [isLoading, setIsLoading] = useState(false);

  // Local state for inputs
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');

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

  // 1. Export Logic
  const handleExport = async () => {
  try {
    if (dreams.length === 0) {
      Alert.alert("No Data", "You have no dreams to export yet.");
      return;
    }

    // 1. Create a file path
    const fileName = `DreamJournal_Backup_${new Date().toISOString().split('T')[0]}.json`;
    const fileUri = FileSystem.documentDirectory + fileName;

    // 2. Write the JSON string to that file
    const dataStr = JSON.stringify(dreams, null, 2);
    await FileSystem.writeAsStringAsync(fileUri, dataStr, {
      encoding: FileSystem.EncodingType.UTF8
    });

    // 3. Share the FILE (not just text)
    // This forces the OS to treat it as a document, enabling "Save to Files"
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
    <SafeAreaView className="flex-1 bg-background-dark">
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-[#111218] border-b border-white/5">
        <TouchableOpacity onPress={() => router.back()} className="flex-row items-center">
          <MaterialIcons name="arrow-back" size={24} color="#9da1b9" />
          <Text className="text-text-secondary ml-1 font-medium">Back</Text>
        </TouchableOpacity>
        <Text className="text-white font-bold text-lg">Settings</Text>
        <View className="w-16" />
      </View>

      <ScrollView className="flex-1 p-4">
        
        {/* User Profile Section */}
        <Text className="text-text-secondary text-xs font-bold uppercase tracking-wider mb-3 ml-1">My Profile</Text>
        <View className="bg-card-dark rounded-xl p-4 border border-white/5 mb-6 gap-4">
          <View>
            <Text className="text-text-secondary text-xs mb-1">Name</Text>
            <TextInput 
              className="bg-[#111218] text-white px-3 py-3 rounded-lg border border-white/5"
              placeholder="How should we call you?"
              placeholderTextColor="#4b5563"
              value={name}
              onChangeText={setName}
              onBlur={handleSaveProfile}
            />
          </View>
          <View className="flex-row gap-4">
            <View className="flex-1">
              <Text className="text-text-secondary text-xs mb-1">Age</Text>
              <TextInput 
                className="bg-[#111218] text-white px-3 py-3 rounded-lg border border-white/5"
                placeholder="Years"
                placeholderTextColor="#4b5563"
                keyboardType="numeric"
                value={age}
                onChangeText={setAge}
                onBlur={handleSaveProfile}
              />
            </View>
            <View className="flex-1">
              <Text className="text-text-secondary text-xs mb-1">Gender</Text>
              <TextInput 
                className="bg-[#111218] text-white px-3 py-3 rounded-lg border border-white/5"
                placeholder="Optional"
                placeholderTextColor="#4b5563"
                value={gender}
                onChangeText={setGender}
                onBlur={handleSaveProfile}
              />
            </View>
          </View>
        </View>

        {/* Data Management Section */}
        <Text className="text-text-secondary text-xs font-bold uppercase tracking-wider mb-3 ml-1">Data Management</Text>
        
        <View className="bg-card-dark rounded-xl overflow-hidden border border-white/5 mb-6">
          
          {/* Export */}
          <TouchableOpacity 
            onPress={handleExport}
            className="flex-row items-center justify-between p-4 bg-white/5 active:bg-white/10 border-b border-white/5"
          >
            <View className="flex-row items-center gap-3">
              <View className="w-8 h-8 rounded-full bg-blue-500/20 items-center justify-center">
                <MaterialIcons name="file-download" size={18} color="#60a5fa" />
              </View>
              <View>
                <Text className="text-white font-semibold">Export JSON Backup</Text>
                <Text className="text-text-secondary text-xs">Save your dreams as text</Text>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#4b5563" />
          </TouchableOpacity>

          {/* Import */}
          <TouchableOpacity 
            onPress={handleImport}
            disabled={isLoading}
            className="flex-row items-center justify-between p-4 bg-white/5 active:bg-white/10"
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
                <Text className="text-white font-semibold">Import Backup</Text>
                <Text className="text-text-secondary text-xs">Restore from JSON file</Text>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#4b5563" />
          </TouchableOpacity>
        </View>

        {/* Danger Zone */}
        <Text className="text-red-400 text-xs font-bold uppercase tracking-wider mb-3 ml-1">Danger Zone</Text>
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

        <Text className="text-text-secondary text-center text-xs mt-8">
          Dream Journal MVP v1.1.0
        </Text>

      </ScrollView>
    </SafeAreaView>
  );
}