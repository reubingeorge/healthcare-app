// Chat Bot Page - Main functionality
// This handles the full-page chat interface at /patient/chat/

// DOM Elements
const chatBox = document.getElementById('chat-box');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const sendButton = document.getElementById('send-button');
const sendSpinner = document.getElementById('send-spinner');
const sendLabel = document.getElementById('send-label');
const sessionsList = document.getElementById('sessions-list');
const newChatButton = document.getElementById('new-chat-button');
const suggestionContainer = document.getElementById('suggestion-container');
const contextBadge = document.getElementById('chat-context-badge');
const closeBtn = document.getElementById("sidebar-close");
const chatArea = document.getElementById("chat-area");
const sidebar = document.getElementById("sidebar");
const toggleBtn = document.getElementById("sidebar-toggle");

// State variables
const initialMessage = "Hello! I'm your medical assistant. I can help answer questions about your condition based on medical documents. How can I help you today?"
let sessionId = null;
let activeButton = null;
let mainCancerType = null;
let subCancerType = null;
let preferredLanguage = null;
let preferredInitialMessage = null;

// Token management - always get the latest token from localStorage
function getToken() {
    return localStorage.getItem('access_token');
}

// Handle token refresh from token-refresh.js
window.updateAuthHeaders = function(newToken) {
    if (newToken) {
        localStorage.setItem('access_token', newToken);
        console.log('Chat: Access token updated');
    }
};

// API URLs
const TRANSLATE_URL = "/api/translate/";
const RESULT_URL = "/api/result";

/**
 * Translation Functions
 */
async function translateText(text, targetLang, token, {timeoutMs=10000, pollEveryMs=500} = {}) {
  if (targetLang == "en") {
    return text;
  }
  if (!text || !targetLang) return text;

  const res = await fetch(TRANSLATE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ text, target_language: targetLang })
  });

  // Cache hit (200)
  if (res.status === 200) {
    const data = await res.json();
    return data?.result ?? text;
  }

  // Accepted (202): poll /result/{request_id}
  if (res.status === 202) {
    const data = await res.json();
    const id = data?.request_id;
    if (!id) return text;

    const started = Date.now();
    while (Date.now() - started < timeoutMs) {
      await new Promise(r => setTimeout(r, pollEveryMs));
      const r2 = await fetch(`${RESULT_URL}/${encodeURIComponent(id)}`, {
        headers: {"Authorization": `Bearer ${token}`}
      });

      if (r2.status === 200) {
        const body = await r2.json();
        if (body.status === "completed") return body.result ?? text;
        if (body.status === "failed") return text;
      } else if (r2.status === 404) {
        // not ready yet or expired; keep polling until timeout
      }
    }
    return text; // timeout fallback
  }

  return text;
}

async function translateArray(texts, targetLang, token) {
  const uniq = [...new Set(texts.filter(Boolean))];
  const map = new Map();
  await Promise.all(
    uniq.map(async (t) => {
      const tt = await translateText(t, targetLang, token);
      map.set(t, tt);
    })
  );
  return texts.map(t => map.get(t) ?? t);
}

/**
 * UI Helper Functions
 */
function scrollToBottom() {
    chatBox.scrollTop = chatBox.scrollHeight;
}

function clearAllSuggestions() {
  document.querySelectorAll('.suggestions-row').forEach(el => el.remove());
}

/**
 * Session Management
 */
