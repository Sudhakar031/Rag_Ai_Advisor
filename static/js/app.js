/**
 * Hireko AI Product Advisor - Client Application
 * Unique Green and White Mix Theme
 */

document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const chatContainer = document.getElementById("chatContainer");
  const welcomeState = document.getElementById("welcomeState");
  const messagesList = document.getElementById("messagesList");
  const typingIndicator = document.getElementById("typingIndicator");
  const chatForm = document.getElementById("chatForm");
  const queryInput = document.getElementById("queryInput");
  const sendBtn = document.getElementById("sendBtn");
  const clearChatBtn = document.getElementById("clearChatBtn");

  // In-memory conversation history
  let conversationHistory = [];
  let currentUserName = null;
  let isSubmitting = false;

  // Configure Marked.js
  if (window.marked) {
    marked.setOptions({
      gfm: true,
      breaks: true,
      headerIds: false,
      mangle: false,
    });
  }

  // Auto-resize textarea
  queryInput.addEventListener("input", () => {
    queryInput.style.height = "auto";
    queryInput.style.height = Math.min(queryInput.scrollHeight, 144) + "px";
    sendBtn.disabled = !queryInput.value.trim();
  });

  // Handle Enter / Shift+Enter
  queryInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!sendBtn.disabled && !isSubmitting) {
        chatForm.dispatchEvent(new Event("submit", { cancelable: true }));
      }
    }
  });

  // Handle Suggested Prompt Chips
  document.querySelectorAll(".prompt-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      const promptText = chip.getAttribute("data-prompt");
      if (promptText) {
        submitQuery(promptText);
      }
    });
  });

  // Handle New Chat / Reset
  clearChatBtn.addEventListener("click", () => {
    conversationHistory = [];
    messagesList.innerHTML = "";
    welcomeState.classList.remove("hidden");
    queryInput.value = "";
    queryInput.style.height = "42px";
    sendBtn.disabled = true;
    queryInput.focus();
  });

  // Form Submission
  chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const query = queryInput.value.trim();
    if (!query || isSubmitting) return;
    submitQuery(query);
  });

  // Submit Query to Python API
  async function submitQuery(queryText) {
    if (isSubmitting) return;
    isSubmitting = true;

    // Hide welcome state once conversation begins
    if (welcomeState && !welcomeState.classList.contains("hidden")) {
      welcomeState.classList.add("hidden");
    }

    // Render User Message
    renderUserMessage(queryText);

    // Reset input
    queryInput.value = "";
    queryInput.style.height = "42px";
    sendBtn.disabled = true;

    // Show Typing Indicator
    showTyping(true);
    scrollToBottom();

    // Prepare API payload
    const payload = {
      query: queryText,
      history: conversationHistory,
      userName: currentUserName,
    };

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Advisor service returned status ${res.status}`);
      }

      const data = await res.json();

      // Update state
      if (data.userName) currentUserName = data.userName;

      // Append to local history
      conversationHistory.push({ role: "user", content: queryText });
      conversationHistory.push({ role: "assistant", content: data.answer });

      // Render Advisor Message
      showTyping(false);
      renderAdvisorMessage(data);
      scrollToBottom();
    } catch (err) {
      showTyping(false);
      renderErrorMessage(
        "Unable to retrieve intelligence from the advisor service. Please verify that the server is active and try again."
      );
      scrollToBottom();
    } finally {
      isSubmitting = false;
      queryInput.focus();
    }
  }

  // Render User Message
  function renderUserMessage(text) {
    const msgDiv = document.createElement("div");
    msgDiv.className = "flex justify-end animate-fade-in";
    msgDiv.innerHTML = `
      <div class="max-w-[85%] sm:max-w-[75%] bg-gradient-to-br from-emerald-900 via-teal-950 to-emerald-900 text-white px-4 py-3 rounded-2xl rounded-tr-xs shadow-sm text-sm leading-relaxed whitespace-pre-wrap border border-emerald-800">
        <p>${escapeHtml(text)}</p>
      </div>
    `;
    messagesList.appendChild(msgDiv);
  }

  // Render Advisor Message
  function renderAdvisorMessage(data) {
    const msgDiv = document.createElement("div");
    msgDiv.className = "flex items-start space-x-3 animate-fade-in";

    // Format Markdown content safely
    let formattedHtml = "";
    if (window.marked && window.DOMPurify) {
      formattedHtml = DOMPurify.sanitize(marked.parse(data.answer));
    } else {
      formattedHtml = `<p class="whitespace-pre-wrap">${escapeHtml(data.answer)}</p>`;
    }

    // Product Card
    let productCardHtml = "";
    if (data.productCard) {
      const card = data.productCard;
      const strengthsList = (card.strengths || [])
        .map(
          (s) =>
            `<li class="flex items-start space-x-2 text-xs text-slate-600"><span class="text-emerald-600 font-bold mt-0.5">•</span><span>${escapeHtml(
              s
            )}</span></li>`
        )
        .join("");

      const hirekoButtonHtml =
        card.websiteUrl && card.name.toLowerCase().includes("hireko")
          ? `<div class="shrink-0 pt-2 sm:pt-0">
                <a
                  href="https://hireko.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center space-x-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-xs hover:shadow-sm"
                >
                  <span>Visit Hireko.ai</span>
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                  </svg>
                </a>
              </div>`
          : "";

      productCardHtml = `
        <div class="mt-4 pt-4 border-t border-emerald-100">
          <div class="bg-gradient-to-br from-white to-emerald-50/40 border border-emerald-200/80 rounded-xl p-4 shadow-2xs">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div class="flex items-center space-x-2">
                  <h4 class="text-sm font-bold text-slate-900">${escapeHtml(card.name)}</h4>
                  <span class="text-[10px] font-semibold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                    ${escapeHtml(card.category)}
                  </span>
                </div>
                <p class="text-xs text-slate-500 mt-1">${escapeHtml(card.tagline)}</p>
                ${
                  strengthsList
                    ? `<ul class="mt-2.5 space-y-1">${strengthsList}</ul>`
                    : ""
                }
              </div>

              ${hirekoButtonHtml}
            </div>
          </div>
        </div>
      `;
    }

    // Sources pill
    let sourcesHtml = "";
    if (data.sources && data.sources.length > 0) {
      const sourceTitles = data.sources
        .map((s) => `${s.competitor} (${s.title})`)
        .slice(0, 2)
        .join(" • ");
      sourcesHtml = `
        <div class="mt-3 flex items-center space-x-2 text-[11px] text-emerald-700/80">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>Source verification: ${escapeHtml(sourceTitles)}</span>
        </div>
      `;
    }

    // Follow-up suggestion chips
    let suggestionsHtml = "";
    if (data.followUpSuggestions && data.followUpSuggestions.length > 0) {
      const chips = data.followUpSuggestions
        .map(
          (s) =>
            `<button class="followup-chip text-left text-xs bg-white hover:bg-emerald-50 text-emerald-900 border border-emerald-200 hover:border-emerald-300 px-3 py-1.5 rounded-lg transition-all font-medium shadow-2xs" data-prompt="${escapeHtml(
              s
            )}">${escapeHtml(s)}</button>`
        )
        .join("");

      suggestionsHtml = `
        <div class="mt-4 pt-3 border-t border-emerald-100/70">
          <p class="text-[11px] font-bold uppercase tracking-wider text-emerald-800 mb-2">Explore Next</p>
          <div class="flex flex-wrap gap-2">${chips}</div>
        </div>
      `;
    }

    msgDiv.innerHTML = `
      <img src="/static/ai-advisor.jpg" alt="Advisor Avatar" class="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-300/60 mt-1 shrink-0 shadow-2xs">
      <div class="flex-1 bg-white border border-emerald-100/90 rounded-2xl rounded-tl-xs p-5 shadow-xs hover:border-emerald-200/90 transition-colors overflow-hidden">
        <div class="prose-advisor max-w-none">
          ${formattedHtml}
        </div>
        ${productCardHtml}
        ${sourcesHtml}
        ${suggestionsHtml}
      </div>
    `;

    // Bind click events on follow-up chips
    msgDiv.querySelectorAll(".followup-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        const prompt = chip.getAttribute("data-prompt");
        if (prompt) submitQuery(prompt);
      });
    });

    messagesList.appendChild(msgDiv);
  }

  // Render Error Message
  function renderErrorMessage(errorText) {
    const msgDiv = document.createElement("div");
    msgDiv.className = "flex items-start space-x-3 animate-fade-in";
    msgDiv.innerHTML = `
      <img src="/static/ai-advisor.jpg" alt="Advisor Avatar" class="w-8 h-8 rounded-full object-cover ring-2 ring-red-200 mt-1 shrink-0">
      <div class="flex-1 bg-red-50/70 border border-red-200 rounded-2xl rounded-tl-xs p-4 text-xs text-red-700 leading-relaxed shadow-xs">
        <strong class="font-semibold block mb-1">Advisor Notice</strong>
        ${escapeHtml(errorText)}
      </div>
    `;
    messagesList.appendChild(msgDiv);
  }

  // Show/Hide Typing
  function showTyping(show) {
    if (show) {
      typingIndicator.classList.remove("hidden");
    } else {
      typingIndicator.classList.add("hidden");
    }
  }

  // Auto-scroll
  function scrollToBottom() {
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }

  // Helper escape
  function escapeHtml(str) {
    if (!str) return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
});
