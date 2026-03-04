// The demo scenario from the product proposal:
// "Mock up an onboarding flow for a fitness app"
// This is the fixture that drives the launch demo gif.

import type { FlowSchema } from '../types';

export const onboardingFlowFixture: FlowSchema = {
  schema: 'v1',
  type: 'flow',
  label: 'Onboarding Flow',
  timestamp: '2025-03-03T14:34:00',
  platform: 'mobile',
  design_language: {
    nav_position: 'bottom',
    header_style: 'minimal',
    card_style: 'rounded-lg shadow-sm',
    spacing: 'comfortable',
    color_scheme: 'light',
  },
  screens: [
    {
      label: 'Welcome',
      sections: [
        {
          type: 'hero',
          contains: ['app logo', 'tagline', 'Get Started button', 'Log In link'],
          note: 'Full-bleed hero, no header chrome',
        },
      ],
    },
    {
      label: 'Create Account',
      sections: [
        {
          type: 'header',
          contains: ['back button', 'step indicator (1 of 3)'],
        },
        {
          type: 'form',
          label: 'Sign Up',
          contains: ['name field', 'email field', 'password field', 'Continue button'],
          layout: 'column',
        },
        {
          type: 'footer',
          contains: ['Already have an account? Log in'],
        },
      ],
    },
    {
      label: 'Set Preferences',
      sections: [
        {
          type: 'header',
          contains: ['back button', 'step indicator (2 of 3)'],
        },
        {
          type: 'hero',
          contains: ['headline: What are your goals?', 'subheadline'],
        },
        {
          type: 'grid',
          label: 'Goal options',
          contains: [
            'Lose weight (selectable card)',
            'Build muscle (selectable card)',
            'Improve endurance (selectable card)',
            'Stay active (selectable card)',
          ],
          layout: 'grid',
        },
        {
          type: 'toolbar',
          contains: ['Continue button'],
        },
      ],
    },
    {
      label: 'All Done',
      sections: [
        {
          type: 'hero',
          contains: [
            'success illustration',
            "headline: You're all set!",
            'subheadline',
            'Start Training button',
          ],
          note: 'Celebration state — full screen, no nav chrome',
        },
      ],
    },
  ],
};
