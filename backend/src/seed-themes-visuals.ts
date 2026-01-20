import { createApplication } from "@specific-dev/framework";
import * as schema from './db/schema.js';
import { eq } from 'drizzle-orm';

export async function seedThemesAndVisuals() {
  const app = await createApplication(schema);

  // Check if themes already exist
  const existingThemes = await app.db.select().from(schema.visualThemes);
  if (existingThemes.length > 0) {
    app.logger.info('Themes already seeded, skipping');
    return;
  }

  // Seed themes
  const themes = [
    {
      theme_name: 'Warm Earth',
      background_color: '#f5f1ed',
      card_color: '#efe9e4',
      text_color: '#5a4a42',
      text_secondary_color: '#8b7765',
      primary_color: '#c9a87d',
      secondary_color: '#9b8b7e',
      accent_color: '#d4a574',
    },
    {
      theme_name: 'Soft Pastels',
      background_color: '#faf7f9',
      card_color: '#f5f0f7',
      text_color: '#6b5b7a',
      text_secondary_color: '#9b8ba8',
      primary_color: '#d4b5e8',
      secondary_color: '#c9a8d8',
      accent_color: '#e8c5f0',
    },
    {
      theme_name: 'Deep Grounding',
      background_color: '#2a2520',
      card_color: '#3d3530',
      text_color: '#e8e0d8',
      text_secondary_color: '#b8a89f',
      primary_color: '#6b8e7f',
      secondary_color: '#4a6b5e',
      accent_color: '#7da892',
    },
    {
      theme_name: 'Neutral Calm',
      background_color: '#f3f1f0',
      card_color: '#ebe8e5',
      text_color: '#6b6b6b',
      text_secondary_color: '#989898',
      primary_color: '#b5b5b5',
      secondary_color: '#9a9a9a',
      accent_color: '#c5c5c5',
    },
    {
      theme_name: 'Energizing Dawn',
      background_color: '#fff5f0',
      card_color: '#ffeee5',
      text_color: '#7a5a45',
      text_secondary_color: '#b89968',
      primary_color: '#f5a869',
      secondary_color: '#e89b5a',
      accent_color: '#ffc284',
    },
  ];

  const createdThemes = await app.db
    .insert(schema.visualThemes)
    .values(themes)
    .returning();

  app.logger.info({ count: createdThemes.length }, 'Themes seeded successfully');

  // Seed rhythm visuals - distributed across months
  const rhythmVisuals = [
    // January - Movement
    {
      rhythm_category: 'movement',
      rhythm_name: 'Morning Activation',
      image_url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800',
      video_url: null,
      month_active: 1,
      display_order: 1,
    },
    {
      rhythm_category: 'nourishment',
      rhythm_name: 'Winter Warmth',
      image_url: 'https://images.unsplash.com/photo-1543256969-8f5e2a6d8d75?w=800',
      video_url: null,
      month_active: 1,
      display_order: 2,
    },
    // February - Presence
    {
      rhythm_category: 'presence',
      rhythm_name: 'Mindful Pause',
      image_url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800',
      video_url: null,
      month_active: 2,
      display_order: 1,
    },
    {
      rhythm_category: 'reflection',
      rhythm_name: 'Inner Stillness',
      image_url: 'https://images.unsplash.com/photo-1516222338550-38f3cabf841d?w=800',
      video_url: null,
      month_active: 2,
      display_order: 2,
    },
    // March - Renewal
    {
      rhythm_category: 'movement',
      rhythm_name: 'Spring Flow',
      image_url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800',
      video_url: null,
      month_active: 3,
      display_order: 1,
    },
    {
      rhythm_category: 'nourishment',
      rhythm_name: 'Fresh Beginnings',
      image_url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800',
      video_url: null,
      month_active: 3,
      display_order: 2,
    },
    // April - Growth
    {
      rhythm_category: 'presence',
      rhythm_name: 'Grounded Growth',
      image_url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800',
      video_url: null,
      month_active: 4,
      display_order: 1,
    },
    {
      rhythm_category: 'reflection',
      rhythm_name: 'Seasonal Reflection',
      image_url: 'https://images.unsplash.com/photo-1494783367193-149034c05e41?w=800',
      video_url: null,
      month_active: 4,
      display_order: 2,
    },
    // May - Connection
    {
      rhythm_category: 'movement',
      rhythm_name: 'Flowing Motion',
      image_url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800',
      video_url: null,
      month_active: 5,
      display_order: 1,
    },
    {
      rhythm_category: 'nourishment',
      rhythm_name: 'Bloom & Nourish',
      image_url: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800',
      video_url: null,
      month_active: 5,
      display_order: 2,
    },
    // June - Brightness
    {
      rhythm_category: 'presence',
      rhythm_name: 'Summer Presence',
      image_url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800',
      video_url: null,
      month_active: 6,
      display_order: 1,
    },
    {
      rhythm_category: 'reflection',
      rhythm_name: 'Radiant Awareness',
      image_url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800',
      video_url: null,
      month_active: 6,
      display_order: 2,
    },
    // July - Energy
    {
      rhythm_category: 'movement',
      rhythm_name: 'Peak Energy Flow',
      image_url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800',
      video_url: null,
      month_active: 7,
      display_order: 1,
    },
    {
      rhythm_category: 'nourishment',
      rhythm_name: 'Vital Sustenance',
      image_url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800',
      video_url: null,
      month_active: 7,
      display_order: 2,
    },
    // August - Harvest
    {
      rhythm_category: 'presence',
      rhythm_name: 'Harvest Awareness',
      image_url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800',
      video_url: null,
      month_active: 8,
      display_order: 1,
    },
    {
      rhythm_category: 'reflection',
      rhythm_name: 'Gratitude Circle',
      image_url: 'https://images.unsplash.com/photo-1516222338550-38f3cabf841d?w=800',
      video_url: null,
      month_active: 8,
      display_order: 2,
    },
    // September - Transition
    {
      rhythm_category: 'movement',
      rhythm_name: 'Transitional Flow',
      image_url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800',
      video_url: null,
      month_active: 9,
      display_order: 1,
    },
    {
      rhythm_category: 'nourishment',
      rhythm_name: 'Seasonal Shift',
      image_url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800',
      video_url: null,
      month_active: 9,
      display_order: 2,
    },
    // October - Preparation
    {
      rhythm_category: 'presence',
      rhythm_name: 'Mindful Preparation',
      image_url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800',
      video_url: null,
      month_active: 10,
      display_order: 1,
    },
    {
      rhythm_category: 'reflection',
      rhythm_name: 'Autumn Contemplation',
      image_url: 'https://images.unsplash.com/photo-1494783367193-149034c05e41?w=800',
      video_url: null,
      month_active: 10,
      display_order: 2,
    },
    // November - Gratitude
    {
      rhythm_category: 'movement',
      rhythm_name: 'Grateful Motion',
      image_url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800',
      video_url: null,
      month_active: 11,
      display_order: 1,
    },
    {
      rhythm_category: 'nourishment',
      rhythm_name: 'Nourishing Abundance',
      image_url: 'https://images.unsplash.com/photo-1543256969-8f5e2a6d8d75?w=800',
      video_url: null,
      month_active: 11,
      display_order: 2,
    },
    // December - Rest
    {
      rhythm_category: 'presence',
      rhythm_name: 'Restful Presence',
      image_url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800',
      video_url: null,
      month_active: 12,
      display_order: 1,
    },
    {
      rhythm_category: 'reflection',
      rhythm_name: 'Year-End Reflection',
      image_url: 'https://images.unsplash.com/photo-1516222338550-38f3cabf841d?w=800',
      video_url: null,
      month_active: 12,
      display_order: 2,
    },
  ];

  const createdVisuals = await app.db
    .insert(schema.rhythmVisuals)
    .values(rhythmVisuals)
    .returning();

  app.logger.info({ count: createdVisuals.length }, 'Rhythm visuals seeded successfully');
}

// Run seed
seedThemesAndVisuals()
  .then(() => {
    console.log('Seed completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  });
