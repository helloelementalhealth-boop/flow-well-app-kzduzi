import { createApplication } from "@specific-dev/framework";
import * as appSchema from './db/schema.js';
import * as authSchema from './db/auth-schema.js';

const schema = { ...appSchema, ...authSchema };

export async function seedSleepToolsFinal() {
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
        title: '4-7-8 Breathing',
        description: 'A calming breathwork technique to help you fall asleep naturally',
        content:
          'Begin by exhaling completely through your mouth. Close your mouth and inhale quietly through your nose for 4 counts. Hold your breath for 7 counts. Exhale completely through your mouth for 8 counts. This is one breath cycle. Repeat 3-4 times.',
        duration_minutes: 5,
        is_premium: false,
        audio_url: null,
      },
      {
        tool_type: 'ambient_sounds',
        title: 'Rain & Thunder',
        description: 'Soothing sounds of a gentle rainstorm to lull you to sleep',
        content:
          'Close your eyes and listen to the rhythmic patter of rain on leaves, punctuated by distant rumbles of thunder. Let the sounds wash over you, creating a cocoon of calm.',
        duration_minutes: 30,
        is_premium: false,
        audio_url: null,
      },
      {
        tool_type: 'gratitude',
        title: 'Evening Gratitude',
        description: 'Reflect on three things that brought you joy today',
        content:
          'Before sleep, take a moment to recall three things from your day that you are grateful for. They can be small moments or significant events. Hold each one in your awareness and feel the warmth of appreciation.',
        duration_minutes: 5,
        is_premium: false,
        audio_url: null,
      },
      // PREMIUM TOOLS
      {
        tool_type: 'body_scan',
        title: 'Progressive Relaxation',
        description: 'Release tension from head to toe with guided body awareness',
        content:
          'Lie comfortably and bring awareness to your toes. Notice any tension. Breathe into that area and release. Move slowly up through your feet, calves, thighs, continuing through your entire body up to the crown of your head. Take your time with each area.',
        duration_minutes: 15,
        is_premium: true,
        audio_url: null,
      },
      {
        tool_type: 'sleep_story',
        title: 'Moonlit Forest Walk',
        description: 'A gentle narrative journey through a peaceful nighttime forest',
        content:
          'Imagine yourself walking along a soft forest path under the gentle glow of moonlight. The air is cool and fresh. You hear the distant sound of an owl. Each step takes you deeper into tranquility...',
        duration_minutes: 20,
        is_premium: true,
        audio_url: null,
      },
      {
        tool_type: 'wind_down',
        title: 'Gentle Evening Ritual',
        description: 'A complete wind-down sequence combining breath, body, and mind',
        content:
          'Begin with three deep breaths. Scan your body for tension. Reflect on your day without judgment. Set an intention for restful sleep. Release any worries, knowing tomorrow is a new beginning.',
        duration_minutes: 10,
        is_premium: true,
        audio_url: null,
      },
    ];

    // Insert all sleep tools
    const createdTools = await app.db
      .insert(appSchema.sleepTools)
      .values(sleepToolsData)
      .returning();

    console.log(`✓ Successfully seeded ${createdTools.length} sleep tools`);
    console.log(`  - Free tools: 3`);
    console.log(`  - Premium tools: 3`);
    console.log(`\nTools created:`);
    createdTools.forEach((tool, index) => {
      console.log(
        `  ${index + 1}. ${tool.title} (${tool.tool_type}) - ${tool.duration_minutes} min - ${tool.is_premium ? 'Premium' : 'Free'}`
      );
    });
  } catch (error) {
    console.error('Failed to seed sleep tools:', error);
    throw error;
  }
}

// Run seed
seedSleepToolsFinal()
  .then(() => {
    console.log('\n✓ Sleep tools seed completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n✗ Sleep tools seed failed:', error);
    process.exit(1);
  });
