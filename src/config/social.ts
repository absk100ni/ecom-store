// Social channel links -- single source of truth for Footer + FollowUs section.
// Set the VITE_* env vars in .env; channels with empty URLs are hidden.
export interface SocialChannel {
  name: 'Instagram' | 'YouTube' | 'Facebook';
  url: string;
  handle: string;
  cta: string;
}

const env = import.meta.env;

export const SOCIAL_CHANNELS: SocialChannel[] = [
  {
    name: 'Instagram' as const,
    url: env.VITE_INSTAGRAM_URL || '',
    handle: env.VITE_INSTAGRAM_HANDLE || '@lucubraelec',
    cta: 'Watch our latest reels',
  },
  {
    name: 'YouTube' as const,
    url: env.VITE_YOUTUBE_URL || '',
    handle: env.VITE_YOUTUBE_HANDLE || 'LucubraElec',
    cta: 'Unboxings & reviews',
  },
  {
    name: 'Facebook' as const,
    url: env.VITE_FACEBOOK_URL || '',
    handle: env.VITE_FACEBOOK_HANDLE || 'LucubraElec',
    cta: 'Deals & announcements',
  },
].filter((c) => c.url !== '');
