// Maps logical image keys to Vite-processed asset URLs.
// Public pages use these keys in contentStore seed data.
// Admin-added content can store absolute URLs or base64 data URLs directly.

import camp1 from '@assets/campaign-1.jpg';
import camp2 from '@assets/campaign-2.jpg';
import camp3 from '@assets/campaign-3.jpg';
import news1 from '@assets/news-1.jpg';
import news2 from '@assets/news-2.jpg';
import heroImg from '@assets/hero-hockey.jpg';
import teamImg from '@assets/about-team.jpg';
import missionHealth from '@assets/mission-health.jpg';
import missionHockey from '@assets/mission-hockey.jpg';

const REGISTRY: Record<string, string> = {
  'campaign-1': camp1,
  'campaign-2': camp2,
  'campaign-3': camp3,
  'news-1': news1,
  'news-2': news2,
  'hero-hockey': heroImg,
  'about-team': teamImg,
  'mission-health': missionHealth,
  'mission-hockey': missionHockey,
};

/** Resolve an image key (or a direct URL / data URI) to a displayable src. */
export function resolveImage(urlOrKey: string | undefined, fallback?: string): string {
  if (!urlOrKey) return fallback ?? '';
  if (
    urlOrKey.startsWith('http') ||
    urlOrKey.startsWith('data:') ||
    urlOrKey.startsWith('/')
  ) {
    return urlOrKey;
  }
  return REGISTRY[urlOrKey] ?? fallback ?? '';
}

export { camp1, camp2, camp3, news1, news2, heroImg, teamImg, missionHealth, missionHockey };
