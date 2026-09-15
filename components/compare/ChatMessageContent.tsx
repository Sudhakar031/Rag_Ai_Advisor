"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Zap,
  Award,
  ChevronRight,
  ExternalLink,
  Table as TableIcon,
} from "lucide-react";

interface ChatMessageContentProps {
  content: string;
}

// Renders inline formatted text: **bold**, `code`, [links](url), emojis/checkmarks
function renderInlineText(text: string): React.ReactNode[] {
  const tokenRegex = /(\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|`([^`]+)`)/g;

  const elements: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      elements.push(text.slice(lastIndex, match.index));
    }

    if (match[2] && match[3]) {
      const linkText = match[2];
      const linkUrl = match[3];
      const isInternal = linkUrl.startsWith("/") || linkUrl.startsWith("#");

      if (isInternal) {
        elements.push(
          <Link
            key={`link-${match.index}`}
            href={linkUrl}
            className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-800 underline underline-offset-2 transition-colors"
          >
            <span>{linkText}</span>
            <ChevronRight size={12} className="inline" />
          </Link>
        );
      } else {
        elements.push(
          <a
            key={`link-${match.index}`}
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-800 underline underline-offset-2 transition-colors"
          >
            <span>{linkText}</span>
            <ExternalLink size={12} className="inline" />
          </a>
        );
      }
    } else if (match[4]) {
      elements.push(
        <strong key={`bold-${match.index}`} className="font-semibold text-slate-900">
          {match[4]}
        </strong>
      );
    } else if (match[5]) {
      elements.push(
        <code
          key={`code-${match.index}`}
          className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-blue-700 border border-slate-200"
        >
          {match[5]}
        </code>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    elements.push(text.slice(lastIndex));
  }

  return elements.length > 0 ? elements : [text];
}

interface TableData {
  headers: string[];
  rows: string[][];
}

function parseTableBlock(lines: string[]): TableData | null {
  if (lines.length < 2) return null;

  const parseRow = (line: string): string[] => {
    return line
      .trim()
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .split("|")
      .map((c) => c.trim());
  };

  const headers = parseRow(lines[0]);
  const rows: string[][] = [];

  for (let i = 2; i < lines.length; i++) {
    const row = parseRow(lines[i]);
    if (row.length > 0 && row.some((cell) => cell.length > 0)) {
      rows.push(row);
    }
  }

  return { headers, rows };
}

export default function ChatMessageContent({ content }: ChatMessageContentProps) {
  const blocks = useMemo(() => {
    const rawLines = content.split("\n");
    const resultBlocks: {
      type: "heading" | "table" | "callout" | "list" | "paragraph" | "divider";
      level?: number;
      calloutType?: "tldr" | "verdict" | "tip" | "info";
      content?: string;
      items?: string[];
      tableData?: TableData;
    }[] = [];

    let i = 0;
    while (i < rawLines.length) {
      const line = rawLines[i].trim();

      if (!line) {
        i++;
        continue;
      }

      if (line === "---" || line === "***" || line === "___") {
        resultBlocks.push({ type: "divider" });
        i++;
        continue;
      }

      const headingMatch = line.match(/^(#{1,4})\s+(.+)$/);
      if (headingMatch) {
        resultBlocks.push({
          type: "heading",
          level: headingMatch[1].length,
          content: headingMatch[2],
        });
        i++;
        continue;
      }

      if (
        line.startsWith("|") &&
        i + 1 < rawLines.length &&
        rawLines[i + 1].trim().startsWith("|") &&
        rawLines[i + 1].includes("---")
      ) {
        const tableLines: string[] = [];
        while (i < rawLines.length && rawLines[i].trim().startsWith("|")) {
          tableLines.push(rawLines[i]);
          i++;
        }
        const tableData = parseTableBlock(tableLines);
        if (tableData) {
          resultBlocks.push({
            type: "table",
            tableData,
          });
          continue;
        }
      }

      const isCalloutPrefix =
        line.startsWith(">") ||
        line.startsWith("⚡") ||
        line.toLowerCase().startsWith("**quick take") ||
        line.toLowerCase().startsWith("**tl;dr") ||
        line.toLowerCase().startsWith("tl;dr:") ||
        line.startsWith("🏆") ||
        line.toLowerCase().startsWith("**the buyer verdict") ||
        line.toLowerCase().startsWith("**verdict");

      if (isCalloutPrefix) {
        let calloutType: "tldr" | "verdict" | "tip" | "info" = "info";
        if (line.includes("TL;DR") || line.includes("⚡") || line.toLowerCase().includes("quick take")) {
          calloutType = "tldr";
        } else if (line.includes("🏆") || line.toLowerCase().includes("verdict")) {
          calloutType = "verdict";
        } else if (line.includes("💡") || line.toLowerCase().includes("tip")) {
          calloutType = "tip";
        }

        const calloutLines: string[] = [];
        while (i < rawLines.length && rawLines[i].trim().length > 0) {
          const l = rawLines[i].trim().replace(/^>\s*/, "");
          calloutLines.push(l);
          i++;
        }

        resultBlocks.push({
          type: "callout",
          calloutType,
          content: calloutLines.join("\n"),
        });
        continue;
      }

      const listMatch = line.match(/^([*\-•]|\d+\.)\s+(.+)$/);
      if (listMatch) {
        const items: string[] = [];
        while (i < rawLines.length) {
          const curr = rawLines[i].trim();
          const currListMatch = curr.match(/^([*\-•]|\d+\.)\s+(.+)$/);
          if (currListMatch) {
            items.push(currListMatch[2]);
            i++;
          } else if (curr.length === 0) {
            if (i + 1 < rawLines.length && rawLines[i + 1].trim().match(/^([*\-•]|\d+\.)\s+(.+)$/)) {
              i++;
            } else {
              break;
            }
          } else {
            break;
          }
        }

        resultBlocks.push({
          type: "list",
          items,
        });
        continue;
      }

      const paraLines: string[] = [];
      while (
        i < rawLines.length &&
        rawLines[i].trim().length > 0 &&
        !rawLines[i].trim().startsWith("#") &&
        !rawLines[i].trim().startsWith("|") &&
        !rawLines[i].trim().startsWith(">") &&
        !rawLines[i].trim().startsWith("⚡") &&
        !rawLines[i].trim().startsWith("🏆") &&
        !rawLines[i].trim().match(/^([*\-•]|\d+\.)\s+/)
      ) {
        paraLines.push(rawLines[i].trim());
        i++;
      }

      if (paraLines.length > 0) {
        resultBlocks.push({
          type: "paragraph",
          content: paraLines.join(" "),
        });
      }
    }

    return resultBlocks;
  }, [content]);

  return (
    <div className="space-y-3.5 text-slate-800 text-[13.5px] leading-relaxed">
      {blocks.map((block, idx) => {
        if (block.type === "heading") {
          const headingText = block.content || "";
          if (block.level === 1 || block.level === 2) {
            return (
              <div key={idx} className="pt-2 pb-1 border-b border-slate-100">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <Sparkles size={16} className="text-blue-600 shrink-0" />
                  <span>{renderInlineText(headingText)}</span>
                </h2>
              </div>
            );
          }
          if (block.level === 3) {
            return (
              <h3
                key={idx}
                className="text-[14.5px] font-bold text-slate-900 pt-1.5 flex items-center gap-2"
              >
                <span className="h-2 w-2 rounded-full bg-blue-600 shrink-0 inline-block" />
                <span>{renderInlineText(headingText)}</span>
              </h3>
            );
          }
          return (
            <h4
              key={idx}
              className="text-xs font-bold uppercase tracking-wider text-slate-700 pt-1 flex items-center gap-1.5"
            >
              <span>{renderInlineText(headingText)}</span>
            </h4>
          );
        }

        if (block.type === "callout") {
          const isTldr = block.calloutType === "tldr";
          const isVerdict = block.calloutType === "verdict";

          return (
            <div
              key={idx}
              className={`rounded-xl p-3.5 sm:p-4 text-xs sm:text-sm border transition-all ${
                isTldr
                  ? "bg-gradient-to-r from-blue-50/90 via-indigo-50/80 to-blue-50/90 border-blue-200/80 text-blue-950 shadow-2xs"
                  : isVerdict
                  ? "bg-gradient-to-r from-amber-50/90 via-orange-50/80 to-amber-50/90 border-amber-200/80 text-amber-950 shadow-2xs"
                  : "bg-slate-50 border-slate-200 text-slate-800"
              }`}
            >
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 shrink-0">
                  {isTldr && <Zap size={16} className="text-blue-600 fill-blue-600" />}
                  {isVerdict && <Award size={16} className="text-amber-600" />}
                  {!isTldr && !isVerdict && <AlertCircle size={16} className="text-slate-500" />}
                </div>
                <div className="flex-1 space-y-1.5 leading-relaxed">
                  {block.content?.split("\n").map((line, lIdx) => (
                    <p key={lIdx}>{renderInlineText(line)}</p>
                  ))}
                </div>
              </div>
            </div>
          );
        }

        if (block.type === "table" && block.tableData) {
          const { headers, rows } = block.tableData;
          return (
            <div
              key={idx}
              className="my-3 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white font-semibold">
                      {headers.map((h, hIdx) => {
                        const isHireko = h.toLowerCase().includes("hireko");
                        return (
                          <th
                            key={hIdx}
                            className={`px-3.5 py-2.5 text-xs font-semibold tracking-wide border-r border-slate-800 last:border-r-0 ${
                              isHireko ? "text-blue-300" : "text-slate-100"
                            }`}
                          >
                            <div className="flex items-center gap-1.5">
                              {hIdx === 0 && <TableIcon size={13} className="text-blue-400" />}
                              <span>{h}</span>
                              {isHireko && (
                                <span className="rounded bg-blue-500/30 px-1.5 py-0.5 text-[10px] font-bold text-blue-200 border border-blue-400/40">
                                  AI-First
                                </span>
                              )}
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rows.map((row, rIdx) => {
                      const isEven = rIdx % 2 === 0;
                      return (
                        <tr
                          key={rIdx}
                          className={`transition-colors ${
                            isEven ? "bg-white" : "bg-slate-50/60"
                          } hover:bg-blue-50/40`}
                        >
                          {row.map((cell, cIdx) => {
                            const isDimension = cIdx === 0;
                            const isHirekoCol =
                              headers[cIdx] && headers[cIdx].toLowerCase().includes("hireko");

                            return (
                              <td
                                key={cIdx}
                                className={`px-3.5 py-2.5 align-top border-r border-slate-100 last:border-r-0 ${
                                  isDimension
                                    ? "font-semibold text-slate-900 whitespace-nowrap bg-slate-50/50"
                                    : isHirekoCol
                                    ? "text-blue-950 font-medium bg-blue-50/20"
                                    : "text-slate-700"
                                }`}
                              >
                                {renderInlineText(cell)}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        }

        if (block.type === "list" && block.items) {
          return (
            <ul key={idx} className="space-y-1.5 my-1.5 pl-0.5">
              {block.items.map((item, itIdx) => (
                <li key={itIdx} className="flex items-start gap-2.5 text-slate-700">
                  <div className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <CheckCircle2 size={12} className="text-blue-600" />
                  </div>
                  <div className="flex-1 leading-relaxed">
                    {renderInlineText(item)}
                  </div>
                </li>
              ))}
            </ul>
          );
        }

        if (block.type === "divider") {
          return <hr key={idx} className="my-3 border-slate-100" />;
        }

        return (
          <p key={idx} className="text-slate-700 leading-relaxed">
            {renderInlineText(block.content || "")}
          </p>
        );
      })}
    </div>
  );
}
