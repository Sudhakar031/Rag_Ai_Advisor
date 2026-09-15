export interface ComparisonOverview {
  slug: string;
  title: string;
  competitorName: string;
  category: string;
  summary: string;
  heroTitle: string;
  overview: string;
  quickStats: Array<{ label: string; value: string }>;
  highlights: string[];
  features: Array<{ feature: string; hireko: string; competitor: string }>;
  pricing: Array<{ label: string; hireko: string; competitor: string }>;
  strengths: string[];
  weaknesses: string[];
  verdict: string;
  faq: Array<{ question: string; answer: string }>;
  disclaimer: string;
  relatedSlugs: string[];
}
