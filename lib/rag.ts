import { classifyIntent, generateCasualResponse, extractUserName, type IntentType } from "./intent";
import {
  type ConversationContext,
  createInitialContext,
  updateContextWithQuery,
  recordAnswerInContext,
  resolveContextForQuery,
} from "./contextManager";
import { comparisons } from "@/data/comparisons";
import type { ComparisonOverview } from "@/types/comparison";
import {
  COMPETITORS_DIRECTORY,
  TOTAL_COMPETITORS_COUNT,
  getCompetitorsByCategoryGroup,
  getCompetitorEntry,
  getPlatformTopBanner,
} from "@/data/competitorDirectory";
import vectorStoreData from "@/data/vectorStore.json";

const vectorStoreJson: any[] = Array.isArray(vectorStoreData) ? vectorStoreData : [];

export interface VectorChunk {
  id: string;
  slug: string;
  competitor: string;
  section: string;
  title: string;
  content: string;
  keywords: string[];
}

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface SourceCitation {
  competitor: string;
  section: string;
  title: string;
}

export interface ProductCardData {
  name: string;
  category: string;
  tagline: string;
  strengths: string[];
  bestFor: string;
  slug: string;
  websiteUrl?: string;
  websiteDomain?: string;
}

export interface AdvisorResponse {
  answer: string;
  intent: IntentType;
  sources: SourceCitation[];
  productCard?: ProductCardData;
  suggestedFollowUps: string[];
  context: ConversationContext;
}

const HIREKO_DEFAULT_CHUNKS: VectorChunk[] = [
  {
    id: "hireko-overview",
    slug: "hireko-overview",
    competitor: "Hireko",
    section: "Platform Architecture",
    title: "Hireko AI Interviewing & Screening Engine",
    content:
      "Hireko is an AI-first hiring platform featuring interactive, bidirectional voice and video AI interviews, real-time dynamic follow-up questions, resume intelligence, and automated rubric-based candidate evaluations that save recruiters over 80% of screening time.",
    keywords: ["hireko", "ai", "interview", "video", "voice", "screening", "autograder", "rubric", "evaluation", "scorecard"],
  },
  {
    id: "hireko-features",
    slug: "hireko-features",
    competitor: "Hireko",
    section: "Core Features & Capabilities",
    title: "Hireko Conversational AI & Dynamic Follow-ups",
    content:
      "Unlike static one-way video recording tools, Hireko conducts live, interactive voice and video dialogues. The AI agent actively listens to candidate responses and asks real-time adaptive follow-up questions to test deep subject matter competence and behavioral aptitude.",
    keywords: ["hireko", "features", "conversational", "dynamic", "follow-up", "interview", "voice", "video", "interactive"],
  },
  {
    id: "hireko-scoring",
    slug: "hireko-scoring",
    competitor: "Hireko",
    section: "Evaluation & Intelligence",
    title: "Hireko Automated Competency Rubric & Scorecards",
    content:
      "Hireko autogrades candidate interviews against standardized, customizable evaluation rubrics. Recruiters receive instant structured scorecards, competency breakdowns, resume match percentages, and actionable hiring recommendations within seconds.",
    keywords: ["hireko", "scoring", "autograder", "rubric", "scorecard", "evaluation", "competency", "resume"],
  },
  {
    id: "hireko-pricing",
    slug: "hireko-pricing",
    competitor: "Hireko",
    section: "Pricing & SaaS Model",
    title: "Hireko Flexible SaaS & Low TCO",
    content:
      "Hireko offers transparent, flexible SaaS pricing scaled to active hiring volume. Teams can self-onboard immediately with zero rigid annual commitments or complex multi-week professional service fees.",
    keywords: ["hireko", "pricing", "cost", "saas", "subscription", "plans", "trial", "tco"],
  },
];

export const RAG_SYSTEM_PROMPT = `You are the HireKo.ai AI Product Advisor embedded on hireko-main-1.vercel.app/compare.

TONE & PERSONA:
- Converse kindly, warmly, helpfully, and authoritatively like an executive hiring advisor.
- Keep answers neat, scannable, structured, and visually compelling to attract users.

CRITICAL ACCURACY & COMPETITOR RULES:
- ALWAYS address the specific competitor, platform, or capability the user asked about.
- If the user asks about Talview, answer specifically about Talview (exam proctoring, cheating prevention, secure browser lock, exam certifications).
- If the user asks about Ribbon AI, Juicebox, CodeSignal, Paradox, etc., answer specifically about that platform.
- NEVER mention or default to HireVue unless the user explicitly asks about HireVue.
- If the user asks general questions about Hireko or hiring without naming a competitor, answer purely about Hireko.
- Never show Hireko bullet points under a competitor's strength section.

STRICT FORMATTING STRUCTURE:
- Always use Markdown callouts (> ⚡ **TL;DR:** ...) for quick takes.
- Use markdown tables (| col | col |) for side-by-side or feature breakdowns.
- Use bold headers and clean bullet points for easy skimming.
- Conclude with a clear, honest Buyer's Verdict (> 🏆 **Buyer Verdict:** ...).
- Conclude with actionable next steps (👉 **Next Steps:** ...).`;

