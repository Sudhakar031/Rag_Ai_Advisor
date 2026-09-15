export interface ConversationContext {
  currentProducts: string[];
  currentCategory?: string;
  currentTopic?: string;
  previousQuestions: string[];
  previousAnswers: string[];
  userPreferences: Record<string, string>;
  lastRecommendation?: string;
  conversationMode: "casual" | "research";
}

export function createInitialContext(): ConversationContext {
  return {
    currentProducts: ["Hireko"],
    previousQuestions: [],
    previousAnswers: [],
    userPreferences: {},
    conversationMode: "casual",
  };
}

export function updateContextWithQuery(
  context: ConversationContext,
  query: string,
  productsMentioned: string[],
  intentType: string,
  userName?: string
): ConversationContext {
  const updated = { ...context };

  // Store user name if provided
  if (userName) {
    updated.userPreferences = {
      ...(updated.userPreferences || {}),
      userName,
    };
  }

  // Track question history
  updated.previousQuestions = [...(updated.previousQuestions || []), query].slice(-10);

  // Update mode
  if (["CASUAL_GREETING", "NAME_INTRO", "CASUAL_THANKS", "CASUAL_CONFIRMATION", "CASUAL_GOODBYE"].includes(intentType)) {
    updated.conversationMode = "casual";
  } else {
    updated.conversationMode = "research";
  }

  // Update current products
  if (productsMentioned.length > 0) {
    if (productsMentioned.length === 1 && !productsMentioned.includes("Hireko")) {
      // Competitor mentioned: pair Hireko with this specific competitor
      updated.currentProducts = ["Hireko", productsMentioned[0]];
    } else if (productsMentioned.length === 1 && productsMentioned[0] === "Hireko") {
      // Pure Hireko question: focus exclusively on Hireko
      updated.currentProducts = ["Hireko"];
    } else {
      updated.currentProducts = productsMentioned;
    }
  }

  // Topic detection
  const qLower = query.toLowerCase();
  if (qLower.includes("pricing") || qLower.includes("cost") || qLower.includes("price") || qLower.includes("plan")) {
    updated.currentTopic = "pricing";
  } else if (qLower.includes("ai interview") || qLower.includes("interview") || qLower.includes("voice") || qLower.includes("video")) {
    updated.currentTopic = "AI interviews";
  } else if (qLower.includes("advantage") || qLower.includes("strength") || qLower.includes("better") || qLower.includes("stand out") || qLower.includes("excel") || qLower.includes("good at")) {
    updated.currentTopic = "strengths";
  } else if (qLower.includes("gap") || qLower.includes("build next") || qLower.includes("weakness") || qLower.includes("missing") || qLower.includes("opportunity") || qLower.includes("roadmap")) {
    updated.currentTopic = "gaps";
  } else if (qLower.includes("enterprise") || qLower.includes("scale") || qLower.includes("security") || qLower.includes("proctor")) {
    updated.currentTopic = "enterprise readiness";
  } else if (intentType === "COMPETITOR_LIST" || qLower.includes("competitor") || qLower.includes("how many")) {
    updated.currentTopic = "competitor landscape";
  } else {
    updated.currentTopic = "general";
  }

  return updated;
}

export function recordAnswerInContext(context: ConversationContext, answerText: string): ConversationContext {
  return {
    ...context,
    previousAnswers: [...(context.previousAnswers || []), answerText].slice(-8),
  };
}

export function resolveContextForQuery(context: ConversationContext, query: string): { resolvedQuery: string; targetProducts: string[] } {
  const qLower = query.toLowerCase();
  let targetProducts = context.currentProducts && context.currentProducts.length > 0 ? context.currentProducts : ["Hireko"];

  if (/what about|how about|which is better|which one|why/i.test(qLower) && targetProducts.length >= 2) {
    const prodA = targetProducts[0];
    const prodB = targetProducts[1];
    return {
      resolvedQuery: `Compare ${prodA} vs ${prodB} regarding ${query}`,
      targetProducts,
    };
  }

  return {
    resolvedQuery: query,
    targetProducts,
  };
}
