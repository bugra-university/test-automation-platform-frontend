import { translateText } from './translateApi';

describe('translateText', () => {
    it('should translate text from Turkish to English', async () => {
        const turkishText = 'Merhaba dünya';
        const translatedText = await translateText(turkishText, 'en');
        expect(translatedText.toLowerCase()).toContain('hello');
        expect(translatedText.toLowerCase()).toContain('world');
    });

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

    it('should gracefully handle translation errors', async () => {
        // Test with an invalid language code
        const turkishText = 'Merhaba dünya';
        const translatedText = await translateText(turkishText, 'invalid-lang');
        // Should return original text on error
        expect(translatedText).toBe(turkishText);
    });
});
