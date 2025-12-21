import './global.css'; // <--- MUST BE LINE 1
import 'react-native-reanimated'; // <--- MUST BE LINE 2

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { DreamProvider } from '../components/DreamContext';

export default function Layout() {
  return (
    <DreamProvider>
    <View style={{ flex: 1, backgroundColor: '#101322' }}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#101322' },
          animation: 'fade',
        }}
      />
    </View>
    </DreamProvider>
  );
}