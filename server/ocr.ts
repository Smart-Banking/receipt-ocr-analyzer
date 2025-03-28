// Временна версия на OCR функцията
// Връща предварително зададен текст за тестване на потока на приложението
export async function performOcr(imageBase64: string, language: string): Promise<{ text: string }> {
  console.log(`OCR processing request received with language: ${language}`);
  console.log(`Image data length: ${imageBase64.length}`);
  
  // Валидация
  if (!imageBase64 || typeof imageBase64 !== 'string') {
    throw new Error('Invalid image data provided to OCR function');
  }
  
  // Симулиране на забавяне, за да наподобим реален OCR процес
  console.log('Processing image...');
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  console.log('OCR processing completed');
  
  // Връщаме примерен текст според избрания език
  let sampleText = '';
  
  if (language === 'bg') {
    sampleText = `КАСОВА БЕЛЕЖКА
ХИПЕРМАРКЕТ ФАНТАСТИКО
София, бул. Черни връх 32
ЕИК: 123456789
АРТИКУЛ                  ЦЕНА
----------------------------
Хляб Добруджа             1.99
Прясно мляко 3% 1л        2.89
Кисело мляко              1.25
Сирене БДС кг            12.50
Кашкавал                 16.90
Ябълки                    3.50
Банани                    3.20
Домати                    4.80
----------------------------
ОБЩО:                    47.03
ДДС 20%:                  7.84
Обща сума:               47.03

Начин на плащане: В брой
Дата: 28.03.2025 10:15:22
Благодарим Ви!`;
  } else if (language === 'en') {
    sampleText = `RECEIPT
SUPERMARKET FANTASTIKO
Sofia, 32 Cherni Vrah Blvd.
VAT: BG123456789
ITEM                     PRICE
----------------------------
Bread                     1.99
Milk 3% 1L                2.89
Yogurt                    1.25
White Cheese kg          12.50
Yellow Cheese            16.90
Apples                    3.50
Bananas                   3.20
Tomatoes                  4.80
----------------------------
TOTAL:                   47.03
VAT 20%:                  7.84
Total amount:            47.03

Payment method: Cash
Date: 28.03.2025 10:15:22
Thank you!`;
  } else {
    sampleText = `RECEIPT
SUPERMARKET FANTASTIKO
Sofia, 32 Cherni Vrah Blvd.
ID: 123456789
ITEM                     PRICE
----------------------------
Bread                     1.99
Milk 3% 1L                2.89
Yogurt                    1.25
Cheese kg                12.50
Yellow Cheese            16.90
Apples                    3.50
Bananas                   3.20
Tomatoes                  4.80
----------------------------
TOTAL:                   47.03
VAT 20%:                  7.84
Total amount:            47.03

Payment: Cash
Date: 28.03.2025 10:15:22
Thank you!`;
  }
  
  console.log('Returning sample text for testing');
  
  return { text: sampleText };
}