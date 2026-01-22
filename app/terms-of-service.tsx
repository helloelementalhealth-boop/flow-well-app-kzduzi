
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

export default function TermsOfServiceScreen() {
  const { currentTheme: theme } = useTheme();

  const sections = [
    {
      title: 'Acceptance of Terms',
      content: 'By accessing and using Eluminate, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our app. Your continued use constitutes acceptance of any updates to these terms.',
    },
    {
      title: 'Use of Service',
      content: 'Eluminate is a wellness and mindfulness platform designed to support your personal growth journey. You agree to use the service only for lawful purposes and in accordance with these terms. You are responsible for maintaining the confidentiality of your account.',
    },
    {
      title: 'User Content',
      content: 'You retain all rights to the content you create in Eluminate, including journal entries, notes, and personal data. By using our service, you grant us a license to store and process this content to provide our services to you.',
    },
    {
      title: 'Subscription and Payments',
      content: 'Premium features require a paid subscription. Subscriptions automatically renew unless cancelled at least 24 hours before the end of the current period. Refunds are handled according to the app store policies of your platform.',
    },
    {
      title: 'Intellectual Property',
      content: 'All content, features, and functionality of Eluminate, including but not limited to text, graphics, logos, and software, are owned by us and protected by copyright, trademark, and other intellectual property laws.',
    },
    {
      title: 'Disclaimer of Warranties',
      content: 'Eluminate is provided "as is" without warranties of any kind. We do not guarantee that the service will be uninterrupted or error-free. The app is not a substitute for professional medical or mental health advice.',
    },
    {
      title: 'Limitation of Liability',
      content: 'We shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of Eluminate. Our total liability shall not exceed the amount you paid for the service in the past 12 months.',
    },
    {
      title: 'Account Termination',
      content: 'We reserve the right to suspend or terminate your account if you violate these terms or engage in harmful behavior. You may terminate your account at any time through the app settings.',
    },
    {
      title: 'Changes to Terms',
      content: 'We may modify these terms at any time. We will notify you of significant changes via email or in-app notification. Your continued use after changes constitutes acceptance of the modified terms.',
    },
    {
      title: 'Governing Law',
      content: 'These terms are governed by and construed in accordance with applicable laws. Any disputes shall be resolved through binding arbitration in accordance with commercial arbitration rules.',
    },
    {
      title: 'Contact Information',
      content: 'For questions about these Terms of Service, please contact us at legal@eluminate.app. We are committed to addressing your concerns and maintaining transparent communication.',
    },
  ];

  const headerTitle = 'Terms of Service';
  const lastUpdatedText = 'Last updated: January 2026';
  const introText = 'Please read these terms carefully before using Eluminate. These terms govern your use of our wellness platform and services.';

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Terms of Service',
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
