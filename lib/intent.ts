export type IntentType =
  | "CASUAL_GREETING"
  | "NAME_INTRO"
  | "CASUAL_THANKS"
  | "CASUAL_CONFIRMATION"
  | "CASUAL_GOODBYE"
  | "PRODUCT_COMPARISON" // 1. Competitor comparison
  | "PRICING_COMPARISON" // 2. Pricing comparison
  | "FEATURE_QUESTION" // 3. Direct Yes/No capability question
  | "FEATURE_COMPARISON" // 4. Feature-specific comparison across platforms ("Which platforms have facial recognition?")
  | "HIREKO_BEST_FEATURES" // 5. Hireko's best features / competitive advantage
  | "HIREKO_ROADMAP" // 5b. Prioritized roadmap / What should Hireko improve next
  | "BEST_FEATURE_BY_USE_CASE" // 5c. Which platform has the best feature / best feature by use case
  | "HIREKO_SPECIFIC" // 6. Hireko.ai-specific question (non-comparative)
  | "COMPETITOR_SPECIFIC" // 7. Competitor-specific question (non-comparative)
  | "RECOMMENDATION" // 8. Recommendation question
  | "GENERAL_QA" // 9. General AI recruitment / interviewing question
  | "UNRELATED_QUESTION" // 10. Unrelated question outside hiring technology
  | "REPEATED_QUESTION" // 11. Repeated/similar question in session
  | "COMPETITOR_LIST"
  | "COMPETITOR_STRENGTHS"
  | "COMPETITIVE_INTELLIGENCE"
  | "FOLLOW_UP"
  | "UNRECOGNIZED"
  | "UNKNOWN";

