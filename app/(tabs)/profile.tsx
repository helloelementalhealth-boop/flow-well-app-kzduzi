
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
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/styles/commonStyles';
import { activityApi, goalsApi } from '@/utils/api';
import { IconSymbol } from '@/components/IconSymbol';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTheme, useAdminAuth } from '@/contexts/WidgetContext';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const { currentTheme: theme } = useTheme();
  const { isAdmin } = useAdminAuth();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [activityData, setActivityData] = useState<any>(null);
  const [goals, setGoals] = useState<any[]>([]);

  const today = new Date().toISOString().split('T')[0];

  const loadData = React.useCallback(async () => {
    console.log('[ProfileScreen] Loading activity data and goals');
    setRefreshing(true);
    try {
      const [summary, goalsData] = await Promise.all([
        activityApi.getSummary(today),
        goalsApi.getGoals(),
      ]);
      setActivityData(summary);
      setGoals(goalsData);
      console.log('[ProfileScreen] Data loaded successfully');
    } catch (error) {
      console.error('[ProfileScreen] Failed to load data:', error);
    } finally {
      setRefreshing(false);
    }
  }, [today]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleUpgrade = () => {
    console.log('[ProfileScreen] User tapped Upgrade to Premium');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Premium Features',
      'Unlock advanced tools, personalized insights, and exclusive content with Eluminate Premium.',
      [
        { text: 'Maybe Later', style: 'cancel' },
        { text: 'Learn More', onPress: () => console.log('Navigate to premium info') },
      ]
    );
  };

  const handlePrivacy = () => {
    console.log('[ProfileScreen] User tapped Privacy Policy');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Privacy Policy', 'Your privacy is important to us. We protect your data and never share it without your consent.');
  };

  const handleTerms = () => {
    console.log('[ProfileScreen] User tapped Terms of Service');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Terms of Service', 'By using Eluminate, you agree to our terms and conditions.');
  };

  const handleHelp = () => {
    console.log('[ProfileScreen] User tapped Help & Support');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Help & Support', 'Need assistance? Contact us at support@eluminate.app');
  };

  const ActivityCard = ({
    icon,
    label,
    value,
    unit,
    color,
  }: {
    icon: string;
    label: string;
    value: number;
    unit: string;
    color: string;
  }) => {
    const displayValue = value.toString();
    const displayUnit = unit;
    
    return (
      <View style={[styles.activityCard, { backgroundColor: theme.card }]}>
        <View style={[styles.activityIcon, { backgroundColor: color + '20' }]}>
          <IconSymbol
            ios_icon_name={icon}
            android_material_icon_name={icon}
            size={24}
            color={color}
          />
        </View>
        <Text style={[styles.activityLabel, { color: theme.textSecondary }]}>
          {label}
        </Text>
        <View style={styles.activityValueRow}>
          <Text style={[styles.activityValue, { color: theme.text }]}>
            {displayValue}
          </Text>
          <Text style={[styles.activityUnit, { color: theme.textSecondary }]}>
            {displayUnit}
          </Text>
        </View>
      </View>
    );
  };

  const greetingText = 'Your Wellness Profile';
  const premiumBadgeText = 'Premium';
  const upgradeButtonText = 'Upgrade to Premium';
  const todayActivityTitle = 'Today\'s Activity';
  const settingsTitle = 'Settings';
  const adminControlText = 'Admin Control';
  const adminDescriptionText = 'Manage app content and settings';
  const privacyText = 'Privacy Policy';
  const privacyDescriptionText = 'How we protect your data';
  const termsText = 'Terms of Service';
  const termsDescriptionText = 'Our terms and conditions';
  const helpText = 'Help & Support';
  const helpDescriptionText = 'Get assistance and answers';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={loadData} 
            tintColor={theme.primary} 
          />
        }
      >
        {/* Header */}
        <View style={[styles.header, Platform.OS === 'android' && { paddingTop: 48 }]}>
          <Text style={[styles.greeting, { color: theme.text }]}>
            {greetingText}
          </Text>
        </View>

        {/* Premium Card */}
        <Animated.View entering={FadeInDown.delay(0).duration(400)}>
          <View style={[styles.premiumCard, { backgroundColor: theme.primary }]}>
            <View style={styles.premiumContent}>
              <View style={styles.premiumBadge}>
                <IconSymbol
                  ios_icon_name="star"
                  android_material_icon_name="star"
                  size={16}
                  color="#FFD700"
                />
                <Text style={styles.premiumBadgeText}>{premiumBadgeText}</Text>
              </View>
              <Text style={styles.premiumTitle}>
                Unlock Your Full Potential
              </Text>
              <Text style={styles.premiumDescription}>
                Access advanced tools, personalized insights, and exclusive wellness content
              </Text>
              <TouchableOpacity
                style={styles.upgradeButton}
                onPress={handleUpgrade}
                activeOpacity={0.8}
              >
                <Text style={[styles.upgradeButtonText, { color: theme.primary }]}>
                  {upgradeButtonText}
                </Text>
                <IconSymbol
                  ios_icon_name="arrow-forward"
                  android_material_icon_name="arrow-forward"
                  size={20}
                  color={theme.primary}
                />
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>

        {/* Today's Activity */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {todayActivityTitle}
          </Text>
          <View style={styles.activityGrid}>
            <ActivityCard
              icon="directions-walk"
              label="Steps"
              value={activityData?.steps || 0}
              unit="steps"
              color={theme.success}
            />
            <ActivityCard
              icon="bedtime"
              label="Sleep"
              value={activityData?.sleep || 0}
              unit="hrs"
              color={theme.primary}
            />
            <ActivityCard
              icon="water-drop"
              label="Water"
              value={activityData?.water || 0}
              unit="cups"
              color={theme.info}
            />
            <ActivityCard
              icon="mood"
              label="Mood"
              value={activityData?.mood_check || 0}
              unit="checks"
              color={theme.warning}
            />
          </View>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {settingsTitle}
          </Text>
          <View style={[styles.settingsCard, { backgroundColor: theme.card }]}>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => {
                console.log('[ProfileScreen] User tapped Theme Settings');
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/(tabs)/theme-settings');
              }}
              activeOpacity={0.7}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: theme.primary + '20' }]}>
                  <IconSymbol
                    ios_icon_name="palette"
                    android_material_icon_name="palette"
                    size={20}
                    color={theme.primary}
                  />
                </View>
                <Text style={[styles.settingLabel, { color: theme.text }]}>
                  Theme Settings
                </Text>
              </View>
              <IconSymbol
                ios_icon_name="chevron-right"
                android_material_icon_name="chevron-right"
                size={20}
                color={theme.textSecondary}
              />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            <TouchableOpacity
              style={styles.settingItem}
              onPress={handlePrivacy}
              activeOpacity={0.7}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: theme.info + '20' }]}>
                  <IconSymbol
                    ios_icon_name="lock"
                    android_material_icon_name="lock"
                    size={20}
                    color={theme.info}
                  />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={[styles.settingLabel, { color: theme.text }]}>
                    {privacyText}
                  </Text>
                  <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
                    {privacyDescriptionText}
                  </Text>
                </View>
              </View>
              <IconSymbol
                ios_icon_name="chevron-right"
                android_material_icon_name="chevron-right"
                size={20}
                color={theme.textSecondary}
              />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            <TouchableOpacity
              style={styles.settingItem}
              onPress={handleTerms}
              activeOpacity={0.7}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: theme.warning + '20' }]}>
                  <IconSymbol
                    ios_icon_name="description"
                    android_material_icon_name="description"
                    size={20}
                    color={theme.warning}
                  />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={[styles.settingLabel, { color: theme.text }]}>
                    {termsText}
                  </Text>
                  <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
                    {termsDescriptionText}
                  </Text>
                </View>
              </View>
              <IconSymbol
                ios_icon_name="chevron-right"
                android_material_icon_name="chevron-right"
                size={20}
                color={theme.textSecondary}
              />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            <TouchableOpacity
              style={styles.settingItem}
              onPress={handleHelp}
              activeOpacity={0.7}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: theme.success + '20' }]}>
                  <IconSymbol
                    ios_icon_name="help"
                    android_material_icon_name="help"
                    size={20}
                    color={theme.success}
                  />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={[styles.settingLabel, { color: theme.text }]}>
                    {helpText}
                  </Text>
                  <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
                    {helpDescriptionText}
                  </Text>
                </View>
              </View>
              <IconSymbol
                ios_icon_name="chevron-right"
                android_material_icon_name="chevron-right"
                size={20}
                color={theme.textSecondary}
              />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => {
                console.log('[ProfileScreen] User tapped Login/Admin Control');
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/admin/');
              }}
              activeOpacity={0.7}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: theme.error + '20' }]}>
                  <IconSymbol
                    ios_icon_name={isAdmin ? 'settings' : 'login'}
                    android_material_icon_name={isAdmin ? 'settings' : 'login'}
                    size={20}
                    color={theme.error}
                  />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={[styles.settingLabel, { color: theme.text }]}>
                    {isAdmin ? adminControlText : 'Login'}
                  </Text>
                  <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
                    {isAdmin ? adminDescriptionText : 'Access admin features'}
                  </Text>
                </View>
              </View>
              <IconSymbol
                ios_icon_name="chevron-right"
                android_material_icon_name="chevron-right"
                size={20}
                color={theme.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 100 }} />
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
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    paddingTop: 16,
    paddingBottom: 24,
  },
  greeting: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  premiumCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 32,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  premiumContent: {
    gap: 12,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  premiumBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  premiumTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 4,
  },
  premiumDescription: {
    fontSize: 15,
    lineHeight: 22,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
    gap: 8,
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  activityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  activityCard: {
    width: '48%',
    padding: 16,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  activityLabel: {
    fontSize: 13,
    marginBottom: 4,
  },
  activityValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  activityValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  activityUnit: {
    fontSize: 13,
  },
  settingsCard: {
    borderRadius: 16,
    padding: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingTextContainer: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  settingDescription: {
    fontSize: 13,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
  },
});
</write file>

<write file="app/(tabs)/profile.ios.tsx">
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/styles/commonStyles';
import { activityApi, goalsApi } from '@/utils/api';
import { IconSymbol } from '@/components/IconSymbol';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTheme, useAdminAuth } from '@/contexts/WidgetContext';
import { Stack } from 'expo-router';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const { currentTheme: theme } = useTheme();
  const { isAdmin } = useAdminAuth();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [activityData, setActivityData] = useState<any>(null);
  const [goals, setGoals] = useState<any[]>([]);

  const today = new Date().toISOString().split('T')[0];

  const loadData = React.useCallback(async () => {
    console.log('[ProfileScreen] Loading activity data and goals');
    setRefreshing(true);
    try {
      const [summary, goalsData] = await Promise.all([
        activityApi.getSummary(today),
        goalsApi.getGoals(),
      ]);
      setActivityData(summary);
      setGoals(goalsData);
      console.log('[ProfileScreen] Data loaded successfully');
    } catch (error) {
      console.error('[ProfileScreen] Failed to load data:', error);
    } finally {
      setRefreshing(false);
    }
  }, [today]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleUpgrade = () => {
    console.log('[ProfileScreen] User tapped Upgrade to Premium');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Premium Features',
      'Unlock advanced tools, personalized insights, and exclusive content with Eluminate Premium.',
      [
        { text: 'Maybe Later', style: 'cancel' },
        { text: 'Learn More', onPress: () => console.log('Navigate to premium info') },
      ]
    );
  };

  const handlePrivacy = () => {
    console.log('[ProfileScreen] User tapped Privacy Policy');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Privacy Policy', 'Your privacy is important to us. We protect your data and never share it without your consent.');
  };

  const handleTerms = () => {
    console.log('[ProfileScreen] User tapped Terms of Service');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Terms of Service', 'By using Eluminate, you agree to our terms and conditions.');
  };

  const handleHelp = () => {
    console.log('[ProfileScreen] User tapped Help & Support');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Help & Support', 'Need assistance? Contact us at support@eluminate.app');
  };

  const ActivityCard = ({
    icon,
    label,
    value,
    unit,
    color,
  }: {
    icon: string;
    label: string;
    value: number;
    unit: string;
    color: string;
  }) => {
    const displayValue = value.toString();
    const displayUnit = unit;
    
    return (
      <View style={[styles.activityCard, { backgroundColor: theme.card }]}>
        <View style={[styles.activityIcon, { backgroundColor: color + '20' }]}>
          <IconSymbol
            ios_icon_name={icon}
            android_material_icon_name={icon}
            size={24}
            color={color}
          />
        </View>
        <Text style={[styles.activityLabel, { color: theme.textSecondary }]}>
          {label}
        </Text>
        <View style={styles.activityValueRow}>
          <Text style={[styles.activityValue, { color: theme.text }]}>
            {displayValue}
          </Text>
          <Text style={[styles.activityUnit, { color: theme.textSecondary }]}>
            {displayUnit}
          </Text>
        </View>
      </View>
    );
  };

  const greetingText = 'Your Wellness Profile';
  const premiumBadgeText = 'Premium';
  const upgradeButtonText = 'Upgrade to Premium';
  const todayActivityTitle = 'Today\'s Activity';
  const settingsTitle = 'Settings';
  const adminControlText = 'Admin Control';
  const adminDescriptionText = 'Manage app content and settings';
  const privacyText = 'Privacy Policy';
  const privacyDescriptionText = 'How we protect your data';
  const termsText = 'Terms of Service';
  const termsDescriptionText = 'Our terms and conditions';
  const helpText = 'Help & Support';
  const helpDescriptionText = 'Get assistance and answers';

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Profile',
          headerLargeTitle: true,
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
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={loadData} 
              tintColor={theme.primary} 
            />
          }
        >
          {/* Premium Card */}
          <Animated.View entering={FadeInDown.delay(0).duration(400)}>
            <View style={[styles.premiumCard, { backgroundColor: theme.primary }]}>
              <View style={styles.premiumContent}>
                <View style={styles.premiumBadge}>
                  <IconSymbol
                    ios_icon_name="star"
                    android_material_icon_name="star"
                    size={16}
                    color="#FFD700"
                  />
                  <Text style={styles.premiumBadgeText}>{premiumBadgeText}</Text>
                </View>
                <Text style={styles.premiumTitle}>
                  Unlock Your Full Potential
                </Text>
                <Text style={styles.premiumDescription}>
                  Access advanced tools, personalized insights, and exclusive wellness content
                </Text>
                <TouchableOpacity
                  style={styles.upgradeButton}
                  onPress={handleUpgrade}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.upgradeButtonText, { color: theme.primary }]}>
                    {upgradeButtonText}
                  </Text>
                  <IconSymbol
                    ios_icon_name="arrow-forward"
                    android_material_icon_name="arrow-forward"
                    size={20}
                    color={theme.primary}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>

          {/* Today's Activity */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              {todayActivityTitle}
            </Text>
            <View style={styles.activityGrid}>
              <ActivityCard
                icon="directions-walk"
                label="Steps"
                value={activityData?.steps || 0}
                unit="steps"
                color={theme.success}
              />
              <ActivityCard
                icon="bedtime"
                label="Sleep"
                value={activityData?.sleep || 0}
                unit="hrs"
                color={theme.primary}
              />
              <ActivityCard
                icon="water-drop"
                label="Water"
                value={activityData?.water || 0}
                unit="cups"
                color={theme.info}
              />
              <ActivityCard
                icon="mood"
                label="Mood"
                value={activityData?.mood_check || 0}
                unit="checks"
                color={theme.warning}
              />
            </View>
          </View>

          {/* Settings */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              {settingsTitle}
            </Text>
            <View style={[styles.settingsCard, { backgroundColor: theme.card }]}>
              <TouchableOpacity
                style={styles.settingItem}
                onPress={() => {
                  console.log('[ProfileScreen] User tapped Theme Settings');
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push('/(tabs)/theme-settings');
                }}
                activeOpacity={0.7}
              >
                <View style={styles.settingLeft}>
                  <View style={[styles.settingIcon, { backgroundColor: theme.primary + '20' }]}>
                    <IconSymbol
                      ios_icon_name="palette"
                      android_material_icon_name="palette"
                      size={20}
                      color={theme.primary}
                    />
                  </View>
                  <Text style={[styles.settingLabel, { color: theme.text }]}>
                    Theme Settings
                  </Text>
                </View>
                <IconSymbol
                  ios_icon_name="chevron-right"
                  android_material_icon_name="chevron-right"
                  size={20}
                  color={theme.textSecondary}
                />
              </TouchableOpacity>

              <View style={[styles.divider, { backgroundColor: theme.border }]} />

              <TouchableOpacity
                style={styles.settingItem}
                onPress={handlePrivacy}
                activeOpacity={0.7}
              >
                <View style={styles.settingLeft}>
                  <View style={[styles.settingIcon, { backgroundColor: theme.info + '20' }]}>
                    <IconSymbol
                      ios_icon_name="lock"
                      android_material_icon_name="lock"
                      size={20}
                      color={theme.info}
                    />
                  </View>
                  <View style={styles.settingTextContainer}>
                    <Text style={[styles.settingLabel, { color: theme.text }]}>
                      {privacyText}
                    </Text>
                    <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
                      {privacyDescriptionText}
                    </Text>
                  </View>
                </View>
                <IconSymbol
                  ios_icon_name="chevron-right"
                  android_material_icon_name="chevron-right"
                  size={20}
                  color={theme.textSecondary}
                />
              </TouchableOpacity>

              <View style={[styles.divider, { backgroundColor: theme.border }]} />

              <TouchableOpacity
                style={styles.settingItem}
                onPress={handleTerms}
                activeOpacity={0.7}
              >
                <View style={styles.settingLeft}>
                  <View style={[styles.settingIcon, { backgroundColor: theme.warning + '20' }]}>
                    <IconSymbol
                      ios_icon_name="description"
                      android_material_icon_name="description"
                      size={20}
                      color={theme.warning}
                    />
                  </View>
                  <View style={styles.settingTextContainer}>
                    <Text style={[styles.settingLabel, { color: theme.text }]}>
                      {termsText}
                    </Text>
                    <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
                      {termsDescriptionText}
                    </Text>
                  </View>
                </View>
                <IconSymbol
                  ios_icon_name="chevron-right"
                  android_material_icon_name="chevron-right"
                  size={20}
                  color={theme.textSecondary}
                />
              </TouchableOpacity>

              <View style={[styles.divider, { backgroundColor: theme.border }]} />

              <TouchableOpacity
                style={styles.settingItem}
                onPress={handleHelp}
                activeOpacity={0.7}
              >
                <View style={styles.settingLeft}>
                  <View style={[styles.settingIcon, { backgroundColor: theme.success + '20' }]}>
                    <IconSymbol
                      ios_icon_name="help"
                      android_material_icon_name="help"
                      size={20}
                      color={theme.success}
                    />
                  </View>
                  <View style={styles.settingTextContainer}>
                    <Text style={[styles.settingLabel, { color: theme.text }]}>
                      {helpText}
                    </Text>
                    <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
                      {helpDescriptionText}
                    </Text>
                  </View>
                </View>
                <IconSymbol
                  ios_icon_name="chevron-right"
                  android_material_icon_name="chevron-right"
                  size={20}
                  color={theme.textSecondary}
                />
              </TouchableOpacity>

              <View style={[styles.divider, { backgroundColor: theme.border }]} />

              <TouchableOpacity
                style={styles.settingItem}
                onPress={() => {
                  console.log('[ProfileScreen] User tapped Login/Admin Control');
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push('/admin/');
                }}
                activeOpacity={0.7}
              >
                <View style={styles.settingLeft}>
                  <View style={[styles.settingIcon, { backgroundColor: theme.error + '20' }]}>
                    <IconSymbol
                      ios_icon_name={isAdmin ? 'settings' : 'login'}
                      android_material_icon_name={isAdmin ? 'settings' : 'login'}
                      size={20}
                      color={theme.error}
                    />
                  </View>
                  <View style={styles.settingTextContainer}>
                    <Text style={[styles.settingLabel, { color: theme.text }]}>
                      {isAdmin ? adminControlText : 'Login'}
                    </Text>
                    <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
                      {isAdmin ? adminDescriptionText : 'Access admin features'}
                    </Text>
                  </View>
                </View>
                <IconSymbol
                  ios_icon_name="chevron-right"
                  android_material_icon_name="chevron-right"
                  size={20}
                  color={theme.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ height: 100 }} />
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
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },
  premiumCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 32,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  premiumContent: {
    gap: 12,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  premiumBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  premiumTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 4,
  },
  premiumDescription: {
    fontSize: 15,
    lineHeight: 22,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
    gap: 8,
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  activityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  activityCard: {
    width: '48%',
    padding: 16,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  activityLabel: {
    fontSize: 13,
    marginBottom: 4,
  },
  activityValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  activityValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  activityUnit: {
    fontSize: 13,
  },
  settingsCard: {
    borderRadius: 16,
    padding: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingTextContainer: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  settingDescription: {
    fontSize: 13,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
  },
});
</write file>

Now let's create a new admin page to manage sleep tools so they're visible in the premium admin control:

<write file="app/admin/sleep-tools.tsx">
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator,
  Platform,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Stack } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useTheme, useAdminAuth } from '@/contexts/WidgetContext';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { BACKEND_URL } from '@/utils/api';

