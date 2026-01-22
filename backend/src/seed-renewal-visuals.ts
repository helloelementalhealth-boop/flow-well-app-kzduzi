import { createApplication } from '@specific-dev/framework';
import * as appSchema from './db/schema.js';
import * as authSchema from './db/auth-schema.js';

const schema = { ...appSchema, ...authSchema };

export async function seedRenewalVisuals() {
  const app = await createApplication(schema);

  try {
    // Check if visuals already exist
    const existingVisuals = await app.db.select().from(appSchema.renewalVisuals);
    if (existingVisuals.length > 0) {
      console.log(`✓ Renewal visuals already seeded (${existingVisuals.length} visuals found), skipping`);
      return;
    }

    const renewalVisualsData = [
      // SEASONAL VISUALS (4)
      {
        visual_type: 'seasonal',
        season: 'spring',
        day_of_week: null,
        month: null,
        image_url: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=1200&q=80',
        description: 'Cherry blossoms in spring light',
      },
      {
        visual_type: 'seasonal',
        season: 'summer',
        day_of_week: null,
        month: null,
        image_url: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=1200&q=80',
        description: 'Golden field under summer sun',
      },
      {
        visual_type: 'seasonal',
        season: 'fall',
        day_of_week: null,
        month: null,
        image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&q=80',
        description: 'Autumn leaves in golden light',
      },
      {
        visual_type: 'seasonal',
        season: 'winter',
        day_of_week: null,
        month: null,
        image_url: 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=1200&q=80',
        description: 'Snowy mountains in stillness',
      },

      // MONTHLY VISUALS (12)
      {
        visual_type: 'monthly',
        season: null,
        day_of_week: null,
        month: 1,
        image_url: 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=1200&q=80',
        description: 'January snow and silence',
      },
      {
        visual_type: 'monthly',
        season: null,
        day_of_week: null,
        month: 2,
        image_url: 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=1200&q=80',
        description: 'February frost and stillness',
      },
      {
        visual_type: 'monthly',
        season: null,
        day_of_week: null,
        month: 3,
        image_url: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=1200&q=80',
        description: 'March awakening and bloom',
      },
      {
        visual_type: 'monthly',
        season: null,
        day_of_week: null,
        month: 4,
        image_url: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=1200&q=80',
        description: 'April renewal and growth',
      },
      {
        visual_type: 'monthly',
        season: null,
        day_of_week: null,
        month: 5,
        image_url: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=1200&q=80',
        description: 'May abundance and light',
      },
      {
        visual_type: 'monthly',
        season: null,
        day_of_week: null,
        month: 6,
        image_url: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=1200&q=80',
        description: 'June golden warmth',
      },
      {
        visual_type: 'monthly',
        season: null,
        day_of_week: null,
        month: 7,
        image_url: 'https://images.unsplash.com/photo-1503066211613-c17ebc9daef0?w=1200&q=80',
        description: 'July radiant energy',
      },
      {
        visual_type: 'monthly',
        season: null,
        day_of_week: null,
        month: 8,
        image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',
        description: 'August richness and depth',
      },
      {
        visual_type: 'monthly',
        season: null,
        day_of_week: null,
        month: 9,
        image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&q=80',
        description: 'September transition and reflection',
      },
      {
        visual_type: 'monthly',
        season: null,
        day_of_week: null,
        month: 10,
        image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&q=80',
        description: 'October harvest and release',
      },
      {
        visual_type: 'monthly',
        season: null,
        day_of_week: null,
        month: 11,
        image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&q=80',
        description: 'November gratitude and rest',
      },
      {
        visual_type: 'monthly',
        season: null,
        day_of_week: null,
        month: 12,
        image_url: 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=1200&q=80',
        description: 'December reflection and renewal',
      },

      // DAILY VISUALS (7)
      {
        visual_type: 'daily',
        season: null,
        day_of_week: 0,
        month: null,
        image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',
        description: 'Sunday - Rest and renewal',
      },
      {
        visual_type: 'daily',
        season: null,
        day_of_week: 1,
        month: null,
        image_url: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1200&q=80',
        description: 'Monday - New beginnings',
      },
      {
        visual_type: 'daily',
        season: null,
        day_of_week: 2,
        month: null,
        image_url: 'https://images.unsplash.com/photo-1511671782486-a01980e01a18?w=1200&q=80',
        description: 'Tuesday - Grounded strength',
      },
      {
        visual_type: 'daily',
        season: null,
        day_of_week: 3,
        month: null,
        image_url: 'https://images.unsplash.com/photo-1495238505555-83d5e1a6c8cb?w=1200&q=80',
        description: 'Wednesday - Flow and balance',
      },
      {
        visual_type: 'daily',
        season: null,
        day_of_week: 4,
        month: null,
        image_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=1200&q=80',
        description: 'Thursday - Creative energy',
      },
      {
        visual_type: 'daily',
        season: null,
        day_of_week: 5,
        month: null,
        image_url: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=1200&q=80',
        description: 'Friday - Light and joy',
      },
      {
        visual_type: 'daily',
        season: null,
        day_of_week: 6,
        month: null,
        image_url: 'https://images.unsplash.com/photo-1505228395891-9a51e7e86e81?w=1200&q=80',
        description: 'Saturday - Integration and presence',
      },
    ];

    // Insert all renewal visuals
    const createdVisuals = await app.db
      .insert(appSchema.renewalVisuals)
      .values(renewalVisualsData)
      .returning();

    console.log(`\n✓ Successfully seeded ${createdVisuals.length} renewal visuals`);
    console.log(`  - Seasonal visuals: 4`);
    console.log(`  - Monthly visuals: 12`);
    console.log(`  - Daily visuals: 7`);
    console.log(`\nVisuals created:`);
    createdVisuals.forEach((visual, index) => {
      const typeLabel = visual.visual_type === 'seasonal'
        ? `Seasonal (${visual.season})`
        : visual.visual_type === 'monthly'
        ? `Monthly (Month ${visual.month})`
        : `Daily (Day ${visual.day_of_week})`;
      console.log(`  ${index + 1}. ${visual.description} - ${typeLabel}`);
    });
  } catch (error) {
    console.error('Failed to seed renewal visuals:', error);
    throw error;
  }
}

// Run seed
seedRenewalVisuals()
  .then(() => {
    console.log('\n✓ Renewal visuals seed completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n✗ Renewal visuals seed failed:', error);
    process.exit(1);
  });
