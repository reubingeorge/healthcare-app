/**
 * Translation Service Module
 * Handles text translation with caching and polling
 */

const TranslationService = {
    TRANSLATE_URL: "/api/translate/",
    RESULT_URL: "/api/result",

    /**
     * Translates text to target language with polling support for async translations
     * @param {string} text - Text to translate
     * @param {string} targetLanguage - Target language code (e.g., 'en', 'es')
     * @param {string} accessToken - Authentication token
     * @param {Object} options - Polling configuration
     * @param {number} options.timeoutMs - Maximum time to wait for translation
     * @param {number} options.pollIntervalMs - Interval between poll requests
     * @returns {Promise<string>} Translated text or original text on failure
     */
    async translateText(text, targetLanguage, accessToken, { timeoutMs = 10000, pollIntervalMs = 500 } = {}) {
        // Skip translation if target language is English
        if (targetLanguage === "en") {
            return text;
        }

        // Skip if text or language is missing
        if (!text || !targetLanguage) {
            return text;
        }

        const response = await fetch(this.TRANSLATE_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ text, target_language: targetLanguage })
        });

        if (AuthManager.checkAuthenticationError(response)) {
            return text;
        }

        // Cache hit - translation ready immediately
        if (response.status === 200) {
            const data = await response.json();
            return data?.result ?? text;
        }

        // Async translation - poll for result
        if (response.status === 202) {
            return await this._pollForTranslationResult(response, accessToken, timeoutMs, pollIntervalMs, text);
        }

        return text;
    },

    /**
     * Polls for async translation result
     * @private
     */
    async _pollForTranslationResult(initialResponse, accessToken, timeoutMs, pollIntervalMs, fallbackText) {
        const data = await initialResponse.json();
        const requestId = data?.request_id;

        if (!requestId) {
            return fallbackText;
        }

        const startTime = Date.now();

        while (Date.now() - startTime < timeoutMs) {
            await new Promise(resolve => setTimeout(resolve, pollIntervalMs));

            const pollResponse = await fetch(`${this.RESULT_URL}/${encodeURIComponent(requestId)}`, {
                headers: { "Authorization": `Bearer ${accessToken}` }
            });

            if (AuthManager.checkAuthenticationError(pollResponse)) {
                return fallbackText;
            }

            if (pollResponse.status === 200) {
                const resultData = await pollResponse.json();

                if (resultData.status === "completed") {
                    return resultData.result ?? fallbackText;
                }

                if (resultData.status === "failed") {
                    return fallbackText;
                }
            }
            // 404 means not ready yet, continue polling
        }

        // Timeout reached
        return fallbackText;
    },

    /**
     * Translates multiple texts in parallel
     * @param {string[]} texts - Array of texts to translate
     * @param {string} targetLanguage - Target language code
     * @param {string} accessToken - Authentication token
     * @returns {Promise<string[]>} Array of translated texts
     */
    async translateMultiple(texts, targetLanguage, accessToken) {
        // Get unique non-empty texts
        const uniqueTexts = [...new Set(texts.filter(Boolean))];
        const translationMap = new Map();

        // Translate all unique texts in parallel
        await Promise.all(
            uniqueTexts.map(async (text) => {
                const translated = await this.translateText(text, targetLanguage, accessToken);
                translationMap.set(text, translated);
            })
        );

        // Map original array to translations
        return texts.map(text => translationMap.get(text) ?? text);
    }
};
