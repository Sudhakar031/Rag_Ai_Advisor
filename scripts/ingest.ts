import fs from "fs";
import path from "path";
import { comparisons } from "../data/comparisons.ts";
import type { ComparisonOverview } from "../types/comparison";

export interface VectorChunk {
  id: string;
  slug: string;
  competitor: string;
  section: string;
  title: string;
  content: string;
  keywords: string[];
  vector?: number[];
}

function extractKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

function chunkComparison(comp: ComparisonOverview): VectorChunk[] {
  const chunks: VectorChunk[] = [];
  const compName = comp.competitorName;
  const slug = comp.slug;

  // 1. OVERVIEW & SUMMARY
  chunks.push({
    id: `${slug}-overview`,
    slug,
    competitor: compName,
    section: "Overview & Category",
    title: `${compName} vs Hireko Overview`,
    content: `Platform Comparison: ${comp.title} (${comp.category}).\nSummary: ${comp.summary}\nOverview: ${comp.overview}`,
    keywords: extractKeywords(`${comp.title} ${comp.category} ${comp.summary} ${comp.overview}`),
  });

  // 2. QUICK STATS & HIGHLIGHTS
  const statsStr = comp.quickStats
    .map((s) => `${s.label}: Hireko (${s.value})`)
    .join("; ");
  const highlightsStr = comp.highlights.map((h) => `- ${h}`).join("\n");

  chunks.push({
    id: `${slug}-highlights`,
    slug,
    competitor: compName,
    section: "Quick Stats & Highlights",
    title: `${compName} vs Hireko Highlights`,
    content: `Quick Comparison Stats for ${compName} vs Hireko:\n${statsStr}\n\nKey Comparison Highlights:\n${highlightsStr}`,
    keywords: extractKeywords(`${compName} stats highlights ${statsStr} ${highlightsStr}`),
  });

  // 3. FEATURE MATRIX
  const featuresStr = comp.features
    .map(
      (f) =>
        `Feature: ${f.feature} | Hireko: ${f.hireko} | ${compName}: ${f.competitor}`
    )
    .join("\n");

  chunks.push({
    id: `${slug}-features`,
    slug,
    competitor: compName,
    section: "Feature Comparison Matrix",
    title: `${compName} vs Hireko Feature Comparison`,
    content: `Detailed Feature Comparison between Hireko and ${compName}:\n${featuresStr}`,
    keywords: extractKeywords(`${compName} features matrix ${featuresStr}`),
  });

  // 4. PRICING & TCO
  const pricingStr = comp.pricing
    .map(
      (p) =>
        `Pricing Tier/Item: ${p.label} | Hireko: ${p.hireko} | ${compName}: ${p.competitor}`
    )
    .join("\n");

  chunks.push({
    id: `${slug}-pricing`,
    slug,
    competitor: compName,
    section: "Pricing & Contract Structure",
    title: `${compName} vs Hireko Pricing Comparison`,
    content: `Pricing, Cost and Contract Structure Comparison for Hireko vs ${compName}:\n${pricingStr}`,
    keywords: extractKeywords(`${compName} pricing cost plans contract ${pricingStr}`),
  });

  // 5. STRENGTHS & TRADEOFFS
  const strengthsStr = comp.strengths.map((s) => `Hireko Strength: ${s}`).join("\n");
  const weaknessesStr = comp.weaknesses.map((w) => `Hireko Tradeoff/Limitation vs ${compName}: ${w}`).join("\n");

  chunks.push({
    id: `${slug}-strengths-tradeoffs`,
    slug,
    competitor: compName,
    section: "Strengths & Tradeoffs",
    title: `${compName} vs Hireko Strengths and Tradeoffs`,
    content: `Strengths & Tradeoffs when comparing Hireko and ${compName}:\n${strengthsStr}\n${weaknessesStr}`,
    keywords: extractKeywords(`${compName} strengths weaknesses tradeoffs ${strengthsStr} ${weaknessesStr}`),
  });

  // 6. VERDICT & RECOMMENDATIONS
  chunks.push({
    id: `${slug}-verdict`,
    slug,
    competitor: compName,
    section: "Final Verdict & Buyer Guidance",
    title: `${compName} vs Hireko Final Verdict`,
    content: `Final Verdict for choosing between Hireko and ${compName}:\n${comp.verdict}`,
    keywords: extractKeywords(`${compName} verdict recommendation buyer guidance ${comp.verdict}`),
  });

  // 7. FAQs
  if (comp.faq && comp.faq.length > 0) {
    const faqStr = comp.faq
      .map((f) => `Q: ${f.question}\nA: ${f.answer}`)
      .join("\n\n");

    chunks.push({
      id: `${slug}-faq`,
      slug,
      competitor: compName,
      section: "Frequently Asked Questions",
      title: `${compName} vs Hireko FAQ`,
      content: `Frequently Asked Questions regarding ${compName} vs Hireko:\n${faqStr}`,
      keywords: extractKeywords(`${compName} faq questions answers ${faqStr}`),
    });
  }

  return chunks;
}

function buildIngestion() {
  console.log(`Starting ingestion of ${comparisons.length} comparison pages...`);

  const allChunks: VectorChunk[] = [];
  const competitorsList: string[] = [];

  for (const comp of comparisons) {
    competitorsList.push(comp.competitorName);
    const chunks = chunkComparison(comp);
    allChunks.push(...chunks);
  }

  console.log(`Generated ${allChunks.length} section chunks across ${competitorsList.length} competitors:`);
  console.log(competitorsList.join(", "));

  const targetPath = path.resolve("./data/vectorStore.json");
  fs.writeFileSync(targetPath, JSON.stringify(allChunks, null, 2), "utf-8");

  console.log(`Successfully saved vector store to ${targetPath}`);
}

buildIngestion();
