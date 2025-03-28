import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Receipt schema
export const receipts = pgTable("receipts", {
  id: serial("id").primaryKey(),
  imageUrl: text("image_url"),
  ocrText: text("ocr_text"),
  language: text("language").default("bg"),
  analysisResult: text("analysis_result"),
  processedAt: timestamp("processed_at").defaultNow(),
});

// Receipt image schema for OCR processing
export const receiptImageSchema = z.object({
  imageBase64: z.string(),
  language: z.string().default("bg"),
});

export type ReceiptImage = z.infer<typeof receiptImageSchema>;

// Receipt text schema for AI analysis
export const receiptTextSchema = z.object({
  text: z.string(),
  language: z.string().default("bg"),
});

export type ReceiptText = z.infer<typeof receiptTextSchema>;

// Insert receipt schema
export const insertReceiptSchema = createInsertSchema(receipts).omit({
  id: true,
  processedAt: true,
});

export type InsertReceipt = z.infer<typeof insertReceiptSchema>;
export type Receipt = typeof receipts.$inferSelect;

// Users schema (keeping this from the template as required)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
