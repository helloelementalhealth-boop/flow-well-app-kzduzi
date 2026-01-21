
import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import AnimatedHello from '@/components/AnimatedHello';
import { useTheme } from '@/contexts/WidgetContext';

export default function OpeningScreen() {
  const router = useRouter();
  const { currentTheme: theme } = useTheme();
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    console.log('[OpeningScreen] Eluminate butterfly animation started');
    
    // Navigate to main app after animation completes (2.4 seconds total animation time)
    const timer = setTimeout(() => {
      console.log('[OpeningScreen] Animation complete, navigating to home');
      setAnimationComplete(true);
      router.replace('/(tabs)/(home)/');
    }, 2400);

    return () => clearTimeout(timer);
  }, [router]);

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