function renderSessionButton(session) {
    const btn = document.createElement('div');
    btn.className = `flex items-center justify-between w-full text-left cursor-pointer hover:bg-blue-50 rounded-lg px-3 py-2.5 transition-all duration-200 group`
    if (session.id === sessionId) {
        btn.classList.add('bg-blue-50', 'border', 'border-blue-200', 'shadow-sm');
        activeButton = btn;
    }

    btn.onclick = () => {
        if (session.id === sessionId) {
            return;
        }
        sessionId = session.id;
        loadSession(session.id);
        if (activeButton) {
            activeButton.classList.remove('bg-blue-50', 'border', 'border-blue-200', 'shadow-sm');
        }
        btn.classList.add('bg-blue-50', 'border', 'border-blue-200', 'shadow-sm');
        activeButton = btn;
        scrollToBottom();
    };

    const titleSpan = document.createElement('span');
    titleSpan.className = 'text-sm text-gray-700 truncate flex-1';
    titleSpan.textContent = session.title || 'Untitled Chat';

    const deleteBtn = document.createElement('button');
    deleteBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>`;
    deleteBtn.className = 'text-gray-400 hover:text-red-500 ml-2 opacity-0 group-hover:opacity-100 transition-all duration-200 p-1 hover:bg-red-50 rounded';
    deleteBtn.onclick = async (e) => {
        e.stopPropagation();
        await deleteSession(session.id);
        if (session.id === sessionId) {
            sessionId = null;
            chatBox.innerHTML = '';
        }
        loadSessions();
        chatBox.innerHTML = ''
        sessionId = null
        translateText(initialMessage, preferredLanguage, getToken()).then(translated => {
            preferredInitialMessage = translated;
            appendMessage("assistant", translated);
        });
    };

    btn.appendChild(titleSpan);
    btn.appendChild(deleteBtn);

    return btn;
}

async function loadSessions(skipAutoSelect = false) {
    const res = await fetch("/api/patients/chat/sessions/", {
        headers: { Authorization: "Bearer " + getToken() }
    });
    const sessions = await res.json();
    // Only auto-select first session if no session is active and we're not skipping
    if (!sessionId && sessions.length > 0 && !skipAutoSelect) {
        sessionId = sessions[0].id;
    }
    sessionsList.innerHTML = '';
    sessions.forEach(s => {
        const btn = renderSessionButton(s);
        sessionsList.appendChild(btn);
    });
}

async function deleteSession(id) {
    await fetch(`/api/patients/chat/${id}/delete/`, {
        method: 'DELETE',
        headers: { Authorization: "Bearer " + getToken() }
    });
}

async function loadSession(id) {
    // Don't reload if we're already viewing this session
    if (sessionId === id && chatBox.children.length > 0) {
        return;
    }

    const res = await fetch("/api/patients/chat/load/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + getToken()
        },
        body: JSON.stringify({ session_id: id })
    });

    if (res.ok) {
        sessionId = id;
        const data = await res.json();
        const messages = data.messages;
        chatBox.innerHTML = '';
        let bubble = null;
        for (const msg of data.messages) {
            bubble = appendMessage(msg.role, msg.content);
        }
      const localized = await translateArray(data.suggestions, preferredLanguage, getToken());

      renderSuggestionsUnderGroup(bubble, localized);
    } else {
        console.error("Failed to load session");
    }
}

/**
 * Chat Context
 */
async function loadChatContext() {
    try {
        const response = await fetch('/api/patients/chat/context/', {
            headers: {
                'Authorization': 'Bearer ' + getToken(),
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            preferredLanguage = data.language;
            mainCancerType = data.main_cancer_type;
            subCancerType = data.sub_cancer_type;
            contextBadge.textContent = `${subCancerType} Cancer${data.is_fallback ? ' (Default)' : ''}`;
            contextBadge.title = data.is_fallback
                ? 'Using general uterine cancer information'
                : `Using ${subCancerType} cancer specific information`;
        }
    } catch (error) {
        console.error('Error loading chat context:', error);
        contextBadge.textContent = 'Context unavailable';
    }
}

/**
 * Message Rendering
 */
function appendMessage(role, content) {
  const msgWrapper = document.createElement('div');
  msgWrapper.className = `message-group mb-6 flex items-start gap-3 ${
    role === 'user' ? 'justify-end' : 'justify-start'
  }`;

  const iconWrapper = document.createElement('div');
  iconWrapper.className = role === 'user'
    ? 'w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shadow-md flex-shrink-0'
    : 'w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shadow-sm flex-shrink-0 border border-gray-200';

  const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  icon.setAttribute("class", role === 'user' ? "w-5 h-5 text-white" : "w-5 h-5 text-gray-600");
  icon.setAttribute("viewBox", "0 0 24 24");
  icon.setAttribute("fill", "currentColor");

  if (role === 'user') {
    icon.innerHTML = `<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>`;
  } else {
    icon.innerHTML = `<path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 9h-2V5h2v6zm0 4h-2v-2h2v2z"/>`;
  }

  iconWrapper.appendChild(icon);

  const contentCol = document.createElement('div');
  contentCol.className = `flex flex-col ${role === 'user' ? 'items-end' : 'items-start'} max-w-[75%] md:max-w-[65%]`;

  const bubble = document.createElement('div');
  bubble.className = role === 'user'
    ? 'bg-blue-600 text-white px-4 py-3 rounded-2xl rounded-tr-sm shadow-md text-sm whitespace-pre-line leading-relaxed'
    : 'bg-white text-gray-800 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm text-sm whitespace-pre-line leading-relaxed border border-gray-200';

  bubble.textContent = content;
  contentCol.appendChild(bubble);

  if (role === 'user') {
    msgWrapper.appendChild(contentCol);
    msgWrapper.appendChild(iconWrapper);
  } else {
    msgWrapper.appendChild(iconWrapper);
    msgWrapper.appendChild(contentCol);
  }

  chatBox.appendChild(msgWrapper);
  scrollToBottom();

  return contentCol;
}

