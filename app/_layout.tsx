import './global.css'; // <--- MUST BE LINE 1
import 'react-native-reanimated'; // <--- MUST BE LINE 2
import { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { DreamProvider } from '../components/DreamContext';
import { ThemeProvider, useTheme } from '../components/ThemeContext';

// 1. Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack 
        screenOptions={{ 
          headerShown: false,
          contentStyle: { backgroundColor: colors.background }, 
          animation: 'slide_from_right',
          headerStyle: { backgroundColor: colors.background }
        }} 
      />
    </View>
  );
}

export default function Layout() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // 2. Perform any heavy lifting here (Database init is handled in Context, 
        // but we can add a small artificial delay or font loading here if needed)
        
        // Example: If you were loading custom fonts, you'd do it here.
        // await Font.loadAsync({ ... });
        
        // For now, we just wait a tick to ensure Context mounts
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (e) {
        console.warn(e);
      } finally {
        // 3. Tell the app it's ready
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      // 4. Hide the splash screen immediately when the UI is mounted
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <DreamProvider>
        <ThemeProvider> 
             <RootLayoutNav /> 
        </ThemeProvider>
      </DreamProvider>
    </View>
  );

//   return (
//     // 5. Wrap everything in a View to attach the onLayout handler
//     // FIX: Added backgroundColor: '#101322' to prevent white flash during navigation
//     <View style={{ flex: 1, backgroundColor: '#101322' }} onLayout={onLayoutRootView}>
//       <DreamProvider>
//         <Stack 
//           screenOptions={{ 
//             headerShown: false,
//             // Ensure transitions look smooth on dark backgrounds
//             contentStyle: { backgroundColor: '#101322' }, 
//             animation: 'slide_from_right',
//             // Ensure headers (if they ever appear) are also dark
//             headerStyle: { backgroundColor: '#101322' }
//           }} 
//         />
//         {/* Global Status Bar Config */}
//         <StatusBar style="light" backgroundColor="#101322" />
//       </DreamProvider>
//     </View>
//   );
}