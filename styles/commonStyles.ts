
import { StyleSheet } from 'react-native';

// Wellness-focused color palette with warm, calming tones
export const colors = {
  // Light theme - warm, breathable
  light: {
    background: '#FBF9F6',        // Warm off-white
    card: '#FFFFFF',              // Pure white for cards
    text: '#2C2C2E',              // Soft black
    textSecondary: '#8E8E93',     // Muted gray
    primary: '#D4A574',           // Warm terracotta
    secondary: '#E8D5C4',         // Soft sand
    accent: '#B8956A',            // Deep earth
    highlight: '#F4E8DC',         // Gentle cream
    border: '#E5E5EA',            // Subtle border
    shadow: 'rgba(0, 0, 0, 0.08)',
  },
  // Dark theme - deep, grounding
  dark: {
    background: '#1C1C1E',        // Deep charcoal
    card: '#2C2C2E',              // Elevated surface
    text: '#F2F2F7',              // Soft white
    textSecondary: '#98989D',     // Muted gray
    primary: '#D4A574',           // Warm terracotta (consistent)
    secondary: '#4A4A4C',         // Deep gray
    accent: '#E8C9A8',            // Light earth
    highlight: '#3A3A3C',         // Subtle highlight
    border: '#38383A',            // Subtle border
    shadow: 'rgba(0, 0, 0, 0.3)',
  },
};

// Mood colors for journaling
export const moodColors = {
  calm: '#A8C5DD',        // Soft blue
  energized: '#F4C95D',   // Warm yellow
  reflective: '#B8A8D4',  // Gentle purple
  restless: '#E89B9B',    // Soft coral
  grateful: '#A8D4B8',    // Gentle green
  uncertain: '#C4B5A8',   // Neutral beige
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
