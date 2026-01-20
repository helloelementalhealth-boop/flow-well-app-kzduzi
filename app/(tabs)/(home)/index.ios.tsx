
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
  KeyboardAvoidingView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Stack } from 'expo-router';
import { colors, moodColors, commonStyles } from '@/styles/commonStyles';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { journalApi } from '@/utils/api';

type Mood = 'calm' | 'energized' | 'reflective' | 'restless' | 'grateful' | 'uncertain';

const moods: { value: Mood; label: string; emoji: string }[] = [
  { value: 'calm', label: 'Calm', emoji: '🌊' },
  { value: 'energized', label: 'Energized', emoji: '⚡' },
  { value: 'reflective', label: 'Reflective', emoji: '🌙' },
  { value: 'restless', label: 'Restless', emoji: '🌪️' },
  { value: 'grateful', label: 'Grateful', emoji: '🌸' },
  { value: 'uncertain', label: 'Uncertain', emoji: '🌫️' },
];

export default function HomeScreen() {
  console.log('HomeScreen (iOS): Rendering journal screen');
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? colors.dark : colors.light;

  const [content, setContent] = useState('');
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [energy, setEnergy] = useState<number>(3);
  const [intention, setIntention] = useState('');
  const [showIntention, setShowIntention] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleMoodSelect = (mood: Mood) => {
    console.log('User selected mood:', mood);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedMood(mood);
  };

  const handleEnergySelect = (level: number) => {
    console.log('User selected energy level:', level);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEnergy(level);
  };

  const handleSave = async () => {
    console.log('User tapped Save button', { content, selectedMood, energy, intention });
    
    if (!content.trim()) {
      Alert.alert('Error', 'Please write something before saving');
      return;
    }

    setIsSaving(true);
    
    try {
      // Create journal entry via API
      const entry = await journalApi.createEntry({
        content: content.trim(),
        mood: selectedMood || undefined,
        energy,
        intention: intention.trim() || undefined,
      });

      console.log('Journal entry created successfully:', entry);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Show success message
      Alert.alert('Success', 'Your journal entry has been saved', [
        { text: 'OK', onPress: () => console.log('Success alert dismissed') }
      ]);
      
      // Reset form
      setContent('');
      setSelectedMood(null);
      setEnergy(3);
      setIntention('');
      setShowIntention(false);
    } catch (error) {
      console.error('Failed to save journal entry:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      Alert.alert(
        'Error',
        'Failed to save your journal entry. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSaving(false);
    }
  };

  const canSave = content.trim().length > 0;

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerLargeTitle: true,
          headerTitle: 'Journal',
          headerTransparent: false,
          headerBlurEffect: scheme === 'dark' ? 'dark' : 'light',
          headerStyle: {
            backgroundColor: theme.background,
          },
        }}
      />
      <KeyboardAvoidingView 
        behavior="padding"
        style={[styles.container, { backgroundColor: theme.background }]}
        keyboardVerticalOffset={0}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <Animated.View entering={FadeIn.duration(600)} style={styles.header}>
            <Text style={[styles.greeting, { color: theme.text }]}>
              How are you feeling?
            </Text>
            <Text style={[styles.subgreeting, { color: theme.textSecondary }]}>
              Take a moment to reflect
            </Text>
          </Animated.View>

          {/* Mood Selection */}
          <Animated.View entering={FadeInDown.delay(100).duration(600)} style={styles.section}>
            <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
              YOUR MOOD
            </Text>
            <View style={styles.moodGrid}>
              {moods.map((mood, index) => (
                <React.Fragment key={mood.value}>
                  <TouchableOpacity
                    onPress={() => handleMoodSelect(mood.value)}
                    style={[
                      styles.moodButton,
                      { 
                        backgroundColor: selectedMood === mood.value 
                          ? moodColors[mood.value] 
                          : theme.card,
                        borderColor: selectedMood === mood.value 
                          ? moodColors[mood.value]
                          : theme.border,
                      },
                    ]}
                  >
                    <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                    <Text 
                      style={[
                        styles.moodLabel, 
                        { 
                          color: selectedMood === mood.value 
                            ? '#FFFFFF' 
                            : theme.text 
                        }
                      ]}
                    >
                      {mood.label}
                    </Text>
                  </TouchableOpacity>
                </React.Fragment>
              ))}
            </View>
          </Animated.View>

          {/* Energy Level */}
          <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.section}>
            <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
              ENERGY LEVEL
            </Text>
            <View style={styles.energyContainer}>
              {[1, 2, 3, 4, 5].map((level, index) => (
                <React.Fragment key={level}>
                  <TouchableOpacity
                    onPress={() => handleEnergySelect(level)}
                    style={[
                      styles.energyDot,
                      {
                        backgroundColor: level <= energy ? theme.primary : theme.card,
                        borderColor: level <= energy ? theme.primary : theme.border,
                        transform: [{ scale: level <= energy ? 1 : 0.85 }],
                      },
                    ]}
                  />
                </React.Fragment>
              ))}
            </View>
            <View style={styles.energyLabels}>
              <Text style={[styles.energyLabel, { color: theme.textSecondary }]}>Low</Text>
              <Text style={[styles.energyLabel, { color: theme.textSecondary }]}>High</Text>
            </View>
          </Animated.View>

          {/* Journal Entry */}
          <Animated.View entering={FadeInDown.delay(300).duration(600)} style={styles.section}>
            <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
              YOUR THOUGHTS
            </Text>
            <TextInput
              style={[
                styles.textArea,
                {
                  backgroundColor: theme.card,
                  color: theme.text,
                  borderColor: theme.border,
                },
              ]}
              placeholder="What's on your mind today?"
              placeholderTextColor={theme.textSecondary}
              multiline
              numberOfLines={8}
              value={content}
              onChangeText={setContent}
              textAlignVertical="top"
            />
          </Animated.View>

          {/* Intention (Optional) */}
          {!showIntention ? (
            <Animated.View entering={FadeInDown.delay(400).duration(600)}>
              <TouchableOpacity
                onPress={() => {
                  console.log('User tapped Add Intention button');
                  setShowIntention(true);
                }}
                style={styles.addIntentionButton}
              >
                <Text style={[styles.addIntentionText, { color: theme.primary }]}>
                  + Set an intention
                </Text>
              </TouchableOpacity>
            </Animated.View>
          ) : (
            <Animated.View entering={FadeInDown.duration(400)} style={styles.section}>
              <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
                TODAY'S INTENTION
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.card,
                    color: theme.text,
                    borderColor: theme.border,
                  },
                ]}
                placeholder="What do you want to focus on?"
                placeholderTextColor={theme.textSecondary}
                value={intention}
                onChangeText={setIntention}
              />
            </Animated.View>
          )}

          {/* Save Button */}
          <Animated.View entering={FadeInDown.delay(500).duration(600)} style={styles.saveContainer}>
            <TouchableOpacity
              onPress={handleSave}
              disabled={!canSave || isSaving}
              style={[
                styles.saveButton,
                {
                  backgroundColor: canSave && !isSaving ? theme.primary : theme.border,
                  opacity: canSave && !isSaving ? 1 : 0.5,
                },
              ]}
            >
              {isSaving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.saveButtonText}>
                  Save Entry
                </Text>
              )}
            </TouchableOpacity>
          </Animated.View>

          {/* Bottom spacing */}
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    marginBottom: 32,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '600',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subgreeting: {
    fontSize: 16,
    lineHeight: 24,
  },
  section: {
    marginBottom: 28,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  moodButton: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  moodEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  moodLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  energyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  energyDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
  },
  energyLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  energyLabel: {
    fontSize: 12,
  },
  textArea: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    fontSize: 16,
    lineHeight: 24,
    minHeight: 160,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    fontSize: 16,
  },
  addIntentionButton: {
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 28,
  },
  addIntentionText: {
    fontSize: 15,
    fontWeight: '600',
  },
  saveContainer: {
    marginTop: 8,
    marginBottom: 20,
  },
  saveButton: {
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
