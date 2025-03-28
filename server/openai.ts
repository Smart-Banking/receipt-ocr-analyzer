import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Receipt analysis API to process receipt text
export async function analyzeReceiptText(receiptText: string): Promise<string> {
  try {
    const prompt = `Изпращам текст на касова бележка. Преобразувай цените с десетична точка. Създай таблица с три колони: 'Категория', 'Продукт' и 'Цена с отстъпка'.  Не записвай в колона 'Продукт' текст, който не съществува в текста на бележката. Ако има отстъпка, тя се отнася за предходния продукт и отстъпката се изважда от цената му, в таблицата включи цената след отстъпката. Опитай се за всеки продукт да определиш една от категориите: Хляб, Месо, Колбаси, Варива, Плодзеленчук, Млечни, Продукти, Десерти, Напитки, Санитарни, Разни. Ако не успееш да определиш категорията, задай 'Разни'. Групирай редовете по категории. Обедини стоките с еднакви цени и пресметни общата цена за обединените стоки. Създай таблицата в csv формат с разделител ; и я покажи. Сумирай цените в колона 'Цена с отстъпка' и сравни с ред ОБЩО от бележката, ако има разлика потърси причината и коригирай редовете на таблицата. Първият ред от таблицата да съдържа общата сума на всички продукти във формат 'Общо; ; сума'. След разделителите в таблицата да има задължително интервал и таблицата да не включва имената на колони. В отговора си ми покажи само таблицата, без обяснения как се е получила.

Текст на бележката:
${receiptText}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a receipt analysis expert. You analyze receipt texts and structure them into tables." },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    return response.choices[0].message.content || "Не можах да обработя бележката.";
  } catch (error) {
    console.error("Error analyzing receipt:", error);
    throw new Error(`Failed to analyze receipt: ${error instanceof Error ? error.message : String(error)}`);
  }
}
