import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { analyzeReceiptText } from "./openai";
import { performOcr } from "./ocr";
import { receiptTextSchema, receiptImageSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // API endpoint for OCR processing
  app.post("/api/ocr", async (req: Request, res: Response) => {
    try {
      // Log request info for debugging (excluding the actual image data)
      console.log('Received OCR request with language:', req.body.language);
      
      // Validate request body
      const validatedData = receiptImageSchema.parse(req.body);
      
      // Extra validation and debugging for image data
      if (!validatedData.imageBase64) {
        throw new Error('No image data provided');
      }
      
      if (validatedData.imageBase64.length < 100) {
        console.error('Image data suspiciously short:', validatedData.imageBase64);
        throw new Error('Invalid image data: Too short');
      }
      
      console.log('Image data length:', validatedData.imageBase64.length);
      console.log('Image data preview:', validatedData.imageBase64.substring(0, 50) + '...');
      
      // Perform OCR on the image
      const ocrResult = await performOcr(validatedData.imageBase64, validatedData.language);
      
      // Return the OCR result
      res.json({ 
        text: ocrResult.text || '',
        language: validatedData.language 
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        console.error('Validation error:', validationError.message);
        res.status(400).json({ error: validationError.message });
      } else {
        console.error("Error performing OCR:", error);
        res.status(500).json({ 
          error: `Failed to perform OCR: ${error instanceof Error ? error.message : String(error)}` 
        });
      }
    }
  });
  
  // API endpoint for OCR text analysis
  app.post("/api/analyze-receipt", async (req: Request, res: Response) => {
    try {
      // Validate request body
      const validatedData = receiptTextSchema.parse(req.body);
      
      // Process receipt text with OpenAI
      const analysisResult = await analyzeReceiptText(validatedData.text);
      
      // Store the result in memory
      await storage.createReceipt({
        imageUrl: null, // We're not storing the image in this implementation
        ocrText: validatedData.text,
        language: validatedData.language,
        analysisResult
      });
      
      // Return the result
      res.json({ text: analysisResult });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ error: validationError.message });
      } else {
        console.error("Error analyzing receipt:", error);
        res.status(500).json({ 
          error: `Failed to analyze receipt: ${error instanceof Error ? error.message : String(error)}` 
        });
      }
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