/**
 * Suggestion Chips
 */
function renderSuggestionsUnderGroup(groupEl, suggestions) {
  if (!groupEl || !suggestions?.length) return;
  // remove any existing suggestions under this group (safety)
  groupEl.querySelector('.suggestions-row')?.remove();

  const row = document.createElement('div');
  row.className = 'suggestions-row mt-3 flex flex-wrap gap-2 self-start w-full';

  suggestions.slice(0, 4).forEach(s => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'text-xs text-blue-700 px-3 py-1.5 rounded-full bg-white border border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow';
    btn.textContent = s;
    btn.addEventListener('click', () => {
      clearAllSuggestions();
      appendMessage("user", s);
      sendMessage(s);
      chatInput.focus();
    });
    row.appendChild(btn);
  });

  groupEl.appendChild(row);
}

/**
 * Message Sending
 */
async function sendMessage(message) {
    try {
         // Add AI typing indicator with status text and smooth animation
        clearAllSuggestions();
        const typingElement = document.createElement('div');
        typingElement.className = "flex justify-start items-start gap-3 mb-6 fade-in";
        typingElement.innerHTML = `
          <div class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shadow-sm flex-shrink-0 border border-gray-200">
            <svg class="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 9h-2V5h2v6zm0 4h-2v-2h2v2z"/>
            </svg>
          </div>
          <div class="bg-white text-gray-800 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm border border-gray-200 flex items-center gap-3">
            <svg class="w-4 h-4 text-blue-600 animate-spin flex-shrink-0" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span id="status-text" class="text-xs font-medium text-gray-600 transition-opacity duration-300"></span>
          </div>`;
        chatBox.appendChild(typingElement);
        scrollToBottom();

        let send = {
            message: message,
            initial_message: preferredInitialMessage,
            session_id: sessionId
        };
        const res = await fetch("/api/patients/chat/message/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + getToken()
            },
            body: JSON.stringify(send)
        });
        const data = await res.json();

        // Quickly cycle through all status updates (50ms each) to show what happened
        const statusTextElement = document.getElementById('status-text');
        if (data.status_updates && data.status_updates.length > 0 && statusTextElement) {
            for (let i = 0; i < data.status_updates.length; i++) {
                statusTextElement.textContent = data.status_updates[i];
                statusTextElement.style.opacity = '1';
                // Just 50ms delay to make them visible
                await new Promise(resolve => setTimeout(resolve, 50));
            }
        }

        const bubbleEl = appendMessage("assistant", data.response || data.error);
        sessionId = data.session_id;
        try {
          // Build last 5 messages as "role: text" (user/assistant)
          const sres = await fetch("/api/suggest/", {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + getToken()
            },
            body: JSON.stringify({
            session_id: sessionId,
            cancer_type: mainCancerType
            })
          });
          const sdata = await sres.json();
          const suggestions = (sdata.top_4 || []).slice(0, 4);
          const localized = await translateArray(suggestions, preferredLanguage, getToken());

          renderSuggestionsUnderGroup(bubbleEl, localized);
          scrollToBottom();
        } catch (e) {
          // optional fallback for POC
            console.error(e);
        }
        if (typingElement) typingElement.remove();
        scrollToBottom();

    } catch (err) {
        console.error("Error sending message:", err);
    } finally {
        chatInput.disabled = false;
        sendButton.disabled = false;
        sendSpinner.classList.add("hidden");
        sendLabel.classList.remove("invisible");
    }
}

