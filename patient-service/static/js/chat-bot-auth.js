/**
 * Authentication Module
 * Handles token management and authentication checks
 */

const AuthManager = {
    /**
     * Retrieves the current access token from localStorage
     * @returns {string|null} The access token or null if not found
     */
    getAccessToken() {
        return localStorage.getItem('access_token');
    },

    /**
     * Updates the access token in localStorage
     * @param {string} newToken - The new access token
     */
    updateAccessToken(newToken) {
        if (newToken) {
            localStorage.setItem('access_token', newToken);
            console.log('Chat: Access token updated');
        }
    },

    /**
     * Checks if a response indicates an authentication error
     * Redirects to login if unauthorized
     * @param {Response} response - The fetch response object
     * @returns {boolean} True if auth error detected, false otherwise
     */
    checkAuthenticationError(response) {
        if (response.status === 401 || response.status === 403) {
            console.warn('Token expired or unauthorized - redirecting to login');
            window.location.href = '/login/?expired=true';
            return true;
        }
        return false;
    },

    /**
     * Validates that a token exists, redirects to login if not
     * @param {string} redirectPath - The path to redirect back to after login
     * @returns {boolean} True if token exists, false otherwise
     */
    validateTokenExists(redirectPath = '/patient/chat/') {
        const token = this.getAccessToken();
        if (!token) {
            console.error('No access token found - redirecting to login');
            window.location.href = `/login/?next=${redirectPath}`;
            return false;
        }
        return true;
    }
};

// Handle token refresh from global token-refresh.js
window.updateAuthHeaders = function(newToken) {
    AuthManager.updateAccessToken(newToken);
};
