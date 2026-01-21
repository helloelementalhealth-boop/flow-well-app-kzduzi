
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { colors, moodColors } from '@/styles/commonStyles';
import { journalApi, Mood } from '@/utils/api';
import { IconSymbol } from '@/components/IconSymbol';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/contexts/WidgetContext';

const moods: { value: Mood; label: string; emoji: string }[] = [
  { value: 'calm', label: 'Calm', emoji: '🌊' },
  { value: 'energized', label: 'Energized', emoji: '⚡' },
  { value: 'reflective', label: 'Reflective', emoji: '🌙' },
  { value: 'restless', label: 'Restless', emoji: '🌪️' },
  { value: 'grateful', label: 'Grateful', emoji: '🌸' },
  { value: 'uncertain', label: 'Uncertain', emoji: '🌫️' },
];

export default function NewEntryScreen() {
  console.log('[NewEntryScreen] Rendering journal entry form');
  const { currentTheme: theme } = useTheme();
  const router = useRouter();

  const [content, setContent] = useState('');
  const [selectedMood, setSelectedMood] = useState<Mood | undefined>(undefined);
  const [energy, setEnergy] = useState<number>(3);
  const [intention, setIntention] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!content.trim()) {
      Alert.alert('Content Required', 'Please write something in your journal entry.');
      return;
    }

    console.log('[NewEntryScreen] User tapped Save - creating journal entry');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSaving(true);

    try {
      await journalApi.createEntry({
        content: content.trim(),
        mood: selectedMood,
        energy,
        intention: intention.trim() || undefined,
      });

      console.log('[NewEntryScreen] Journal entry created successfully');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success', 'Your journal entry has been saved.', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error('[NewEntryScreen] Failed to create entry:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Failed to save your journal entry. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const contentPlaceholder = 'What are you feeling today? Write your thoughts, reflections, or anything on your mind...';
  const intentionPlaceholder = 'Set an intention for today (optional)';
  const saveButtonText = 'Save Entry';
  const savingText = 'Saving...';
  const moodSectionTitle = 'How are you feeling?';
  const energySectionTitle = 'Energy Level';
  const intentionSectionTitle = 'Today\'s Intention';
  const reflectionSectionTitle = 'Your Reflection';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'New Journal Entry',
          headerStyle: { backgroundColor: theme.background },
          headerTintColor: theme.text,
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => {
                console.log('[NewEntryScreen] User tapped Cancel');
                router.back();
              }}
              style={{ marginLeft: Platform.OS === 'ios' ? 0 : 16 }}
            >
              <Text style={[styles.cancelText, { color: theme.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              onPress={handleSave}
              disabled={isSaving || !content.trim()}
              style={{ marginRight: Platform.OS === 'ios' ? 0 : 16 }}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color={theme.primary} />
              ) : (
                <Text
                  style={[
                    styles.saveText,
                    { color: content.trim() ? theme.primary : theme.textSecondary },
                  ]}
                >
                  {saveButtonText}
                </Text>
              )}
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, Platform.OS === 'android' && { paddingTop: 16 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Mood Selection */}
        <Animated.View entering={FadeInDown.delay(0).duration(400)} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>{moodSectionTitle}</Text>
          <View style={styles.moodGrid}>
            {moods.map((mood, index) => {
              const isSelected = selectedMood === mood.value;
              return (
                <TouchableOpacity
                  key={mood.value}
                  onPress={() => {
                    console.log('[NewEntryScreen] User selected mood:', mood.label);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedMood(mood.value);
                  }}
                  style={[
                    styles.moodButton,
                    {
                      backgroundColor: isSelected ? moodColors[mood.value] : theme.card,
                      borderColor: isSelected ? moodColors[mood.value] : theme.border,
                    },
                  ]}
                  activeOpacity={0.7}
                >
                  <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                  <Text
                    style={[
                      styles.moodLabel,
                      { color: isSelected ? '#FFFFFF' : theme.text },
                    ]}
                  >
                    {mood.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>

        {/* Energy Level */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>{energySectionTitle}</Text>
          <View style={styles.energyContainer}>
            {[1, 2, 3, 4, 5].map((level) => (
              <TouchableOpacity
                key={level}
                onPress={() => {
                  console.log('[NewEntryScreen] User set energy level:', level);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setEnergy(level);
                }}
                style={[
                  styles.energyButton,
                  {
                    backgroundColor: energy >= level ? theme.primary : theme.card,
                    borderColor: energy >= level ? theme.primary : theme.border,
                  },
                ]}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.energyText,
                    { color: energy >= level ? '#FFFFFF' : theme.textSecondary },
                  ]}
                >
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={[styles.energyHint, { color: theme.textSecondary }]}>
            1 = Low Energy, 5 = High Energy
          </Text>
        </Animated.View>

        {/* Intention */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>{intentionSectionTitle}</Text>
          <TextInput
            style={[
              styles.intentionInput,
              {
                backgroundColor: theme.card,
                color: theme.text,
                borderColor: theme.border,
              },
            ]}
            value={intention}
            onChangeText={setIntention}
            placeholder={intentionPlaceholder}
            placeholderTextColor={theme.textSecondary}
            multiline
            numberOfLines={2}
          />
        </Animated.View>

        {/* Journal Content */}
        <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>{reflectionSectionTitle}</Text>
          <TextInput
            style={[
              styles.contentInput,
              {
                backgroundColor: theme.card,
                color: theme.text,
                borderColor: theme.border,
              },
            ]}
            value={content}
            onChangeText={setContent}
            placeholder={contentPlaceholder}
            placeholderTextColor={theme.textSecondary}
            multiline
            numberOfLines={10}
            textAlignVertical="top"
          />
        </Animated.View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
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
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  cancelText: {
    fontSize: 16,
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  moodButton: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  moodEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  moodLabel: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  energyContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  energyButton: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  energyText: {
    fontSize: 20,
    fontWeight: '700',
  },
  energyHint: {
    fontSize: 13,
    textAlign: 'center',
  },
  intentionInput: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    fontSize: 16,
    minHeight: 80,
  },
  contentInput: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    fontSize: 16,
    minHeight: 200,
  },
});
