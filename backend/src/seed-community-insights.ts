import { createApplication } from '@specific-dev/framework';
import * as appSchema from './db/schema.js';
import * as authSchema from './db/auth-schema.js';

const schema = { ...appSchema, ...authSchema };

export async function seedCommunityInsights() {
  const app = await createApplication(schema);

  try {
    // Check if insights already exist
    const existingInsights = await app.db.select().from(appSchema.communityInsights);
    if (existingInsights.length > 0) {
      console.log(`✓ Community insights already seeded (${existingInsights.length} insights found), skipping`);
      return;
    }

    const communityInsightsData = [
      {
        insight_type: 'stat',
        title: 'Most Active Time',
        description: 'Peak wellness activity occurs between 7-9 AM when users are most engaged with their programs.',
        is_active: true,
        display_order: 1,
      },
      {
        insight_type: 'recommendation',
        title: 'Popular Combination',
        description: 'Members who combine mindfulness with sleep programs report 40% better sleep quality.',
        is_active: true,
        display_order: 2,
      },
      {
        insight_type: 'tip',
        title: 'Wellness Tip',
        description: 'Starting your day with a 5-minute breathing exercise can reduce stress levels by up to 30%.',
        is_active: true,
        display_order: 3,
      },
      {
        insight_type: 'tip',
        title: 'Weekly Streak Bonus',
        description: 'Completing your wellness practices for 7 consecutive days unlocks exclusive guided meditations.',
        is_active: true,
        display_order: 4,
      },
      {
        insight_type: 'stat',
        title: 'Community Milestone',
        description: 'Our community has completed over 100,000 wellness sessions this month. You\'re part of something meaningful.',
        is_active: true,
        display_order: 5,
      },
    ];

    // Insert all community insights
    const createdInsights = await app.db
      .insert(appSchema.communityInsights)
      .values(communityInsightsData)
      .returning();

    console.log(`\n✓ Successfully seeded ${createdInsights.length} community insights`);
    console.log(`  - Tips: ${createdInsights.filter((i) => i.insight_type === 'tip').length}`);
    console.log(`  - Stats: ${createdInsights.filter((i) => i.insight_type === 'stat').length}`);
    console.log(`  - Recommendations: ${createdInsights.filter((i) => i.insight_type === 'recommendation').length}`);
    console.log(`\nInsights created:`);
    createdInsights.forEach((insight, index) => {
      console.log(`  ${index + 1}. [${insight.insight_type.toUpperCase()}] ${insight.title}`);
    });
  } catch (error) {
    console.error('Failed to seed community insights:', error);
    throw error;
  }
}

// Run seed
seedCommunityInsights()
  .then(() => {
    console.log('\n✓ Community insights seed completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n✗ Community insights seed failed:', error);
    process.exit(1);
  });
