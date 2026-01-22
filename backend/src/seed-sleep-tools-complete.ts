import { createApplication } from "@specific-dev/framework";
import * as appSchema from './db/schema.js';
import * as authSchema from './db/auth-schema.js';

const schema = { ...appSchema, ...authSchema };

export async function seedSleepToolsComplete() {
  const app = await createApplication(schema);

  try {
    // Check if sleep tools already exist
    const existingTools = await app.db.select().from(appSchema.sleepTools);
    if (existingTools.length > 0) {
      console.log(`✓ Sleep tools already seeded (${existingTools.length} tools found), skipping`);
      return;
    }

    const sleepToolsData = [
      // FREE TOOLS
      {
        tool_type: 'breathwork',
        title: 'Calming Breathwork',
        description: 'Gentle breathing exercises to quiet the mind',
        content:
          'Begin by finding a comfortable seated or lying position. Close your eyes. Inhale slowly through your nose for 4 counts, hold for 4 counts, exhale through your mouth for 6 counts. Repeat this cycle 10 times, allowing your body to relax with each breath.',
        duration_minutes: 10,
        is_premium: false,
        audio_url: null,
      },
      {
        tool_type: 'ambient_sounds',
        title: 'Rain & Thunder',
        description: 'Soothing nature sounds for deep rest',
        content:
          'Close your eyes and listen to the gentle patter of rain on leaves, the distant rumble of thunder, and the peaceful rhythm of nature. Let these sounds wash over you, creating a cocoon of calm.',
        duration_minutes: 30,
        is_premium: false,
        audio_url: null,
      },
      {
        tool_type: 'gratitude',
        title: 'Evening Gratitude',
        description: 'Reflect on the gifts of your day',
        content:
          "Take a moment to reflect on three things from today that you're grateful for. They can be big or small - a kind word, a warm meal, a moment of peace. Hold each one in your heart and feel the warmth of appreciation.",
        duration_minutes: 5,
        is_premium: false,
        audio_url: null,
      },
      // PREMIUM TOOLS
      {
        tool_type: 'body_scan',
        title: 'Progressive Body Scan',
        description: 'Release tension from head to toe',
        content:
          'Lie down comfortably. Starting at the crown of your head, bring awareness to each part of your body. Notice any tension. Breathe into that area and imagine the tension melting away. Move slowly down through your face, neck, shoulders, arms, torso, hips, legs, and feet.',
        duration_minutes: 15,
        is_premium: true,
        audio_url: null,
      },
      {
        tool_type: 'sleep_story',
        title: 'Forest Journey',
        description: 'A peaceful narrative to guide you to sleep',
        content:
          'Imagine yourself walking through a quiet forest at dusk. The air is cool and fresh. You hear the gentle rustling of leaves and distant bird songs. With each step, you feel more relaxed, more at peace. The path leads you to a cozy cabin where you can rest...',
        duration_minutes: 20,
        is_premium: true,
        audio_url: null,
      },
      {
        tool_type: 'wind_down',
        title: 'Complete Wind Down',
        description: 'A full evening routine for optimal rest',
        content:
          'This complete wind-down ritual combines gentle stretching, breathwork, and visualization. Begin by dimming the lights. Spend 5 minutes doing gentle neck and shoulder rolls. Then practice 4-7-8 breathing for 10 minutes. Finally, visualize your perfect sleep sanctuary for 10 minutes.',
        duration_minutes: 25,
        is_premium: true,
        audio_url: null,
      },
    ];

    // Insert all sleep tools
    const createdTools = await app.db
      .insert(appSchema.sleepTools)
      .values(sleepToolsData)
      .returning();

    console.log(`\n✓ Successfully seeded ${createdTools.length} sleep tools`);
    console.log(`  - Free tools: 3`);
    console.log(`  - Premium tools: 3`);
    console.log(`\nTools created:`);
    createdTools.forEach((tool, index) => {
      const tierLabel = tool.is_premium ? 'Premium' : 'Free';
      console.log(
        `  ${index + 1}. ${tool.title} (${tool.tool_type}) - ${tool.duration_minutes} min - ${tierLabel}`
      );
    });
  } catch (error) {
    console.error('Failed to seed sleep tools:', error);
    throw error;
  }
}

// Run seed
seedSleepToolsComplete()
  .then(() => {
    console.log('\n✓ Sleep tools seed completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n✗ Sleep tools seed failed:', error);
    process.exit(1);
  });
