// LibreTranslate API endpoints - using multiple fallback instances
const LIBRETRANSLATE_INSTANCES = [
    'https://translate.argosopentech.com',  // Primary instance
    'https://translate.terraprint.co',      // Backup 1  
    'https://lt.vern.cc'                    // Backup 2
];

/**
 * Translates text from one language to another using LibreTranslate API
 * with automatic fallback between multiple instances
 * 
 * @param text - The text to translate
 * @param targetLang - The target language code (e.g., 'en', 'pl', 'de')
 * @param sourceLang - The source language code (default: 'tr' for Turkish)
 * @returns A promise that resolves to the translated text
 */
export const translateText = async (
    text: string,
    targetLang: string = 'en',
    sourceLang: string = 'tr'
): Promise<string> => {
    // Skip translation if target language is the original language
    if (targetLang === 'original') {
        return text;
    }

    // Don't try to translate empty strings
    if (!text.trim()) {
        return text;
    }

    // Try each instance until one works
    for (const baseUrl of LIBRETRANSLATE_INSTANCES) {
        try {
            const response = await fetch(`${baseUrl}/translate`, {
                method: 'POST',
                body: JSON.stringify({
                    q: text,
                    source: sourceLang,
                    target: targetLang,
                    format: 'text'
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                // Try next instance if this one fails
                continue;
            }

            const data = await response.json();

            if (data && data.translatedText) {
                return data.translatedText;
            }
        } catch (error) {
            console.error(`Translation error with ${baseUrl}:`, error);
            // Continue to next instance
            continue;
        }
    }

    // If all instances fail, return original text
    console.error('All translation instances failed');
    return text;
};

/**
 * List of supported languages with their codes, names, and native names
 */
export const supportedLanguages = [
    { code: "original", name: "Turkish (Original)", nativeName: "Türkçe (Orijinal)" },
    { code: "en", name: "English", nativeName: "English" },
    { code: "de", name: "German", nativeName: "Deutsch" },
    { code: "fr", name: "French", nativeName: "Français" },
    { code: "es", name: "Spanish", nativeName: "Español" },
    { code: "it", name: "Italian", nativeName: "Italiano" },
    { code: "ru", name: "Russian", nativeName: "Русский" },
    { code: "pl", name: "Polish", nativeName: "Polski" },
    { code: "zh", name: "Chinese", nativeName: "中文" }
];
