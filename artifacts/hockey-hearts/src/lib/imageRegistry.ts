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
import campFamily from '@assets/generated_images/campaign-family-support.jpg';
import campGirlsWomen from '@assets/generated_images/campaign-girls-women.jpg';
import campCommunity from '@assets/generated_images/campaign-community-dev.jpg';
import campCoaching from '@assets/generated_images/campaign-coaching.jpg';
import campOutreach from '@assets/generated_images/campaign-outreach-van.jpg';
import campGala from '@assets/generated_images/campaign-gala.jpg';
import campIceTime from '@assets/generated_images/campaign-ice-time.jpg';
import campEducation from '@assets/generated_images/campaign-education.jpg';
import teamRink from '@assets/generated_images/about-team-rink.jpg';
import programMentalHealth from '@assets/generated_images/program-mental-health.jpg';
import ambassadorSvechnikov from '@assets/generated_images/ambassador-svechnikov.jpg';

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
  'campaign-family': campFamily,
  'campaign-girls-women': campGirlsWomen,
  'campaign-community': campCommunity,
  'campaign-coaching': campCoaching,
  'campaign-outreach': campOutreach,
  'campaign-gala': campGala,
  'campaign-ice-time': campIceTime,
  'campaign-education': campEducation,
  'team-rink': teamRink,
  'program-mental-health': programMentalHealth,
  'ambassador-svechnikov': ambassadorSvechnikov,
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

export {
  camp1,
  camp2,
  camp3,
  news1,
  news2,
  heroImg,
  teamImg,
  missionHealth,
  missionHockey,
  teamRink,
  campIceTime,
};
