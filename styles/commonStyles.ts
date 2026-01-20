
import { StyleSheet } from 'react-native';

// Dynamic color theme interface
export interface ColorTheme {
  background: string;
  card: string;
  text: string;
  textSecondary: string;
  primary: string;
  secondary: string;
  accent: string;
  highlight: string;
  border: string;
  shadow: string;
  success: string;
  warning: string;
  error: string;
}

// Predefined color themes - these match the backend seeded themes
export const colorThemes: Record<string, { light: ColorTheme; dark: ColorTheme }> = {
  warmEarth: {
    light: {
      background: '#E8E4DF',
      card: '#F5F3F0',
      text: '#2A2826',
      textSecondary: '#6B6662',
      primary: '#8B7355',
      secondary: '#A89B8E',
      accent: '#6D5D4B',
      highlight: '#D4CEC7',
      border: '#C9C3BC',
      shadow: 'rgba(0, 0, 0, 0.12)',
      success: '#7A8B6F',
      warning: '#B89968',
      error: '#A67B6B',
    },
    dark: {
      background: '#1A1816',
      card: '#252321',
      text: '#E8E4DF',
      textSecondary: '#8B8580',
      primary: '#A89B8E',
      secondary: '#3A3632',
      accent: '#C4B5A6',
      highlight: '#2F2D2A',
      border: '#3A3632',
      shadow: 'rgba(0, 0, 0, 0.4)',
      success: '#8B9B7F',
      warning: '#C4A876',
      error: '#B88B7B',
    },
  },
  softPastels: {
    light: {
      background: '#F5F0F6',
      card: '#FDFBFD',
      text: '#3A2E3F',
      textSecondary: '#7A6B7F',
      primary: '#B89BB8',
      secondary: '#D4C4D4',
      accent: '#9B7B9B',
      highlight: '#E8DFE8',
      border: '#D9CFD9',
      shadow: 'rgba(155, 123, 155, 0.15)',
      success: '#8BA88B',
      warning: '#C4A89B',
      error: '#B88B9B',
    },
    dark: {
      background: '#2A1F2E',
      card: '#3A2F3E',
      text: '#F5F0F6',
      textSecondary: '#A89BA8',
      primary: '#C4A8C4',
      secondary: '#4A3F4E',
      accent: '#D4B8D4',
      highlight: '#3F343F',
      border: '#4A3F4E',
      shadow: 'rgba(0, 0, 0, 0.4)',
      success: '#9BB89B',
      warning: '#D4B8A8',
      error: '#C49BA8',
    },
  },
  deepGrounding: {
    light: {
      background: '#D9D4CF',
      card: '#E8E4DF',
      text: '#1F2A1F',
      textSecondary: '#5A6B5A',
      primary: '#5A6B4B',
      secondary: '#7A8B6F',
      accent: '#4B5A3A',
      highlight: '#C9C4BF',
      border: '#B9B4AF',
      shadow: 'rgba(31, 42, 31, 0.15)',
      success: '#6B8B5A',
      warning: '#A89B6B',
      error: '#9B6B5A',
    },
    dark: {
      background: '#1A1F1A',
      card: '#2A2F2A',
      text: '#E8E4DF',
      textSecondary: '#8B9B8B',
      primary: '#7A8B6F',
      secondary: '#3A4A3A',
      accent: '#9BAB8B',
      highlight: '#2F3A2F',
      border: '#3A4A3A',
      shadow: 'rgba(0, 0, 0, 0.5)',
      success: '#8BAB7A',
      warning: '#B8AB8B',
      error: '#AB8B7A',
    },
  },
  neutralCalm: {
    light: {
      background: '#EFEFEF',
      card: '#FAFAFA',
      text: '#2A2A2A',
      textSecondary: '#6B6B6B',
      primary: '#8B8B8B',
      secondary: '#ABABAB',
      accent: '#5A5A5A',
      highlight: '#DFDFDF',
      border: '#CFCFCF',
      shadow: 'rgba(0, 0, 0, 0.1)',
      success: '#7A9B7A',
      warning: '#B8A87A',
      error: '#A87A7A',
    },
    dark: {
      background: '#1A1A1A',
      card: '#2A2A2A',
      text: '#EFEFEF',
      textSecondary: '#9B9B9B',
      primary: '#ABABAB',
      secondary: '#3A3A3A',
      accent: '#CBCBCB',
      highlight: '#2F2F2F',
      border: '#3A3A3A',
      shadow: 'rgba(0, 0, 0, 0.4)',
      success: '#8BAB8B',
      warning: '#C4B88B',
      error: '#B88B8B',
    },
  },
  energizingDawn: {
    light: {
      background: '#F9EFE5',
      card: '#FFF8F0',
      text: '#3A2A1F',
      textSecondary: '#7A5A4B',
      primary: '#D4A574',
      secondary: '#E8C4A4',
      accent: '#B88B5A',
      highlight: '#F4E4D4',
      border: '#E4D4C4',
      shadow: 'rgba(212, 165, 116, 0.15)',
      success: '#A8B88B',
      warning: '#E8B87A',
      error: '#D48B7A',
    },
    dark: {
      background: '#2A1F16',
      card: '#3A2F26',
      text: '#F9EFE5',
      textSecondary: '#B89B7A',
      primary: '#E8B88B',
      secondary: '#4A3F36',
      accent: '#F4C49B',
      highlight: '#3F342B',
      border: '#4A3F36',
      shadow: 'rgba(0, 0, 0, 0.4)',
      success: '#B8C49B',
      warning: '#F4C88B',
      error: '#E89B8B',
    },
  },
};

// Default colors (Warm Earth theme)
export const colors = colorThemes.warmEarth;

// Mood colors for journaling - muted and natural
export const moodColors = {
  calm: '#7A8B9B',        // Muted blue-gray
  energized: '#C4A876',   // Warm ochre
  reflective: '#8B7A9B',  // Muted purple-gray
  restless: '#B88B7B',    // Soft terracotta
  grateful: '#8B9B7F',    // Muted sage
  uncertain: '#9B8B7A',   // Neutral taupe
};

// Practice type colors for meditation
export const practiceColors = {
  breathwork: '#7A8B9B',
  mindfulness: '#8B9B7F',
  body_scan: '#9B8B7A',
  loving_kindness: '#B88B7B',
  gratitude: '#C4A876',
};

// Workout type colors
export const workoutColors = {
  strength: '#8B7355',
  cardio: '#B88B7B',
  flexibility: '#8B9B7F',
  sports: '#7A8B9B',
};

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
  },
});
