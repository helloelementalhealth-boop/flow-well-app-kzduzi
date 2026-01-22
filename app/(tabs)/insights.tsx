
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  RefreshControl,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/styles/commonStyles';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/contexts/WidgetContext';
import React, { useState, useEffect } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { insightsApi, TrendingProgram, CommunityInsight } from '@/utils/api';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 48 : 20,
    paddingBottom: 120,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  trendCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  trendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  trendIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  trendInfo: {
    flex: 1,
  },
  trendTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  trendSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  trendStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  statText: {
    fontSize: 14,
    marginLeft: 6,
    fontWeight: '500',
  },
  insightCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  insightText: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.6,
    marginTop: 12,
  },
});

export default function InsightsScreen() {
  const router = useRouter();
  const { currentTheme } = useTheme();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const themeColors = currentTheme || colors[isDark ? 'dark' : 'light'];

  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [trendingPrograms, setTrendingPrograms] = useState<TrendingProgram[]>([]);
  const [insights, setInsights] = useState<CommunityInsight[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    console.log('User viewing Insights screen');
    setLoading(true);
    try {
      const [trendingData, insightsData] = await Promise.all([
        insightsApi.getTrending(),
        insightsApi.getCommunityInsights(),
      ]);
      
      console.log('Loaded trending programs:', trendingData);
      console.log('Loaded community insights:', insightsData);
      
      setTrendingPrograms(trendingData);
      setInsights(insightsData);
    } catch (error) {
      console.error('Error loading insights:', error);
      // Keep empty arrays on error
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    console.log('User refreshing insights');
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleTrendPress = (trend: TrendingProgram) => {
    console.log('User tapped trend:', trend.title);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Navigate to the specific program or category
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'stat':
        return 'bar-chart';
      case 'recommendation':
        return 'lightbulb';
      case 'tip':
        return 'info';
      default:
        return 'info';
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={themeColors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: themeColors.text }]}>
            Insights
          </Text>
          <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
            Discover what&apos;s trending in wellness
          </Text>
        </View>

        {/* Trending Programs Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
            Trending Programs
          </Text>
          {trendingPrograms.map((trend, index) => {
            const growthText = `+${trend.growth}%`;
            const participantsText = `${trend.participants.toLocaleString()} active`;
            
            return (
              <Animated.View
                key={trend.id}
                entering={FadeInDown.delay(index * 100)}
              >
                <TouchableOpacity
                  style={[styles.trendCard, { backgroundColor: themeColors.card }]}
                  onPress={() => handleTrendPress(trend)}
                  activeOpacity={0.7}
                >
                  <View style={styles.trendHeader}>
                    <View style={[styles.trendIcon, { backgroundColor: trend.color + '20' }]}>
                      <IconSymbol
                        ios_icon_name="chart.line.uptrend.xyaxis"
                        android_material_icon_name={trend.icon}
                        size={24}
                        color={trend.color}
                      />
                    </View>
                    <View style={styles.trendInfo}>
                      <Text style={[styles.trendTitle, { color: themeColors.text }]}>
                        {trend.title}
                      </Text>
                      <Text style={[styles.trendSubtitle, { color: themeColors.textSecondary }]}>
                        {trend.category}
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.trendStats, { borderTopColor: themeColors.border }]}>
                    <View style={styles.statItem}>
                      <IconSymbol
                        ios_icon_name="person.2.fill"
                        android_material_icon_name="group"
                        size={16}
                        color={themeColors.textSecondary}
                      />
                      <Text style={[styles.statText, { color: themeColors.textSecondary }]}>
                        {participantsText}
                      </Text>
                    </View>
                    <View style={styles.statItem}>
                      <IconSymbol
                        ios_icon_name="arrow.up.right"
                        android_material_icon_name="trending-up"
                        size={16}
                        color={colors.light.success}
                      />
                      <Text style={[styles.statText, { color: colors.light.success }]}>
                        {growthText}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>

        {/* Community Insights Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
            Community Insights
          </Text>
          {insights.map((insight, index) => (
            <Animated.View
              key={insight.id}
              entering={FadeInDown.delay((trendingPrograms.length + index) * 100)}
            >
              <LinearGradient
                colors={[themeColors.card, themeColors.card]}
                style={styles.insightCard}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <IconSymbol
                    ios_icon_name="lightbulb.fill"
                    android_material_icon_name={getInsightIcon(insight.type)}
                    size={20}
                    color={themeColors.primary}
                  />
                  <Text style={[styles.insightTitle, { color: themeColors.text, marginLeft: 8, marginBottom: 0 }]}>
                    {insight.title}
                  </Text>
                </View>
                <Text style={[styles.insightText, { color: themeColors.textSecondary }]}>
                  {insight.description}
                </Text>
              </LinearGradient>
            </Animated.View>
          ))}
        </View>

        {/* Empty state if no data */}
        {!loading && trendingPrograms.length === 0 && insights.length === 0 && (
          <View style={styles.emptyState}>
            <IconSymbol
              ios_icon_name="chart.bar.xaxis"
              android_material_icon_name="bar-chart"
              size={48}
              color={themeColors.textSecondary}
            />
            <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>
              No insights available yet
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
