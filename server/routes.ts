import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { analyzeReceiptText, checkOpenAIKey } from "./openai";
import { performOcr } from "./ocr";
import { receiptTextSchema, receiptImageSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // API endpoint за проверка на OpenAI API ключа
  app.get("/api/check-openai-key", async (_req: Request, res: Response) => {
    try {
      // Проверка дали ключът за OpenAI API е конфигуриран
      if (!process.env.OPENAI_API_KEY) {
        return res.status(400).json({ 
          isValid: false, 
          message: "OpenAI API ключът не е конфигуриран. Моля, добавете го в настройките." 
        });
      }
      
      // Проверка на валидността на ключа
      const isValid = await checkOpenAIKey();
      
      return res.json({ 
        isValid,
        message: isValid 
          ? "OpenAI API ключът е валиден." 
          : "OpenAI API ключът е невалиден или има проблем с услугата."
      });
    } catch (error) {
      console.error('Error checking OpenAI API key:', error);
      return res.status(500).json({ 
        isValid: false, 
        message: "Грешка при проверка на OpenAI API ключа." 
      });
    }
  });
  
  // API endpoint for OCR processing
  app.post("/api/ocr", async (req: Request, res: Response) => {
    console.log('==== OCR API ENDPOINT CALLED ====');
    try {
      // Check if we have a request body
      if (!req.body) {
        console.error('No request body received');
        return res.status(400).json({ error: 'No request body provided' });
      }
      
      // Log request info for debugging
      console.log('Received OCR request with language:', req.body.language || 'not specified');
      
      // Validate request body
      let validatedData;
      try {
        validatedData = receiptImageSchema.parse(req.body);
      } catch (validationError) {
        console.error('Schema validation failed:', validationError);
        if (validationError instanceof ZodError) {
          const formattedError = fromZodError(validationError);
          return res.status(400).json({ error: formattedError.message });
        }
        return res.status(400).json({ error: 'Invalid request format' });
      }
      
      // Extra validation and debugging for image data
      if (!validatedData.imageBase64) {
        console.error('No image data provided in validated request');
        return res.status(400).json({ error: 'No image data provided' });
      }
      
      // Приемаме и тестови кратки данни за диагностични цели
      if (validatedData.imageBase64 === 'test') {
        console.log('Получена тестова заявка - продължаваме с обработката');
      } else if (validatedData.imageBase64.length < 20) {
        console.error('Image data suspiciously short:', validatedData.imageBase64);
        return res.status(400).json({ error: 'Invalid image data: Too short' });
      }
      
      console.log('Image data validation passed:');
      console.log('- Image data length:', validatedData.imageBase64.length);
      console.log('- Image data prefix:', validatedData.imageBase64.substring(0, 30) + '...');
      console.log('- Language:', validatedData.language);
      
      // Perform OCR on the image
      console.log('Calling OCR function...');
      const ocrResult = await performOcr(validatedData.imageBase64, validatedData.language);
      console.log('OCR processing completed successfully');
      
      // Return the OCR result
      const response = { 
        text: ocrResult.text || '',
        language: validatedData.language 
      };
      
      console.log('Sending OCR response to client');
      return res.json(response);
    } catch (error) {
      console.error("==== ERROR PERFORMING OCR ====");
      console.error("Error details:", error);
      console.error("Stack trace:", error instanceof Error ? error.stack : 'No stack trace available');
      
      return res.status(500).json({ 
        error: `Failed to perform OCR: ${error instanceof Error ? error.message : String(error)}` 
      });
    }
  });
  
  // API endpoint за анализ на текст от касови бележки
  app.post("/api/analyze-receipt", async (req: Request, res: Response) => {
    try {
      console.log('==== ANALYZE RECEIPT API ENDPOINT CALLED ====');
      
      // Проверка дали OpenAI API ключът е конфигуриран
      if (!process.env.OPENAI_API_KEY) {
        console.error('OpenAI API key is not configured');
        return res.status(400).json({ 
          error: 'OpenAI API ключът не е конфигуриран. Моля, добавете го в настройките за да използвате функцията за анализ.' 
        });
      }
      
      // Валидиране на входните данни
      let validatedData;
      try {
        validatedData = receiptTextSchema.parse(req.body);
      } catch (validationError) {
        console.error('Receipt text validation failed:', validationError);
        if (validationError instanceof ZodError) {
          const formattedError = fromZodError(validationError);
          return res.status(400).json({ error: formattedError.message });
        }
        return res.status(400).json({ error: 'Невалиден формат на заявката' });
      }
      
      // Логване на заявката за диагностика
      console.log(`Receipt analysis request received, text length: ${validatedData.text.length}`);
      console.log(`Language: ${validatedData.language}`);
      console.log(`Sample text: ${validatedData.text.substring(0, 100)}...`);
      
      // Анализиране на текста чрез OpenAI
      console.log('Calling OpenAI for receipt analysis...');
      const analysisResult = await analyzeReceiptText(validatedData.text);
      console.log('Analysis completed successfully');
      
      // Запазване на резултата в хранилището
      try {
        await storage.createReceipt({
          imageUrl: null, // Не съхраняваме изображението в тази имплементация
          ocrText: validatedData.text,
          language: validatedData.language,
          analysisResult
        });
        console.log('Receipt data stored successfully');
      } catch (storageError) {
        // Логваме грешката, но продължаваме, тъй като съхранението не е критично за функционалността
        console.error('Failed to store receipt data:', storageError);
      }
      
      // Връщане на резултата
      console.log('Sending analysis response to client');
      return res.json({ text: analysisResult });
    } catch (error) {
      console.error("==== ERROR ANALYZING RECEIPT ====");
      console.error("Error details:", error);
      
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      } 
      
      // Проверка за специфични грешки на OpenAI API
      const errorMsg = error instanceof Error ? error.message : String(error);
      
      if (errorMsg.includes('API key')) {
        return res.status(401).json({ 
          error: 'Невалиден OpenAI API ключ. Моля, проверете настройките си.' 
        });
      } else if (errorMsg.includes('rate limit')) {
        return res.status(429).json({ 
          error: 'Достигнат е лимитът на OpenAI API заявки. Моля, опитайте отново по-късно.' 
        });
      }
      
      console.error("Stack trace:", error instanceof Error ? error.stack : 'No stack trace available');
      
      return res.status(500).json({ 
        error: `Грешка при анализ на бележката: ${errorMsg}` 
      });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
