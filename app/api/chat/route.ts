import { NextRequest, NextResponse } from "next/server";
import { askAdvisorRAG, ChatMessage } from "@/lib/rag";
import type { ConversationContext } from "@/lib/contextManager";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, history, context } = body as {
      message?: string;
      history?: ChatMessage[];
      context?: ConversationContext;
    };

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json(
        { error: "Message is required and must be a non-empty string." },
        { status: 400 }
      );
    }

    const result = await askAdvisorRAG(message.trim(), history || [], context);

    return NextResponse.json({
      success: true,
      answer: result.answer,
      intent: result.intent,
      sources: result.sources,
      productCard: result.productCard,
      suggestedFollowUps: result.suggestedFollowUps,
      context: result.context,
    });
  } catch (error) {
    console.error("API /api/chat Error:", error);
    return NextResponse.json(
      {
        error: "Looks like I hit a temporary issue while researching that. Try again in a moment.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
