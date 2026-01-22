
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  RefreshControl,
  Alert,
  Modal,
  Platform,
  ImageBackground,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/WidgetContext';
import { 
  wellnessApi, 
  WellnessProgram, 
  ProgramEnrollment, 
  sleepApi, 
  SleepTool,
  subscriptionApi,
  UserSubscription,
  renewalApi,
  RenewalVisual,
  SavedRenewalItem,
} from '@/utils/api';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function RenewalScreen() {
  const colorScheme = useColorScheme();
  const { currentTheme: theme } = useTheme();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [programs, setPrograms] = useState<WellnessProgram[]>([]);
  const [enrollments, setEnrollments] = useState<ProgramEnrollment[]>([]);
  const [sleepTools, setSleepTools] = useState<SleepTool[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<WellnessProgram | null>(null);
  const [selectedTool, setSelectedTool] = useState<SleepTool | null>(null);
  const [programModalVisible, setProgramModalVisible] = useState(false);
  const [toolModalVisible, setToolModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [currentVisual, setCurrentVisual] = useState<RenewalVisual | null>(null);
  const [savedItems, setSavedItems] = useState<SavedRenewalItem[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    console.log('[Renewal] Loading programs, enrollments, sleep tools, subscription, and visuals');
    setRefreshing(true);
    setError(null);
    
    try {
      // Load subscription status
      try {
        const subData = await subscriptionApi.getStatus();
        setSubscription(subData);
        console.log('[Renewal] Subscription status:', subData.subscription_tier, 'Active:', subData.is_active);
      } catch (error) {
        console.log('[Renewal] Subscription check failed, defaulting to free tier');
        setSubscription({ user_id: 'default_user', subscription_tier: 'free', is_active: false });
      }

      // Load current visual
      try {
        const visualData = await renewalApi.getCurrentVisual();
        setCurrentVisual(visualData);
        console.log('[Renewal] Loaded current visual:', visualData.visual_type);
      } catch (error) {
        console.log('[Renewal] Failed to load visual:', error);
        setCurrentVisual(null);
      }

      // Load saved items
      try {
        const savedData = await renewalApi.getSavedItems();
        setSavedItems(savedData);
        console.log('[Renewal] Loaded saved items:', savedData.length);
      } catch (error) {
        console.log('[Renewal] Failed to load saved items:', error);
        setSavedItems([]);
      }

      // Load programs
      try {
        const programsData = await wellnessApi.getPrograms();
        setPrograms(programsData);
        console.log('[Renewal] Loaded programs:', programsData.length);
      } catch (error) {
        console.error('[Renewal] Failed to load programs:', error);
        setPrograms([]);
      }

      // Load sleep tools
      try {
        const toolsData = await sleepApi.getTools();
        setSleepTools(toolsData);
        console.log('[Renewal] Loaded sleep tools:', toolsData.length);
      } catch (error) {
        console.error('[Renewal] Failed to load sleep tools:', error);
        setSleepTools([]);
      }

      // Try to load enrollments
      try {
        const enrollmentsData = await wellnessApi.getEnrollments();
        setEnrollments(enrollmentsData);
        console.log('[Renewal] Loaded enrollments:', enrollmentsData.length);
      } catch (enrollmentError: any) {
        console.log('[Renewal] Enrollments not available:', enrollmentError?.message || 'Unknown error');
        setEnrollments([]);
      }
    } catch (error: any) {
      console.error('[Renewal] Failed to load data:', error);
      setError(error?.message || 'Failed to load renewal data');
      setPrograms([]);
      setSleepTools([]);
      setEnrollments([]);
    } finally {
      setRefreshing(false);
      setDataLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const hasActiveSubscription = subscription?.is_active && subscription?.subscription_tier !== 'free';

  const isEnrolled = (programId: string) => {
    return enrollments.some(e => e.program_id === programId && !e.is_completed);
  };

  const getEnrollment = (programId: string) => {
    return enrollments.find(e => e.program_id === programId && !e.is_completed);
  };

  const isSaved = (itemType: 'program' | 'ritual' | 'tool', itemId: string) => {
    return savedItems.some(item => item.item_type === itemType && item.item_id === itemId);
  };

  const getSavedItem = (itemType: 'program' | 'ritual' | 'tool', itemId: string) => {
    return savedItems.find(item => item.item_type === itemType && item.item_id === itemId);
  };

  const handleSaveToggle = async (itemType: 'program' | 'ritual' | 'tool', itemId: string) => {
    console.log('[Renewal] Toggling save for:', itemType, itemId);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const saved = getSavedItem(itemType, itemId);
    if (saved) {
      try {
        await renewalApi.removeSavedItem(saved.id);
        setSavedItems(prev => prev.filter(item => item.id !== saved.id));
      } catch (error) {
        console.error('[Renewal] Failed to remove saved item:', error);
      }
    } else {
      try {
        const newSaved = await renewalApi.saveItem(itemType, itemId);
        setSavedItems(prev => [...prev, newSaved]);
      } catch (error) {
        console.error('[Renewal] Failed to save item:', error);
      }
    }
  };

  const handlePauseToggle = async (savedItemId: string, currentPauseState: boolean) => {
    console.log('[Renewal] Toggling pause for saved item:', savedItemId);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const updated = await renewalApi.pauseItem(savedItemId, !currentPauseState);
      setSavedItems(prev => prev.map(item => item.id === savedItemId ? updated : item));
    } catch (error) {
      console.error('[Renewal] Failed to toggle pause:', error);
    }
  };

  const handleProgramPress = async (program: WellnessProgram) => {
    console.log('[Renewal] User tapped program:', program.title, 'Premium:', program.is_premium);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (program.is_premium && !hasActiveSubscription) {
      Alert.alert(
        'Subscription Required',
        `${program.title} is part of Renewal Premium. Subscribe to unlock all programs, rituals, and tools.`,
        [
          { text: 'Not Now', style: 'cancel' },
          {
            text: 'Subscribe',
            onPress: () => {
              console.log('[Renewal] User tapped Subscribe');
              router.push('/(tabs)/profile');
            },
          },
        ]
      );
      return;
    }

    setSelectedProgram(program);
    setProgramModalVisible(true);
  };

  const handleToolPress = async (tool: SleepTool) => {
    console.log('[Renewal] User tapped sleep tool:', tool.title, 'Premium:', tool.is_premium);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (tool.is_premium && !hasActiveSubscription) {
      Alert.alert(
        'Subscription Required',
        `${tool.title} is part of Renewal Premium. Subscribe to unlock all rituals and tools.`,
        [
          { text: 'Not Now', style: 'cancel' },
          {
            text: 'Subscribe',
            onPress: () => {
              console.log('[Renewal] User tapped Subscribe for sleep tool');
              router.push('/(tabs)/profile');
            },
          },
        ]
      );
      return;
    }

    setSelectedTool(tool);
    setToolModalVisible(true);
  };

  const handleEnroll = async () => {
    if (!selectedProgram) return;

    console.log('[Renewal] User enrolling in program:', selectedProgram.title);
    setLoading(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    try {
      await wellnessApi.enrollInProgram(selectedProgram.id);
      Alert.alert('Enrolled!', `You've started the ${selectedProgram.title} program. Check back daily for your next activity.`);
      setProgramModalVisible(false);
      await loadData();
    } catch (error) {
      console.error('[Renewal] Failed to enroll:', error);
      Alert.alert('Error', 'Failed to enroll in program. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getProgramIcon = (programType: string): string => {
    const iconMap: Record<string, string> = {
      stress_relief: 'self-improvement',
      energy_boost: 'bolt',
      mindful_living: 'spa',
      better_sleep: 'bedtime',
      gratitude_journey: 'favorite',
      self_compassion: 'favorite-border',
    };
    return iconMap[programType] || 'star';
  };

  const getProgramColor = (programType: string): string => {
    const colorMap: Record<string, string> = {
      stress_relief: '#7A9B8B',
      energy_boost: '#E8A87C',
      mindful_living: '#9B8BA7',
      better_sleep: '#7A8B9B',
      gratitude_journey: '#C4A876',
      self_compassion: '#B88B9B',
    };
    return colorMap[programType] || theme.primary;
  };

  const getProgramImage = (programType: string): string => {
    const imageMap: Record<string, string> = {
      stress_relief: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80',
      energy_boost: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=800&q=80',
      mindful_living: 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=800&q=80',
      better_sleep: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80',
      gratitude_journey: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800&q=80',
      self_compassion: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80',
    };
    return imageMap[programType] || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80';
  };

  const getToolIcon = (toolType: string): string => {
    const iconMap: Record<string, string> = {
      breathwork: 'air',
      body_scan: 'self-improvement',
      sleep_story: 'menu-book',
      ambient_sounds: 'music-note',
      gratitude: 'favorite',
      wind_down: 'bedtime',
    };
    return iconMap[toolType] || 'spa';
  };

  const getToolColor = (toolType: string): string => {
    const colorMap: Record<string, string> = {
      breathwork: '#7A9B9B',
      body_scan: '#9B8BA7',
      sleep_story: '#8B9BA7',
      ambient_sounds: '#A7B88B',
      gratitude: '#C4A876',
      wind_down: '#7A8B9B',
    };
    return colorMap[toolType] || theme.primary;
  };

  const durationText = selectedProgram ? `${selectedProgram.duration_days} days` : '';
  const enrolledText = selectedProgram && isEnrolled(selectedProgram.id) ? 'Enrolled' : '';
  const toolDurationText = selectedTool ? `${selectedTool.duration_minutes} min` : '';

  // Get active and paused items for "Continue Your Renewal" section
  const activeEnrollments = enrollments.filter(e => !e.is_completed);
  const activeSavedItems = savedItems.filter(item => !item.is_paused);
  const pausedSavedItems = savedItems.filter(item => item.is_paused);

  // Show loading state
  if (dataLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
        <View style={[styles.header, Platform.OS === 'android' && { paddingTop: 48 }]}>
          <View>
            <Text style={[styles.title, { color: theme.text }]}>Renewal</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Your sanctuary for rest and transformation
            </Text>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
            Loading your renewal space...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state
  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
        <View style={[styles.header, Platform.OS === 'android' && { paddingTop: 48 }]}>
          <View>
            <Text style={[styles.title, { color: theme.text }]}>Renewal</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Your sanctuary for rest and transformation
            </Text>
          </View>
        </View>
        <View style={styles.errorContainer}>
          <IconSymbol
            ios_icon_name="error"
            android_material_icon_name="error"
            size={48}
            color={theme.textSecondary}
          />
          <Text style={[styles.errorTitle, { color: theme.text }]}>
            Unable to load Renewal
          </Text>
          <Text style={[styles.errorText, { color: theme.textSecondary }]}>
            {error}
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: theme.primary }]}
            onPress={loadData}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={[styles.header, Platform.OS === 'android' && { paddingTop: 48 }]}>
        <View>
          <Text style={[styles.title, { color: theme.text }]}>Renewal</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Your sanctuary for rest and transformation
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadData} tintColor={theme.primary} />
        }
      >
        {/* Dynamic Visual Header */}
        {currentVisual && (
          <Animated.View entering={FadeIn.duration(600)} style={styles.visualHeader}>
            <ImageBackground
              source={{ uri: currentVisual.image_url }}
              style={styles.visualImage}
              imageStyle={styles.visualImageStyle}
            >
              <LinearGradient
                colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.6)']}
                style={styles.visualGradient}
              >
                <Text style={styles.visualDescription}>{currentVisual.description}</Text>
              </LinearGradient>
            </ImageBackground>
          </Animated.View>
        )}

        {/* Continue Your Renewal Section */}
        {(activeEnrollments.length > 0 || activeSavedItems.length > 0 || pausedSavedItems.length > 0) && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Continue Your Renewal</Text>
            <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
              Pick up where you left off
            </Text>

            {activeEnrollments.map((enrollment, index) => {
              const program = programs.find(p => p.id === enrollment.program_id);
              if (!program) return null;

              const progressPercent = (enrollment.completed_days.length / program.duration_days) * 100;
              const progressText = `Day ${enrollment.current_day} of ${program.duration_days}`;
              const percentText = `${Math.round(progressPercent)}%`;

              return (
                <Animated.View
                  key={enrollment.id}
                  entering={FadeInDown.delay(index * 80).duration(400)}
                  style={styles.activeCard}
                >
                  <TouchableOpacity
                    style={[styles.activeCardInner, { backgroundColor: theme.card }]}
                    onPress={() => handleProgramPress(program)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.activeCardHeader}>
                      <View style={[styles.activeIconContainer, { backgroundColor: getProgramColor(program.program_type) + '30' }]}>
                        <IconSymbol
                          ios_icon_name={getProgramIcon(program.program_type)}
                          android_material_icon_name={getProgramIcon(program.program_type)}
                          size={24}
                          color={getProgramColor(program.program_type)}
                        />
                      </View>
                      <View style={styles.activeCardInfo}>
                        <Text style={[styles.activeCardTitle, { color: theme.text }]}>{program.title}</Text>
                        <Text style={[styles.activeCardProgress, { color: theme.textSecondary }]}>
                          {progressText}
                        </Text>
                      </View>
                      <Text style={[styles.activeCardPercent, { color: theme.primary }]}>{percentText}</Text>
                    </View>
                    <View style={[styles.progressBar, { backgroundColor: theme.textSecondary + '20' }]}>
                      <View
                        style={[
                          styles.progressFill,
                          { backgroundColor: getProgramColor(program.program_type), width: `${progressPercent}%` },
                        ]}
                      />
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}

            {pausedSavedItems.length > 0 && (
              <View style={[styles.pausedSection, { backgroundColor: theme.card }]}>
                <Text style={[styles.pausedTitle, { color: theme.textSecondary }]}>Paused</Text>
                {pausedSavedItems.map((item, index) => {
                  const itemName = item.item_type === 'program' 
                    ? programs.find(p => p.id === item.item_id)?.title 
                    : sleepTools.find(t => t.id === item.item_id)?.title;
                  
                  return (
                    <View key={item.id} style={styles.pausedItem}>
                      <Text style={[styles.pausedItemText, { color: theme.textSecondary }]}>{itemName}</Text>
                      <TouchableOpacity onPress={() => handlePauseToggle(item.id, item.is_paused)}>
                        <IconSymbol
                          ios_icon_name="play-arrow"
                          android_material_icon_name="play-arrow"
                          size={20}
                          color={theme.primary}
                        />
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {/* Sleep Rituals & Tools Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Sleep Rituals</Text>
          <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
            Elemental practices for deep rest
          </Text>

          {sleepTools.length === 0 && !refreshing ? (
            <View style={[styles.emptyState, { backgroundColor: theme.card }]}>
              <IconSymbol
                ios_icon_name="bedtime"
                android_material_icon_name="bedtime"
                size={48}
                color={theme.textSecondary}
              />
              <Text style={[styles.emptyStateTitle, { color: theme.text }]}>
                Your Renewal tools are being prepared
              </Text>
              <Text style={[styles.emptyStateText, { color: theme.textSecondary }]}>
                New practices arrive soon
              </Text>
            </View>
          ) : null}

          <View style={styles.toolsGrid}>
            {sleepTools.map((tool, index) => {
              const toolIcon = getToolIcon(tool.tool_type);
              const toolColor = getToolColor(tool.tool_type);
              const isLocked = tool.is_premium && !hasActiveSubscription;
              const saved = isSaved('tool', tool.id);

              return (
                <Animated.View
                  key={tool.id}
                  entering={FadeInDown.delay(index * 60).duration(400)}
                  style={styles.toolCard}
                >
                  <TouchableOpacity
                    style={[styles.toolCardInner, { backgroundColor: theme.card }]}
                    onPress={() => handleToolPress(tool)}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.toolIconContainer, { backgroundColor: toolColor + '30' }]}>
                      <IconSymbol
                        ios_icon_name={toolIcon}
                        android_material_icon_name={toolIcon}
                        size={28}
                        color={toolColor}
                      />
                    </View>
                    {isLocked && (
                      <View style={styles.toolLockBadge}>
                        <IconSymbol
                          ios_icon_name="lock"
                          android_material_icon_name="lock"
                          size={10}
                          color="#FFD700"
                        />
                      </View>
                    )}
                    {!isLocked && (
                      <TouchableOpacity 
                        style={styles.toolSaveButton}
                        onPress={(e) => {
                          e.stopPropagation();
                          handleSaveToggle('tool', tool.id);
                        }}
                      >
                        <IconSymbol
                          ios_icon_name={saved ? 'bookmark' : 'bookmark-border'}
                          android_material_icon_name={saved ? 'bookmark' : 'bookmark-border'}
                          size={16}
                          color={saved ? theme.primary : theme.textSecondary}
                        />
                      </TouchableOpacity>
                    )}
                    <Text style={[styles.toolTitle, { color: theme.text }]}>{tool.title}</Text>
                    <Text style={[styles.toolDuration, { color: theme.textSecondary }]}>
                      {tool.duration_minutes} min
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>
        </View>

        {/* Renewal Programs Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Renewal Programs</Text>
          <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
            Evergreen journeys for lasting transformation
          </Text>

          {programs.length === 0 && !refreshing ? (
            <View style={[styles.emptyState, { backgroundColor: theme.card }]}>
              <IconSymbol
                ios_icon_name="spa"
                android_material_icon_name="spa"
                size={48}
                color={theme.textSecondary}
              />
              <Text style={[styles.emptyStateTitle, { color: theme.text }]}>
                This space is opening for you
              </Text>
              <Text style={[styles.emptyStateText, { color: theme.textSecondary }]}>
                New programs arrive soon
              </Text>
            </View>
          ) : null}

          <View style={styles.programsGrid}>
            {programs.map((program, index) => {
              const programIcon = getProgramIcon(program.program_type);
              const programColor = getProgramColor(program.program_type);
              const programImage = getProgramImage(program.program_type);
              const enrolled = isEnrolled(program.id);
              const isLocked = program.is_premium && !hasActiveSubscription;
              const saved = isSaved('program', program.id);

              return (
                <Animated.View
                  key={program.id}
                  entering={FadeInDown.delay(index * 80).duration(400)}
                  style={styles.programCardContainer}
                >
                  <TouchableOpacity
                    style={[styles.programCard, { backgroundColor: theme.card }]}
                    onPress={() => handleProgramPress(program)}
                    activeOpacity={0.8}
                  >
                    <ImageBackground
                      source={{ uri: programImage }}
                      style={styles.programImage}
                      imageStyle={styles.programImageStyle}
                    >
                      <LinearGradient
                        colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.8)']}
                        style={styles.programGradient}
                      >
                        <View style={styles.programBadges}>
                          {isLocked && (
                            <View style={styles.premiumBadge}>
                              <IconSymbol
                                ios_icon_name="lock"
                                android_material_icon_name="lock"
                                size={12}
                                color="#FFD700"
                              />
                              <Text style={styles.premiumText}>Premium</Text>
                            </View>
                          )}
                          {enrolled && (
                            <View style={styles.enrolledBadge}>
                              <IconSymbol
                                ios_icon_name="check"
                                android_material_icon_name="check"
                                size={12}
                                color="#4CAF50"
                              />
                              <Text style={styles.enrolledText}>Active</Text>
                            </View>
                          )}
                          {!isLocked && !enrolled && (
                            <TouchableOpacity 
                              style={styles.programSaveButton}
                              onPress={(e) => {
                                e.stopPropagation();
                                handleSaveToggle('program', program.id);
                              }}
                            >
                              <IconSymbol
                                ios_icon_name={saved ? 'bookmark' : 'bookmark-border'}
                                android_material_icon_name={saved ? 'bookmark' : 'bookmark-border'}
                                size={16}
                                color={saved ? '#FFD700' : 'rgba(255, 255, 255, 0.8)'}
                              />
                            </TouchableOpacity>
                          )}
                        </View>
                        <View style={[styles.programIconContainer, { backgroundColor: programColor + '30' }]}>
                          <IconSymbol
                            ios_icon_name={programIcon}
                            android_material_icon_name={programIcon}
                            size={24}
                            color="#FFFFFF"
                          />
                        </View>
                        <Text style={styles.programName}>{program.title}</Text>
                        <Text style={styles.programDescription}>{program.description}</Text>
                        <View style={styles.programFooter}>
                          <View style={styles.durationBadge}>
                            <IconSymbol
                              ios_icon_name="calendar-today"
                              android_material_icon_name="calendar-today"
                              size={14}
                              color="rgba(255, 255, 255, 0.9)"
                            />
                            <Text style={styles.durationText}>{program.duration_days} days</Text>
                          </View>
                        </View>
                      </LinearGradient>
                    </ImageBackground>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Program Details Modal */}
      <Modal
        visible={programModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setProgramModalVisible(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setProgramModalVisible(false)}>
              <IconSymbol
                ios_icon_name="close"
                android_material_icon_name="close"
                size={24}
                color={theme.text}
              />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {selectedProgram?.title}
            </Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {selectedProgram && (
              <React.Fragment>
                <View style={[styles.modalProgramCard, { backgroundColor: theme.card }]}>
                  <View style={[styles.modalIconContainer, { backgroundColor: getProgramColor(selectedProgram.program_type) + '30' }]}>
                    <IconSymbol
                      ios_icon_name={getProgramIcon(selectedProgram.program_type)}
                      android_material_icon_name={getProgramIcon(selectedProgram.program_type)}
                      size={48}
                      color={getProgramColor(selectedProgram.program_type)}
                    />
                  </View>
                  <Text style={[styles.modalProgramDescription, { color: theme.textSecondary }]}>
                    {selectedProgram.description}
                  </Text>
                  <View style={styles.modalDurationRow}>
                    <IconSymbol
                      ios_icon_name="calendar-today"
                      android_material_icon_name="calendar-today"
                      size={16}
                      color={theme.textSecondary}
                    />
                    <Text style={[styles.modalDuration, { color: theme.textSecondary }]}>
                      {durationText}
                    </Text>
                  </View>
                  {enrolledText && (
                    <View style={styles.modalEnrolledBadge}>
                      <IconSymbol
                        ios_icon_name="check-circle"
                        android_material_icon_name="check-circle"
                        size={16}
                        color="#4CAF50"
                      />
                      <Text style={[styles.modalEnrolledText, { color: '#4CAF50' }]}>
                        {enrolledText}
                      </Text>
                    </View>
                  )}
                </View>

                {selectedProgram.daily_activities && selectedProgram.daily_activities.length > 0 && (
                  <View style={[styles.activitiesCard, { backgroundColor: theme.card }]}>
                    <Text style={[styles.activitiesTitle, { color: theme.text }]}>Daily Activities</Text>
                    {selectedProgram.daily_activities.slice(0, 5).map((activity, index) => {
                      const dayText = `Day ${activity.day}`;
                      return (
                        <View key={index} style={styles.activityRow}>
                          <View style={[styles.dayBadge, { backgroundColor: theme.primary + '20' }]}>
                            <Text style={[styles.dayText, { color: theme.primary }]}>{dayText}</Text>
                          </View>
                          <View style={styles.activityInfo}>
                            <Text style={[styles.activityTitle, { color: theme.text }]}>{activity.title}</Text>
                            <Text style={[styles.activityDescription, { color: theme.textSecondary }]}>
                              {activity.activity}
                            </Text>
                          </View>
                        </View>
                      );
                    })}
                    {selectedProgram.daily_activities.length > 5 && (
                      <Text style={[styles.moreActivities, { color: theme.textSecondary }]}>
                        + {selectedProgram.daily_activities.length - 5} more days
                      </Text>
                    )}
                  </View>
                )}

                {!isEnrolled(selectedProgram.id) && (
                  <TouchableOpacity
                    style={[styles.enrollButton, { backgroundColor: theme.primary }]}
                    onPress={handleEnroll}
                    disabled={loading}
                    activeOpacity={0.8}
                  >
                    {loading ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <React.Fragment>
                        <IconSymbol
                          ios_icon_name="play-arrow"
                          android_material_icon_name="play-arrow"
                          size={24}
                          color="#FFFFFF"
                        />
                        <Text style={styles.enrollButtonText}>Start Program</Text>
                      </React.Fragment>
                    )}
                  </TouchableOpacity>
                )}
              </React.Fragment>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Sleep Tool Details Modal */}
      <Modal
        visible={toolModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setToolModalVisible(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setToolModalVisible(false)}>
              <IconSymbol
                ios_icon_name="close"
                android_material_icon_name="close"
                size={24}
                color={theme.text}
              />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {selectedTool?.title}
            </Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {selectedTool && (
              <React.Fragment>
                <View style={[styles.modalProgramCard, { backgroundColor: theme.card }]}>
                  <View style={[styles.modalIconContainer, { backgroundColor: getToolColor(selectedTool.tool_type) + '30' }]}>
                    <IconSymbol
                      ios_icon_name={getToolIcon(selectedTool.tool_type)}
                      android_material_icon_name={getToolIcon(selectedTool.tool_type)}
                      size={48}
                      color={getToolColor(selectedTool.tool_type)}
                    />
                  </View>
                  <Text style={[styles.modalProgramDescription, { color: theme.textSecondary }]}>
                    {selectedTool.description}
                  </Text>
                  <View style={styles.modalDurationRow}>
                    <IconSymbol
                      ios_icon_name="access-time"
                      android_material_icon_name="access-time"
                      size={16}
                      color={theme.textSecondary}
                    />
                    <Text style={[styles.modalDuration, { color: theme.textSecondary }]}>
                      {toolDurationText}
                    </Text>
                  </View>
                </View>

                {selectedTool.content && (
                  <View style={[styles.activitiesCard, { backgroundColor: theme.card }]}>
                    <Text style={[styles.activitiesTitle, { color: theme.text }]}>About This Ritual</Text>
                    <Text style={[styles.toolContentText, { color: theme.textSecondary }]}>
                      {selectedTool.content}
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  style={[styles.enrollButton, { backgroundColor: theme.primary }]}
                  onPress={() => {
                    console.log('[Renewal] User starting sleep tool:', selectedTool.title);
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    Alert.alert('Coming Soon', 'Ritual playback will be available soon!');
                  }}
                  activeOpacity={0.8}
                >
                  <IconSymbol
                    ios_icon_name="play-arrow"
                    android_material_icon_name="play-arrow"
                    size={24}
                    color="#FFFFFF"
                  />
                  <Text style={styles.enrollButtonText}>Begin Ritual</Text>
                </TouchableOpacity>
              </React.Fragment>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  retryButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
  },
  visualHeader: {
    marginHorizontal: -24,
    marginBottom: 32,
    height: 200,
  },
  visualImage: {
    width: '100%',
    height: '100%',
  },
  visualImageStyle: {
    resizeMode: 'cover',
  },
  visualGradient: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 24,
  },
  visualDescription: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  section: {
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
  activeCard: {
    marginBottom: 16,
  },
  activeCardInner: {
    borderRadius: 16,
    padding: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  activeCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  activeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activeCardInfo: {
    flex: 1,
  },
  activeCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  activeCardProgress: {
    fontSize: 14,
  },
  activeCardPercent: {
    fontSize: 18,
    fontWeight: '700',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  pausedSection: {
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
  },
  pausedTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  pausedItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  pausedItemText: {
    fontSize: 15,
    flex: 1,
  },
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  toolCard: {
    width: '48%',
  },
  toolCardInner: {
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    position: 'relative',
  },
  toolIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  toolLockBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderRadius: 12,
    padding: 6,
  },
  toolSaveButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 6,
  },
  toolTitle: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  toolDuration: {
    fontSize: 13,
  },
  programsGrid: {
    gap: 16,
  },
  programCardContainer: {
    marginBottom: 0,
  },
  programCard: {
    borderRadius: 20,
    overflow: 'hidden',
    height: 220,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  programImage: {
    width: '100%',
    height: '100%',
  },
  programImageStyle: {
    resizeMode: 'cover',
  },
  programGradient: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-end',
  },
  programBadges: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    gap: 8,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  premiumText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFD700',
  },
  enrolledBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  enrolledText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4CAF50',
  },
  programSaveButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    padding: 8,
  },
  programIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  programName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  programDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
    marginBottom: 12,
  },
  programFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  durationText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
  emptyState: {
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  modalProgramCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  modalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalProgramDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 12,
  },
  modalDurationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  modalDuration: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalEnrolledBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  modalEnrolledText: {
    fontSize: 14,
    fontWeight: '600',
  },
  activitiesCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  activitiesTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  dayBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 12,
  },
  dayText: {
    fontSize: 12,
    fontWeight: '600',
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  activityDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  moreActivities: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  toolContentText: {
    fontSize: 15,
    lineHeight: 24,
  },
  enrollButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 40,
    gap: 8,
  },
  enrollButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
