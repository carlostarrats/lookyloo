import type { ScreenSchema } from '../types';

export const homeScreenFixture: ScreenSchema = {
  schema: 'v1',
  type: 'screen',
  label: 'Home Screen',
  timestamp: '2025-03-03T14:34:00',
  platform: 'mobile',
  sections: [
    {
      type: 'header',
      contains: ['logo', 'notification bell', 'user avatar'],
    },
    {
      type: 'hero',
      contains: ['headline', 'subheadline', 'primary CTA button'],
    },
    {
      type: 'top-nav',
      label: 'Categories',
      contains: ['All', 'Trending', 'New', 'Saved'],
      layout: 'row',
    },
    {
      type: 'grid',
      label: 'Featured Items',
      contains: ['card', 'card', 'card', 'card'],
      layout: 'grid',
    },
    {
      type: 'bottom-nav',
      contains: ['Home', 'Search', 'Activity', 'Profile'],
      layout: 'row',
    },
  ],
};
