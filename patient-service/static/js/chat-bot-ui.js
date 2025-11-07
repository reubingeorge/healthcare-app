/**
 * UI Utilities Module
 * Handles UI interactions, responsive behavior, and textarea auto-resize
 */

const UIHelpers = {
    /**
     * Scrolls chat box to bottom
     */
    scrollChatToBottom() {
        const chatBoxElement = document.getElementById('chat-box');
        chatBoxElement.scrollTop = chatBoxElement.scrollHeight;
    },

    /**
     * Handles responsive sidebar behavior
     */
    handleResponsiveLayout() {
        const sidebarElement = document.getElementById('sidebar');
        const closeButtonElement = document.getElementById('sidebar-close');
        const isMobile = window.innerWidth < 768; // Tailwind's md breakpoint

        if (!isMobile) {
            // Ensure sidebar is visible on larger screens
            sidebarElement.classList.remove('-translate-x-full');
            sidebarElement.classList.add('translate-x-0');
            closeButtonElement.classList.add('hidden');
        } else {
            // On mobile, show close icon when sidebar is open
            if (!sidebarElement.classList.contains('-translate-x-full')) {
                closeButtonElement.classList.remove('hidden');
            }
        }
    },

    /**
     * Auto-resizes textarea based on content
     * @param {HTMLTextAreaElement} textareaElement - The textarea element
     */
    autoResizeTextarea(textareaElement) {
        textareaElement.style.height = 'auto';
        const maxHeight = 150; // Maximum height in pixels (about 5 lines)
        const newHeight = Math.min(textareaElement.scrollHeight, maxHeight);
        textareaElement.style.height = newHeight + 'px';

        // Enable scrolling if content exceeds max height
        if (textareaElement.scrollHeight > maxHeight) {
            textareaElement.style.overflowY = 'auto';
        } else {
            textareaElement.style.overflowY = 'hidden';
        }
    },

    /**
     * Sets up all event listeners for the chat UI
     */
    setupEventListeners() {
        const sidebarElement = document.getElementById('sidebar');
        const closeButtonElement = document.getElementById('sidebar-close');
        const toggleButtonElement = document.getElementById('sidebar-toggle');
        const chatInputElement = document.getElementById('chat-input');
        const sendButtonElement = document.getElementById('send-button');
        const newChatButtonElement = document.getElementById('new-chat-button');

        // Sidebar toggle events
        closeButtonElement.addEventListener('click', () => {
            sidebarElement.classList.add('-translate-x-full');
            sidebarElement.classList.remove('translate-x-0');
            closeButtonElement.classList.add('hidden');
        });

        toggleButtonElement.addEventListener('click', () => {
            sidebarElement.classList.remove('-translate-x-full');
            sidebarElement.classList.add('translate-x-0');
            closeButtonElement.classList.remove('hidden');
        });

        // Auto-resize textarea on input
        chatInputElement.addEventListener('input', () => {
            this.autoResizeTextarea(chatInputElement);
        });

        // Handle Enter key (submit on Enter, new line on Shift+Enter)
        chatInputElement.addEventListener('keydown', async (event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                event.stopPropagation();
                await this._handleMessageSubmit();
            }
        });

        // Chat form submission (for button click)
        sendButtonElement.addEventListener('click', async (event) => {
            event.preventDefault();
            event.stopPropagation();
            await this._handleMessageSubmit();
        });

        // New chat button
        newChatButtonElement.addEventListener("click", () => {
            SessionManager.startNewSession();
        });

        // Window resize handler
        window.addEventListener('resize', () => {
            this.handleResponsiveLayout();
        });
    },

    /**
     * Handles message submission from form
     * @private
     */
    async _handleMessageSubmit() {
        const chatInputElement = document.getElementById('chat-input');
        const sendButtonElement = document.getElementById('send-button');
        const spinnerElement = document.getElementById('send-spinner');
        const labelElement = document.getElementById('send-label');
        const suggestionContainerElement = document.getElementById('suggestion-container');

        const messageText = chatInputElement.value.trim();

        if (!messageText || chatInputElement.disabled) {
            return;
        }

        // Disable input during send
        chatInputElement.disabled = true;
        sendButtonElement.disabled = true;
        spinnerElement.classList.remove("hidden");
        labelElement.classList.add("invisible");

        ChatManager.appendMessage("user", messageText);
        const messageToSend = messageText;
        chatInputElement.value = "";
        chatInputElement.style.height = 'auto';

        try {
            await ChatManager.sendMessage(messageToSend);
        } finally {
            suggestionContainerElement.innerHTML = '';
            chatInputElement.disabled = false;
            sendButtonElement.disabled = false;
            spinnerElement.classList.add("hidden");
            labelElement.classList.remove("invisible");
            chatInputElement.focus();
        }
    }
};
