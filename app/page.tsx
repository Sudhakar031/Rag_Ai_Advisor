"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Send, RotateCcw, ExternalLink, Sparkles, Check, ArrowRight, ShieldCheck } from "lucide-react";
import ChatMessageContent from "@/components/compare/ChatMessageContent";

interface ProductCardData {
  name: string;
  category: string;
  tagline: string;
  strengths?: string[];
  bestFor?: string;
  slug?: string;
  websiteUrl?: string;
  websiteDomain?: string;
}

interface SourceCitation {
  competitor: string;
  section: string;
  title: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  productCard?: ProductCardData;
  sources?: SourceCitation[];
  followUpSuggestions?: string[];
}

const STARTER_PROMPTS = [
  {
    title: "Compare AI Pricing",
    desc: "Cross-platform pricing matrix & TCO breakdown",
    prompt: "Which platform has the best pricing?",
  },
  {
    title: "Compare 3 Platforms",
    desc: "HireVue vs Talview vs Hireko side-by-side",
    prompt: "Compare HireVue, Talview, and Hireko",
  },
  {
    title: "Metaview Pricing",
    desc: "Free, Pro, Max self-serve tiers & notes",
    prompt: "What is pricing for Metaview?",
  },
  {
    title: "HireVue Pricing",
    desc: "Enterprise suite & demo-led model",
    prompt: "What is the pricing for HireVue?",
  },
  {
    title: "CodeSignal Pricing",
    desc: "$79 Build, $479 Grow & Pro tiers",
    prompt: "What is the pricing for CodeSignal?",
  },
  {
    title: "Why Hireko",
    desc: "Two-way conversation vs 1-way video",
    prompt: "What makes Hireko different?",
  },
];

