import * as ExcelJS from 'exceljs';
import { translateText } from './translateApi';

/**
 * Translates an Excel workbook from Turkish to another language
 * 
 * @param wb - The Excel workbook to translate
 * @param targetLanguage - The target language code (e.g., 'en', 'pl', 'de')
 * @param progressCallback - Optional callback to report translation progress (0-100)
 * @returns A promise that resolves to the translated workbook
 */
export const translateWorkbook = async (
    wb: ExcelJS.Workbook,
    targetLanguage: string = 'en',
    progressCallback?: (progress: number) => void
): Promise<ExcelJS.Workbook> => {
    if (targetLanguage === 'original') {
        return wb; // Return original workbook if no translation is needed
    }

    // Optional progress reporting
    const updateProgress = progressCallback || (() => { });
    updateProgress(0);

    // Create a copy of the workbook
    const translatedWorkbook = new ExcelJS.Workbook();

    // Total cells to translate for progress tracking
    let totalCells = 0;
    let translatedCells = 0;

    // First count total text cells
    wb.worksheets.forEach(sheet => {
        sheet.eachRow({ includeEmpty: false }, row => {
            row.eachCell({ includeEmpty: false }, cell => {
                if (cell.value && typeof cell.value === 'string') {
                    // Skip very short text or text that looks like numbers/codes
                    const cellText = cell.value.toString();
                    if (!(cellText.length <= 2 || /^\d+$/.test(cellText))) {
                        totalCells++;
                    }
                }
            });
        });
    });

    // Batch translations for better performance (Google Translate API is more efficient with batches)
    const batchSize = 20; // How many texts to translate in one API call
    const textBatches: { sheet: ExcelJS.Worksheet, row: number, col: number, text: string }[] = [];

    // Collect all text cells that need translation
    wb.worksheets.forEach((sheet, sheetIndex) => {
        sheet.eachRow({ includeEmpty: false }, (row, rowIndex) => {
            row.eachCell({ includeEmpty: false }, (cell, colIndex) => {
                if (cell.value && typeof cell.value === 'string') {
                    const cellText = cell.value.toString();
                    // Skip very short text or text that looks like numbers/codes
                    if (!(cellText.length <= 2 || /^\d+$/.test(cellText))) {
                        textBatches.push({
                            sheet,
                            row: rowIndex,
                            col: colIndex,
                            text: cellText
                        });
                    }
                }
            });
        });
    });    // Create and copy sheets to new workbook
    for (let i = 0; i < wb.worksheets.length; i++) {
        const originalSheet = wb.worksheets[i];
        const newSheet = translatedWorkbook.addWorksheet(originalSheet.name);

        // Copy column properties and widths
        originalSheet.columns.forEach((col: any, index: number) => {
            const newCol = newSheet.getColumn(index + 1);
            newCol.width = col.width || 10;
            // Copy column properties
            if (col.style) {
                Object.assign(newCol, { style: col.style });
            }
        });

        // Copy row heights
        originalSheet.eachRow({ includeEmpty: true }, (row, rowIndex) => {
            const newRow = newSheet.getRow(rowIndex);
            newRow.height = row.height;
        });

        // Copy all cells first with their styles, we'll update the text values later
        originalSheet.eachRow({ includeEmpty: true }, (row, rowIndex) => {
            const newRow = newSheet.getRow(rowIndex);

            for (let colIndex = 1; colIndex <= row.cellCount; colIndex++) {
                const cell = row.getCell(colIndex);
                const newCell = newRow.getCell(colIndex);

                // Copy styles
                if (cell.style) {
                    newCell.style = JSON.parse(JSON.stringify(cell.style));
                }

                // Copy the value for now, we'll update texts later
                newCell.value = cell.value;
            }
        });    // Let's skip merged cells for now as the ExcelJS typings make it complex
        // In a production app, you would need to handle this more carefully
        // For this example, we'll focus on the translation features
    }

    // Process translations in batches
    for (let i = 0; i < textBatches.length; i += batchSize) {
        const batch = textBatches.slice(i, i + batchSize);
        const batchTexts = batch.map(item => item.text);

        try {
            // Translate all texts in this batch
            const translatedTexts = await Promise.all(
                batchTexts.map(text => translateText(text, targetLanguage))
            );

            // Update cells with translated text
            batch.forEach((item, index) => {
                const { row, col } = item;
                const sheetName = item.sheet.name;
                const newSheet = translatedWorkbook.getWorksheet(sheetName);

                if (newSheet) {
                    const newCell = newSheet.getRow(row).getCell(col);
                    newCell.value = translatedTexts[index];
                }

                // Update progress
                translatedCells++;
                const progress = Math.floor((translatedCells / totalCells) * 100);
                updateProgress(progress);
            });
        } catch (error) {
            console.error('Error translating batch:', error);
            // If batch fails, try individual translations
            for (const item of batch) {
                try {
                    const { row, col } = item;
                    const sheetName = item.sheet.name;
                    const newSheet = translatedWorkbook.getWorksheet(sheetName);

                    if (newSheet) {
                        const translatedText = await translateText(item.text, targetLanguage);
                        const newCell = newSheet.getRow(row).getCell(col);
                        newCell.value = translatedText;
                    }
                } catch (err) {
                    // Just keep the original text if translation fails
                } finally {
                    // Update progress
                    translatedCells++;
                    const progress = Math.floor((translatedCells / totalCells) * 100);
                    updateProgress(progress);
                }
            }
        }
    }

    updateProgress(100);
    return translatedWorkbook;
};
