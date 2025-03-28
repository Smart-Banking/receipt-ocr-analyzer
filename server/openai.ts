import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Помощна функция за проверка на API ключа
export async function checkOpenAIKey(): Promise<boolean> {
  try {
    // Изпраща минимално запитване за проверка на ключа
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: "hello" }],
      max_tokens: 5
    });
    
    return response.choices && response.choices.length > 0;
  } catch (error) {
    console.error("OpenAI API key validation error:", error);
    return false;
  }
}

// Специализиран анализ на български касови бележки
export async function analyzeReceiptText(receiptText: string): Promise<string> {
  try {
    // Проверка за празен или невалиден вход
    if (!receiptText || receiptText.trim().length < 10) {
      return "Моля въведете валиден текст от касова бележка.";
    }
    
    const systemPrompt = `Ти си експерт по анализ на касови бележки от български магазини. 
Твоята задача е да извлечеш всички продукти и техните цени от текста на касовата бележка, да ги категоризираш правилно и да създадеш структурирана CSV таблица.

Специфики при анализа на български касови бележки:
1. Отстъпките обикновено са посочени със знак "-" или думата "отстъпка" след продукта, за който се отнасят.
2. Някои бележки използват запетая вместо точка за десетичен разделител.
3. Възможно е да има съкращения на имената на продуктите.
4. В някои бележки може да има допълнителни кодове, които не са част от имената на продуктите.
5. Възможно е някои продукти да имат промоционални цени, отбелязани с думите "промо" или "намаление".`;

    const userPrompt = `Изпращам текст на касова бележка. Анализирай я и:

1. Преобразувай цените, използвайки точка като десетичен разделител.
2. Създай таблица с три колони: 'Категория', 'Продукт' и 'Цена с отстъпка'.
3. Не включвай в колона 'Продукт' текст, който не съществува в текста на бележката.
4. Ако има отстъпка, тя се отнася за предходния продукт - приспадни я от цената и включи само крайната цена след отстъпката.
5. Категоризирай всеки продукт в една от следните категории:
   * Хляб и тестени
   * Месо и колбаси
   * Млечни продукти
   * Плодове и зеленчуци
   * Напитки
   * Захарни и десерти
   * Консерви и готови храни
   * Подправки и сосове
   * Санитарни и козметични
   * Битови стоки
   * Разни
6. Ако не можеш да определиш категорията на продукт, използвай категория 'Разни'.
7. Групирай редовете по категории.
8. Обедини идентичните продукти и коригирай цените съответно.
9. Създай таблицата в CSV формат с разделител ";" и интервал след всеки разделител.
10. Първият ред на таблицата трябва да съдържа общата сума във формат: "Общо; ; сума"
11. Таблицата не трябва да включва имена на колони.
12. Сумирай всички цени в колона 'Цена с отстъпка' и сравни с общата сума от бележката. При разлика, провери за грешки и коригирай.

Върни САМО CSV таблицата без допълнителни обяснения или форматиране.

Ето текста на бележката:
${receiptText}`;

    // Изпращане на заявката към OpenAI
    console.log('Sending request to OpenAI for receipt analysis...');
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.2, // По-ниска температура за по-последователни резултати
      max_tokens: 2500, // Повече токени за по-дълги бележки
      presence_penalty: -0.1, // Леко насърчаване на повторение на модела за по-последователно форматиране
      frequency_penalty: 0.2, // Леко обезкуражаване на повтарящи се фрази
    });

    // Извличане и форматиране на отговора
    const result = response.choices[0].message.content || "Не можах да обработя бележката.";
    
    // Логване на резултата за диагностика
    console.log('Receipt analysis complete, result length:', result.length);
    
    return result;
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Error analyzing receipt:", error);
    
    // Подробно логване на грешката
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
      });
    }
    
    // Проверка за специфични OpenAI API грешки
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (errorMessage.includes('API key')) {
      return "Грешка: Невалиден API ключ за OpenAI. Моля, проверете настройките си.";
    } else if (errorMessage.includes('rate limit')) {
      return "Грешка: Достигнат е лимитът на API заявки. Моля, опитайте отново по-късно.";
    } else if (errorMessage.includes('context length')) {
      return "Грешка: Текстът на бележката е твърде дълъг. Моля, опитайте с по-кратък текст.";
    }
    
    throw new Error(`Failed to analyze receipt: ${errorMessage}`);
  }
}
