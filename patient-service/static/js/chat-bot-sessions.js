/**
 * Session Management Module
 * Handles chat session CRUD operations and UI rendering
 */

const SessionManager = {
    currentSessionId: null,
    activeSessionButton: null,

    /**
     * Loads all chat sessions from the server
     * @param {boolean} skipAutoSelect - If true, won't auto-select first session
     */
    async loadAllSessions(skipAutoSelect = false) {
        const response = await fetch("/api/patients/chat/sessions/", {
            headers: { Authorization: "Bearer " + AuthManager.getAccessToken() }
        });

        if (AuthManager.checkAuthenticationError(response)) {
            return;
        }

        const sessions = await response.json();

        // Auto-select first session if no session is active and not skipping
        if (!this.currentSessionId && sessions.length > 0 && !skipAutoSelect) {
            this.currentSessionId = sessions[0].id;
        }

        this._renderSessionsList(sessions);
    },

    /**
     * Renders the sessions list in the sidebar
     * @private
     */
    _renderSessionsList(sessions) {
        const sessionsListElement = document.getElementById('sessions-list');
        sessionsListElement.innerHTML = '';

        sessions.forEach(session => {
            const sessionButton = this._createSessionButton(session);
            sessionsListElement.appendChild(sessionButton);
        });
    },

    /**
     * Creates a session button element
     * @private
     */
    _createSessionButton(session) {
        const buttonElement = document.createElement('div');
        buttonElement.className = 'flex items-center justify-between w-full text-left cursor-pointer hover:bg-blue-50 rounded-lg px-3 py-2.5 transition-all duration-200 group';

        // Highlight active session
        if (session.id === this.currentSessionId) {
            buttonElement.classList.add('bg-blue-50', 'border', 'border-blue-200', 'shadow-sm');
            this.activeSessionButton = buttonElement;
        }

        buttonElement.onclick = () => this._handleSessionClick(session, buttonElement);

        // Session title
        const titleSpan = document.createElement('span');
        titleSpan.className = 'text-sm text-gray-700 truncate flex-1';
        titleSpan.textContent = session.title || 'Untitled Chat';

        // Delete button
        const deleteButton = this._createDeleteButton(session);

        buttonElement.appendChild(titleSpan);
        buttonElement.appendChild(deleteButton);

        return buttonElement;
    },

    /**
     * Handles session button click
     * @private
     */
    async _handleSessionClick(session, buttonElement) {
        if (session.id === this.currentSessionId) {
            return;
        }

        this.currentSessionId = session.id;
        await this.loadSession(session.id);

        // Update active button styling
        if (this.activeSessionButton) {
            this.activeSessionButton.classList.remove('bg-blue-50', 'border', 'border-blue-200', 'shadow-sm');
        }
        buttonElement.classList.add('bg-blue-50', 'border', 'border-blue-200', 'shadow-sm');
        this.activeSessionButton = buttonElement;

        UIHelpers.scrollChatToBottom();
    },

    /**
     * Creates delete button for session
     * @private
     */
    _createDeleteButton(session) {
        const deleteButton = document.createElement('button');
        deleteButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                    </svg>`;
        deleteButton.className = 'text-gray-400 hover:text-red-500 ml-2 opacity-0 group-hover:opacity-100 transition-all duration-200 p-1 hover:bg-red-50 rounded';
        deleteButton.onclick = async (event) => {
            event.stopPropagation();
            await this.deleteSession(session.id);
        };

        return deleteButton;
    },

    /**
     * Deletes a session
     * @param {string} sessionId - Session ID to delete
     */
    async deleteSession(sessionId) {
        const response = await fetch(`/api/patients/chat/${sessionId}/delete/`, {
            method: 'DELETE',
            headers: { Authorization: "Bearer " + AuthManager.getAccessToken() }
        });

        if (AuthManager.checkAuthenticationError(response)) {
            return;
        }

        // If deleted session was active, clear the chat
        if (sessionId === this.currentSessionId) {
            this.currentSessionId = null;
            ChatManager.clearChatAndShowWelcome();
        }

        await this.loadAllSessions();
    },

    /**
     * Loads a specific session's messages
     * @param {string} sessionId - Session ID to load
     */
    async loadSession(sessionId) {
        const chatBoxElement = document.getElementById('chat-box');

        // Don't reload if already viewing this session with messages
        if (this.currentSessionId === sessionId && chatBoxElement.children.length > 0) {
            return;
        }

        const response = await fetch("/api/patients/chat/load/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + AuthManager.getAccessToken()
            },
            body: JSON.stringify({ session_id: sessionId })
        });

        if (AuthManager.checkAuthenticationError(response)) {
            return;
        }

        if (response.ok) {
            this.currentSessionId = sessionId;
            const data = await response.json();

            chatBoxElement.innerHTML = '';
            let lastMessageElement = null;

            for (const message of data.messages) {
                lastMessageElement = ChatManager.appendMessage(message.role, message.content);
            }

            // Show suggestions if available
            if (data.suggestions && data.suggestions.length > 0) {
                const translatedSuggestions = await TranslationService.translateMultiple(
                    data.suggestions,
                    ChatManager.preferredLanguage,
                    AuthManager.getAccessToken()
                );
                ChatManager.renderSuggestions(lastMessageElement, translatedSuggestions);
            }
        } else {
            console.error("Failed to load session");
        }
    },

    /**
     * Starts a new chat session
     */
    startNewSession() {
        this.currentSessionId = null;
        ChatManager.clearChatAndShowWelcome();
    }
};
