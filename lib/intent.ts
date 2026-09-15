export type IntentType =
  | "CASUAL_GREETING"
  | "NAME_INTRO"
  | "CASUAL_THANKS"
  | "CASUAL_CONFIRMATION"
  | "CASUAL_GOODBYE"
  | "PRODUCT_COMPARISON"
  | "PRODUCT_RESEARCH"
  | "COMPETITOR_STRENGTHS"
  | "HIREKO_GENERAL"
  | "COMPETITOR_LIST"
  | "RECOMMENDATION"
  | "COMPETITIVE_INTELLIGENCE"
  | "FOLLOW_UP"
  | "UNRECOGNIZED"
  | "UNKNOWN";

export interface IntentResult {
  type: IntentType;
  confidence: number;
  productsMentioned: string[];
  userName?: string;
  topic?: string;
  query: string;
  rectifiedQuery?: string;
}

const GREETING_PATTERNS = [
  /^(hi|hello|hey|hi there|hello there|hey there|good morning|good afternoon|good evening|greetings|start|yo|hlo|helo|heyy|hie|heyya|gud morning|gud evening)$/i,
];

const THANKS_PATTERNS = [
  /^(thanks|thank you|thank u|thanks a lot|thanks so much|appreciate it|that's helpful|thats helpful|very helpful|thak you|thak u|thnk you|thnks|thx|thnx|tnx|tq|thanku)$/i,
];

const CONFIRMATION_PATTERNS = [
  /^(okay|ok|got it|understood|makes sense|cool|nice|perfect|sounds good|alright|right|okey|okau|okie|gotit|sunds good|makse sense)$/i,
];

const GOODBYE_PATTERNS = [
  /^(bye|goodbye|see you|see ya|talk later|catch you later|exit|quit|bye bye|byee|gudbye|byebye|seeyou)$/i,
];

const ALL_COMPETITOR_MAP: Record<string, string> = {
  hirevue: "HireVue",
  talview: "Talview",
  sparkhire: "Spark Hire",
  "spark hire": "Spark Hire",
  myinterview: "myInterview",
  willo: "Willo",
  codesignal: "CodeSignal",
  paradox: "Paradox",
  humanly: "Humanly",
  "interviewer.ai": "Interviewer.AI",
  interviewer: "Interviewer.AI",
  metaview: "Metaview",
  mercor: "Mercor",
  greenhouse: "Greenhouse",
  recruit41: "Recruit41",
  coderbyte: "Coderbyte",
  ribbon: "Ribbon AI",
  "ribbon ai": "Ribbon AI",
  juicebox: "Juicebox (PeopleGPT)",
  peoplegpt: "Juicebox (PeopleGPT)",
  "modern hire": "Modern Hire",
  modernhire: "Modern Hire",
  hireko: "Hireko",
};

const COMMON_TYPO_ALIASES: Record<string, string> = {
  modernhir: "Modern Hire",
  modern_hire: "Modern Hire",
  talvew: "Talview",
  talveiw: "Talview",
  tallview: "Talview",
  talvieu: "Talview",
  talwiew: "Talview",
  hievue: "HireVue",
  hievuee: "HireVue",
  hirvue: "HireVue",
  hirvuee: "HireVue",
  hirevew: "HireVue",
  hireveue: "HireVue",
  codesingal: "CodeSignal",
  codesignl: "CodeSignal",
  codesig: "CodeSignal",
  pradox: "Paradox",
  paradoxx: "Paradox",
  juicebx: "Juicebox (PeopleGPT)",
  juicbox: "Juicebox (PeopleGPT)",
  ribon: "Ribbon AI",
  ribonai: "Ribbon AI",
  ribbonai: "Ribbon AI",
  grenhouse: "Greenhouse",
  greenhous: "Greenhouse",
  metavew: "Metaview",
  mercorr: "Mercor",
  coderbyt: "Coderbyte",
  humanley: "Humanly",
  sparkhir: "Spark Hire",
  sparkhyre: "Spark Hire",
  myintervew: "myInterview",
  wilo: "Willo",
  hirekoo: "Hireko",
  hirko: "Hireko",
  hirecko: "Hireko",
};

export function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

export function extractMentionedProductsWithFuzzy(qLower: string): { products: string[]; rectifiedQuery: string } {
  const products: string[] = [];
  let rectifiedQuery = qLower;

  // 1. Direct match in ALL_COMPETITOR_MAP
  for (const [key, name] of Object.entries(ALL_COMPETITOR_MAP)) {
    if (qLower.includes(key) && !products.includes(name)) {
      products.push(name);
    }
  }

  // 2. Direct match in COMMON_TYPO_ALIASES
  for (const [typo, name] of Object.entries(COMMON_TYPO_ALIASES)) {
    if (qLower.includes(typo) && !products.includes(name)) {
      products.push(name);
      rectifiedQuery = rectifiedQuery.replace(typo, name.toLowerCase());
    }
  }

  // 3. Token-by-token Levenshtein Fuzzy Search if no products found yet
  if (products.length === 0) {
    const tokens = qLower.split(/\s+/).filter((t) => t.length >= 4);
    const candidateKeys = Object.keys(ALL_COMPETITOR_MAP).filter((k) => k.length >= 4);

    for (const token of tokens) {
      for (const targetKey of candidateKeys) {
        const dist = levenshteinDistance(token, targetKey);
        const maxDist = targetKey.length >= 5 ? 2 : 1;
        if (dist <= maxDist) {
          const matchedName = ALL_COMPETITOR_MAP[targetKey];
          if (!products.includes(matchedName)) {
            products.push(matchedName);
            rectifiedQuery = rectifiedQuery.replace(token, targetKey);
          }
        }
      }
    }
  }

  return { products, rectifiedQuery };
}

export function extractUserName(query: string): string | null {
  const match = query.match(
    /(?:my name is|i am|i'm|im|call me|this is|myself)\s+([a-zA-Z]+)/i
  );
  if (match && match[1]) {
    const name = match[1].trim();
    const reserved = ["here", "looking", "comparing", "wondering", "asking", "interested", "sure", "ready", "fine", "good", "user"];
    if (!reserved.includes(name.toLowerCase())) {
      return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    }
  }
  return null;
}

export function classifyIntent(query: string): IntentResult {
  const cleanQuery = query.trim();
  const qLower = cleanQuery.toLowerCase().replace(/[^a-z0-9\s]/g, " ");
  const trimmedLower = qLower.trim();

  // Check Name Introduction
  const extractedName = extractUserName(cleanQuery);
  if (extractedName) {
    return {
      type: "NAME_INTRO",
      confidence: 1.0,
      userName: extractedName,
      productsMentioned: [],
      query: cleanQuery,
    };
  }

  // Check Casual Intents with Typo Patterns & Fuzzy Matching
  if (GREETING_PATTERNS.some((p) => p.test(trimmedLower)) || levenshteinDistance(trimmedLower, "hello") <= 2 || levenshteinDistance(trimmedLower, "hi") <= 1) {
    return { type: "CASUAL_GREETING", confidence: 1.0, productsMentioned: [], query: cleanQuery };
  }

  if (THANKS_PATTERNS.some((p) => p.test(trimmedLower)) || levenshteinDistance(trimmedLower, "thank you") <= 3 || levenshteinDistance(trimmedLower, "thanks") <= 2) {
    return { type: "CASUAL_THANKS", confidence: 1.0, productsMentioned: [], query: cleanQuery };
  }

  if (CONFIRMATION_PATTERNS.some((p) => p.test(trimmedLower)) || levenshteinDistance(trimmedLower, "okay") <= 2 || levenshteinDistance(trimmedLower, "got it") <= 2) {
    return { type: "CASUAL_CONFIRMATION", confidence: 1.0, productsMentioned: [], query: cleanQuery };
  }

  if (GOODBYE_PATTERNS.some((p) => p.test(trimmedLower)) || levenshteinDistance(trimmedLower, "goodbye") <= 2 || levenshteinDistance(trimmedLower, "bye") <= 1) {
    return { type: "CASUAL_GOODBYE", confidence: 1.0, productsMentioned: [], query: cleanQuery };
  }

  // Extract Mentioned Products with Fuzzy Typo Rectification
  const { products: productsMentioned, rectifiedQuery } = extractMentionedProductsWithFuzzy(qLower);

  const competitorOnly = productsMentioned.filter((p) => p !== "Hireko");
  const isHirekoOnly = productsMentioned.length === 1 && productsMentioned[0] === "Hireko";
  const noCompetitorMentioned = competitorOnly.length === 0;

  // 1. Competitor Listing & Directory Queries (e.g. "what are the competitors are there and how many competitors are there list it?", "what are the competitors are there list it?", "how many competitors are there?", "list all competitors", "show website links", "why because what are the competitors i listed and can you provide the links to open the websites for thier platforms")
  const isCompetitorList =
    /how many.*(?:competitor|platform|tool|software)/i.test(cleanQuery) ||
    /what.*(?:competitor|platform)/i.test(cleanQuery) ||
    /list.*(?:all.*)?(?:competitor|platform|tool)/i.test(cleanQuery) ||
    /(?:all|tracked|evaluated).*(?:competitor|platform)/i.test(cleanQuery) ||
    /competitor.*(?:list|directory|landscape|overview|breakdown|website|link)/i.test(cleanQuery) ||
    /who are.*(?:competitor|alternative)/i.test(cleanQuery) ||
    /which.*(?:competitor|platform.*exist)/i.test(cleanQuery) ||
    /(?:link|links|url|urls|website|websites).*(?:open|platform|competitor|tool)/i.test(cleanQuery) ||
    /(?:open|visit).*(?:website|link|platform)/i.test(cleanQuery) ||
    /links.*to.*open/i.test(cleanQuery) ||
    ((/how many|what are the|list\b|all\b|show\b|give\b/i.test(cleanQuery) && /competitor|platform/i.test(cleanQuery)) && competitorOnly.length <= 1) ||
    (/what are the competitor/i.test(cleanQuery) && /list/i.test(cleanQuery));

  if (isCompetitorList && (competitorOnly.length === 0 || /all|list|how many|directory|landscape|links|websites/i.test(cleanQuery))) {
    return { type: "COMPETITOR_LIST", confidence: 0.98, productsMentioned: [], query: cleanQuery, rectifiedQuery };
  }

  // 2. Pure Hireko Inquiry (e.g. "what is hireko", "how does hireko work", "hireko features", or general questions when no competitor named)
  const isExplicitHireko = isHirekoOnly || /hireko/i.test(cleanQuery);
  const isGeneralHirekoInquiry =
    noCompetitorMentioned &&
    /how does it work|how do you work|what do you do|what is this|tell me about yourself|what can you do|about the platform|features|overview|how do ai interviews work|screening process/i.test(cleanQuery);

  if (isExplicitHireko && !/compare|vs\b|versus|differ|against\b/i.test(cleanQuery) && competitorOnly.length === 0) {
    return { type: "HIREKO_GENERAL", confidence: 0.95, productsMentioned: ["Hireko"], query: cleanQuery, rectifiedQuery };
  }
  if (isGeneralHirekoInquiry) {
    return { type: "HIREKO_GENERAL", confidence: 0.9, productsMentioned: ["Hireko"], query: cleanQuery, rectifiedQuery };
  }

  // 3. Explicit Comparison (e.g. "compare Hireko vs Talview", "Hireko vs CodeSignal", "difference between X and Y")
  const isComparisonQuery =
    /compare|vs\b|versus|difference|differ|side by side|against\b/i.test(cleanQuery) ||
    productsMentioned.length >= 2;

  if (isComparisonQuery) {
    return { type: "PRODUCT_COMPARISON", confidence: 0.9, productsMentioned, query: cleanQuery, rectifiedQuery };
  }

  // 4. Competitor Strengths / Inquiry (e.g. "what does talview do better?", "talview strengths", "why choose talview", "tell me about talview")
  if (competitorOnly.length === 1) {
    const isStrengthQuery =
      /better|strength|excel|stand out|good at|advantage|why choose|why pick|tell me about|what is|how does|what about|about\b|overview|special/i.test(cleanQuery) ||
      cleanQuery.split(/\s+/).length <= 3; // e.g. "Talview", "About Talview"

    if (isStrengthQuery) {
      return { type: "COMPETITOR_STRENGTHS", confidence: 0.95, productsMentioned, query: cleanQuery, rectifiedQuery };
    }
  }

  // 5. Recommendation
  const isRecommendation = /which|should i choose|recommend|best for|highest rated|who wins/i.test(cleanQuery);
  if (isRecommendation) {
    return { type: "RECOMMENDATION", confidence: 0.85, productsMentioned, query: cleanQuery, rectifiedQuery };
  }

  // 6. Competitive Intelligence / Gaps
  const isCompetitiveIntel = /gap|gaps|worry|build next|opportunities|threat|lacks|missing|roadmap/i.test(cleanQuery);
  if (isCompetitiveIntel) {
    return { type: "COMPETITIVE_INTELLIGENCE", confidence: 0.85, productsMentioned, query: cleanQuery, rectifiedQuery };
  }

  // 7. Follow-up
  const isFollowUp = /what about|how about|and\b|why\b|explain/i.test(cleanQuery) && productsMentioned.length === 0;
  if (isFollowUp) {
    return { type: "FOLLOW_UP", confidence: 0.8, productsMentioned, query: cleanQuery, rectifiedQuery };
  }

  // 7. General Product Research / Pricing
  if (productsMentioned.length > 0 || /feature|pricing|cost|screening|interview|ats|sourcing|proctor/i.test(cleanQuery)) {
    if (competitorOnly.length === 0) {
      return { type: "HIREKO_GENERAL", confidence: 0.8, productsMentioned: ["Hireko"], query: cleanQuery, rectifiedQuery };
    }
    return { type: "PRODUCT_RESEARCH", confidence: 0.8, productsMentioned, query: cleanQuery, rectifiedQuery };
  }

  // Check if input is garbled / unrecognizable (e.g., random letters with no real words)
  const realWordPattern = /[aeiouy]{1,}/i;
  if (!realWordPattern.test(cleanQuery) || cleanQuery.length < 3) {
    return { type: "UNRECOGNIZED", confidence: 0.2, productsMentioned: [], query: cleanQuery };
  }

  return { type: "UNRECOGNIZED", confidence: 0.3, productsMentioned, query: cleanQuery, rectifiedQuery };
}

export function generateCasualResponse(intent: IntentType, userName?: string): string {
  const nameShort = userName ? `${userName}, ` : "";

  switch (intent) {
    case "NAME_INTRO":
      return `Hi ${userName}, what brings you here today?`;
    case "CASUAL_GREETING":
      return `${userName ? `Hey ${userName}!` : "Hey!"} Nice to have you here. What would you like to explore today?`;
    case "CASUAL_THANKS":
      return `You're very welcome ${nameShort}glad I could help! Want to compare another platform?`;
    case "CASUAL_CONFIRMATION":
      return `Sounds good ${nameShort}whenever you're ready, we can dig into another platform!`;
    case "CASUAL_GOODBYE":
      return `See you ${userName || "there"}! Come back anytime if you want to explore another competitor.`;
    case "UNRECOGNIZED":
      return `I couldn't quite understand that ${nameShort}did you mean to ask about a platform like Hireko, Ribbon AI, Talview, or CodeSignal? Please re-check your spelling or click one of the suggested topics below!`;
    default:
      return `${userName ? `Hi ${userName}! ` : ""}How can I help you research AI hiring products today?`;
  }
}
