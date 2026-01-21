
import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import AnimatedHello from '@/components/AnimatedHello';
import { useTheme } from '@/contexts/WidgetContext';

export default function OpeningScreen() {
  const router = useRouter();
  const { currentTheme: theme } = useTheme();
  const [hasNavigated, setHasNavigated] = useState(false);

  useEffect(() => {
    console.log('[OpeningScreen] Eluminate animation started');
    
    // Navigate to main app after animation completes (4240ms total: 2000ms pathway + 640ms letters + 600ms subtitle)
    const timer = setTimeout(() => {
      if (!hasNavigated) {
        console.log('[OpeningScreen] Animation complete, navigating to home');
        setHasNavigated(true);
        router.replace('/(tabs)/(home)/');
      }
    }, 4240);

    return () => {
      clearTimeout(timer);
    };
  }, [router, hasNavigated]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <AnimatedHello color={theme.primary} secondaryColor={theme.textSecondary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