interface SleepTool {
  id: string;
  tool_type: string;
  title: string;
  description: string;
  content?: string;
  duration_minutes: number;
  is_premium: boolean;
  audio_url?: string;
  created_at: string;
}

export default function AdminSleepTools() {
  const { currentTheme: theme } = useTheme();
  const { isAdmin, isLoading: authLoading } = useAdminAuth();
  const router = useRouter();
  const [tools, setTools] = useState<SleepTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTool, setEditingTool] = useState<SleepTool | null>(null);

  // Form state
  const [toolType, setToolType] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('');
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    loadTools();
  }, []);

  const loadTools = async () => {
    console.log('[AdminSleepTools] Loading sleep tools');
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/sleep/tools`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        throw new Error('Failed to load tools');
      }
      
      const data = await response.json();
      setTools(data);
      console.log('[AdminSleepTools] Loaded tools:', data.length);
    } catch (error) {
      console.error('[AdminSleepTools] Failed to load tools:', error);
      Alert.alert('Error', 'Failed to load sleep tools');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTool = () => {
    console.log('[AdminSleepTools] User tapped Add Tool');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditingTool(null);
    setToolType('');
    setTitle('');
    setDescription('');
    setContent('');
    setDurationMinutes('');
    setIsPremium(false);
    setModalVisible(true);
  };

  const handleEditTool = (tool: SleepTool) => {
    console.log('[AdminSleepTools] Editing tool:', tool.id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditingTool(tool);
    setToolType(tool.tool_type);
    setTitle(tool.title);
    setDescription(tool.description);
    setContent(tool.content || '');
    setDurationMinutes(tool.duration_minutes.toString());
    setIsPremium(tool.is_premium);
    setModalVisible(true);
  };

  const handleSaveTool = async () => {
    if (!toolType || !title || !description || !durationMinutes) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    console.log('[AdminSleepTools] Saving tool');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    try {
      const toolData = {
        tool_type: toolType,
        title,
        description,
        content,
        duration_minutes: parseInt(durationMinutes),
        is_premium: isPremium,
      };

      const url = editingTool 
        ? `${BACKEND_URL}/api/sleep/tools/${editingTool.id}`
        : `${BACKEND_URL}/api/sleep/tools`;
      
      const response = await fetch(url, {
        method: editingTool ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toolData),
      });

      if (!response.ok) {
        throw new Error('Failed to save tool');
      }

      setModalVisible(false);
      loadTools();
      Alert.alert('Success', `Tool ${editingTool ? 'updated' : 'created'} successfully`);
    } catch (error) {
      console.error('[AdminSleepTools] Failed to save tool:', error);
      Alert.alert('Error', 'Failed to save tool');
    }
  };

  const handleDeleteTool = (tool: SleepTool) => {
    Alert.alert(
      'Delete Tool',
      `Are you sure you want to delete "${tool.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            console.log('[AdminSleepTools] Deleting tool:', tool.id);
            try {
              const response = await fetch(`${BACKEND_URL}/api/sleep/tools/${tool.id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({}),
              });

              if (!response.ok) {
                throw new Error('Failed to delete tool');
              }

              loadTools();
              Alert.alert('Success', 'Tool deleted successfully');
            } catch (error) {
              console.error('[AdminSleepTools] Failed to delete tool:', error);
              Alert.alert('Error', 'Failed to delete tool');
            }
          },
        },
      ]
    );
  };

  const getToolIcon = (toolType: string): string => {
    const iconMap: Record<string, string> = {
      breathwork: 'air',
      body_scan: 'self-improvement',
      sleep_story: 'menu-book',
      ambient_sounds: 'music-note',
      gratitude: 'favorite',
      wind_down: 'nightlight',
    };
    return iconMap[toolType] || 'bedtime';
  };

  // Redirect to admin login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAdmin) {
      console.log('[AdminSleepTools] Not authenticated, redirecting to admin login');
      Alert.alert('Access Denied', 'Please login as admin to access this page');
      router.replace('/admin/');
    }
  }, [authLoading, isAdmin, router]);

  if (loading || authLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <Stack.Screen
          options={{
            headerShown: true,
            title: 'Sleep Tools',
            headerStyle: { backgroundColor: theme.background },
            headerTintColor: theme.text,
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </SafeAreaView>
    );
  }

  // Don't render if not admin
  if (!isAdmin) {
    return null;
  }

  const premiumTools = tools.filter(t => t.is_premium);
  const freeTools = tools.filter(t => !t.is_premium);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Sleep Tools',
          headerStyle: { backgroundColor: theme.background },
          headerTintColor: theme.text,
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.header, Platform.OS === 'android' && { paddingTop: 16 }]}>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Manage sleep tools and premium features
          </Text>
        </View>

        {/* Premium Tools Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <IconSymbol
              ios_icon_name="star"
              android_material_icon_name="star"
              size={20}
              color="#FFD700"
            />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Premium Tools
            </Text>
            <View style={[styles.badge, { backgroundColor: theme.primary + '20' }]}>
              <Text style={[styles.badgeText, { color: theme.primary }]}>
                {premiumTools.length}
              </Text>
            </View>
          </View>

          {premiumTools.map((tool, index) => (
            <Animated.View
              key={tool.id}
              entering={FadeInDown.delay(index * 50).duration(300)}
              style={[styles.toolCard, { backgroundColor: theme.card }]}
            >
              <View style={styles.toolHeader}>
                <View style={styles.toolInfo}>
                  <View style={styles.toolTitleRow}>
                    <IconSymbol
                      ios_icon_name={getToolIcon(tool.tool_type)}
                      android_material_icon_name={getToolIcon(tool.tool_type)}
                      size={20}
                      color={theme.primary}
                    />
                    <Text style={[styles.toolTitle, { color: theme.text }]}>
                      {tool.title}
                    </Text>
                  </View>
                  <Text style={[styles.toolDescription, { color: theme.textSecondary }]}>
                    {tool.description}
                  </Text>
                  <View style={styles.toolMeta}>
                    <Text style={[styles.toolMetaText, { color: theme.textSecondary }]}>
                      {tool.duration_minutes} min
                    </Text>
                    <Text style={[styles.toolMetaText, { color: theme.textSecondary }]}>
                      •
                    </Text>
                    <Text style={[styles.toolMetaText, { color: theme.textSecondary }]}>
                      {tool.tool_type}
                    </Text>
                  </View>
                </View>
                <View style={styles.toolActions}>
                  <TouchableOpacity
                    onPress={() => handleEditTool(tool)}
                    style={[styles.actionButton, { backgroundColor: theme.primary + '20' }]}
                  >
                    <IconSymbol
                      ios_icon_name="edit"
                      android_material_icon_name="edit"
                      size={18}
                      color={theme.primary}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDeleteTool(tool)}
                    style={[styles.actionButton, { backgroundColor: theme.error + '20' }]}
                  >
                    <IconSymbol
                      ios_icon_name="delete"
                      android_material_icon_name="delete"
                      size={18}
                      color={theme.error}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          ))}
        </View>

        {/* Free Tools Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <IconSymbol
              ios_icon_name="lock-open"
              android_material_icon_name="lock-open"
              size={20}
              color={theme.success}
            />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Free Tools
            </Text>
            <View style={[styles.badge, { backgroundColor: theme.success + '20' }]}>
              <Text style={[styles.badgeText, { color: theme.success }]}>
                {freeTools.length}
              </Text>
            </View>
          </View>

          {freeTools.map((tool, index) => (
            <Animated.View
              key={tool.id}
              entering={FadeInDown.delay(index * 50).duration(300)}
              style={[styles.toolCard, { backgroundColor: theme.card }]}
            >
              <View style={styles.toolHeader}>
                <View style={styles.toolInfo}>
                  <View style={styles.toolTitleRow}>
                    <IconSymbol
                      ios_icon_name={getToolIcon(tool.tool_type)}
                      android_material_icon_name={getToolIcon(tool.tool_type)}
                      size={20}
                      color={theme.success}
                    />
                    <Text style={[styles.toolTitle, { color: theme.text }]}>
                      {tool.title}
                    </Text>
                  </View>
                  <Text style={[styles.toolDescription, { color: theme.textSecondary }]}>
                    {tool.description}
                  </Text>
                  <View style={styles.toolMeta}>
                    <Text style={[styles.toolMetaText, { color: theme.textSecondary }]}>
                      {tool.duration_minutes} min
                    </Text>
                    <Text style={[styles.toolMetaText, { color: theme.textSecondary }]}>
                      •
                    </Text>
                    <Text style={[styles.toolMetaText, { color: theme.textSecondary }]}>
                      {tool.tool_type}
                    </Text>
                  </View>
                </View>
                <View style={styles.toolActions}>
                  <TouchableOpacity
                    onPress={() => handleEditTool(tool)}
                    style={[styles.actionButton, { backgroundColor: theme.primary + '20' }]}
                  >
                    <IconSymbol
                      ios_icon_name="edit"
                      android_material_icon_name="edit"
                      size={18}
                      color={theme.primary}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDeleteTool(tool)}
                    style={[styles.actionButton, { backgroundColor: theme.error + '20' }]}
                  >
                    <IconSymbol
                      ios_icon_name="delete"
                      android_material_icon_name="delete"
                      size={18}
                      color={theme.error}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.primary }]}
          onPress={handleAddTool}
          activeOpacity={0.8}
        >
          <IconSymbol
            ios_icon_name="add"
            android_material_icon_name="add"
            size={24}
            color="#FFFFFF"
          />
          <Text style={styles.addButtonText}>Add New Tool</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Edit/Add Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={[styles.modalCancel, { color: theme.primary }]}>Cancel</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {editingTool ? 'Edit Tool' : 'New Tool'}
            </Text>
            <TouchableOpacity onPress={handleSaveTool}>
              <Text style={[styles.modalSave, { color: theme.primary }]}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <Text style={[styles.label, { color: theme.text }]}>Tool Type</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
              value={toolType}
              onChangeText={setToolType}
              placeholder="e.g., breathwork, body_scan, sleep_story"
              placeholderTextColor={theme.textSecondary}
            />

            <Text style={[styles.label, { color: theme.text }]}>Title</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
              value={title}
              onChangeText={setTitle}
              placeholder="Tool title"
              placeholderTextColor={theme.textSecondary}
            />

            <Text style={[styles.label, { color: theme.text }]}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: theme.card, color: theme.text }]}
              value={description}
              onChangeText={setDescription}
              placeholder="Brief description"
              placeholderTextColor={theme.textSecondary}
              multiline
              numberOfLines={3}
            />

            <Text style={[styles.label, { color: theme.text }]}>Content</Text>
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: theme.card, color: theme.text }]}
              value={content}
              onChangeText={setContent}
              placeholder="Detailed content or instructions"
              placeholderTextColor={theme.textSecondary}
              multiline
              numberOfLines={5}
            />

            <Text style={[styles.label, { color: theme.text }]}>Duration (minutes)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
              value={durationMinutes}
              onChangeText={setDurationMinutes}
              placeholder="e.g., 10"
              placeholderTextColor={theme.textSecondary}
              keyboardType="numeric"
            />

            <View style={styles.switchRow}>
              <View>
                <Text style={[styles.label, { color: theme.text }]}>Premium Feature</Text>
                <Text style={[styles.switchDescription, { color: theme.textSecondary }]}>
                  Requires subscription to access
                </Text>
              </View>
              <Switch
                value={isPremium}
                onValueChange={setIsPremium}
                trackColor={{ false: theme.border, true: theme.primary + '60' }}
                thumbColor={isPremium ? theme.primary : theme.textSecondary}
              />
            </View>

            <View style={{ height: 40 }} />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
  },
  header: {
    paddingTop: 8,
    paddingBottom: 24,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  toolCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  toolHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  toolInfo: {
    flex: 1,
    marginRight: 12,
  },
  toolTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  toolTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  toolDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  toolMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toolMetaText: {
    fontSize: 13,
  },
  toolActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
    gap: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalCancel: {
    fontSize: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalSave: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
  },
  switchDescription: {
    fontSize: 13,
    marginTop: 4,
  },
});