export function retrieveTopChunks(query: string, topK: number = 5, targetCompetitor?: string): VectorChunk[] {
  const chunks = (vectorStoreJson || []) as VectorChunk[];
  const cleanQuery = query.toLowerCase().replace(/[^a-z0-9\s]/g, " ");
  const queryTerms = cleanQuery.split(/\s+/).filter((w) => w.length > 2);

  // If a specific competitor is targeted (not Hireko), restrict candidate pool strictly to that competitor
  let pool = chunks;
  if (targetCompetitor && targetCompetitor.toLowerCase() !== "hireko") {
    const compClean = targetCompetitor.toLowerCase().replace(/[^a-z0-9]/g, "");
    const filtered = chunks.filter((c) => {
      const cComp = c.competitor.toLowerCase().replace(/[^a-z0-9]/g, "");
      const cSlug = c.slug.toLowerCase().replace(/[^a-z0-9]/g, "");
      return cComp.includes(compClean) || compClean.includes(cComp) || cSlug.includes(compClean);
    });
    if (filtered.length > 0) {
      pool = filtered;
    }
  } else if (targetCompetitor && targetCompetitor.toLowerCase() === "hireko") {
    return HIREKO_DEFAULT_CHUNKS.slice(0, topK);
  }

  if (queryTerms.length === 0) {
    return pool.slice(0, topK);
  }

  const scored = pool.map((chunk) => {
    let score = 0;
    const textLower = `${chunk.title} ${chunk.section} ${chunk.content}`.toLowerCase();

    for (const term of queryTerms) {
      if (textLower.includes(term)) score += 2;
      if (chunk.keywords && chunk.keywords.includes(term)) score += 1;
    }

    if (queryTerms.some((t) => chunk.title.toLowerCase().includes(t))) {
      score += 3;
    }

    return { chunk, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const results = scored.filter((s) => s.score > 0).slice(0, topK).map((s) => s.chunk);
  return results.length > 0 ? results : pool.slice(0, topK);
}

// Find competitor overview object from data/comparisons.ts
export function findCompetitorOverview(name?: string): ComparisonOverview | undefined {
  if (!name) return undefined;
  const clean = name.toLowerCase().trim();
  if (clean === "hireko") return undefined;

  return comparisons.find((c) => {
    const cName = c.competitorName.toLowerCase();
    const cSlug = c.slug.toLowerCase();

    return (
      cName === clean ||
      clean.includes(cName) ||
      cSlug.includes(clean.replace(/[^a-z0-9]/g, "")) ||
      (clean.includes("talview") && cSlug.includes("talview")) ||
      (clean.includes("ribbon") && cSlug.includes("ribbon")) ||
      (clean.includes("juicebox") && cSlug.includes("juicebox")) ||
      (clean.includes("peoplegpt") && cSlug.includes("juicebox")) ||
      (clean.includes("codesignal") && cSlug.includes("codesignal")) ||
      (clean.includes("paradox") && cSlug.includes("paradox")) ||
      (clean.includes("spark") && cSlug.includes("spark")) ||
      (clean.includes("willo") && cSlug.includes("willo")) ||
      (clean.includes("myinterview") && cSlug.includes("myinterview")) ||
      (clean.includes("metaview") && cSlug.includes("metaview")) ||
      (clean.includes("mercor") && cSlug.includes("mercor")) ||
      (clean.includes("greenhouse") && cSlug.includes("greenhouse")) ||
      (clean.includes("recruit41") && cSlug.includes("recruit41")) ||
      (clean.includes("coderbyte") && cSlug.includes("coderbyte")) ||
      (clean.includes("humanly") && cSlug.includes("humanly")) ||
      (clean.includes("interviewer") && cSlug.includes("interviewer")) ||
      (clean.includes("hirevue") && cSlug.includes("hirevue"))
    );
  });
}

function getCompetitorSpecificHighlights(comp: ComparisonOverview): string[] {
  // Filter out any highlights that are exclusively about Hireko
  const filtered = comp.highlights.filter(
    (h) =>
      !h.toLowerCase().startsWith("hireko focuses") &&
      !h.toLowerCase().startsWith("hireko is designed") &&
      !h.toLowerCase().startsWith("hireko uses") &&
      !h.toLowerCase().startsWith("hireko provides")
  );

  const points = [...filtered];

  // Append any core strengths from comp.strengths
  for (const s of comp.strengths) {
    if (!points.some((p) => p.toLowerCase().includes(s.toLowerCase())) && points.length < 4) {
      points.push(`${comp.competitorName} provides ${s.toLowerCase()}.`);
    }
  }

  return points.length > 0
    ? points.slice(0, 4)
    : [
        `${comp.competitorName} provides established solutions in ${comp.category.toLowerCase()}.`,
        `${comp.competitorName} supports specialized workflows tailored for enterprise hiring.`,
      ];
}

export function generateFollowUpChips(intent: IntentType, products: string[], topic?: string): string[] {
  const competitor = products.find((p) => p !== "Hireko");

  if (competitor) {
    if (topic === "pricing") {
      return [
        `What does ${competitor} do better?`,
        `How does ${competitor} handle AI interviews?`,
        `What are Hireko's main advantages over ${competitor}?`,
        `Which platform is best for my team?`,
      ];
    }
    if (topic === "strengths" || intent === "COMPETITOR_STRENGTHS") {
      return [
        `Compare pricing for ${competitor}`,
        `How does ${competitor} handle AI interviews?`,
        `Compare Hireko vs ${competitor}`,
        `Which platform should I choose?`,
      ];
    }
    if (topic === "AI interviews") {
      return [
        `Compare ${competitor} pricing`,
        `What does ${competitor} do better?`,
        `What are Hireko's strengths over ${competitor}?`,
        `Which platform should I choose?`,
      ];
    }
    return [
      `What does ${competitor} do better?`,
      `Compare pricing for ${competitor}`,
      `How does ${competitor} handle AI interviews?`,
      `Compare Hireko vs ${competitor}`,
    ];
  }

  // Competitor Directory / Landscape Queries
  if (intent === "COMPETITOR_LIST" || topic === "competitor landscape") {
    return [
      `What does Talview do better?`,
      `How does Ribbon AI compare to Hireko?`,
      `What about Juicebox (PeopleGPT)?`,
      `Which platform should I choose for my team?`,
    ];
  }

  // Pure Hireko or General Queries
  if (topic === "pricing") {
    return [
      `How do Hireko AI interviews work?`,
      `Compare Hireko vs Talview`,
      `Compare Hireko vs Ribbon AI`,
      `Which platform should I choose?`,
    ];
  }

  if (topic === "AI interviews" || intent === "HIREKO_GENERAL") {
    return [
      `What are Hireko's pricing plans?`,
      `Compare Hireko vs Talview`,
      `Compare Hireko vs CodeSignal`,
      `What should Hireko build next?`,
    ];
  }

  return [
    `What is Hireko?`,
    `Compare Hireko vs Talview`,
    `How does Ribbon AI compare to Hireko?`,
    `What does Juicebox (PeopleGPT) do?`,
  ];
}

function buildCompetitorListAnswer(userName?: string): string {
  const nameSalutation = userName ? `, ${userName}` : "";
  const grouped = getCompetitorsByCategoryGroup();

  const categorySections = Object.entries(grouped)
    .map(([groupName, entries], idx) => {
      const items = entries
        .map(
          (c) =>
            `- **${c.name}:** ${c.superpower} • [Official Website (${c.websiteDomain})](${c.websiteUrl}) • [Compare on HireKo](${c.comparisonPath})`
        )
        .join("\n");
      return `##### ${idx + 1}. ${groupName} (${entries.length} Platforms)\n${items}`;
    })
    .join("\n\n");

  return `### 🌐 Comprehensive Competitor Directory: ${TOTAL_COMPETITORS_COUNT} Evaluated Hiring Platforms

> ⚡ **TL;DR${nameSalutation}:** HireKo actively benchmarks **${TOTAL_COMPETITORS_COUNT} leading hiring technology competitors** across 5 specialized market categories. Below is the complete directory featuring their core focus, direct links to open their official platform websites, and side-by-side HireKo comparison analyses:

| # | Competitor Platform | Market Category | Primary Focus & Superpower | Official Website | HireKo Comparison |
| :-: | :--- | :--- | :--- | :--- | :--- |
${COMPETITORS_DIRECTORY.map((c, i) => `| ${i + 1} | **${c.name}** | ${c.category.split("&")[0].trim()} | ${c.tagline} | [${c.websiteDomain}](${c.websiteUrl}) | [Compare](${c.comparisonPath}) |`).join("\n")}

#### 📁 Categorized Competitor Breakdown & Direct Links

${categorySections}

#### 🌟 How HireKo Differs from All ${TOTAL_COMPETITORS_COUNT} Competitors
While competitors typically solve single pieces of the recruitment funnel (like recorded video repositories, coding test suites, or calendar scheduling), **HireKo.ai** specializes in **autonomous, bidirectional conversational AI interviewing**:
- **Live Conversational Dialogue:** Candidates converse naturally with an adaptive AI agent instead of talking into an awkward countdown timer.
- **Dynamic Real-Time Follow-Ups:** Real-time probing based on candidate answers to test genuine technical and domain skills.
- **Instant Autograding Rubrics:** Automatically delivers standardized competency scorecards, saving recruiters 80%+ of phone screening time.
- **Flexible & Transparent SaaS:** Rapid self-serve onboarding with zero multi-year enterprise lock-in.

> 🏆 **Platform Selection Guide:** Choose **HireKo** to automate first-round conversational screening. Choose **Juicebox** to source passive profiles, **CodeSignal** for coding IDE compilers, **Talview** for secure exam proctoring, or **Paradox** for high-volume hourly SMS scheduling.

👉 **Next Steps:** [Browse All ${TOTAL_COMPETITORS_COUNT} Comparisons on Directory](/compare) • [Try Interactive HireKo Demo](/demo) • [View Flexible Pricing](/pricing)`;
}

function buildHirekoOverviewAnswer(userName?: string): string {
  const nameSalutation = userName ? `, ${userName}` : "";

  return `### Hireko.ai: Autonomous Conversational AI Hiring Platform

> 🌐 **Official Platform:** [hireko.ai](https://hireko.ai) • 📁 **Category:** Autonomous AI Interviewing • 🔗 [Try Live Demo](/demo)

> ⚡ **TL;DR${nameSalutation}:** Hireko is an AI-first hiring intelligence platform featuring interactive, bidirectional voice and video AI interviews, real-time dynamic follow-ups, and automated rubric-based candidate evaluations that save recruiting teams over 80% of screening time.

| Core Capability | Hireko Specification | Recruiter & Candidate Value |
| :--- | :--- | :--- |
| **Interactive AI Interviews** | Live Bidirectional Voice & Video | Engaging conversation; 0% webcam countdown fatigue |
| **Dynamic Follow-Ups** | Real-time Contextual AI Probing | Evaluates deep subject matter competence and problem solving |
| **Candidate Autograder** | Multi-Factor Rubrics & Scorecards | Instant objective scoring aligned to your job requirements |
| **Resume & Candidate Intelligence** | AI Parsing & Competency Match | Surfaces hidden skill gaps and auto-generates custom questions |
| **Recruiter Command Center** | Ranked Shortlists & Audio Snippets | Review candidate evaluations in under 2 minutes per applicant |
| **Enterprise Security & Speed** | SOC-2 Compliant, Rapid Onboarding | Deploy in hours with zero multi-month integration delays |

#### 🌟 Why Modern Recruiting Teams Choose Hireko
- **Bidirectional Conversational Dialogue:** Rather than forcing applicants to record awkward monologues into a timer, Hireko conducts a natural, adaptive interview that candidates genuinely appreciate.
- **Consistent, Bias-Free Evaluation:** Every candidate receives an objective, structured evaluation scored against verified job competencies, drastically reducing unconscious hiring bias.
- **Dramatically Lower Total Cost of Ownership:** Transparent SaaS plans that scale with your hiring cycles without rigid multi-year minimum commitments.

> 🏆 **Platform Verdict:** For organizations seeking to eliminate the manual recruiter screening bottleneck while delivering an exceptional candidate experience, Hireko provides the definitive AI interviewing advantage.

👉 **Next Steps:** [Try the Live Demo](/demo) • [Explore Comparison Directory](/compare) • [View Pricing Plans](/pricing)`;
}

function buildHirekoPricingAnswer(userName?: string): string {
  const nameSalutation = userName ? `, ${userName}` : "";

  return `### Hireko Pricing & Flexible SaaS Plans

> 🌐 **Official Platform:** [hireko.ai](https://hireko.ai) • 📁 **Category:** Autonomous AI Interviewing • 🔗 [Explore Pricing](/pricing)

> ⚡ **TL;DR${nameSalutation}:** Hireko operates with transparent, flexible SaaS pricing tailored to your active screening volume, eliminating the rigid annual minimums and multi-week setup retainers common in legacy software.

| Pricing Dimension | Hireko.ai Model | Benefit to Your Team |
| :--- | :--- | :--- |
| **Pricing Structure** | Flexible Custom SaaS | Pay for active screening capacity as you grow |
| **Contract Terms** | Flexible Monthly or Annual | Zero multi-year lock-in; scale up or pause between hiring cycles |
| **Implementation Fees** | Fast Self-Serve Onboarding | $0 mandatory implementation retainers; deploy in hours |
| **Trial Availability** | Interactive Demo & Pilot | Test conversational AI interviews with your own rubrics |
| **Included Capabilities** | All-in-one Platform | AI Voice/Video Interviewer, Resume Match, and Recruiter Dashboard |

#### 💡 Total Cost of Ownership & ROI
- **Save 15–20 Recruiter Hours per Hire:** Automating initial candidate screens frees your talent team to focus on closing top candidates.
- **Eliminate Unused Licenses:** Legacy platforms lock you into 12-month seat minimums regardless of hiring pauses. Hireko adapts to your hiring velocity.
- **Zero Hidden IT Overheads:** No complex hardware or weeks of integration engineering required.

> 🏆 **Budget Verdict:** Teams looking for maximum ROI and flexible SaaS commitments will save significantly with Hireko.

👉 **Next Steps:** [Contact Sales for Custom Pricing](/pricing) • [Schedule a Live Pilot](/contact)`;
}

function buildCompetitorStrengthsAnswer(comp: ComparisonOverview, userName?: string): string {
  const nameSalutation = userName ? `, ${userName}` : "";
  const targetCompName = comp.competitorName;
  const targetSlug = comp.slug;
  const highlights = getCompetitorSpecificHighlights(comp);
  const bestFor = comp.features.find((f) => f.feature.toLowerCase().includes("best"))?.competitor || `${targetCompName} evaluation teams`;
  const compStrength = comp.quickStats.find((s) => s.label.toLowerCase().includes(targetCompName.toLowerCase()) || (s.label.toLowerCase().includes("strength") && !s.label.toLowerCase().includes("hireko")))?.value || comp.category;
  const topBanner = getPlatformTopBanner(targetCompName);

  const featureRows = comp.features.slice(0, 5);

  return `### Deep Dive: Where ${targetCompName} Excels in the Market

${topBanner}

> ⚡ **TL;DR${nameSalutation}:** **${targetCompName}** is a recognized platform in **${comp.category}**, with a primary focus on **${compStrength}**. Here is where it demonstrates distinct market advantages:

| Evaluation Dimension | ${targetCompName} Capability | Hireko Alternative |
| :--- | :--- | :--- |
${featureRows.map((f) => `| **${f.feature}** | ${f.competitor} | ${f.hireko} |`).join("\n")}

#### 🏛️ Top Strengths & Where ${targetCompName} Stands Out
${highlights.map((h) => `- **${targetCompName} Strength:** ${h}`).join("\n")}

#### 🔄 How ${targetCompName} Compares to Hireko
- **Primary Specialization:** **${targetCompName}** specializes in **${compStrength.toLowerCase()}**, whereas **Hireko** is built AI-first for **interactive conversational voice/video interviewing and instant autograding**.
- **Ideal Deployment:** Choose **${targetCompName}** if your organization requires **${bestFor.toLowerCase()}**.
- **When to Choose Hireko:** Choose **Hireko** if you want to eliminate manual recruiter screening phone calls with live AI agents that converse naturally, probe deep technical/domain skills, and score applicants instantly.

> 🏆 **Buyer Verdict:** ${comp.verdict}

👉 **Next Steps:** [Read the Full ${targetCompName} vs Hireko Analysis](/compare/${targetSlug}) • [Explore All 16 Platform Comparisons](/compare)`;
}

export function buildTopicSpecificAnswer(
  query: string,
  compName: string | undefined,
  chunks: VectorChunk[],
  intent: IntentType,
  topic?: string,
  userName?: string
): string {
  const qLower = query.toLowerCase();
  const nameSalutation = userName ? `, ${userName}` : "";
  const comp = compName ? findCompetitorOverview(compName) : undefined;
  const isHirekoOnly = !comp || compName === "Hireko" || intent === "HIREKO_GENERAL";

  // =========================================================================
  // 1. COMPETITOR LIST & DIRECTORY INQUIRY (16 Competitors with Website Links)
  // =========================================================================
  if (
    intent === "COMPETITOR_LIST" ||
    topic === "competitor landscape" ||
    qLower.includes("how many") ||
    (qLower.includes("competitor") && (qLower.includes("list") || qLower.includes("there") || qLower.includes("all"))) ||
    qLower.includes("websites")
  ) {
    return buildCompetitorListAnswer(userName);
  }

  // =========================================================================
  // 2. PURE HIREKO INQUIRY (Zero mention of any competitor)
  // =========================================================================
  if (isHirekoOnly) {
    if (topic === "pricing" || qLower.includes("pricing") || qLower.includes("cost") || qLower.includes("plan")) {
      return buildHirekoPricingAnswer(userName);
    }
    return buildHirekoOverviewAnswer(userName);
  }

  const targetCompName = comp.competitorName;
  const targetSlug = comp.slug;

  // =========================================================================
  // 2. COMPETITOR STRENGTHS / WHAT DOES [COMP] DO BETTER
  // =========================================================================
  if (
    intent === "COMPETITOR_STRENGTHS" ||
    topic === "strengths" ||
    qLower.includes("better") ||
    qLower.includes("strength") ||
    qLower.includes("excel") ||
    qLower.includes("stand out") ||
    qLower.includes("advantage") ||
    qLower.includes("why choose")
  ) {
    return buildCompetitorStrengthsAnswer(comp, userName);
  }

  // =========================================================================
  // 3. PRICING SPECIFIC ANSWER (Hireko vs Specific Competitor)
  // =========================================================================
  if (topic === "pricing" || qLower.includes("pricing") || qLower.includes("cost") || qLower.includes("price") || qLower.includes("plan")) {
    const topBanner = getPlatformTopBanner(targetCompName);
    const pricingRows = comp.pricing;
    const startingPriceText =
      comp.pricing.find((p) => p.label.toLowerCase().includes("starting"))?.competitor ||
      (targetCompName === "Ribbon AI"
        ? "$499/mo with interview allowances"
        : targetCompName === "Juicebox"
        ? "$99/seat/mo + agent sourcing credits"
        : "~$15,000–$25,000/yr subscription");

    return `### Pricing & Cost Breakdown: Hireko vs ${targetCompName}

${topBanner}

> ⚡ **TL;DR:** Hireko delivers transparent, scalable SaaS pricing aligned directly with your screening volume, avoiding multi-year lock-in. In contrast, **${targetCompName}** operates primarily with ${startingPriceText}.

| Pricing Dimension | Hireko.ai | ${targetCompName} |
| :--- | :--- | :--- |
${pricingRows.map((p) => `| **${p.label}** | ${p.hireko} | ${p.competitor} |`).join("\n")}

#### 💡 Total Cost of Ownership (TCO) & ROI Value
- **Zero Hidden Setup Retainers:** Hireko eliminates the 4-12 week integration fees and professional service retainers common with legacy enterprise platforms.
- **Pay as You Grow:** Scale your screening capacity up or down with your active hiring cycles, avoiding unused annual seat license penalties.
- **Immediate Time-to-Value:** Recruiters start evaluating applicants on day one without complex IT or procurement friction.

> 🏆 **Budget Verdict:** Teams looking for maximum ROI and flexible SaaS commitments will save significantly with Hireko. If your procurement process requires an established contract bundle, ${targetCompName} follows that traditional structure.

👉 **Next Steps:** [Explore Hireko Pricing](/pricing) • [Read Full ${targetCompName} Breakdown](/compare/${targetSlug})`;
  }

  // =========================================================================
  // 4. AI INTERVIEWING & SCREENING ANSWER
  // =========================================================================
  if (topic === "AI interviews" || qLower.includes("interview") || qLower.includes("voice") || qLower.includes("video") || qLower.includes("screening")) {
    const topBanner = getPlatformTopBanner(targetCompName);
    const compInterviewType =
      comp.features.find((f) => f.feature.toLowerCase().includes("interview"))?.competitor ||
      (targetCompName === "Ribbon AI"
        ? "AI Voice Interviews"
        : targetCompName === "Talview"
        ? "Proctored Automated Assessments"
        : "Digital Screening");

    const compFollowUpType =
      comp.features.find((f) => f.feature.toLowerCase().includes("follow"))?.competitor ||
      (targetCompName === "Ribbon AI" ? "Dynamic based on answers" : "Pre-recorded Static Prompts");

    return `### AI Interviewing & Screening Depth: Hireko vs ${targetCompName}

${topBanner}

> ⚡ **TL;DR:** Hireko leads with live, bidirectional conversational AI interviews that converse naturally and ask dynamic follow-ups. ${targetCompName} focuses on ${compInterviewType.toLowerCase()}.

| Interview Capability | Hireko Conversational AI | ${targetCompName} |
| :--- | :--- | :--- |
| **Interview Format** | Live Bidirectional Voice & Video | ${compInterviewType} |
| **Dynamic Follow-Ups** | Real-time Adaptive AI Questions | ${compFollowUpType} |
| **Candidate Autograder** | Automated Rubric & Scorecards | ${comp.features.find((f) => f.feature.toLowerCase().includes("evaluat"))?.competitor || "Assessment-Based"} |
| **Candidate Experience** | Engaging, Natural Dialogue | ${targetCompName === "Ribbon AI" ? "Automated Voice Calls" : targetCompName === "Talview" ? "Proctored Exam Flow" : "Async Candidate Session"} |
| **Recruiter Intelligence** | Instant Competency Breakdown | Recruiter Review Portal |

#### 🌟 Key Advantages of Hireko AI Interviews
- **Real-Time Contextual Follow-Ups:** Rather than asking fixed questions, Hireko listens to candidate responses and asks thoughtful follow-ups that test real domain competence.
- **Dramatically Lower Drop-Off Rates:** Candidates prefer an interactive dialogue over talking to an awkward, timer-countdown webcam screen.
- **Instant Autograding:** Recruiters receive structured evaluation scorecards and candidate competency summaries within seconds of interview completion.

> 🏆 **Experience Verdict:** For an authentic, human-like candidate screening process that candidate talent appreciates, Hireko provides a modern conversational advantage.

👉 **Next Steps:** [View Full ${targetCompName} vs Hireko Analysis](/compare/${targetSlug}) • [Book a Live Demo](/contact)`;
  }

  // =========================================================================
  // 5. PRODUCT GAPS & ROADMAP ("What should Hireko build next?")
  // =========================================================================
  if (
    intent === "COMPETITIVE_INTELLIGENCE" ||
    topic === "gaps" ||
    qLower.includes("gap") ||
    qLower.includes("build next") ||
    qLower.includes("weakness") ||
    qLower.includes("missing") ||
    qLower.includes("roadmap") ||
    qLower.includes("opportunity")
  ) {
    return `### Strategic Product Opportunities & Roadmap for Hireko

> ⚡ **TL;DR:** While Hireko leads in conversational AI interviewing, analysis of top competitors reveals 4 high-leverage product expansion vectors.

#### 1. 📱 Multi-Channel Candidate Outreach (SMS & WhatsApp)
- **Market Inspiration:** Ribbon AI and Paradox (Olivia).
- **Recruiter Impact:** Candidates open SMS and WhatsApp messages at a 90%+ rate within minutes (vs. ~20% email open rates). Adding automated WhatsApp interview reminders and scheduling drastically reduces candidate drop-off.

#### 2. 🔍 Pre-Funnel AI Candidate Sourcing (800M+ Profiles)
- **Market Inspiration:** Juicebox (PeopleGPT).
- **Recruiter Impact:** Sourcing and interviewing currently sit in separate silos. By pairing natural language talent search (e.g., "Find Senior Python developers in Austin") with instant automated AI interview invites, Hireko delivers an end-to-end talent pipeline.

#### 3. 💻 Interactive Coding Sandboxes & Algorithmic IDEs
- **Market Inspiration:** CodeSignal and Coderbyte.
- **Recruiter Impact:** Technical hiring teams need both conversational architecture discussions AND live code execution. Embedding an algorithmic code compiler alongside Hireko's voice interviewer creates an unbeatable technical hiring engine.

#### 4. 🛡️ Advanced Anti-Cheat Proctoring & Interview Integrity
- **Market Inspiration:** Talview & Ribbon AI.
- **Recruiter Impact:** Integrating browser tab-lock detection, voice biometric verification, and screen integrity checks satisfies high-stakes enterprise compliance while preserving a candidate-friendly flow.

> 🏆 **Strategic Summary:** Combining Hireko's conversational AI interviewer with multi-channel outreach and talent discovery represents the future of autonomous hiring.`;
  }

  // =========================================================================
  // 6. PLATFORM RECOMMENDATION GUIDE ("Which platform should I choose?")
  // =========================================================================
  if (intent === "RECOMMENDATION" || qLower.includes("which") || qLower.includes("should i choose") || qLower.includes("recommend") || qLower.includes("best for") || qLower.includes("who wins")) {
    return `### Platform Selection Guide: Which Hiring Tool Fits Your Needs?

> ⚡ **TL;DR:** Choose your hiring platform based on your team's biggest bottleneck: screening high applicant volume, finding passive talent, or integrating legacy enterprise compliance.

| Hiring Priority & Scenario | Recommended Platform | Primary Superpower |
| :--- | :--- | :--- |
| **Interactive Voice & Video Screening** | **Hireko.ai** | Bidirectional AI dialogues, instant autograding & low TCO |
| **Passive Talent Sourcing (800M+ Profiles)** | **Juicebox (PeopleGPT)** | Natural language candidate search and automated lists |
| **Full Funnel: Sourcing + WhatsApp + Voice** | **Ribbon AI** | Sourcing with SMS/WhatsApp outreach & monthly allowances |
| **High-Stakes Anti-Cheat Proctoring** | **Talview** | Exam-grade proctoring, screen locking, and certification |
| **Technical Software Engineering Benchmarks** | **CodeSignal** | Real-time code compilers and standardized coding scores |
| **Retail & Hourly SMS Text Scheduling** | **Paradox** | Automated mobile chat assistant for high-turnover roles |
| **Fortune 500 Compliance & Video Library** | **HireVue** | Legacy enterprise video testing and annual commitments |

#### 🎯 Quick Decision Rules
- **Choose Hireko if:** You want to conduct human-like first-round interviews, autograde candidates automatically, and deploy in days with transparent SaaS pricing.
- **Choose Juicebox if:** You lack inbound applicants and need to search 800M+ passive profiles using natural language.
- **Choose Talview if:** Your organization mandates high-stakes exam proctoring, licensing certifications, and secure browser lock.
- **Choose CodeSignal if:** You need deep coding compilers, algorithm benchmarks, and technical IDE pair programming.

> 🏆 **Need a Tailored Recommendation?** Tell me your hiring team size, role types (e.g. Sales, Tech, Ops), and expected screening volume!`;
  }

  // =========================================================================
  // 7. DEFAULT FULL SIDE-BY-SIDE COMPARISON (Hireko vs Target Competitor)
  // =========================================================================
  const compStrength =
    comp.quickStats.find((s) => s.label.toLowerCase().includes(targetCompName.toLowerCase()) || (s.label.toLowerCase().includes("strength") && !s.label.toLowerCase().includes("hireko")))?.value ||
    comp.category;

  const featureRows = comp.features.slice(0, 5);
  const highlights = getCompetitorSpecificHighlights(comp);
  const topBanner = getPlatformTopBanner(targetCompName);

  return `### Hireko vs ${targetCompName}

${topBanner}

> ⚡ **TL;DR${nameSalutation}:** Hireko is built AI-first for interactive conversational voice/video interviewing and instant autograding, while **${targetCompName}** focuses on ${comp.category.toLowerCase()} (${compStrength.toLowerCase()}).

| Dimension | Hireko.ai | ${targetCompName} |
| :--- | :--- | :--- |
${featureRows.map((f) => `| **${f.feature}** | ${f.hireko} | ${f.competitor} |`).join("\n")}

#### 🌟 Where Hireko Stands Out
- **Interactive Conversational AI:** Real-time bidirectional voice & video candidate screening that dynamically asks intelligent follow-up questions.
- **Candidate Intelligence & Autograding:** Automated competency evaluation rubrics, resume match scoring, and recruiter summary reports.
- **Rapid Time-to-Value & Lower TCO:** Transparent SaaS subscription model with fast onboarding and zero rigid multi-year minimum commitments.

#### 🏛️ Where ${targetCompName} Stands Out
${highlights.map((h) => `- **${targetCompName} Advantage:** ${h}`).join("\n")}

> 🏆 **Buyer Verdict:** ${comp.verdict}

👉 **Next Steps:** [Read the Full ${targetCompName} vs Hireko Analysis](/compare/${targetSlug}) • [Book a Live Demo](/contact)`;
}

// LLM API Call helper (OpenAI / Gemini)
async function callLLMIfAvailable(
  userMessage: string,
  chunks: VectorChunk[],
  history: ChatMessage[],
  userName?: string
): Promise<string | null> {
  const openAiKey = process.env.OPENAI_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  const contextText = chunks.map((c) => `[${c.competitor} - ${c.section}]: ${c.content}`).join("\n\n");
  const userGreetingInstruction = userName ? `The user's name is ${userName}. Address them warmly by name if appropriate.` : "";

  if (openAiKey) {
    try {
      const messages = [
        { role: "system", content: `${RAG_SYSTEM_PROMPT}\n${userGreetingInstruction}\n\nRETRIEVED CONTEXT:\n${contextText}` },
        ...history.slice(-4).map((m) => ({ role: m.role, content: m.content })),
        { role: "user", content: userMessage },
      ];

      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openAiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages,
          temperature: 0.3,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        return data.choices?.[0]?.message?.content || null;
      }
    } catch (e) {
      console.warn("OpenAI API call failed:", e);
    }
  }

  if (geminiKey) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `${RAG_SYSTEM_PROMPT}\n${userGreetingInstruction}\n\nRETRIEVED CONTEXT:\n${contextText}\n\nUSER QUESTION: ${userMessage}`,
                  },
                ],
              },
            ],
          }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
      }
    } catch (e) {
      console.warn("Gemini API call failed:", e);
    }
  }

  return null;
}

