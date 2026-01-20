
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Stack, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { IconSymbol } from '@/components/IconSymbol';
import { useTheme } from '@/contexts/WidgetContext';
import { colorThemes } from '@/styles/commonStyles';

export default function ThemeSettingsScreen() {
  const colorScheme = useColorScheme();
  const { currentTheme: theme, themeName, autoThemeByTime, availableThemes, setTheme, toggleAutoTheme } = useTheme();
  const router = useRouter();

  const themeDisplayNames: Record<string, string> = {
    warmEarth: 'Warm Earth',
    softPastels: 'Soft Pastels',
    deepGrounding: 'Deep Grounding',
    neutralCalm: 'Neutral Calm',
    energizingDawn: 'Energizing Dawn',
  };

  const themeDescriptions: Record<string, string> = {
    warmEarth: 'Muted browns and taupes for grounded warmth',
    softPastels: 'Gentle pinks, lavenders, and soft blues',
    deepGrounding: 'Dark earth tones and deep greens',
    neutralCalm: 'Timeless grays and subtle beiges',
    energizingDawn: 'Warm oranges, yellows, and peachy tones',
  };

  const handleThemeSelect = async (newTheme: string) => {
    console.log('[ThemeSettings] User selected theme:', newTheme);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await setTheme(newTheme);
  };

  const handleToggleAutoTheme = async () => {
    console.log('[ThemeSettings] User toggled auto theme');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await toggleAutoTheme();
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Visual Themes',
          headerStyle: { backgroundColor: theme.background },
          headerTintColor: theme.text,
          headerShadowVisible: false,
        }}
      />
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['bottom']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Auto Theme Toggle */}
          <Animated.View entering={FadeInDown.duration(400)} style={[styles.section, { backgroundColor: theme.card }]}>
            <View style={styles.autoThemeHeader}>
              <View style={styles.autoThemeInfo}>
                <Text style={[styles.autoThemeTitle, { color: theme.text }]}>
                  Auto Theme by Time
                </Text>
                <Text style={[styles.autoThemeDescription, { color: theme.textSecondary }]}>
                  Theme shifts throughout the day to match your energy
                </Text>
              </View>
              <Switch
                value={autoThemeByTime}
                onValueChange={handleToggleAutoTheme}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
          </Animated.View>

          {/* Theme Selection */}
          <View style={styles.themesSection}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Choose Your Theme
            </Text>
            <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
              Select a color palette that matches your emotional tone
            </Text>

            {availableThemes.map((themeKey, index) => {
              const isSelected = themeName === themeKey;
              const themeColors = colorThemes[themeKey as keyof typeof colorThemes][colorScheme ?? 'light'];
              
              return (
                <Animated.View key={themeKey} entering={FadeInDown.delay(index * 100).duration(400)}>
                  <TouchableOpacity
                    style={[
                      styles.themeCard,
                      { 
                        backgroundColor: theme.card,
                        borderColor: isSelected ? theme.primary : theme.border,
                        borderWidth: isSelected ? 2 : 1,
                      }
                    ]}
                    onPress={() => handleThemeSelect(themeKey)}
                    activeOpacity={0.7}
                    disabled={autoThemeByTime}
                  >
                    <View style={styles.themeInfo}>
                      <Text style={[styles.themeName, { color: theme.text }]}>
                        {themeDisplayNames[themeKey]}
                      </Text>
                      <Text style={[styles.themeDescription, { color: theme.textSecondary }]}>
                        {themeDescriptions[themeKey]}
                      </Text>
                    </View>

                    <View style={styles.colorPalette}>
                      <View style={[styles.colorSwatch, { backgroundColor: themeColors.primary }]} />
                      <View style={[styles.colorSwatch, { backgroundColor: themeColors.secondary }]} />
                      <View style={[styles.colorSwatch, { backgroundColor: themeColors.accent }]} />
                      <View style={[styles.colorSwatch, { backgroundColor: themeColors.success }]} />
                    </View>

                    {isSelected && (
                      <View style={[styles.selectedBadge, { backgroundColor: theme.primary }]}>
                        <IconSymbol
                          ios_icon_name="check"
                          android_material_icon_name="check"
                          size={16}
                          color="#FFFFFF"
                        />
                      </View>
                    )}
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>

          {/* Info Section */}
          <Animated.View entering={FadeInDown.delay(600).duration(400)} style={styles.infoSection}>
            <View style={[styles.infoCard, { backgroundColor: theme.card }]}>
              <IconSymbol
                ios_icon_name="info"
                android_material_icon_name="info"
                size={20}
                color={theme.primary}
              />
              <Text style={[styles.infoText, { color: theme.textSecondary }]}>
                Themes adapt to both light and dark mode. Your selection will be remembered across sessions.
              </Text>
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 120,
  },
  section: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  autoThemeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  autoThemeInfo: {
    flex: 1,
    marginRight: 16,
  },
  autoThemeTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  autoThemeDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  themesSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  sectionSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
  },
  themeCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    position: 'relative',
  },
  themeInfo: {
    marginBottom: 16,
  },
  themeName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  themeDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  colorPalette: {
    flexDirection: 'row',
    gap: 8,
  },
  colorSwatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  infoSection: {
    marginBottom: 24,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});
