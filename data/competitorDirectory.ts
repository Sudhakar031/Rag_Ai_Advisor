export interface CompetitorEntry {
  id: string;
  name: string;
  category: string;
  categoryGroup: string;
  tagline: string;
  superpower: string;
  websiteUrl: string;
  websiteDomain: string;
  comparisonSlug: string;
  comparisonPath: string;
  bestFor: string;
  pricingModel: string;
}

export const COMPETITORS_DIRECTORY: CompetitorEntry[] = [
  // 1. Video Assessments & Remote Proctoring
  {
    id: "talview",
    name: "Talview",
    category: "Video Assessments & Remote Proctoring",
    categoryGroup: "🎥 AI Video Screening & Assessments",
    tagline: "Secure remote proctoring and high-stakes assessment engine",
    superpower: "High-stakes exam proctoring, AI cheating detection, screen & browser locking",
    websiteUrl: "https://www.talview.com/en/",
    websiteDomain: "talview.com",
    comparisonSlug: "talview-vs-hireko",
    comparisonPath: "/compare/talview-vs-hireko",
    bestFor: "Universities, licensing boards, and high-stakes certification testing",
    pricingModel: "Annual Subscription (~$15k–$25k/yr)",
  },
  {
    id: "hirevue",
    name: "HireVue",
    category: "Video Assessments & Enterprise Testing",
    categoryGroup: "🎥 AI Video Screening & Assessments",
    tagline: "Legacy enterprise video interviewing and structured assessments",
    superpower: "Enterprise compliance, structured video assessments, legacy ATS integrations (acquired Modern Hire)",
    websiteUrl: "https://www.hirevue.com/",
    websiteDomain: "hirevue.com",
    comparisonSlug: "hirevue-vs-hireko",
    comparisonPath: "/compare/hirevue-vs-hireko",
    bestFor: "Large Global 2000 enterprises requiring legacy ATS integrations",
    pricingModel: "Annual Enterprise Contract (~$35k+/yr)",
  },
  {
    id: "modern-hire",
    name: "Modern Hire",
    category: "Enterprise Assessment & Structured Hiring",
    categoryGroup: "🎥 AI Video Screening & Assessments",
    tagline: "Enterprise structured digital interviewing and Automated Interview Scoring (AIS)",
    superpower: "Automated Interview Scoring (AIS), job simulations, and enterprise workflows (part of HireVue)",
    websiteUrl: "https://www.hirevue.com/",
    websiteDomain: "hirevue.com",
    comparisonSlug: "modern-hire-vs-hireko",
    comparisonPath: "/compare/modern-hire-vs-hireko",
    bestFor: "Global 2000 enterprises requiring psychometrically validated assessments",
    pricingModel: "Custom Enterprise Quote (via HireVue)",
  },
  {
    id: "sparkhire",
    name: "Spark Hire",
    category: "Video Interview Platforms",
    categoryGroup: "🎥 AI Video Screening & Assessments",
    tagline: "Simple, budget-friendly one-way recorded video interviewing",
    superpower: "Easy self-recorded candidate video clips without complex AI automation",
    websiteUrl: "https://www.sparkhire.com/",
    websiteDomain: "sparkhire.com",
    comparisonSlug: "sparkhire-vs-hireko",
    comparisonPath: "/compare/sparkhire-vs-hireko",
    bestFor: "Small & midsize businesses wanting simple manual video review",
    pricingModel: "Tier-Based Subscription ($149–$499/mo)",
  },
  {
    id: "willo",
    name: "Willo",
    category: "Video Interview Platforms",
    categoryGroup: "🎥 AI Video Screening & Assessments",
    tagline: "Asynchronous browser-based video, audio and text screening",
    superpower: "Async video/audio/text answers without apps, AI transcription & summaries, candidate verification",
    websiteUrl: "https://www.willo.video/",
    websiteDomain: "willo.video",
    comparisonSlug: "willo-vs-hireko",
    comparisonPath: "/compare/willo-vs-hireko",
    bestFor: "Startups and high-volume applicant screening without apps",
    pricingModel: "Lite: $59/live role; Enterprise from $3,799/yr",
  },
  {
    id: "myinterview",
    name: "myInterview",
    category: "Video Interview Platforms",
    categoryGroup: "🎥 AI Video Screening & Assessments",
    tagline: "Video-first candidate screening and personality evaluation",
    superpower: "Structured video screening questions (now operating under Spark Hire)",
    websiteUrl: "https://www.myinterview.me/",
    websiteDomain: "myinterview.me",
    comparisonSlug: "myinterview-vs-hireko",
    comparisonPath: "/compare/myinterview-vs-hireko",
    bestFor: "Volume video hiring with customized candidate branding",
    pricingModel: "Managed under Spark Hire",
  },
  {
    id: "interviewer-ai",
    name: "Interviewer.AI",
    category: "Video Assessments & Pre-Screening",
    categoryGroup: "🎥 AI Video Screening & Assessments",
    tagline: "Pre-interview screening with cognitive tests and resume scoring",
    superpower: "Video monologue answers combined with cognitive aptitude quizzes",
    websiteUrl: "https://interviewer.ai/",
    websiteDomain: "interviewer.ai",
    comparisonSlug: "interviewer-ai-vs-hireko",
    comparisonPath: "/compare/interviewer-ai-vs-hireko",
    bestFor: "Pre-screening combining video answers with cognitive assessments",
    pricingModel: "Tiered SaaS ($149–$499+/mo)",
  },

  // 2. Technical & Coding Assessments
  {
    id: "codesignal",
    name: "CodeSignal",
    category: "Technical Assessment Platforms",
    categoryGroup: "💻 Technical & Coding Assessments",
    tagline: "Cloud coding environment and standardized algorithmic evaluation",
    superpower: "Multi-language cloud IDE, compiler test runners, Coding Evaluation Framework",
    websiteUrl: "https://codesignal.com/",
    websiteDomain: "codesignal.com",
    comparisonSlug: "codesignal-vs-hireko",
    comparisonPath: "/compare/codesignal-vs-hireko",
    bestFor: "Software engineering hiring and live pair-programming sessions",
    pricingModel: "Credit-Based Subscription ($79–$479+/mo)",
  },
  {
    id: "coderbyte",
    name: "Coderbyte",
    category: "Technical & Coding Assessments",
    categoryGroup: "💻 Technical & Coding Assessments",
    tagline: "Affordable code challenge library with automated test execution",
    superpower: "Extensive pre-built algorithm challenge library with multi-language tests",
    websiteUrl: "https://coderbyte.com/",
    websiteDomain: "coderbyte.com",
    comparisonSlug: "coderbyte-vs-hireko",
    comparisonPath: "/compare/coderbyte-vs-hireko",
    bestFor: "Development teams wanting cost-effective algorithmic screening",
    pricingModel: "Monthly Subscription ($199–$499/mo)",
  },

  // 3. AI Talent Sourcing & Search
  {
    id: "juicebox",
    name: "Juicebox (PeopleGPT)",
    category: "AI Talent Sourcing & Search",
    categoryGroup: "🔍 AI Talent Sourcing & Search",
    tagline: "Natural language search across 800M+ global talent profiles",
    superpower: "Query 800M+ profiles from 30+ sources with conversational prompts & autonomous sourcing agents",
    websiteUrl: "https://juicebox.ai/peoplegpt",
    websiteDomain: "juicebox.ai",
    comparisonSlug: "juicebox-vs-hireko",
    comparisonPath: "/compare/juicebox-vs-hireko",
    bestFor: "Outbound sourcing teams searching for passive talent globally",
    pricingModel: "Free plan; Paid from $99/seat/mo + agent sourcing credits",
  },
  {
    id: "ribbon-ai",
    name: "Ribbon AI",
    category: "AI Sourcing & Voice Interviewing",
    categoryGroup: "🔍 AI Talent Sourcing & Search",
    tagline: "Full journey candidate sourcing, multi-channel outreach & AI voice interviews",
    superpower: "AI skill sourcing, outreach via Email/SMS/WhatsApp, dynamic AI voice interviews & scoring",
    websiteUrl: "https://www.ribbon.ai/",
    websiteDomain: "ribbon.ai",
    comparisonSlug: "ribbon-ai-vs-hireko",
    comparisonPath: "/compare/ribbon-ai-vs-hireko",
    bestFor: "End-to-end sourcing, high-response WhatsApp outreach, and voice screens",
    pricingModel: "Growth: $499/mo; Business: $999/mo; Scale: $1,999/mo (annual)",
  },
  {
    id: "mercor",
    name: "Mercor",
    category: "Talent Pipelines & Marketplaces",
    categoryGroup: "🔍 AI Talent Sourcing & Search",
    tagline: "Searchable global talent marketplace of pre-interviewed engineers",
    superpower: "Pre-vetted marketplace of 100k+ global talent who completed AI interviews",
    websiteUrl: "https://www.mercor.com/",
    websiteDomain: "mercor.com",
    comparisonSlug: "mercor-vs-hireko",
    comparisonPath: "/compare/mercor-vs-hireko",
    bestFor: "Instantly hiring from a global pool of pre-interviewed developers",
    pricingModel: "Database access fee + custom placement fee",
  },

  // 4. Conversational SMS & Recruiter Assistants
  {
    id: "paradox",
    name: "Paradox (Olivia)",
    category: "AI Recruiting Assistants",
    categoryGroup: "💬 Conversational SMS & Recruiter Assistants",
    tagline: "Conversational mobile assistant for automated scheduling & screening",
    superpower: "Automated SMS text screening and instant calendar interview scheduling",
    websiteUrl: "https://www.paradox.ai/",
    websiteDomain: "paradox.ai",
    comparisonSlug: "paradox-vs-hireko",
    comparisonPath: "/compare/paradox-vs-hireko",
    bestFor: "High-volume hourly hiring (retail, hospitality, logistics, healthcare)",
    pricingModel: "High-volume Enterprise contract (~$12k–$100k+/yr)",
  },
  {
    id: "humanly",
    name: "Humanly",
    category: "AI Recruiting Assistants",
    categoryGroup: "💬 Conversational SMS & Recruiter Assistants",
    tagline: "High-volume SMS candidate engagement and automated reference checking",
    superpower: "24/7 SMS chatbot screening, applicant FAQ automation, automated reference checks",
    websiteUrl: "https://www.humanly.io/",
    websiteDomain: "humanly.io",
    comparisonSlug: "humanly-vs-hireko",
    comparisonPath: "/compare/humanly-vs-hireko",
    bestFor: "Engaging high volumes of candidates via SMS and chat automation",
    pricingModel: "Usage & seat-based (~$200–$500+/mo)",
  },

  // 5. ATS & Recruiting Intelligence
  {
    id: "metaview",
    name: "Metaview",
    category: "Recruiting Intelligence",
    categoryGroup: "📊 ATS & Recruiting Intelligence",
    tagline: "Silent AI note-taker and interview intelligence platform",
    superpower: "Turns live conversations into AI notes, scorecards, and insights; AI agents for review & sourcing",
    websiteUrl: "https://www.metaview.ai/",
    websiteDomain: "metaview.ai",
    comparisonSlug: "metaview-vs-hireko",
    comparisonPath: "/compare/metaview-vs-hireko",
    bestFor: "Recruiters wanting to eliminate manual note-taking in live interviews",
    pricingModel: "Free plan; Application Review Pro: $150/mo; Enterprise quote",
  },
  {
    id: "greenhouse",
    name: "Greenhouse",
    category: "Applicant Tracking Systems (ATS)",
    categoryGroup: "📊 ATS & Recruiting Intelligence",
    tagline: "Enterprise applicant tracking system and structured hiring workflows",
    superpower: "Central system of record for job pipelines, approvals, compliance, and offers",
    websiteUrl: "https://my.greenhouse.com/",
    websiteDomain: "my.greenhouse.com",
    comparisonSlug: "greenhouse-vs-hireko",
    comparisonPath: "/compare/greenhouse-vs-hireko",
    bestFor: "Enterprise candidate pipeline operations and hiring compliance",
    pricingModel: "Custom annual contract (~$6k–$50k+/yr)",
  },
  {
    id: "recruit41",
    name: "Recruit41",
    category: "AI Recruiting Workflows",
    categoryGroup: "📊 ATS & Recruiting Intelligence",
    tagline: "Streamlined candidate intake and AI-assisted screening workflows",
    superpower: "Structured candidate intake forms and lightweight automated screening",
    websiteUrl: "https://www.recruit41.com/",
    websiteDomain: "recruit41.com",
    comparisonSlug: "recruit41-vs-hireko",
    comparisonPath: "/compare/recruit41-vs-hireko",
    bestFor: "Boutique recruiting teams seeking streamlined intake workflows",
    pricingModel: "Tiered SaaS (Quote-based)",
  },
];