export async function askAdvisorRAG(
  query: string,
  history: ChatMessage[] = [],
  sessionContext?: ConversationContext
): Promise<AdvisorResponse> {
  let currentContext = sessionContext || createInitialContext();

  // 1. Intent Classification & Name Extraction
  const intentResult = classifyIntent(query);
  const { type: intentType, productsMentioned, userName: extractedName } = intentResult;

  const activeUserName = extractedName || currentContext.userPreferences?.userName;

  // Update context memory
  currentContext = updateContextWithQuery(currentContext, query, productsMentioned, intentType, activeUserName);

  // 2. Handle Casual Small Talk & Name Intros & Unrecognized Typo Rephrase Prompts
  if (
    intentType === "NAME_INTRO" ||
    intentType === "CASUAL_GREETING" ||
    intentType === "CASUAL_THANKS" ||
    intentType === "CASUAL_CONFIRMATION" ||
    intentType === "CASUAL_GOODBYE" ||
    intentType === "UNRECOGNIZED"
  ) {
    const casualText = generateCasualResponse(intentType, activeUserName);
    const updatedCtx = recordAnswerInContext(currentContext, casualText);
    return {
      answer: casualText,
      intent: intentType,
      sources: [],
      suggestedFollowUps: generateFollowUpChips(intentType, updatedCtx.currentProducts),
      context: updatedCtx,
    };
  }

  // 2.5 Handle Competitor Directory / Listing Queries Directly
  if (intentType === "COMPETITOR_LIST") {
    const listAnswer = buildCompetitorListAnswer(activeUserName);
    const updatedCtx = recordAnswerInContext(currentContext, listAnswer);
    const productCard: ProductCardData = {
      name: "16 Tracked Competitors",
      category: "Hiring Technology Directory",
      tagline: "Comprehensive directory of 16 evaluated platforms across 5 categories",
      strengths: [
        "16 in-depth platform profiles",
        "5 specialized market categories",
        "Direct links to official platform websites",
        "Full side-by-side comparison rubrics",
      ],
      bestFor: "Recruiters and talent leaders evaluating modern hiring software",
      slug: "all-competitors",
    };
    const sources: SourceCitation[] = [
      { competitor: "All 16 Competitors", section: "Platform Directory", title: "Complete 16-Platform Evaluation Matrix" },
      { competitor: "Directory", section: "Official Links", title: "Official Direct Platform Websites" },
      { competitor: "Hireko", section: "Market Overview", title: "Hireko vs Competitor Landscape Analysis" },
    ];
    return {
      answer: listAnswer,
      intent: intentType,
      sources,
      productCard,
      suggestedFollowUps: generateFollowUpChips(intentType, updatedCtx.currentProducts, updatedCtx.currentTopic),
      context: updatedCtx,
    };
  }

  // 3. Context Resolution for Follow-up / Implicit Queries
  const { resolvedQuery, targetProducts } = resolveContextForQuery(currentContext, query);

  // Check if a specific competitor is referenced (do NOT default to HireVue!)
  const competitorProduct = targetProducts.find((p) => p !== "Hireko");
  const compOverview = competitorProduct ? findCompetitorOverview(competitorProduct) : undefined;
  const compName = compOverview ? compOverview.competitorName : competitorProduct;

  // 4. Check for Repeated Query Deduplication
  const previousAnswers = currentContext.previousAnswers || [];
  const isDuplicateQuery = currentContext.previousQuestions.slice(0, -1).includes(query);

  if (isDuplicateQuery && previousAnswers.length > 0) {
    const lastAns = previousAnswers[previousAnswers.length - 1];
    const namePrefix = activeUserName ? `${activeUserName}, ` : "";
    const duplicateResponse = `As we touched on earlier ${namePrefix}here is a quick recap:

${lastAns.slice(0, 180)}...

Is there a specific detail, pricing angle, or feature comparison you'd like me to unpack further?`;

    const updatedCtx = recordAnswerInContext(currentContext, duplicateResponse);
    return {
      answer: duplicateResponse,
      intent: intentType,
      sources: [],
      suggestedFollowUps: generateFollowUpChips(intentType, currentContext.currentProducts, currentContext.currentTopic),
      context: updatedCtx,
    };
  }

  // 5. Knowledge Retrieval (RAG) filtered strictly to target competitor or Hireko
  const targetFilter = compName || (intentType === "HIREKO_GENERAL" || !competitorProduct ? "Hireko" : undefined);
  const chunks = retrieveTopChunks(resolvedQuery, 5, targetFilter);

  const sources: SourceCitation[] = chunks.map((c) => ({
    competitor: c.competitor,
    section: c.section,
    title: c.title,
  }));

  // Ensure appropriate authoritative profile citation
  if (compOverview && !sources.some((s) => s.competitor.toLowerCase() === compOverview.competitorName.toLowerCase())) {
    sources.unshift({
      competitor: compOverview.competitorName,
      section: compOverview.category,
      title: `${compOverview.competitorName} vs Hireko Profile`,
    });
  } else if (!compOverview && !competitorProduct) {
    if (!sources.some((s) => s.competitor.toLowerCase() === "hireko")) {
      sources.unshift({
        competitor: "Hireko",
        section: "Platform Architecture",
        title: "Hireko Autonomous AI Interviewer & Intelligence",
      });
    }
  }

  // 6. Try LLM first if API key configured
  let responseText: string | null = await callLLMIfAvailable(query, chunks, history, activeUserName);

  // If no LLM API key, use dynamic topic-aware synthesizer
  if (!responseText) {
    responseText = buildTopicSpecificAnswer(
      query,
      compName,
      chunks,
      intentType,
      currentContext.currentTopic,
      activeUserName
    );
  } else if (compName && !responseText.includes("Official Platform")) {
    const topBanner = getPlatformTopBanner(compName);
    const firstNewline = responseText.indexOf("\n");
    if (firstNewline > 0 && responseText.startsWith("#")) {
      responseText = responseText.slice(0, firstNewline) + "\n\n" + topBanner + "\n" + responseText.slice(firstNewline);
    } else {
      responseText = topBanner + "\n\n" + responseText;
    }
  }

  // Record Answer to prevent future repetitions
  const updatedCtx = recordAnswerInContext(currentContext, responseText);

  // 7. Product Card Data
  const dirEntry = compOverview ? getCompetitorEntry(compOverview.competitorName) : undefined;
  const productCard: ProductCardData = compOverview
    ? {
        name: compOverview.competitorName,
        category: compOverview.category,
        tagline: `${compOverview.competitorName} compared with Hireko`,
        strengths: compOverview.strengths.slice(0, 3),
        bestFor:
          compOverview.features.find((f) => f.feature.toLowerCase().includes("best"))?.competitor ||
          `${compOverview.competitorName} evaluation teams`,
        slug: compOverview.slug,
        websiteUrl: dirEntry?.websiteUrl,
        websiteDomain: dirEntry?.websiteDomain,
      }
    : {
        name: "Hireko.ai",
        category: "Autonomous AI Interviewing",
        tagline: "Interactive Voice & Video Candidate Screening",
        strengths: [
          "Live bidirectional AI interviews",
          "Automated competency autograding",
          "Real-time dynamic follow-ups",
          "Zero multi-year lock-in",
        ],
        bestFor: "Recruiting teams seeking autonomous first-round screening",
        slug: "hireko",
        websiteUrl: "https://hireko.ai",
        websiteDomain: "hireko.ai",
      };

  return {
    answer: responseText,
    intent: intentType,
    sources,
    productCard,
    suggestedFollowUps: generateFollowUpChips(intentType, updatedCtx.currentProducts, updatedCtx.currentTopic),
    context: updatedCtx,
  };
}