export default function AdvisorPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userName, setUserName] = useState<string | undefined>(undefined);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 144)}px`;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = async (queryText?: string) => {
    const textToSend = (queryText || input).trim();
    if (!textToSend || isLoading) return;

    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "42px";
    }

    const newMessages: Message[] = [...messages, { role: "user", content: textToSend }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: textToSend,
          history: newMessages.map((m) => ({ role: m.role, content: m.content })),
          userName,
        }),
      });

      if (!res.ok) {
        throw new Error(`Advisor service returned status ${res.status}`);
      }

      const data = await res.json();
      if (data.userName) setUserName(data.userName);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.answer || "No response received.",
          productCard: data.productCard,
          sources: data.sources,
          followUpSuggestions: data.followUpSuggestions || data.suggestedFollowUps,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "## Advisor notice\n\nUnable to retrieve intelligence from the advisor service. Please check your network connection and try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([]);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "42px";
      textareaRef.current.focus();
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gradient-to-b from-white via-emerald-50/20 to-slate-50 text-slate-900 font-sans antialiased">
      
      {/* TOP HEADER - CRISP WHITE & EMERALD ACCENTS */}
      <header className="bg-white/95 backdrop-blur-md border-b border-emerald-100 sticky top-0 z-30 shadow-xs shrink-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-18 py-3 flex items-center justify-between">
          
          {/* HIREKO LOGO & TITLE */}
          <div className="flex items-center space-x-3.5">
            <div className="flex items-center">
              <Image
                src="/hireko-header-logo.png"
                alt="Hireko.ai Logo"
                width={140}
                height={36}
                priority
                className="h-9 w-auto object-contain"
              />
            </div>
            <div className="h-5 w-px bg-emerald-200/80" />
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Image
                  src="/ai-advisor.jpg"
                  alt="AI Advisor Avatar"
                  width={34}
                  height={34}
                  className="w-8.5 h-8.5 rounded-full object-cover ring-2 ring-emerald-500/40 shadow-xs"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full ring-1 ring-emerald-400/50" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-sm font-bold text-slate-900 tracking-tight leading-none">
                    AI Product Advisor
                  </h1>
                  <span className="text-[10px] font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded-sm">
                    Intelligence
                  </span>
                </div>
                <p className="text-[11px] text-emerald-700/80 leading-none mt-1">
                  Recruitment & AI Interview Platform Benchmarks
                </p>
              </div>
            </div>
          </div>

          {/* HEADER ACTIONS */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-1.5 text-xs text-emerald-900 bg-emerald-50/90 px-2.5 py-1 rounded-full border border-emerald-200/80 shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-semibold text-emerald-800">Verified Benchmarks</span>
            </div>
            <button
              onClick={handleReset}
              className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 bg-emerald-50/60 hover:bg-emerald-100/80 border border-emerald-200/80 px-3 py-1.5 rounded-xl transition-all flex items-center space-x-1.5 shadow-2xs cursor-pointer"
              title="Start a new chat conversation"
            >
              <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
              <span>New Chat</span>
            </button>
          </div>

        </div>
      </header>

      {/* MAIN CHAT SCROLL AREA */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 scroll-smooth">
        <div className="max-w-4xl mx-auto space-y-6">

          {/* WELCOME / EMPTY STATE WITH GENERATED HIREKO VISUAL */}
          {messages.length === 0 && (
            <div className="space-y-6 py-2 animate-in fade-in duration-300">
              
              {/* FEATURED HIREKO HERO CARD */}
              <div className="bg-white border border-emerald-200/90 rounded-2xl p-6 sm:p-7 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-emerald-100/40 via-teal-50/20 to-transparent rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  
                  {/* Left Content */}
                  <div className="max-w-xl">
                    <div className="inline-flex items-center space-x-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold px-2.5 py-1 rounded-full mb-3">
                      <Sparkles className="w-3 h-3 text-emerald-600" />
                      <span>Autonomous AI Interview Platform</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-snug">
                      Hireko AI Product Advisor
                    </h2>
                    <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                      Your specialized research advisor for AI interview screening, competency scorecards, ATS operations, and verified competitor pricing models.
                    </p>

                    {/* Quick Feature Badges */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-5 text-xs">
                      <div className="flex items-center space-x-2 bg-emerald-50/60 border border-emerald-200/60 px-2.5 py-1.5 rounded-lg text-emerald-900 font-medium">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Two-Way AI Video</span>
                      </div>
                      <div className="flex items-center space-x-2 bg-emerald-50/60 border border-emerald-200/60 px-2.5 py-1.5 rounded-lg text-emerald-900 font-medium">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>2-Min Autograding</span>
                      </div>
                      <div className="flex items-center space-x-2 bg-emerald-50/60 border border-emerald-200/60 px-2.5 py-1.5 rounded-lg text-emerald-900 font-medium">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Strict Pricing Isolation</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Generated Hireko Platform Visual Showcase */}
                  <div className="shrink-0 w-full md:w-80 group">
                    <div className="relative rounded-xl overflow-hidden border-2 border-emerald-200 shadow-md transition-all duration-300 group-hover:shadow-lg group-hover:border-emerald-400">
                      <Image
                        src="/hireko-ai-interview.jpg"
                        alt="Hireko AI Interview & Assessment Dashboard"
                        width={640}
                        height={360}
                        priority
                        className="w-full h-auto object-cover transform transition-transform duration-500 group-hover:scale-102"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/70 via-transparent to-transparent flex items-end p-2.5">
                        <span className="text-[10px] font-semibold text-white tracking-wide">
                          Live AI Interview & Autograding Dashboard
                        </span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* SUGGESTED INQUIRIES GRID */}
              <div>
                <h3 className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-3 px-1">
                  Suggested Inquiries
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {STARTER_PROMPTS.map((card, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(card.prompt)}
                      className="group text-left bg-white hover:bg-emerald-50/40 border border-emerald-100 hover:border-emerald-300 p-3.5 rounded-xl transition-all shadow-2xs hover:shadow-xs cursor-pointer"
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                        <span>{card.title}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-emerald-500 transition-transform group-hover:translate-x-0.5" />
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                        {card.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* MESSAGES FEED */}
          {messages.map((msg, idx) => (
            <div key={idx} className="space-y-4">
              {msg.role === "user" ? (
                <div className="flex justify-end animate-in fade-in duration-200">
                  <div className="max-w-[85%] sm:max-w-[75%] bg-gradient-to-br from-emerald-900 via-teal-950 to-emerald-900 text-white px-4 py-3 rounded-2xl rounded-tr-xs shadow-sm text-sm leading-relaxed whitespace-pre-wrap border border-emerald-800">
                    {msg.content}
                  </div>
                </div>
              ) : (
                <div className="flex items-start space-x-3 animate-in fade-in duration-200">
                  <Image
                    src="/ai-advisor.jpg"
                    alt="Advisor Avatar"
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-300/60 mt-1 shrink-0 shadow-2xs"
                  />
                  <div className="flex-1 bg-white border border-emerald-100/90 rounded-2xl rounded-tl-xs p-5 shadow-xs hover:border-emerald-200/90 transition-colors overflow-hidden">
                    
                    {/* Render Formatted Markdown with Emerald Accents */}
                    <ChatMessageContent content={msg.content} />

                    {/* Single-Platform Product Card */}
                    {msg.productCard && (
                      <div className="mt-4 pt-4 border-t border-emerald-100">
                        <div className="bg-gradient-to-br from-white to-emerald-50/40 border border-emerald-200/80 rounded-xl p-4 shadow-2xs">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                              <div className="flex items-center space-x-2">
                                <h4 className="text-sm font-bold text-slate-900">
                                  {msg.productCard.name}
                                </h4>
                                <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                                  {msg.productCard.category}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 mt-1">
                                {msg.productCard.tagline}
                              </p>
                              {msg.productCard.strengths && msg.productCard.strengths.length > 0 && (
                                <ul className="mt-2.5 space-y-1">
                                  {msg.productCard.strengths.map((str, sIdx) => (
                                    <li key={sIdx} className="flex items-start space-x-2 text-xs text-slate-600">
                                      <span className="text-emerald-600 font-bold mt-0.5">•</span>
                                      <span>{str}</span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>

                            {/* SINGLE CLEAN HIREKO WEBSITE BUTTON WITH EMERALD GRADIENT - Only shown if card is Hireko */}
                            {msg.productCard.websiteUrl && msg.productCard.name.toLowerCase().includes("hireko") && (
                              <div className="shrink-0 pt-2 sm:pt-0">
                                <a
                                  href="https://hireko.ai"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center space-x-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-xs hover:shadow-sm"
                                >
                                  <span>Visit Hireko.ai</span>
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Sources Citation */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-3 flex items-center space-x-2 text-[11px] text-emerald-700/80">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>
                          Source verification:{" "}
                          {msg.sources.map((s) => `${s.competitor} (${s.title})`).slice(0, 2).join(" • ")}
                        </span>
                      </div>
                    )}

                    {/* Follow-up suggestions */}
                    {msg.followUpSuggestions && msg.followUpSuggestions.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-emerald-100/70">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 mb-2">
                          Explore Next
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {msg.followUpSuggestions.map((suggestion, sIdx) => (
                            <button
                              key={sIdx}
                              onClick={() => handleSend(suggestion)}
                              className="text-left text-xs bg-white hover:bg-emerald-50 text-emerald-900 border border-emerald-200 hover:border-emerald-300 px-3 py-1.5 rounded-lg transition-all font-medium shadow-2xs cursor-pointer"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              )}
            </div>
          ))}

          {/* TYPING INDICATOR */}
          {isLoading && (
            <div className="flex items-start space-x-3">
              <Image
                src="/ai-advisor.jpg"
                alt="Advisor Avatar"
                width={32}
                height={32}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-300/60 mt-1 shrink-0"
              />
              <div className="bg-white border border-emerald-100 rounded-2xl rounded-tl-xs px-4 py-3 shadow-2xs">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce" style={{ animationDelay: "300ms" }} />
                  <span className="text-xs text-emerald-800 font-medium ml-2">Consulting knowledge base...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* INPUT AREA (STICKY BOTTOM BAR - CRISP WHITE & EMERALD RING) */}
      <footer className="bg-white/95 backdrop-blur-md border-t border-emerald-100 px-4 sm:px-6 py-3 shadow-xs shrink-0">
        <div className="max-w-4xl mx-auto">
          {/* FLOATING ANIMATED AI FEMALE MASCOT OVER CHAT BOX */}
          <div className="flex items-center justify-between mb-2 px-1">
            <div className="flex items-center space-x-2.5 animate-mascot-float">
              <div className="relative group cursor-pointer" title="Hireko AI Product Advisor">
                <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-emerald-500 shadow-md animate-mascot-pulse">
                  <Image
                    src="/ai-advisor.jpg"
                    alt="AI Female Advisor Avatar"
                    width={36}
                    height={36}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full ring-1 ring-emerald-400/50" />
              </div>
              <div className="flex items-center space-x-1.5 bg-gradient-to-r from-emerald-50 via-teal-50/60 to-emerald-50 border border-emerald-200/90 px-3 py-1 rounded-full shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                <span className="text-[11px] font-bold text-emerald-950">
                  Hireko AI Advisor
                </span>
                <span className="text-[10px] text-emerald-700 font-medium hidden sm:inline">
                  • Online • Ready for any question
                </span>
              </div>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="relative flex items-end bg-white border border-emerald-200 rounded-2xl p-1.5 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all shadow-inner"
          >
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={handleTextareaInput}
              onKeyDown={handleKeyDown}
              placeholder="Ask about AI hiring platforms, pricing, features, or workflows..."
              className="w-full bg-transparent resize-none border-0 focus:ring-0 text-slate-900 text-sm placeholder:text-slate-400 py-2.5 px-3 max-h-36 overflow-y-auto leading-relaxed outline-hidden"
              style={{ minHeight: "42px" }}
            />

            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="shrink-0 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white p-2.5 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-xs hover:shadow-emerald-500/20 mb-0.5 mr-0.5 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </footer>

    </div>
  );
}
