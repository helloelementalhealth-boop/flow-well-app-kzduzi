import { createApplication } from "@specific-dev/framework";
import * as appSchema from './db/schema.js';
import * as authSchema from './db/auth-schema.js';

const schema = { ...appSchema, ...authSchema };

export async function seedSleepToolsData() {
  const app = await createApplication(schema);

  try {
    // Check if sleep tools already exist
    const existingTools = await app.db.select().from(appSchema.sleepTools);
    if (existingTools.length > 0) {
      console.log(`Sleep tools already seeded (${existingTools.length} tools found), skipping`);
      return;
    }

    const sleepToolsData = [
      // FREE TOOLS
      {
        tool_type: 'breathwork',
        title: '4-7-8 Breathing',
        description: 'A calming breathwork technique to help you fall asleep naturally',
        content:
          'The 4-7-8 breathing technique is a simple yet powerful method to calm your nervous system:\n\n1. Exhale completely through your mouth\n2. Close your mouth and inhale through your nose for 4 counts\n3. Hold your breath for 7 counts\n4. Exhale completely through your mouth for 8 counts\n5. Repeat this cycle 3-4 times\n\nThis technique activates your parasympathetic nervous system, signaling to your body that it\'s time to rest.',
        duration_minutes: 5,
        is_premium: false,
        audio_url: null,
      },
      {
        tool_type: 'gratitude',
        title: 'Evening Gratitude',
        description: 'Reflect on three things you\'re grateful for today',
        content:
          'Before sleep, take a moment to reflect on your day:\n\n1. Think of three things you\'re grateful for today\n2. They can be big or small - a warm meal, a kind word, a moment of peace\n3. Feel the warmth of appreciation in your heart\n4. Let this positive energy carry you into sleep\n\nGratitude practice has been shown to improve sleep quality and overall well-being.',
        duration_minutes: 5,
        is_premium: false,
        audio_url: null,
      },
      {
        tool_type: 'wind_down',
        title: 'Gentle Wind Down',
        description: 'A simple routine to prepare your body and mind for rest',
        content:
          'Create a peaceful transition to sleep:\n\n1. Dim the lights in your space\n2. Put away electronic devices\n3. Do some gentle stretches\n4. Take a few deep breaths\n5. Set an intention for restful sleep\n\nThis routine signals to your body that it\'s time to shift from activity to rest.',
        duration_minutes: 10,
        is_premium: false,
        audio_url: null,
      },
      // PREMIUM TOOLS
      {
        tool_type: 'body_scan',
        title: 'Deep Body Scan Meditation',
        description: 'A guided journey through your body to release tension and invite sleep',
        content:
          'This premium body scan meditation guides you through deep relaxation:\n\n1. Lie comfortably in bed\n2. Starting with your toes, bring awareness to each part of your body\n3. Notice any tension and consciously release it\n4. Move slowly up through your legs, torso, arms, and head\n5. Feel your body becoming heavy and relaxed\n6. Allow yourself to drift into peaceful sleep\n\nThis extended practice includes guided audio and visualization techniques for deeper relaxation.',
        duration_minutes: 20,
        is_premium: true,
        audio_url: null,
      },
      {
        tool_type: 'sleep_story',
        title: 'Moonlit Forest Journey',
        description: 'A soothing narrative to guide you into peaceful dreams',
        content:
          'Premium sleep story with calming narration:\n\nImagine yourself walking through a moonlit forest. The air is cool and fresh. Soft moonlight filters through the trees, creating patterns of light and shadow on the forest floor. You hear the gentle rustle of leaves and the distant call of an owl.\n\nAs you walk deeper into the forest, you discover a peaceful clearing with a comfortable bed of soft moss. You lie down, feeling the earth support you. The stars twinkle above through the canopy. You feel completely safe and at peace.\n\nYour breathing slows. Your body relaxes. The forest embraces you in its quiet magic...\n\n[Full story continues with rich sensory details and calming imagery]',
        duration_minutes: 30,
        is_premium: true,
        audio_url: null,
      },
      {
        tool_type: 'ambient_sounds',
        title: 'Ocean Waves & Rain',
        description: 'Premium soundscapes designed for deep, restorative sleep',
        content:
          'Premium ambient soundscapes include:\n\n- Gentle ocean waves lapping on shore\n- Soft rainfall on leaves\n- Distant thunder\n- Crickets chirping\n- Wind through trees\n\nThese high-quality recordings are designed to mask disruptive noises and create a cocoon of calm. The sounds are carefully mixed to promote delta wave brain activity associated with deep sleep.\n\nPremium features:\n- 8-hour continuous playback\n- Fade-out timer options\n- Mix your own soundscape\n- Offline playback',
        duration_minutes: 60,
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
  } catch (error) {
    console.error('Failed to seed sleep tools:', error);
    throw error;
  }
}

// Run seed
seedSleepToolsData()
  .then(() => {
    console.log('Sleep tools seed completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Sleep tools seed failed:', error);
    process.exit(1);
  });
