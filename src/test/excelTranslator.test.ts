import * as ExcelJS from 'exceljs';
import { translateWorkbook } from '../utils/excelTranslator';
import { translateText } from '../utils/translateApi';

describe('Excel Translation Tests', () => {
    let workbook: ExcelJS.Workbook; beforeAll(async () => {
        // Create a test workbook
        workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Test Sayfası');

        // Add some test data
        sheet.getCell('A1').value = 'Merhaba Dünya';
        sheet.getCell('B1').value = 'Bu bir test dosyasıdır';

        // Add merged cells
        sheet.mergeCells('A3:B3');
        sheet.getCell('A3').value = 'Birleştirilmiş hücrede Türkçe metin';

        // Add longer text
        sheet.getCell('A5').value = 'Uzun bir paragraf metni buraya gelecek. Bu metin çeviri işlemini test etmek için kullanılacak.';
    }); test('Translation Process Test', async () => {
        // 1. Test original content first
        const sheet = workbook.getWorksheet('Test Sayfası');
        expect(sheet).toBeDefined();
        if (!sheet) {
            throw new Error('Test worksheet not found');
        }

        const originalA1 = sheet.getCell('A1').value;
        expect(originalA1).toBe('Merhaba Dünya');

        // 2. Translate to English
        const translatedWb = await translateWorkbook(workbook, 'en', (progress) => {
            console.log(`Translation progress: ${progress}%`);
        });// 3. Check translated content
        const translatedSheet = translatedWb.getWorksheet('Test Sayfası');

        expect(translatedSheet).toBeDefined();
        if (translatedSheet) {
            const translatedA1 = translatedSheet.getCell('A1').value;
            const translatedB1 = translatedSheet.getCell('B1').value;
            const translatedA3 = translatedSheet.getCell('A3').value;

            // 4. Verify translations
            expect(typeof translatedA1).toBe('string');
            expect(translatedA1).not.toBe('Merhaba Dünya');

            // 5. Check if merged cells are preserved
            const mergedCells = translatedSheet.mergeCells;
            expect(mergedCells).toContain('A3:B3');
        }        // 6. Test if styles are preserved
        const originalSheet = workbook.getWorksheet('Test Sayfası');
        expect(originalSheet).toBeDefined();
        if (originalSheet && translatedSheet) {
            const originalA1Style = originalSheet.getCell('A1').style;
            const translatedA1Style = translatedSheet.getCell('A1').style;
            expect(translatedA1Style).toEqual(originalA1Style);
        }
    });

    test('Individual Translation Test', async () => {
        const text = 'Merhaba Dünya';
        const translated = await translateText(text, 'en');
        expect(translated).not.toBe(text);
        expect(translated.toLowerCase()).toContain('hello');
    });
});