/**
 * Sidebar Responsiveness
 */
function handleResize() {
  const isMobile = window.innerWidth < 768; // Tailwind's md breakpoint

  if (!isMobile) {
    // Ensure sidebar is visible and close button is hidden on larger screens
    sidebar.classList.remove('-translate-x-full');
    sidebar.classList.add('translate-x-0');
    closeBtn.classList.add('hidden');
  } else {
    // On small screens, allow close icon to show again when sidebar is open
    if (!sidebar.classList.contains('-translate-x-full')) {
      closeBtn.classList.remove('hidden');
    }
  }
}

/**
 * Auto-resize textarea
 */
function autoResizeTextarea() {
    chatInput.style.height = 'auto';
    const maxHeight = 150; // Maximum height in pixels (about 5 lines)
    const newHeight = Math.min(chatInput.scrollHeight, maxHeight);
    chatInput.style.height = newHeight + 'px';

    // Enable scrolling if content exceeds max height
    if (chatInput.scrollHeight > maxHeight) {
        chatInput.style.overflowY = 'auto';
    } else {
        chatInput.style.overflowY = 'hidden';
    }
}

/**
 * Event Listeners Setup
 */
function setupEventListeners() {
    // Sidebar toggle events
    closeBtn.addEventListener('click', () => {
      sidebar.classList.add('-translate-x-full');
      sidebar.classList.remove('translate-x-0');
      closeBtn.classList.add('hidden');
    });

    toggleBtn.addEventListener('click', () => {
      sidebar.classList.remove('-translate-x-full');
      sidebar.classList.add('translate-x-0');
      closeBtn.classList.remove('hidden');
    });

    // Auto-resize textarea on input
    chatInput.addEventListener('input', autoResizeTextarea);

    // Handle form submission logic
    async function handleMessageSubmit() {
        const message = chatInput.value.trim();
        if (!message || chatInput.disabled) {
            return;
        }

        chatInput.disabled = true;
        sendButton.disabled = true;
        sendSpinner.classList.remove("hidden");
        sendLabel.classList.add("invisible");

        appendMessage("user", message);
        const messageToSend = message;
        chatInput.value = "";
        chatInput.style.height = 'auto';

        try {
            await sendMessage(messageToSend);
        } finally {
            suggestionContainer.innerHTML = '';
            chatInput.disabled = false;
            sendButton.disabled = false;
            sendSpinner.classList.add("hidden");
            sendLabel.classList.remove("invisible");
            chatInput.focus();
        }
    }

    // Handle Enter key (submit on Enter, new line on Shift+Enter)
    chatInput.addEventListener('keydown', async (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            e.stopPropagation();
            await handleMessageSubmit();
        }
    });

    // Chat form submission (for button click)
    sendButton.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        await handleMessageSubmit();
    });

    // New chat button
    newChatButton.addEventListener("click", async () => {
        chatBox.innerHTML = ''
        sessionId = null
        translateText(initialMessage, preferredLanguage, getToken()).then(translated => {
            preferredInitialMessage = translated;
            appendMessage("assistant", translated);
        });
    });

    // Window resize handler
    window.addEventListener('resize', handleResize);
}

/**
 * Initialize on DOM Load
 */
document.addEventListener("DOMContentLoaded", async () => {
    // Initialize
    await loadSessions();
    await loadChatContext();

    // Setup event listeners
    setupEventListeners();

    // Handle initial resize
    handleResize();

    // Load existing session or show welcome message
    if (sessionId){
        await loadSession(sessionId);
    } else {
        translateText(initialMessage, preferredLanguage, getToken()).then(translated => {
            preferredInitialMessage = translated;
            appendMessage("assistant", translated);
        });
    }
});