export const TOTAL_COMPETITORS_COUNT = COMPETITORS_DIRECTORY.length; // 16

export function getCompetitorsByCategoryGroup(): Record<string, CompetitorEntry[]> {
  const grouped: Record<string, CompetitorEntry[]> = {};
  for (const comp of COMPETITORS_DIRECTORY) {
    if (!grouped[comp.categoryGroup]) {
      grouped[comp.categoryGroup] = [];
    }
    grouped[comp.categoryGroup].push(comp);
  }
  return grouped;
}

export function getCompetitorEntry(nameOrSlug?: string): CompetitorEntry | undefined {
  if (!nameOrSlug) return undefined;
  const target = nameOrSlug.toLowerCase().trim();
  return COMPETITORS_DIRECTORY.find(
    (c) =>
      c.id.toLowerCase() === target ||
      c.name.toLowerCase() === target ||
      c.comparisonSlug.toLowerCase() === target ||
      c.comparisonSlug.toLowerCase().includes(target) ||
      target.includes(c.name.toLowerCase()) ||
      target.includes(c.id.toLowerCase())
  );
}

export function getPlatformTopBanner(competitorName?: string): string {
  if (!competitorName || competitorName === "Hireko") {
    return `> 🌐 **Official Platform:** [hireko.ai](https://hireko.ai) • 📁 **Category:** Autonomous AI Interviewing • 🔗 [Interactive Demo](/demo)`;
  }
  const entry = getCompetitorEntry(competitorName);
  if (!entry) return "";
  return `> 🌐 **Official Platform:** [${entry.websiteDomain}](${entry.websiteUrl}) • 📁 **Category:** ${entry.category} • 🔗 [Compare on HireKo](${entry.comparisonPath})`;
}
