export const HOMEPAGE_ASSETS = {
  hero: {
    desktop: 'hero/v1/desktop.avif',
    mobile: 'hero/v1/mobile.avif',
  },
  about: {
    portrait: 'about/v1/portrait.svg',
  },
} as const;

export const HOMEPAGE_ALTS = {
  heroDesktop: 'תמונת רקע לדסקטופ',
  heroMobile: 'תמונת רקע למובייל',
  aboutPortrait: 'תמונת פורטרט של אביגיל',
} as const;

export const HOMEPAGE_FLAGS = {
  // Toggle to replace AboutSection text with an image from storage
  aboutUseImage: true,
} as const;


