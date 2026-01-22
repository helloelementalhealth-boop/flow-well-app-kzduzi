
import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { useTheme } from '@/contexts/WidgetContext';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function PrivacyPolicyScreen() {
  const { currentTheme: theme } = useTheme();

  const sections = [
    {
      title: 'Information We Collect',
      content: 'We collect information you provide directly to us, including your name, email address, and wellness data you choose to track. This includes journal entries, meditation sessions, nutrition logs, and activity metrics. All data is stored securely and encrypted.',
    },
    {
      title: 'How We Use Your Information',
      content: 'Your information is used to provide and improve our wellness services, personalize your experience, and send you relevant notifications and insights. We analyze aggregated, anonymized data to improve our app features and user experience.',
    },
    {
      title: 'Data Security',
      content: 'We implement industry-standard security measures to protect your personal information. All data is encrypted in transit and at rest. We use secure servers and regularly update our security protocols to ensure your information remains safe.',
    },
    {
      title: 'Your Privacy Rights',
      content: 'You have the right to access, update, or delete your personal information at any time. You can export your data or request complete account deletion. We will never sell your personal information to third parties.',
    },
    {
      title: 'Third-Party Services',
      content: 'We may use trusted third-party services for analytics and app functionality. These services are bound by strict privacy agreements and only receive anonymized data necessary for their specific functions.',
    },
    {
      title: 'Data Retention',
      content: 'We retain your personal information for as long as your account is active or as needed to provide you services. You can request deletion of your data at any time, and we will comply within 30 days.',
    },
    {
      title: 'Children\'s Privacy',
      content: 'Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you believe we have collected such information, please contact us immediately.',
    },
    {
      title: 'Changes to This Policy',
      content: 'We may update this privacy policy from time to time. We will notify you of any significant changes via email or in-app notification. Your continued use of the app after changes constitutes acceptance of the updated policy.',
    },
    {
      title: 'Contact Us',
      content: 'If you have any questions about this privacy policy or our data practices, please contact us at privacy@eluminate.app. We are committed to addressing your concerns promptly and transparently.',
    },
  ];

  const headerTitle = 'Privacy Policy';
  const lastUpdatedText = 'Last updated: January 2026';
  const introText = 'Your privacy is important to us. This policy explains how we collect, use, and protect your personal information when you use Eluminate.';

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Privacy Policy',
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
          <View style={[styles.header, Platform.OS === 'android' && { paddingTop: 48 }]}>
            <Text style={[styles.title, { color: theme.text }]}>
              {headerTitle}
            </Text>
            <Text style={[styles.lastUpdated, { color: theme.textSecondary }]}>
              {lastUpdatedText}
            </Text>
          </View>

          <Animated.View entering={FadeInDown.duration(400)}>
            <View style={[styles.introCard, { backgroundColor: theme.card }]}>
              <Text style={[styles.introText, { color: theme.text }]}>
                {introText}
              </Text>
            </View>
          </Animated.View>

          {sections.map((section, index) => {
            const sectionTitle = section.title;
            const sectionContent = section.content;
            
            return (
              <Animated.View
                key={index}
                entering={FadeInDown.delay(index * 50).duration(400)}
              >
                <View style={[styles.section, { backgroundColor: theme.card }]}>
                  <Text style={[styles.sectionTitle, { color: theme.text }]}>
                    {sectionTitle}
                  </Text>
                  <Text style={[styles.sectionContent, { color: theme.textSecondary }]}>
                    {sectionContent}
                  </Text>
                </View>
              </Animated.View>
            );
          })}

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
  },
  header: {
    paddingTop: 16,
    paddingBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  lastUpdated: {
    fontSize: 14,
  },
  introCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  introText: {
    fontSize: 16,
    lineHeight: 24,
  },
  section: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  sectionContent: {
    fontSize: 15,
    lineHeight: 24,
  },
});
