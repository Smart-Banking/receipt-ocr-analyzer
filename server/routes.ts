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
      
      if (validatedData.imageBase64.length < 100) {
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
