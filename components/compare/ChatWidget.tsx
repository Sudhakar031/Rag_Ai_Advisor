"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Bot,
  Send,
  Sparkles,
  X,
  RefreshCw,
  MessageSquare,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Zap,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  ArrowUpRight,
  ExternalLink,
} from "lucide-react";
import { ConversationContext } from "@/lib/contextManager";
import ChatMessageContent from "./ChatMessageContent";

interface Source {
  competitor: string;
  section: string;
  title: string;
}

interface ProductCardData {
  name: string;
  category: string;
  tagline: string;
  strengths: string[];
  bestFor: string;
  slug: string;
  websiteUrl?: string;
  websiteDomain?: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  productCard?: ProductCardData;
  suggestedFollowUps?: string[];
}

const WELCOME_PROMPTS = [
  "How many competitors are there? (List with websites)",
  "What is Hireko?",
  "What does Talview do better?",
  "How does Ribbon AI compare to Hireko?",
  "What about Juicebox (PeopleGPT)?",
  "What should Hireko build next to win?",
  "Which platform should I choose for my team?",
];

const ACTION_CHIPS = [
  "List All Competitors & Websites",
  "What is Hireko?",
  "Modern Hire vs Hireko",
  "Talview Strengths",
  "Compare Ribbon AI",
  "Juicebox (PeopleGPT)",
  "Willo Video Screening",
  "Metaview Note-Taker",
  "Which platform to choose?",
];

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [context, setContext] = useState<ConversationContext | undefined>(undefined);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [feedbackState, setFeedbackState] = useState<Record<string, "up" | "down">>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isLoading]);

  const handleCopy = (id: string, text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => {
        setCopiedId((curr) => (curr === id ? null : curr));
      }, 2000);
    }
  };

  const handleFeedback = (id: string, type: "up" | "down") => {
    setFeedbackState((prev) => ({
      ...prev,
      [id]: prev[id] === type ? undefined! : type,
    }));
  };

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: textToSend.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!queryText) setInput("");
    setIsLoading(true);

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend.trim(),
          history,
          context,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: data.answer,
            sources: data.sources,
            productCard: data.productCard,
            suggestedFollowUps: data.suggestedFollowUps,
          },
        ]);
        if (data.context) {
          setContext(data.context);
        }
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: data.error || "Looks like I hit a temporary issue while researching that. Try again in a moment.",
          },
        ]);
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Looks like I hit a temporary issue while researching that. Try again in a moment.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([]);
    setContext(undefined);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* INLINE EMBEDDED BANNER ON THE COMPARE PAGE */}
      <section className="mx-auto my-10 max-w-6xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-2xl border border-blue-900/40 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-2xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-3.5 py-1 text-xs font-semibold text-blue-300 backdrop-blur-sm">
                <Sparkles size={14} className="text-blue-400 animate-pulse" />
                <span>Conversational AI Research Assistant</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Have specific product or competitor questions?
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Your AI Product Advisor gives neat, structured side-by-side answers grounded in verified research data across 16 hiring platforms (including HireVue, Ribbon AI, Juicebox, Talview, CodeSignal, and Paradox).
              </p>
            </div>

            <button
              onClick={() => setIsOpen(true)}
              className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold !text-white transition-all duration-200 hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/30 active:scale-95 shrink-0 shadow-md cursor-pointer"
              style={{ color: "#ffffff" }}
            >
              <MessageSquare size={18} className="text-white" />
              <span className="!text-white font-semibold" style={{ color: "#ffffff" }}>Launch AI Product Advisor</span>
            </button>
          </div>
        </div>
      </section>

      {/* FLOATING ACTION BUTTON */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-3 rounded-full bg-blue-600 px-5 py-3.5 !text-white shadow-2xl transition-all duration-300 hover:bg-blue-500 hover:scale-105 active:scale-95 cursor-pointer"
            aria-label="Open AI Product Advisor Chat"
            style={{ color: "#ffffff" }}
          >
            <div className="relative">
              <Bot size={22} className="text-white" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>
            <span className="font-semibold text-sm pr-1 !text-white" style={{ color: "#ffffff" }}>AI Product Advisor</span>
          </button>
        )}
      </div>

      {/* CHAT MODAL / MAIN INTERFACE */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-2 sm:p-4 backdrop-blur-xs">
          <div className="flex h-[90vh] w-full max-w-4xl flex-col rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* HEADER */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-900 px-5 py-4 text-white">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-inner">
                  <Bot size={22} />
                </div>
                <div>
                  <h3 className="font-semibold text-base flex items-center gap-2">
                    <span>AI Product Advisor</span>
                    <span className="rounded bg-blue-500/20 px-2.5 py-0.5 text-[10px] font-medium text-blue-300 border border-blue-400/30">
                      Grounded in 16 Platforms
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Neat, structured hiring intelligence & competitor research
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleReset}
                  title="Clear conversation"
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                >
                  <RefreshCw size={17} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  title="Close advisor"
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* ACTION CHIPS BAR */}
            <div className="border-b border-slate-100 bg-slate-50/80 px-4 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
              <span className="text-[11px] font-semibold text-slate-400 shrink-0 flex items-center gap-1">
                <Zap size={12} className="text-blue-600" /> Explore:
              </span>
              {ACTION_CHIPS.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(chip)}
                  className="shrink-0 text-xs bg-white hover:bg-blue-50 hover:text-blue-700 text-slate-700 rounded-full px-3 py-1 border border-slate-200 transition-colors shadow-2xs font-medium cursor-pointer"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* CHAT MESSAGES / WELCOME SCREEN */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50/50">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full max-w-xl mx-auto text-center space-y-6 py-8">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xl">
                    <Sparkles size={32} />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-slate-900">
                      Hi! I&apos;m your AI Product Advisor.
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      I deliver neat, structured answers with executive summaries, comparison tables, and buyer verdicts grounded in verified research across 16 hiring platforms.
                    </p>
                  </div>

                  <div className="w-full space-y-3 pt-2">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider text-left">
                      Try asking:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                      {WELCOME_PROMPTS.map((prompt, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSend(prompt)}
                          className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 hover:border-blue-500 hover:shadow-md text-xs font-medium text-slate-800 transition-all group cursor-pointer"
                        >
                          <span>&ldquo;{prompt}&rdquo;</span>
                          <ChevronRight size={14} className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.role === "user" ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`max-w-[95%] sm:max-w-[90%] rounded-2xl p-4 sm:p-5 text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-blue-600 text-white rounded-br-xs shadow-md font-medium"
                          : "bg-white text-slate-800 border border-slate-200/90 rounded-bl-xs shadow-xs space-y-4"
                      }`}
                    >
                      {msg.role === "assistant" && (
                        <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                          <div className="flex items-center gap-1.5 font-semibold text-xs text-blue-600">
                            <Sparkles size={14} />
                            <span>HireKo AI Product Advisor</span>
                            <span className="hidden sm:inline-block rounded bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700 border border-blue-200/60 ml-1">
                              Structured Brief
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            {/* COPY BUTTON */}
                            <button
                              onClick={() => handleCopy(msg.id, msg.content)}
                              title="Copy answer to clipboard"
                              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
                            >
                              {copiedId === msg.id ? (
                                <>
                                  <Check size={12} className="text-emerald-600" />
                                  <span className="text-emerald-600 font-semibold">Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy size={12} />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>

                            {/* FEEDBACK BUTTONS */}
                            <div className="flex items-center gap-0.5 border-l border-slate-200 pl-1 ml-1">
                              <button
                                onClick={() => handleFeedback(msg.id, "up")}
                                title="Helpful answer"
                                className={`rounded p-1 transition-colors cursor-pointer ${
                                  feedbackState[msg.id] === "up"
                                    ? "bg-blue-100 text-blue-700 font-semibold"
                                    : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                                }`}
                              >
                                <ThumbsUp size={12} />
                              </button>
                              <button
                                onClick={() => handleFeedback(msg.id, "down")}
                                title="Needs improvement"
                                className={`rounded p-1 transition-colors cursor-pointer ${
                                  feedbackState[msg.id] === "down"
                                    ? "bg-rose-100 text-rose-700 font-semibold"
                                    : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                                }`}
                              >
                                <ThumbsDown size={12} />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* STRUCTURED MESSAGE BODY */}
                      {msg.role === "assistant" ? (
                        <ChatMessageContent content={msg.content} />
                      ) : (
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                      )}

                      {/* PRODUCT CARD RENDERER */}
                      {msg.productCard && (
                        <div className="mt-3 p-4 rounded-xl bg-gradient-to-br from-slate-50 to-blue-50/40 border border-slate-200/90 text-xs space-y-2.5">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                              <span>{msg.productCard.name}</span>
                              <span className="text-[10px] text-slate-400 font-normal">Profile</span>
                            </span>
                            <div className="flex items-center gap-1.5">
                              {msg.productCard.websiteUrl && (
                                <a
                                  href={msg.productCard.websiteUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded border border-blue-200/80 transition-colors"
                                >
                                  <span>Website</span>
                                  <ExternalLink size={10} />
                                </a>
                              )}
                              <span className="text-[10px] font-semibold bg-blue-100 text-blue-800 px-2 py-0.5 rounded border border-blue-200/60">
                                {msg.productCard.category}
                              </span>
                            </div>
                          </div>
                          
                          <p className="text-slate-600 text-xs">{msg.productCard.tagline}</p>
                          
                          {msg.productCard.strengths && msg.productCard.strengths.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1 pt-1">
                              <span className="text-[11px] font-medium text-slate-500 mr-1">Key Strengths:</span>
                              {msg.productCard.strengths.map((str, sIdx) => (
                                <span
                                  key={sIdx}
                                  className="rounded bg-white px-2 py-0.5 text-[11px] font-medium text-slate-700 border border-slate-200 shadow-2xs"
                                >
                                  {str}
                                </span>
                              ))}
                            </div>
                          )}

                          <div className="pt-1 flex items-center justify-between border-t border-slate-200/60 mt-2">
                            <div className="text-[11px] text-slate-600">
                              <span className="font-semibold text-slate-700">Best for: </span>
                              <span>{msg.productCard.bestFor}</span>
                            </div>

                            <Link
                              href={msg.productCard.slug === "all-competitors" || msg.productCard.slug === "hireko" ? "/compare" : `/compare/${msg.productCard.slug}`}
                              className="inline-flex items-center gap-1 font-semibold text-xs text-blue-600 hover:text-blue-800 transition-colors group shrink-0 ml-2"
                            >
                              <span>{msg.productCard.slug === "all-competitors" ? "Browse Directory" : "Full Breakdown"}</span>
                              <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                            </Link>
                          </div>
                        </div>
                      )}

                      {/* QUICK ACTION ROW FOR PRODUCT QUERIES */}
                      {msg.productCard && (
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          {msg.productCard.websiteUrl && (
                            <a
                              href={msg.productCard.websiteUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 !text-white px-3 py-1.5 text-xs font-medium transition-colors shadow-2xs"
                              style={{ color: "#ffffff" }}
                            >
                              <span style={{ color: "#ffffff" }}>Open {msg.productCard.name} Website</span>
                              <ExternalLink size={12} style={{ color: "#ffffff" }} />
                            </a>
                          )}
                          <Link
                            href={msg.productCard.slug === "all-competitors" || msg.productCard.slug === "hireko" ? "/compare" : `/compare/${msg.productCard.slug}`}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 !text-white px-3 py-1.5 text-xs font-medium transition-colors shadow-2xs"
                            style={{ color: "#ffffff" }}
                          >
                            <span style={{ color: "#ffffff" }}>
                              {msg.productCard.slug === "all-competitors" ? "Browse All 16 Platform Comparisons" : `Explore Full ${msg.productCard.name} Comparison`}
                            </span>
                            <ArrowUpRight size={12} style={{ color: "#ffffff" }} />
                          </Link>
                          <Link
                            href="/pricing"
                            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 !text-slate-800 px-3 py-1.5 text-xs font-medium transition-colors border border-slate-200"
                            style={{ color: "#1e293b" }}
                          >
                            <span style={{ color: "#1e293b" }}>View Hireko Pricing</span>
                          </Link>
                          <Link
                            href="/contact"
                            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 !text-blue-700 px-3 py-1.5 text-xs font-medium transition-colors border border-blue-200/60"
                            style={{ color: "#1d4ed8" }}
                          >
                            <span style={{ color: "#1d4ed8" }}>Schedule a Live Demo</span>
                          </Link>
                        </div>
                      )}

                      {/* CITATION SOURCES */}
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                            <ShieldCheck size={13} className="text-emerald-600" /> Evidence Sources:
                          </span>
                          {msg.sources.map((src, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 border border-slate-200"
                            >
                              <span>{src.competitor}</span>
                              <span className="text-slate-400">•</span>
                              <span>{src.section}</span>
                            </span>
                          ))}
                        </div>
                      )}

                      {/* FOLLOW-UP SUGGESTION CHIPS */}
                      {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-slate-100">
                          <p className="text-[11px] font-semibold text-slate-400 mb-2 flex items-center gap-1">
                            <TrendingUp size={12} className="text-blue-600" /> Suggested Next Questions:
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {msg.suggestedFollowUps.map((chip, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleSend(chip)}
                                className="text-left text-xs bg-blue-50/80 hover:bg-blue-100 text-blue-700 font-medium rounded-lg px-3 py-1.5 border border-blue-200/60 transition-colors cursor-pointer"
                              >
                                {chip}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>
                  </div>
                ))
              )}

              {/* TYPING ANIMATION INDICATOR */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-bl-xs bg-white border border-slate-200 p-4 shadow-xs">
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                      <Bot size={16} className="animate-spin text-blue-600" />
                      <span>Synthesizing structured hiring intelligence...</span>
                      <span className="flex gap-1 ml-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-bounce"></span>
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]"></span>
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]"></span>
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* CHAT INPUT FORM */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="border-t border-slate-200 bg-white p-3 sm:p-4"
            >
              <div className="flex items-end gap-2">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything about AI hiring platforms (e.g., What is Hireko, Talview vs Hireko, Ribbon AI, pricing)..."
                  rows={1}
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-hidden transition-all resize-none max-h-32"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 !text-white transition-all hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600 shrink-0 shadow-md cursor-pointer"
                  style={{ color: "#ffffff" }}
                >
                  <Send size={18} className="text-white" style={{ color: "#ffffff" }} />
                </button>
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 px-1">
                <span>Press Enter to send, Shift + Enter for new line</span>
                <span>Grounded in 16 competitor research profiles</span>
              </div>
            </form>

          </div>
        </div>
      )}
    </>
  );
}
