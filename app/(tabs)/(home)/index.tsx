
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  RefreshControl,
  Dimensions,
  Platform,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { colors } from '@/styles/commonStyles';
import { dashboardApi, quotesApi, WeeklyQuote } from '@/utils/api';
import { IconSymbol } from '@/components/IconSymbol';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const theme = colors[colorScheme ?? 'light'];
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [overview, setOverview] = useState<any>(null);
  const [weeklyQuote, setWeeklyQuote] = useState<WeeklyQuote | null>(null);
  const [loadingQuote, setLoadingQuote] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const loadOverview = async () => {
    console.log('[HomeScreen] Loading dashboard overview');
    setRefreshing(true);
    try {
      const data = await dashboardApi.getOverview(today);
      setOverview(data);
      console.log('[HomeScreen] Overview loaded:', data);
    } catch (error) {
      console.error('[HomeScreen] Failed to load overview:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const loadWeeklyQuote = async () => {
    console.log('[HomeScreen] Loading weekly quote');
    try {
      const quote = await quotesApi.getCurrentQuote();
      setWeeklyQuote(quote);
      console.log('[HomeScreen] Weekly quote loaded:', quote);
    } catch (error) {
      console.error('[HomeScreen] Failed to load weekly quote:', error);
    }
  };

  const handleRegenerateQuote = async () => {
    console.log('[HomeScreen] User tapped regenerate quote');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoadingQuote(true);
    try {
      const newQuote = await quotesApi.regenerateQuote();
      setWeeklyQuote(newQuote);
      console.log('[HomeScreen] New quote generated:', newQuote);
    } catch (error) {
      console.error('[HomeScreen] Failed to regenerate quote:', error);
    } finally {
      setLoadingQuote(false);
    }
  };

  useEffect(() => {
    loadOverview();
    loadWeeklyQuote();
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={() => {
              loadOverview();
              loadWeeklyQuote();
            }} 
            tintColor={theme.primary} 
          />
        }
      >
        {/* Weekly Quote Hero Section */}
        <Animated.View entering={FadeIn.duration(600)} style={styles.heroSection}>
          <ImageBackground
            source={{ uri: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80' }}
            style={styles.heroBackground}
            imageStyle={styles.heroImage}
          >
            <LinearGradient
              colors={
                colorScheme === 'dark'
                  ? ['rgba(26, 24, 22, 0.7)', 'rgba(26, 24, 22, 0.95)']
                  : ['rgba(232, 228, 223, 0.7)', 'rgba(232, 228, 223, 0.95)']
              }
              style={styles.heroGradient}
            >
              <View style={[styles.header, Platform.OS === 'android' && { paddingTop: 48 }]}>
                <Text style={[styles.greeting, { color: theme.textSecondary }]}>
                  {new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening'}
                </Text>
                <Text style={[styles.appName, { color: theme.text }]}>Hello Wellness</Text>
              </View>

              {weeklyQuote && (
                <View style={styles.quoteContainer}>
                  <Text style={[styles.quoteLabel, { color: theme.textSecondary }]}>
                    This Week's Intention
                  </Text>
                  <Text style={[styles.quoteText, { color: theme.text }]}>
                    "{weeklyQuote.quote_text}"
                  </Text>
                  <TouchableOpacity
                    onPress={handleRegenerateQuote}
                    disabled={loadingQuote}
                    style={[styles.refreshButton, { backgroundColor: theme.card }]}
                    activeOpacity={0.7}
                  >
                    <IconSymbol
                      ios_icon_name="refresh"
                      android_material_icon_name="refresh"
                      size={16}
                      color={theme.primary}
                    />
                    <Text style={[styles.refreshText, { color: theme.primary }]}>
                      {loadingQuote ? 'Generating...' : 'New Intention'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </LinearGradient>
          </ImageBackground>
        </Animated.View>
        {/* Movement Categories */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Movement</Text>
          <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
            Choose what feels right for your body today
          </Text>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.movementScroll}
          >
            <TouchableOpacity
              style={[styles.movementCard, { backgroundColor: theme.card }]}
              onPress={() => {
                console.log('[HomeScreen] User tapped Morning Activation');
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/(tabs)/fitness');
              }}
              activeOpacity={0.8}
            >
              <ImageBackground
                source={{ uri: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=80' }}
                style={styles.movementImage}
                imageStyle={styles.movementImageStyle}
              >
                <LinearGradient
                  colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
                  style={styles.movementGradient}
                >
                  <Text style={styles.movementTitle}>Morning Activation</Text>
                  <Text style={styles.movementDuration}>5-15 min</Text>
                </LinearGradient>
              </ImageBackground>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.movementCard, { backgroundColor: theme.card }]}
              onPress={() => {
                console.log('[HomeScreen] User tapped Restorative Flow');
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/(tabs)/fitness');
              }}
              activeOpacity={0.8}
            >
              <ImageBackground
                source={{ uri: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&q=80' }}
                style={styles.movementImage}
                imageStyle={styles.movementImageStyle}
              >
                <LinearGradient
                  colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
                  style={styles.movementGradient}
                >
                  <Text style={styles.movementTitle}>Restorative Flow</Text>
                  <Text style={styles.movementDuration}>10-20 min</Text>
                </LinearGradient>
              </ImageBackground>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.movementCard, { backgroundColor: theme.card }]}
              onPress={() => {
                console.log('[HomeScreen] User tapped Strength Building');
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/(tabs)/fitness');
              }}
              activeOpacity={0.8}
            >
              <ImageBackground
                source={{ uri: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=80' }}
                style={styles.movementImage}
                imageStyle={styles.movementImageStyle}
              >
                <LinearGradient
                  colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
                  style={styles.movementGradient}
                >
                  <Text style={styles.movementTitle}>Strength Building</Text>
                  <Text style={styles.movementDuration}>20-30 min</Text>
                </LinearGradient>
              </ImageBackground>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.movementCard, { backgroundColor: theme.card }]}
              onPress={() => {
                console.log('[HomeScreen] User tapped Evening Unwinding');
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/(tabs)/mindfulness');
              }}
              activeOpacity={0.8}
            >
              <ImageBackground
                source={{ uri: 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=400&q=80' }}
                style={styles.movementImage}
                imageStyle={styles.movementImageStyle}
              >
                <LinearGradient
                  colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
                  style={styles.movementGradient}
                >
                  <Text style={styles.movementTitle}>Evening Unwinding</Text>
                  <Text style={styles.movementDuration}>5-10 min</Text>
                </LinearGradient>
              </ImageBackground>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Today's Rhythm */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Today's Rhythm</Text>
          <View style={styles.rhythmGrid}>
            <TouchableOpacity
              style={[styles.rhythmCard, { backgroundColor: theme.card }]}
              onPress={() => {
                console.log('[HomeScreen] User tapped Nourishment');
                router.push('/(tabs)/nutrition');
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.rhythmIcon, { backgroundColor: theme.warning + '20' }]}>
                <IconSymbol
                  ios_icon_name="restaurant"
                  android_material_icon_name="restaurant"
                  size={24}
                  color={theme.warning}
                />
              </View>
              <Text style={[styles.rhythmLabel, { color: theme.text }]}>Nourishment</Text>
              <Text style={[styles.rhythmValue, { color: theme.textSecondary }]}>
                {overview?.nutrition?.total_calories || 0} kcal
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.rhythmCard, { backgroundColor: theme.card }]}
              onPress={() => {
                console.log('[HomeScreen] User tapped Movement');
                router.push('/(tabs)/fitness');
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.rhythmIcon, { backgroundColor: theme.error + '20' }]}>
                <IconSymbol
                  ios_icon_name="fitness-center"
                  android_material_icon_name="fitness-center"
                  size={24}
                  color={theme.error}
                />
              </View>
              <Text style={[styles.rhythmLabel, { color: theme.text }]}>Movement</Text>
              <Text style={[styles.rhythmValue, { color: theme.textSecondary }]}>
                {overview?.workouts?.count || 0} sessions
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.rhythmCard, { backgroundColor: theme.card }]}
              onPress={() => {
                console.log('[HomeScreen] User tapped Presence');
                router.push('/(tabs)/mindfulness');
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.rhythmIcon, { backgroundColor: theme.success + '20' }]}>
                <IconSymbol
                  ios_icon_name="self-improvement"
                  android_material_icon_name="self-improvement"
                  size={24}
                  color={theme.success}
                />
              </View>
              <Text style={[styles.rhythmLabel, { color: theme.text }]}>Presence</Text>
              <Text style={[styles.rhythmValue, { color: theme.textSecondary }]}>
                {overview?.meditation?.total_minutes || 0} min
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.rhythmCard, { backgroundColor: theme.card }]}
              onPress={() => {
                console.log('[HomeScreen] User tapped Reflection');
                router.push('/(tabs)/(history)/');
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.rhythmIcon, { backgroundColor: theme.primary + '20' }]}>
                <IconSymbol
                  ios_icon_name="book"
                  android_material_icon_name="book"
                  size={24}
                  color={theme.primary}
                />
              </View>
              <Text style={[styles.rhythmLabel, { color: theme.text }]}>Reflection</Text>
              <Text style={[styles.rhythmValue, { color: theme.textSecondary }]}>
                Journal
              </Text>
            </TouchableOpacity>
          </View>
        </View>


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
    paddingBottom: 120,
  },
  heroSection: {
    marginBottom: 24,
  },
  heroBackground: {
    width: '100%',
    minHeight: 320,
  },
  heroImage: {
    resizeMode: 'cover',
  },
  heroGradient: {
    flex: 1,
    paddingBottom: 32,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  greeting: {
    fontSize: 14,
    marginBottom: 4,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  appName: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  quoteContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  quoteLabel: {
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  quoteText: {
    fontSize: 20,
    lineHeight: 32,
    fontWeight: '500',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  refreshText: {
    fontSize: 13,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
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
  movementScroll: {
    paddingRight: 24,
    gap: 16,
  },
  movementCard: {
    width: 240,
    height: 160,
    borderRadius: 20,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  movementImage: {
    width: '100%',
    height: '100%',
  },
  movementImageStyle: {
    resizeMode: 'cover',
  },
  movementGradient: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 16,
  },
  movementTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  movementDuration: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  rhythmGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  rhythmCard: {
    width: (width - 60) / 2,
    padding: 20,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  rhythmIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  rhythmLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  rhythmValue: {
    fontSize: 13,
  },
});
