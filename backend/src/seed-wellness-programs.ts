import { createApplication } from '@specific-dev/framework';
import * as appSchema from './db/schema.js';
import * as authSchema from './db/auth-schema.js';

const schema = { ...appSchema, ...authSchema };

export async function seedWellnessPrograms() {
  const app = await createApplication(schema);

  try {
    // Check if programs already exist
    const existingPrograms = await app.db.select().from(appSchema.wellnessPrograms);
    if (existingPrograms.length > 0) {
      console.log(
        `✓ Wellness programs already seeded (${existingPrograms.length} programs found), skipping`
      );
      return;
    }

    const wellnessProgramsData = [
      // FREE PROGRAMS
      {
        program_type: 'stress_relief',
        title: '7-Day Stress Relief',
        description: 'A quick, accessible program to manage daily stress and anxiety',
        duration_days: 7,
        is_premium: false,
        daily_activities: [
          { day: 1, title: 'Understanding Stress', activity: 'Learn the fundamentals of stress and how it affects your body. Practice deep breathing for 5 minutes.' },
          { day: 2, title: 'Body Awareness', activity: 'Perform a progressive body scan to identify where you hold tension. Spend 10 minutes releasing physical stress.' },
          { day: 3, title: 'Mindful Movement', activity: 'Gentle stretching and walking meditation. Notice how movement helps release tension.' },
          { day: 4, title: 'Thought Patterns', activity: 'Learn to recognize stress-inducing thought patterns. Practice reframing techniques.' },
          { day: 5, title: 'Breathing Techniques', activity: 'Master the 4-7-8 breathing technique. Practice for 10 minutes whenever stress arises.' },
          { day: 6, title: 'Grounding Exercises', activity: 'Learn 5-4-3-2-1 sensory grounding. Use when anxiety peaks.' },
          { day: 7, title: 'Integration & Reflection', activity: 'Review your week, identify what helped most, and create your stress-management toolkit.' },
        ],
        image_url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=300&fit=crop',
      },
      {
        program_type: 'energy_reset',
        title: '5-Day Energy Reset',
        description: 'Revitalize your energy levels through movement, nutrition, and sleep optimization',
        duration_days: 5,
        is_premium: false,
        daily_activities: [
          { day: 1, title: 'Energy Audit', activity: 'Assess your current energy levels throughout the day. Identify energy drains and boosts.' },
          { day: 2, title: 'Movement & Vitality', activity: '20 minutes of energizing exercise. Any activity that gets your heart pumping works.' },
          { day: 3, title: 'Nutrition Focus', activity: 'Learn about energy-sustaining foods. Plan meals that stabilize blood sugar.' },
          { day: 4, title: 'Sleep Optimization', activity: 'Create an ideal sleep environment. Practice a 20-minute wind-down routine.' },
          { day: 5, title: 'Energy Mastery', activity: 'Combine all learnings. Design your personal energy management plan.' },
        ],
        image_url: 'https://images.unsplash.com/photo-1518611505868-48cb0bd25748?w=400&h=300&fit=crop',
      },
      {
        program_type: 'gratitude',
        title: '3-Day Gratitude Start',
        description: 'Begin building a gratitude practice in just 3 days with simple exercises',
        duration_days: 3,
        is_premium: false,
        daily_activities: [
          { day: 1, title: 'First Steps in Gratitude', activity: 'Write down 3 things you are grateful for today. No matter how small.' },
          { day: 2, title: 'Deepening Appreciation', activity: 'Express gratitude to one person. Share what they mean to you.' },
          { day: 3, title: 'Gratitude Reflection', activity: 'Reflect on how gratitude practice has shifted your perspective. Plan daily practice.' },
        ],
        image_url: 'https://images.unsplash.com/photo-1528720596519-c21dde05b84b?w=400&h=300&fit=crop',
      },

      // PREMIUM PROGRAMS
      {
        program_type: 'mindfulness',
        title: '21-Day Mindfulness Journey',
        description: 'A comprehensive journey into mindfulness meditation with progressive deepening',
        duration_days: 21,
        is_premium: true,
        daily_activities: [
          { day: 1, title: 'What is Mindfulness?', activity: 'Introduction to mindfulness. 5-minute breathing meditation.' },
          { day: 2, title: 'Body Scan Foundation', activity: '10-minute guided body scan meditation.' },
          { day: 3, title: 'Breath Awareness', activity: 'Focus on the breath. Notice without changing.' },
          { day: 4, title: 'Thought Observation', activity: 'Observe thoughts like clouds passing. No judgment.' },
          { day: 5, title: 'Loving Kindness Intro', activity: 'Begin loving-kindness meditation with yourself.' },
          { day: 6, title: 'Expanding Kindness', activity: 'Extend loving-kindness to others.' },
          { day: 7, title: 'Week One Reflection', activity: 'Reflect on your meditation practice. Adjust as needed.' },
          { day: 8, title: 'Deepening Breath Work', activity: '15-minute advanced breathing practice.' },
          { day: 9, title: 'Body & Mind Connection', activity: 'Connect bodily sensations with mental states.' },
          { day: 10, title: 'Staying Present', activity: 'Practice present-moment awareness throughout the day.' },
          { day: 11, title: 'Working with Difficult Emotions', activity: 'Learn to approach emotions with compassion.' },
          { day: 12, title: 'Mindful Eating', activity: 'Eat one meal with complete awareness.' },
          { day: 13, title: 'Walking Meditation', activity: '15-minute mindful walking practice.' },
          { day: 14, title: 'Mid-Point Integration', activity: 'Review progress. Deepen your commitment.' },
          { day: 15, title: 'Advanced Visualization', activity: '20-minute guided visualization meditation.' },
          { day: 16, title: 'Metta in Action', activity: 'Extend loving-kindness to all beings.' },
          { day: 17, title: 'Equanimity Practice', activity: 'Cultivate balance and acceptance.' },
          { day: 18, title: 'Daily Mindfulness Integration', activity: 'Bring mindfulness into all daily activities.' },
          { day: 19, title: 'Advanced Technique Exploration', activity: 'Explore techniques that resonate most with you.' },
          { day: 20, title: 'Your Personal Practice', activity: 'Design your ongoing mindfulness practice.' },
          { day: 21, title: 'Completion & Integration', activity: 'Celebrate your journey. Commit to lifelong practice.' },
        ],
        image_url: 'https://images.unsplash.com/photo-1512207736139-7fc3ee1aae4e?w=400&h=300&fit=crop',
      },
      {
        program_type: 'sleep_mastery',
        title: '14-Day Sleep Mastery',
        description: 'Master the science of sleep with proven techniques and practices',
        duration_days: 14,
        is_premium: true,
        daily_activities: [
          { day: 1, title: 'Sleep Science Basics', activity: 'Learn sleep cycles and why quality sleep matters.' },
          { day: 2, title: 'Sleep Environment Optimization', activity: 'Audit and improve your sleep space for darkness, temperature, and comfort.' },
          { day: 3, title: 'Wind-Down Ritual', activity: 'Create a 30-minute wind-down routine. Practice tonight.' },
          { day: 4, title: 'Digital Hygiene', activity: 'Establish screen-free time 1 hour before bed.' },
          { day: 5, title: 'Sleep Breathing Techniques', activity: 'Master the 4-7-8 breathing for sleep.' },
          { day: 6, title: 'Progressive Relaxation', activity: '20-minute body relaxation practice.' },
          { day: 7, title: 'Sleep Journal Insights', activity: 'Review your sleep week. Identify patterns.' },
          { day: 8, title: 'Sleep Story Meditation', activity: 'Try guided sleep story. Let it carry you to sleep.' },
          { day: 9, title: 'Nutrition for Sleep', activity: 'Learn sleep-friendly foods and meal timing.' },
          { day: 10, title: 'Exercise & Sleep Connection', activity: 'Discover how movement improves sleep quality.' },
          { day: 11, title: 'Advanced Relaxation Techniques', activity: 'Explore body scan and visualization.' },
          { day: 12, title: 'Managing Sleep Anxiety', activity: 'Learn techniques for racing thoughts at bedtime.' },
          { day: 13, title: 'Fine-Tuning Your Practice', activity: 'Adjust techniques based on what\'s working.' },
          { day: 14, title: 'Long-Term Sleep Mastery', activity: 'Create your sustainable sleep excellence plan.' },
        ],
        image_url: 'https://images.unsplash.com/photo-1508270175620-ce7e6f763667?w=400&h=300&fit=crop',
      },
      {
        program_type: 'self_compassion',
        title: '30-Day Self-Compassion Practice',
        description: 'Transform your relationship with yourself through compassion-based practices',
        duration_days: 30,
        is_premium: true,
        daily_activities: [
          { day: 1, title: 'Introduction to Self-Compassion', activity: 'Understand the three elements of self-compassion: mindfulness, common humanity, self-kindness.' },
          { day: 2, title: 'Recognizing Self-Criticism', activity: 'Identify your inner critic. Notice its patterns.' },
          { day: 3, title: 'Your Compassionate Voice', activity: 'Develop a kind, supportive inner voice.' },
          { day: 4, title: 'Common Humanity', activity: 'Recognize that struggle is part of the human experience.' },
          { day: 5, title: 'Self-Compassion Phrases', activity: 'Practice supportive phrases for difficult moments.' },
          { day: 6, title: 'Loving-Kindness Foundations', activity: 'Begin loving-kindness practice directed toward yourself.' },
          { day: 7, title: 'Week One Reflection', activity: 'Notice shifts in how you speak to yourself.' },
          { day: 8, title: 'Compassion Meditation', activity: '20-minute guided self-compassion meditation.' },
          { day: 9, title: 'Releasing Perfectionism', activity: 'Explore how perfectionism undermines self-compassion.' },
          { day: 10, title: 'Mistakes & Learning', activity: 'Reframe mistakes as opportunities for growth.' },
          { day: 11, title: 'Setting Compassionate Boundaries', activity: 'Learn saying "no" is an act of self-care.' },
          { day: 12, title: 'Self-Compassion in Relationships', activity: 'Extend compassion to yourself within relationships.' },
          { day: 13, title: 'Journaling for Compassion', activity: 'Write about challenges with kindness toward yourself.' },
          { day: 14, title: 'Mid-Point Integration', activity: 'Notice the impact of self-compassion practice.' },
          { day: 15, title: 'Tonglen Practice', activity: 'Transform suffering through compassion exchange.' },
          { day: 16, title: 'Self-Care as Self-Compassion', activity: 'Discover that self-care is compassion in action.' },
          { day: 17, title: 'Working with Shame', activity: 'Learn to meet shame with compassion instead of judgment.' },
          { day: 18, title: 'Compassion for Your Body', activity: 'Build a kind relationship with your physical self.' },
          { day: 19, title: 'Emotional Acceptance', activity: 'Hold difficult emotions with compassion.' },
          { day: 20, title: 'Advanced Compassion Practice', activity: '25-minute deep self-compassion meditation.' },
          { day: 21, title: 'Three-Week Review', activity: 'Celebrate growth. Deepen commitment.' },
          { day: 22, title: 'Compassion During Crisis', activity: 'Learn to stay compassionate when life is hard.' },
          { day: 23, title: 'Inner Resource Building', activity: 'Strengthen your compassionate presence.' },
          { day: 24, title: 'Compassion Toward Past Self', activity: 'Offer kindness to your younger self.' },
          { day: 25, title: 'Vision of Compassionate Self', activity: 'Visualize your compassionate potential.' },
          { day: 26, title: 'Daily Compassion Practice', activity: 'Integrate self-compassion into everyday life.' },
          { day: 27, title: 'Sustaining Momentum', activity: 'Maintain practice through challenges.' },
          { day: 28, title: 'Sharing Compassion', activity: 'Extend your compassion to others naturally.' },
          { day: 29, title: 'Personal Compassion Ritual', activity: 'Create your unique compassion practice.' },
          { day: 30, title: 'Commitment to Self-Compassion', activity: 'Pledge to ongoing compassionate self-relating.' },
        ],
        image_url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=300&fit=crop',
      },
    ];

    // Insert all wellness programs
    const createdPrograms = await app.db
      .insert(appSchema.wellnessPrograms)
      .values(wellnessProgramsData)
      .returning();

    console.log(`\n✓ Successfully seeded ${createdPrograms.length} wellness programs`);
    console.log(`  - Free programs: 3`);
    console.log(`  - Premium programs: 3`);
    console.log(`\nPrograms created:`);
    createdPrograms.forEach((program, index) => {
      const tierLabel = program.is_premium ? 'Premium' : 'Free';
      console.log(
        `  ${index + 1}. ${program.title} (${program.duration_days} days) - ${tierLabel}`
      );
    });
  } catch (error) {
    console.error('Failed to seed wellness programs:', error);
    throw error;
  }
}

// Run seed
seedWellnessPrograms()
  .then(() => {
    console.log('\n✓ Wellness programs seed completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n✗ Wellness programs seed failed:', error);
    process.exit(1);
  });
