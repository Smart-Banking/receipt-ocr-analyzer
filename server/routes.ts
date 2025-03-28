import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { analyzeReceiptText } from "./openai";
import { receiptTextSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
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