export interface IntentResult {
  type: IntentType;
  confidence: number;
  productsMentioned: string[];
  targetPlatform?: string;
  featureKey?: string;
  featureLabel?: string;
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

export const FEATURE_DEFINITIONS: Array<{
  key: string;
  label: string;
  regex: RegExp;
}> = [
  {
    key: "gameBasedAssessment",
    label: "Game-Based Assessment",
    regex: /game\s*[- ]?based|gamified|game\s*assessments?|game\s*tests?/i,
  },
  {
    key: "facialRecognition",
    label: "Facial Recognition",
    regex: /facial\s*recognition|facial\s*analysis|face\s*recognition|microexpressions?|emotion\s*ai|emotion\s*recognition/i,
  },
  {
    key: "liveVideo",
    label: "Live Video",
    regex: /live\s*video|live\s*interview|real-time\s*video|2-way\s*video|two-way\s*video/i,
  },
  {
    key: "videoInterview",
    label: "Video Interview",
    regex: /video\s*interviews?|video\s*screening|video\s*recording|webcam\s*interview|recorded\s*video/i,
  },
  {
    key: "aiInterview",
    label: "AI Interview",
    regex: /ai\s*interviews?|conversational\s*interview|two-way\s*interview|2-way\s*interview|voice\s*interview|autonomous\s*interview/i,
  },
  {
    key: "interviewAnalysis",
    label: "Interview Analysis",
    regex: /interview\s*analysis|analyze\s*interviews?|transcription|speech\s*analysis|audio\s*analysis/i,
  },
  {
    key: "candidateAssessment",
    label: "Candidate Assessment",
    regex: /candidate\s*assessments?|assessments?|skill\s*assessments?|cognitive\s*tests?|psychometric/i,
  },
  {
    key: "aiEvaluation",
    label: "AI Evaluation & Scoring",
    regex: /ai\s*evaluation|candidate\s*scoring|scoring|autograd|rubric\s*scoring|automated\s*evaluation|score\s*candidates/i,
  },
  {
    key: "proctoring",
    label: "Remote Exam Proctoring",
    regex: /proctoring|remote\s*proctoring|anti-cheat|browser\s*lock|cheating\s*prevention|tab\s*switch/i,
  },
  {
    key: "codingSandbox",
    label: "Coding Sandbox & Compilers",
    regex: /coding\s*sandboxes?|code\s*editor|ide\s*compiler|coding\s*tests?|algorithmic\s*tests?/i,
  },
];

const UNRELATED_PATTERNS = [
  /\b(capital of|weather in|recipe for|joke|poem|cats|dogs|pizza|dough|pasta|football|cricket|basketball|president of|who won the|solve \d|photosynthesis|bake a|cook a|movie|song lyrics)\b/i,
];

const RECRUITMENT_KEYWORDS =
  /\b(hiring|hire|recruit|recruiting|interview|interviews|screening|candidate|candidates|ats|rubric|rubrics|assessment|assessments|competitor|competitors|platform|platforms|resume|resumes|job|jobs|talent|applicant|applicants|pricing|cost|subscription|proctoring|codesignal|hirevue|talview|spark hire|metaview|willo|ribbon|paradox|hireko|game|gamified)\b/i;

export function classifyIntent(query: string): IntentResult {
  const cleanQuery = query.trim();
  const qLower = cleanQuery.toLowerCase().replace(/[^a-z0-9\s]/g, " ");
  const trimmedLower = qLower.trim();

  // 1. Check Name Introduction
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

  // 2. Check Casual Intents with Typo Patterns & Fuzzy Matching
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

  // 3. Extract Mentioned Products with Fuzzy Typo Rectification
  const { products: productsMentioned, rectifiedQuery } = extractMentionedProductsWithFuzzy(qLower);
  const competitorOnly = productsMentioned.filter((p) => p !== "Hireko");
  const isExplicitHireko = productsMentioned.includes("Hireko") || /hireko/i.test(cleanQuery);

  // 4. Feature Extraction
  const featureDef = FEATURE_DEFINITIONS.find((f) => f.regex.test(cleanQuery));
  const featureKey = featureDef?.key;
  const featureLabel = featureDef?.label;

  // 5. Unrelated Question Detection
  const matchesUnrelatedExplicit = UNRELATED_PATTERNS.some((p) => p.test(cleanQuery));
  if (matchesUnrelatedExplicit) {
    if (!RECRUITMENT_KEYWORDS.test(cleanQuery) || /capital of|joke|poem|pizza|dough|cats|dogs/i.test(cleanQuery)) {
      return {
        type: "UNRELATED_QUESTION",
        confidence: 0.99,
        productsMentioned,
        query: cleanQuery,
        rectifiedQuery,
      };
    }
  }

  // 6. Direct Yes/No Feature Capability Question
  // e.g., "Does Hireko have facial recognition?", "Does Hireko support video interviews?", "Does HireVue have AI evaluation?", "Can Hireko analyze interviews?", "Does Talview support assessments?", "Does Hireko have candidate scoring?", "Does [platform name] have video interviews?"
  const isYesNoCapabilityQuery =
    /^(?:does|can|is|will|do|support)\s+(?:\[?[a-z0-9_.\s]+\]?)\s+(?:have|support|do|offer|include|feature|provide|record|conduct|test|integrate|allow|analyze|score|autograde|grade|use|conduct|hold)/i.test(cleanQuery) ||
    /^(?:does|can|is|will|do)\s+(?:hireko|hirevue|talview|spark\s*hire|metaview|codesignal|willo|ribbon|paradox|modern\s*hire|juicebox|greenhouse|humanly|coderbyte|interviewer|mercor|recruit41|\[?[a-z0-9_.\s]+\]?)\b/i.test(cleanQuery) ||
    /(?:does|can|is)\s+(?:hireko|hirevue|talview|spark\s*hire|metaview|codesignal|willo|ribbon|paradox|modern\s*hire|juicebox|greenhouse|humanly|coderbyte|interviewer|mercor|recruit41|\[?[a-z0-9_.\s]+\]?)\s+(?:have|support|do|offer|include|feature|provide|record|conduct|test|integrate|allow|analyze|score|autograde|grade|use)/i.test(cleanQuery);

  if (isYesNoCapabilityQuery && featureKey) {
    const isPlaceholder = /\[platform|\bplatform\s*name\b|\bany\s*platform\b|\bthe\s*platform\b/i.test(cleanQuery);
    let targetPlatform = isPlaceholder
      ? "[platform name]"
      : isExplicitHireko
      ? "Hireko"
      : competitorOnly[0] || productsMentioned[0] || "Hireko";
    return {
      type: "FEATURE_QUESTION",
      confidence: 0.98,
      productsMentioned: isPlaceholder ? ["[platform name]"] : [targetPlatform],
      targetPlatform,
      featureKey,
      featureLabel,
      query: cleanQuery,
      rectifiedQuery,
    };
  }

  // 7. Feature-Specific Comparison Across Platforms (Cross-Platform)
  // e.g., "Which platforms have facial recognition?", "Which platforms support live video?", "Which platforms support AI interviews?", "Which platforms have candidate scoring?"
  const isFeatureComparison =
    /which\s+platforms?\s+(?:have|support|offer|feature|provide|use|include|do)/i.test(cleanQuery) ||
    /who\s+(?:has|supports|offers|provides)\s+(?:live\s*video|facial|ai\s*interview|video|proctoring|coding|scoring|assessments?)/i.test(cleanQuery) ||
    /platforms?\s+(?:supporting|that\s+support|with)\b/i.test(cleanQuery) ||
    (/which\s+platform/i.test(cleanQuery) && !!featureKey) ||
    (/which.*(?:live\s*video|video\s*interview|ai\s*interview|facial\s*recognition)/i.test(cleanQuery));

  if (isFeatureComparison && featureKey) {
    return {
      type: "FEATURE_COMPARISON",
      confidence: 0.98,
      productsMentioned,
      featureKey,
      featureLabel,
      query: cleanQuery,
      rectifiedQuery,
    };
  }

  // 7.8 What should Hireko improve next? / Product Roadmap (Pattern D)
  const isHirekoRoadmap =
    /what\s+should\s+hireko\s+(?:improve|build|focus\s+on|develop|prioritize)(?:\s+next)?/i.test(cleanQuery) ||
    /how\s+can\s+hireko\s+improve/i.test(cleanQuery) ||
    /hireko\s+(?:product\s+)?roadmap/i.test(cleanQuery) ||
    /recommended\s+improvements?\s+(?:for\s+hireko)?/i.test(cleanQuery) ||
    /what\s+features?\s+should\s+hireko\s+add/i.test(cleanQuery) ||
    /what\s+to\s+build\s+next/i.test(cleanQuery) ||
    /what\s+should\s+we\s+build\s+next/i.test(cleanQuery);

  if (isHirekoRoadmap) {
    return {
      type: "HIREKO_ROADMAP",
      confidence: 0.99,
      productsMentioned: ["Hireko"],
      targetPlatform: "Hireko",
      query: cleanQuery,
      rectifiedQuery,
    };
  }

  // 7.9 Which platform has the best feature? / Best platform by use case (Pattern A)
  const isBestFeatureQuery =
    /which\s+platform\s+has\s+(?:the\s+)?best\s+features?/i.test(cleanQuery) ||
    /who\s+has\s+(?:the\s+)?best\s+features?/i.test(cleanQuery) ||
    /best\s+features?\s+by\s+use\s+case/i.test(cleanQuery) ||
    /best\s+platform\s+by\s+use\s+case/i.test(cleanQuery) ||
    /which\s+platform\s+is\s+the\s+best(?:\s+overall)?/i.test(cleanQuery) ||
    /best\s+recruiting\s+platform\s+overall/i.test(cleanQuery);

  if (isBestFeatureQuery) {
    return {
      type: "PRODUCT_COMPARISON",
      confidence: 0.99,
      productsMentioned: ["Hireko", "HireVue", "Talview", "CodeSignal", "Spark Hire", "Metaview"],
      query: cleanQuery,
      rectifiedQuery,
    };
  }

  // 8. Hireko's Best Features / Advantages / Competitive Strengths
  // e.g., "What are Hireko's best features?", "What makes Hireko better?", "What are Hireko's advantages?", "What does Hireko do better than competitors?", "Why should I choose Hireko?", "What is Hireko's competitive advantage?"
  const isHirekoBestFeatures =
    /what\s+(?:are\s+)?hireko(?:'s)?\s+(?:best|top|main|key|standout)?\s*(?:features?|advantages?|strengths?|capabilities?)/i.test(cleanQuery) ||
    /what\s+makes\s+hireko\s+(?:better|different|unique|special|stand\s*out)/i.test(cleanQuery) ||
    /what\s+does\s+hireko\s+do\s+better/i.test(cleanQuery) ||
    /why\s+(?:should\s+i\s+)?choose\s+hireko|why\s+choose\s+hireko/i.test(cleanQuery) ||
    /what\s+is\s+hireko(?:'s)?\s+competitive\s+advantage/i.test(cleanQuery) ||
    /hireko\s+advantages?|hireko\s+best\s+features?/i.test(cleanQuery);

  if (isHirekoBestFeatures) {
    return {
      type: "HIREKO_BEST_FEATURES",
      confidence: 0.98,
      productsMentioned: ["Hireko"],
      targetPlatform: "Hireko",
      query: cleanQuery,
      rectifiedQuery,
    };
  }

  // 8.5 Compare All Platforms / Multi-Feature Comparison (Rule 4)
  // e.g. "Compare all platforms on pricing and AI features", "compare all platforms"
  const isCompareAllPlatforms =
    /compare\s+all\s+platforms/i.test(cleanQuery) ||
    /compare.*all.*(?:platform|tool|competitor)/i.test(cleanQuery) ||
    /compare.*(?:pricing|cost).*(?:and|&)?.*(?:ai|features?)/i.test(cleanQuery) ||
    /compare\s+all/i.test(cleanQuery);

  if (isCompareAllPlatforms) {
    const resolvedProducts = [
      "Hireko",
      "HireVue",
      "Talview",
      "Modern Hire",
      "Spark Hire",
      "myInterview",
      "Willo",
      "CodeSignal",
      "Paradox",
      "Humanly",
      "Interviewer.AI",
      "Metaview",
      "Mercor",
      "Greenhouse",
    ];
    return {
      type: "PRODUCT_COMPARISON",
      confidence: 0.99,
      productsMentioned: resolvedProducts,
      query: cleanQuery,
      rectifiedQuery,
    };
  }

  // 9. Pricing Questions (Single Platform, Cross-Platform, or General)
  // e.g., "How much does Hireko cost?", "Which platform is cheaper?", "Hireko vs HireVue pricing", "Pricing", "compare ai pricing", "what is pricing for metaview"
  const isPricingQuery =
    /\b(pricing|price|prices|cost|costs|subscription|subscriptions|plans?|packages?|tier|tiers|fee|fees|how\s+much\s+does.*cost|which\s+platform\s+is\s+cheaper|cheapest)\b/i.test(cleanQuery);

  if (isPricingQuery) {
    return {
      type: "PRICING_COMPARISON",
      confidence: 0.98,
      productsMentioned,
      query: cleanQuery,
      rectifiedQuery,
      topic: "pricing",
    };
  }

  // 10. Recommendation Questions
  // e.g., "Which platform should I choose?", "Which is best for AI interviews?", "Which platform is better for recruiters?", "Should I use Hireko or HireVue?"
  const isRecommendation =
    /which\s+platform\s+should\s+i\s+choose|which\s+is\s+best\s+for|which\s+platform\s+is\s+better\s+for|should\s+i\s+use|what\s+do\s+you\s+recommend|recommend\s+a\s+platform|who\s+wins/i.test(cleanQuery);

  if (isRecommendation) {
    return {
      type: "RECOMMENDATION",
      confidence: 0.95,
      productsMentioned,
      featureKey,
      featureLabel,
      query: cleanQuery,
      rectifiedQuery,
    };
  }

  // 11. Explicit Competitor Comparison
  // e.g., "Compare Hireko and HireVue", "Hireko vs Talview", "Which is better, Hireko or HireVue?", "What is the difference between Hireko and HireVue?", "Compare the features of these platforms", "Which platform has better AI interview features?", "What does Hireko have that competitors don't?", "compare 3 competitors"
  const isMultiNumericCompare =
    /compare.*?(?:3\s*(?:or|to|-)\s*4|4|four|3|three|several|top|multiple|all|matrix)/i.test(cleanQuery) ||
    /compare.*?(?:competitor|platform|tool|alternative)/i.test(cleanQuery);

  const isComparisonQuery =
    /\b(compare|vs|versus|difference\s+between|differ|side\s+by\s+side|against)\b/i.test(cleanQuery) ||
    /which\s+is\s+better.*(?:or|vs)/i.test(cleanQuery) ||
    /better\s+ai\s+interview\s+features/i.test(cleanQuery) ||
    /what\s+does\s+hireko\s+have\s+that\s+competitors\s+don/i.test(cleanQuery) ||
    productsMentioned.length >= 2 ||
    isMultiNumericCompare;

  if (isComparisonQuery) {
    let resolvedProducts = [...productsMentioned];
    if (isCompareAllPlatforms) {
      resolvedProducts = [
        "Hireko",
        "HireVue",
        "Talview",
        "Spark Hire",
        "Metaview",
        "CodeSignal",
        "Willo",
        "Ribbon AI",
        "Modern Hire",
      ];
    } else if (resolvedProducts.length < 2 && isMultiNumericCompare) {
      const isFour =
        /4|four/i.test(cleanQuery) ||
        /3\s*(?:or|to|-)\s*4|three\s*or\s*four/i.test(cleanQuery);
      if (isFour) {
        resolvedProducts = isExplicitHireko
          ? ["Hireko", "HireVue", "Talview", "Spark Hire"]
          : ["HireVue", "Talview", "Spark Hire", "Metaview"];
      } else {
        resolvedProducts = isExplicitHireko
          ? ["Hireko", "HireVue", "Talview"]
          : ["HireVue", "Talview", "Spark Hire"];
      }
    } else if (resolvedProducts.length < 2 && /competitor|platform|these\s+platforms/i.test(cleanQuery)) {
      resolvedProducts = ["Hireko", "HireVue", "Talview"];
    }
    return {
      type: "PRODUCT_COMPARISON",
      confidence: 0.98,
      productsMentioned: resolvedProducts,
      featureKey,
      featureLabel,
      query: cleanQuery,
      rectifiedQuery,
    };
  }

  // 12. Competitor Directory / List
  const isCompetitorList =
    /how many.*(?:competitor|platform|tool|software)/i.test(cleanQuery) ||
    /what.*(?:are\s+the\s+competitors|competitor\s+list|all\s+competitors)/i.test(cleanQuery) ||
    /list.*(?:all.*)?(?:competitor|platform|tool)/i.test(cleanQuery) ||
    /(?:all|tracked|evaluated).*(?:competitor|platform)/i.test(cleanQuery) ||
    /competitor.*(?:list|directory|landscape|overview|breakdown|website|link)/i.test(cleanQuery) ||
    /who are.*(?:competitor|alternative)/i.test(cleanQuery);

  if (isCompetitorList && (competitorOnly.length === 0 || /all|list|how many|directory|landscape/i.test(cleanQuery))) {
    return { type: "COMPETITOR_LIST", confidence: 0.98, productsMentioned: [], query: cleanQuery, rectifiedQuery };
  }

  // 13. Pure Hireko Inquiry (Non-comparative)
  // e.g., "What is Hireko?", "How does Hireko work?", "Tell me about Hireko", "What can Hireko do?"
  if (isExplicitHireko && competitorOnly.length === 0) {
    return {
      type: "HIREKO_SPECIFIC",
      confidence: 0.95,
      productsMentioned: ["Hireko"],
      targetPlatform: "Hireko",
      query: cleanQuery,
      rectifiedQuery,
    };
  }

  // 14. Competitor-Specific Question (Non-comparative)
  // e.g., "Tell me about Talview", "What is Spark Hire?", "Overview of CodeSignal", "What does Metaview do?"
  if (competitorOnly.length === 1 && !isExplicitHireko) {
    return {
      type: "COMPETITOR_SPECIFIC",
      confidence: 0.95,
      productsMentioned: competitorOnly,
      targetPlatform: competitorOnly[0],
      query: cleanQuery,
      rectifiedQuery,
    };
  }

  // 15. General AI Recruitment / Interviewing QA
  // e.g., STAR method, KPIs, chunk size, behavioral questions, AI interview bias
  if (/star\s+method|behavioral|chunk|kpi|metric|recruiting|bias|interview/i.test(cleanQuery)) {
    return {
      type: "GENERAL_QA",
      confidence: 0.95,
      productsMentioned: [],
      query: cleanQuery,
      rectifiedQuery,
    };
  }

  // 16. Fallback Unrelated Check if no recruitment keywords are found
  if (!RECRUITMENT_KEYWORDS.test(cleanQuery) && cleanQuery.length > 5) {
    return {
      type: "UNRELATED_QUESTION",
      confidence: 0.9,
      productsMentioned: [],
      query: cleanQuery,
      rectifiedQuery,
    };
  }

  // 17. Unrecognized check (garbled text / no vowels)
  const realWordPattern = /[aeiouy]{1,}/i;
  const isAllConsonants = /^[^aeiouy\s]+$/i.test(cleanQuery.replace(/[^a-z]/gi, ""));
  if (!realWordPattern.test(cleanQuery) || cleanQuery.length < 3 || isAllConsonants) {
    return { type: "UNRECOGNIZED", confidence: 0.2, productsMentioned: [], query: cleanQuery };
  }

  return { type: "GENERAL_QA", confidence: 0.9, productsMentioned: [], query: cleanQuery, rectifiedQuery };
}

export function generateCasualResponse(intent: IntentType, userName?: string): string {
  const nameShort = userName ? `${userName}, ` : "";

  switch (intent) {
    case "NAME_INTRO":
      return `Hi ${userName}, what brings you here today?`;
    case "CASUAL_GREETING":
      return "Hi there! I'm the Hireko.ai Product Advisor. How can I assist you?";
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
