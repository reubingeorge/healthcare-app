/**
 * Chat Bot Initialization
 * Main entry point for the chat application
 */

(async function initializeChatBot() {
    // Validate token exists before initializing
    if (!AuthManager.validateTokenExists()) {
        return;
    }

    try {
        // Load initial data in parallel
        await Promise.all([
            SessionManager.loadAllSessions(),
            ChatManager.loadChatContext()
        ]);

        // Setup event listeners
        UIHelpers.setupEventListeners();

        // Handle initial responsive layout
        UIHelpers.handleResponsiveLayout();

        // Load existing session or show welcome message
        if (SessionManager.currentSessionId) {
            await SessionManager.loadSession(SessionManager.currentSessionId);
        } else {
            await ChatManager.clearChatAndShowWelcome();
        }

    } catch (error) {
        console.error('Error initializing chat bot:', error);
    }
})();
