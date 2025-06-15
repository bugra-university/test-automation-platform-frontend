import { translateText } from '../utils/translateApi';

describe('translateText', () => {
    it('should translate text from Turkish to English', async () => {
        const turkishText = 'Merhaba dünya';
        const translatedText = await translateText(turkishText, 'en');
        // The translation might vary slightly between instances, so we check multiple possibilities
        const possibleTranslations = ['hello world', 'hi world', 'hello, world'];
        expect(possibleTranslations).toContain(translatedText.toLowerCase());
    }, 10000); // Increased timeout since we're making real API calls

    it('should return original text when target language is "original"', async () => {
        const turkishText = 'Merhaba dünya';
        const translatedText = await translateText(turkishText, 'original');
        expect(translatedText).toBe(turkishText);
    });

    it('should handle empty strings', async () => {
        const emptyText = '   ';
        const translatedText = await translateText(emptyText, 'en');
        expect(translatedText).toBe(emptyText);
    });

    it('should handle translation errors gracefully', async () => {
        // Test with an invalid language code
        const turkishText = 'Merhaba dünya';
        const translatedText = await translateText(turkishText, 'xx');
        // Should return original text when translation fails
        expect(translatedText).toBe(turkishText);
    });

    it('should handle network errors gracefully', async () => {
        // Mock fetch to simulate network error
        const originalFetch = global.fetch;
        global.fetch = jest.fn(() => Promise.reject('Network error'));

        const turkishText = 'Merhaba dünya';
        const translatedText = await translateText(turkishText, 'en');

        // Should return original text when all instances fail
        expect(translatedText).toBe(turkishText);

        // Restore original fetch
        global.fetch = originalFetch;
    });
});
