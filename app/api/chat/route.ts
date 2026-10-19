import { NextRequest, NextResponse } from "next/server";
import { askAdvisorRAG } from "@/lib/rag";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, history = [], userName } = body;

    if (!query || typeof query !== "string" || !query.trim()) {
      return NextResponse.json({
        answer: "Please ask a question about Hireko.ai, competitor comparisons, pricing, or AI interview features!",
        intent: "GENERAL_QA",
        sources: [],
        suggestedFollowUps: [
          "Which platforms support live video?",
          "Compare all platforms on pricing and AI features",
          "Does HireVue have video interviews?",
        ],
      });
    }

    const response = await askAdvisorRAG(query.trim(), history, undefined, userName);
    return NextResponse.json(response);
  } catch (error) {
    console.error("API /api/chat handled fallback:", error);
    return NextResponse.json({
      answer:
        "Hireko.ai provides live conversational AI video and voice interviews with automated ~2-minute autograding. Some details for this specific request are not confirmed. What platform or feature would you like to check?",
      intent: "GENERAL_QA",
      sources: [],
      suggestedFollowUps: [
        "Which platforms support live video?",
        "Compare all platforms on pricing and AI features",
        "Does HireVue have video interviews?",
      ],
    });
  }
}
