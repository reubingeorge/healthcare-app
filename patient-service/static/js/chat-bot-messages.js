/**
 * Chat Messages Module
 * Handles message rendering, sending, and suggestion chips
 */

const ChatManager = {
    INITIAL_WELCOME_MESSAGE: "Hello! I'm your medical assistant. I can help answer questions about your condition based on medical documents. How can I help you today?",

    // Chat context from patient profile
    mainCancerType: null,
    subCancerType: null,
    preferredLanguage: null,
    localizedWelcomeMessage: null,

    /**
     * Loads chat context (cancer type, language preference)
     */
    async loadChatContext() {
        try {
            const response = await fetch('/api/patients/chat/context/', {
                headers: {
                    'Authorization': 'Bearer ' + AuthManager.getAccessToken(),
                    'Content-Type': 'application/json'
                }
            });

            if (AuthManager.checkAuthenticationError(response)) {
                return;
            }

            if (response.ok) {
                const data = await response.json();
                this.preferredLanguage = data.language;
                this.mainCancerType = data.main_cancer_type;
                this.subCancerType = data.sub_cancer_type;

                const contextBadge = document.getElementById('chat-context-badge');
                contextBadge.textContent = `${data.sub_cancer_type} Cancer${data.is_fallback ? ' (Default)' : ''}`;
                contextBadge.title = data.is_fallback
                    ? 'Using general uterine cancer information'
                    : `Using ${data.sub_cancer_type} cancer specific information`;
            }
        } catch (error) {
            console.error('Error loading chat context:', error);
            const contextBadge = document.getElementById('chat-context-badge');
            contextBadge.textContent = 'Context unavailable';
        }
    },

    /**
     * Appends a message to the chat box
     * @param {string} role - 'user' or 'assistant'
     * @param {string} content - Message text
     * @returns {HTMLElement} The message content wrapper element
     */
    appendMessage(role, content) {
        const chatBoxElement = document.getElementById('chat-box');
        const messageWrapper = document.createElement('div');
        messageWrapper.className = `message-group mb-6 flex items-start gap-3 ${
            role === 'user' ? 'justify-end' : 'justify-start'
        }`;

        const iconWrapper = this._createMessageIcon(role);
        const contentColumn = this._createMessageContent(role, content);

        if (role === 'user') {
            messageWrapper.appendChild(contentColumn);
            messageWrapper.appendChild(iconWrapper);
        } else {
            messageWrapper.appendChild(iconWrapper);
            messageWrapper.appendChild(contentColumn);
        }

        chatBoxElement.appendChild(messageWrapper);
        UIHelpers.scrollChatToBottom();

        return contentColumn;
    },

    /**
     * Creates message icon element
     * @private
     */
    _createMessageIcon(role) {
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
        return iconWrapper;
    },

    /**
     * Creates message content bubble
     * @private
     */
    _createMessageContent(role, content) {
        const contentColumn = document.createElement('div');
        contentColumn.className = `flex flex-col ${role === 'user' ? 'items-end' : 'items-start'} max-w-[75%] md:max-w-[65%]`;

        const bubble = document.createElement('div');
        bubble.className = role === 'user'
            ? 'bg-blue-600 text-white px-4 py-3 rounded-2xl rounded-tr-sm shadow-md text-sm whitespace-pre-line leading-relaxed'
            : 'bg-white text-gray-800 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm text-sm whitespace-pre-line leading-relaxed border border-gray-200';

        bubble.textContent = content;
        contentColumn.appendChild(bubble);

        return contentColumn;
    },

    /**
     * Renders suggestion chips below a message
     * @param {HTMLElement} messageElement - The message element to attach suggestions to
     * @param {string[]} suggestions - Array of suggestion texts
     */
    renderSuggestions(messageElement, suggestions) {
        if (!messageElement || !suggestions || suggestions.length === 0) {
            return;
        }

        // Remove existing suggestions (safety check)
        messageElement.querySelector('.suggestions-row')?.remove();

        const suggestionsRow = document.createElement('div');
        suggestionsRow.className = 'suggestions-row mt-3 flex flex-wrap gap-2 self-start w-full';

        suggestions.slice(0, 4).forEach(suggestionText => {
            const suggestionButton = document.createElement('button');
            suggestionButton.type = 'button';
            suggestionButton.className = 'text-xs text-blue-700 px-3 py-1.5 rounded-full bg-white border border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow';
            suggestionButton.textContent = suggestionText;
            suggestionButton.addEventListener('click', () => {
                this.handleSuggestionClick(suggestionText);
            });
            suggestionsRow.appendChild(suggestionButton);
        });

        messageElement.appendChild(suggestionsRow);
    },

    /**
     * Handles suggestion chip click
     */
    handleSuggestionClick(suggestionText) {
        this.clearAllSuggestions();
        this.appendMessage("user", suggestionText);
        this.sendMessage(suggestionText);
        document.getElementById('chat-input').focus();
    },

    /**
     * Clears all suggestion chips from the chat
     */
    clearAllSuggestions() {
        document.querySelectorAll('.suggestions-row').forEach(element => element.remove());
    },

    /**
     * Sends a message to the chat API
     * @param {string} messageText - The message to send
     */
    async sendMessage(messageText) {
        const chatInputElement = document.getElementById('chat-input');
        const sendButtonElement = document.getElementById('send-button');
        const spinnerElement = document.getElementById('send-spinner');
        const labelElement = document.getElementById('send-label');

        try {
            // Show typing indicator
            this.clearAllSuggestions();
            const typingIndicator = this._createTypingIndicator();
            document.getElementById('chat-box').appendChild(typingIndicator);
            UIHelpers.scrollChatToBottom();

            const requestBody = {
                message: messageText,
                initial_message: this.localizedWelcomeMessage,
                session_id: SessionManager.currentSessionId
            };

            const response = await fetch("/api/patients/chat/message/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + AuthManager.getAccessToken()
                },
                body: JSON.stringify(requestBody)
            });

            if (AuthManager.checkAuthenticationError(response)) {
                return;
            }

            const data = await response.json();

            // Show status updates
            await this._displayStatusUpdates(data.status_updates);

            // Display assistant response
            const assistantMessageElement = this.appendMessage("assistant", data.response || data.error);
            SessionManager.currentSessionId = data.session_id;

            // Fetch and display suggestions
            await this._fetchAndDisplaySuggestions(assistantMessageElement);

            // Remove typing indicator
            if (typingIndicator) {
                typingIndicator.remove();
            }

            UIHelpers.scrollChatToBottom();

        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            chatInputElement.disabled = false;
            sendButtonElement.disabled = false;
            spinnerElement.classList.add("hidden");
            labelElement.classList.remove("invisible");
        }
    },

    /**
     * Creates typing indicator element
     * @private
     */
    _createTypingIndicator() {
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
        return typingElement;
    },

    /**
     * Displays status updates during message processing
     * @private
     */
    async _displayStatusUpdates(statusUpdates) {
        const statusTextElement = document.getElementById('status-text');
        if (statusUpdates && statusUpdates.length > 0 && statusTextElement) {
            for (let i = 0; i < statusUpdates.length; i++) {
                statusTextElement.textContent = statusUpdates[i];
                statusTextElement.style.opacity = '1';
                await new Promise(resolve => setTimeout(resolve, 50));
            }
        }
    },

    /**
     * Fetches suggestions and displays them
     * @private
     */
    async _fetchAndDisplaySuggestions(messageElement) {
        try {
            const response = await fetch("/api/suggest/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + AuthManager.getAccessToken()
                },
                body: JSON.stringify({
                    session_id: SessionManager.currentSessionId,
                    cancer_type: this.mainCancerType
                })
            });

            if (AuthManager.checkAuthenticationError(response)) {
                return;
            }

            const data = await response.json();
            const suggestions = (data.top_4 || []).slice(0, 4);
            const translatedSuggestions = await TranslationService.translateMultiple(
                suggestions,
                this.preferredLanguage,
                AuthManager.getAccessToken()
            );

            this.renderSuggestions(messageElement, translatedSuggestions);
            UIHelpers.scrollChatToBottom();
        } catch (error) {
            console.error('Error fetching suggestions:', error);
        }
    },

    /**
     * Clears chat and shows welcome message
     */
    async clearChatAndShowWelcome() {
        const chatBoxElement = document.getElementById('chat-box');
        chatBoxElement.innerHTML = '';

        const translatedWelcome = await TranslationService.translateText(
            this.INITIAL_WELCOME_MESSAGE,
            this.preferredLanguage,
            AuthManager.getAccessToken()
        );

        this.localizedWelcomeMessage = translatedWelcome;
        this.appendMessage("assistant", translatedWelcome);
    }
};
