
import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { useTheme } from '@/contexts/WidgetContext';
import { IconSymbol } from '@/components/IconSymbol';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

export default function HelpSupportScreen() {
  const { currentTheme: theme } = useTheme();

  const handleContactEmail = () => {
    console.log('[HelpSupport] User tapped email support');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL('mailto:support@eluminate.app?subject=Support Request');
  };

  const handleFAQ = (question: string) => {
    console.log('[HelpSupport] User tapped FAQ:', question);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const contactOptions = [
    {
      icon: 'email',
      title: 'Email Support',
      description: 'support@eluminate.app',
      action: handleContactEmail,
    },
  ];

  const faqs = [
    {
      question: 'How do I track my wellness activities?',
      answer: 'Navigate to the specific tab (Movement, Mindfulness, Nourishment) and tap the + button to log your activities. All your data is automatically saved and synced.',
    },
    {
      question: 'What are Wellness Programs?',
      answer: 'Wellness Programs are structured multi-day journeys designed to help you build healthy habits. Enroll in a program from the Wellness tab and follow the daily activities to complete it.',
    },
    {
      question: 'How do I upgrade to Premium?',
      answer: 'Tap the "Upgrade to Premium" button on your Profile screen to view available subscription plans and unlock advanced features, personalized insights, and exclusive content.',
    },
    {
      question: 'Can I export my data?',
      answer: 'Yes! Go to Profile > Settings and select "Export Data" to download all your wellness information in a portable format.',
    },
    {
      question: 'How do I change my theme?',
      answer: 'Visit Profile > Theme Settings to choose from our curated color palettes. You can also enable "Auto Theme by Time" to have your theme shift throughout the day.',
    },
    {
      question: 'Is my data secure?',
      answer: 'Absolutely. All your personal information and wellness data is encrypted and stored securely. We never share your data with third parties. See our Privacy Policy for details.',
    },
    {
      question: 'How do notifications work?',
      answer: 'Enable notifications in your device settings to receive gentle reminders for meditation, hydration, and wellness check-ins. You can customize notification preferences in the app.',
    },
    {
      question: 'Can I cancel my subscription?',
      answer: 'Yes, you can cancel your subscription at any time through your device\'s app store settings. Your premium features will remain active until the end of your billing period.',
    },
  ];

  const headerTitle = 'Help & Support';
  const contactSectionTitle = 'Contact Us';
  const faqSectionTitle = 'Frequently Asked Questions';
  const resourcesSectionTitle = 'Additional Resources';

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Help & Support',
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
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              We&apos;re here to help you on your wellness journey
            </Text>
          </View>

          {/* Contact Options */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              {contactSectionTitle}
            </Text>
            {contactOptions.map((option, index) => {
              const optionTitle = option.title;
              const optionDescription = option.description;
              
              return (
                <Animated.View
                  key={index}
                  entering={FadeInDown.delay(index * 50).duration(400)}
                >
                  <TouchableOpacity
                    style={[styles.contactCard, { backgroundColor: theme.card }]}
                    onPress={option.action}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.contactIcon, { backgroundColor: theme.primary + '20' }]}>
                      <IconSymbol
                        ios_icon_name={option.icon}
                        android_material_icon_name={option.icon}
                        size={24}
                        color={theme.primary}
                      />
                    </View>
                    <View style={styles.contactInfo}>
                      <Text style={[styles.contactTitle, { color: theme.text }]}>
                        {optionTitle}
                      </Text>
                      <Text style={[styles.contactDescription, { color: theme.textSecondary }]}>
                        {optionDescription}
                      </Text>
                    </View>
                    <IconSymbol
                      ios_icon_name="chevron-right"
                      android_material_icon_name="chevron-right"
                      size={20}
                      color={theme.textSecondary}
                    />
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>

          {/* FAQs */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              {faqSectionTitle}
            </Text>
            {faqs.map((faq, index) => {
              const faqQuestion = faq.question;
              const faqAnswer = faq.answer;
              
              return (
                <Animated.View
                  key={index}
                  entering={FadeInDown.delay(index * 30).duration(400)}
                >
                  <TouchableOpacity
                    style={[styles.faqCard, { backgroundColor: theme.card }]}
                    onPress={() => handleFAQ(faq.question)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.faqHeader}>
                      <IconSymbol
                        ios_icon_name="help"
                        android_material_icon_name="help"
                        size={20}
                        color={theme.primary}
                      />
                      <Text style={[styles.faqQuestion, { color: theme.text }]}>
                        {faqQuestion}
                      </Text>
                    </View>
                    <Text style={[styles.faqAnswer, { color: theme.textSecondary }]}>
                      {faqAnswer}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>

          {/* Additional Resources */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              {resourcesSectionTitle}
            </Text>
            <Animated.View entering={FadeInDown.delay(400).duration(400)}>
              <View style={[styles.resourceCard, { backgroundColor: theme.card }]}>
                <IconSymbol
                  ios_icon_name="info"
                  android_material_icon_name="info"
                  size={20}
                  color={theme.primary}
                />
                <Text style={[styles.resourceText, { color: theme.textSecondary }]}>
                  For more detailed guides and tutorials, visit our website or check out our blog for wellness tips and app updates.
                </Text>
              </View>
            </Animated.View>
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
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  contactDescription: {
    fontSize: 14,
  },
  faqCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  faqAnswer: {
    fontSize: 15,
    lineHeight: 24,
  },
  resourceCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 20,
    borderRadius: 16,
    gap: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  resourceText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 24,
  },
});
