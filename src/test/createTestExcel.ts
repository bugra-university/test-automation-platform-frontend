import * as ExcelJS from 'exceljs';

async function createTestExcel() {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Test Sayfası');    // Bazı temel stiller ekleyelim
    const headerStyle = {
        font: { bold: true, size: 12 },
        alignment: { vertical: 'middle' as const, horizontal: 'center' as const }
    };

    // Test verileri ekleyelim
    sheet.getCell('A1').value = 'Başlık';
    sheet.getCell('A1').style = headerStyle;

    sheet.getCell('B1').value = 'İçerik';
    sheet.getCell('B1').style = headerStyle;

    // Normal içerik
    sheet.getCell('A2').value = 'Merhaba Dünya';
    sheet.getCell('B2').value = 'Bu bir test mesajıdır';

    // Birleştirilmiş hücreler
    sheet.mergeCells('A3:B3'); sheet.getCell('A3').value = 'Bu birleştirilmiş bir hücredir ve Türkçe metin içerir';
    sheet.getCell('A3').alignment = { vertical: 'middle' as const, horizontal: 'center' as const };

    // Uzun metin
    sheet.getCell('A4').value = 'Test Başlığı';
    sheet.getCell('B4').value = 'Bu uzun bir paragraf metnidir. Excel çeviri işlemini test etmek için kullanılacaktır. Türkçe karakterler içermektedir: çğıöşü.';

    // Formatlı metin
    sheet.getCell('A5').value = 'Formatlı Metin';
    sheet.getCell('B5').value = 'Kalın ve italik metinler de çevrilmelidir';
    sheet.getCell('B5').style = {
        font: { bold: true, italic: true },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } }
    };

    // Sütun genişliklerini ayarlayalım
    sheet.getColumn('A').width = 20;
    sheet.getColumn('B').width = 50;

    // Excel dosyasını kaydedelim
    await workbook.xlsx.writeFile('test-translation.xlsx');
    console.log('Test Excel dosyası oluşturuldu: test-translation.xlsx');
}

createTestExcel().catch(console.error);
