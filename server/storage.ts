import { receipts, type InsertReceipt, type Receipt } from "@shared/schema";
import { users, type User, type InsertUser } from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // User operations (keeping from template)
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Receipt operations
  createReceipt(receipt: InsertReceipt): Promise<Receipt>;
  getReceipt(id: number): Promise<Receipt | undefined>;
  getAllReceipts(): Promise<Receipt[]>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private receipts: Map<number, Receipt>;
  private userId: number;
  private receiptId: number;

  constructor() {
    this.users = new Map();
    this.receipts = new Map();
    this.userId = 1;
    this.receiptId = 1;
  }

  // User methods (keeping from template)
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Receipt methods
  async createReceipt(insertReceipt: InsertReceipt): Promise<Receipt> {
    const id = this.receiptId++;
    const receipt: Receipt = {
      id,
      imageUrl: insertReceipt.imageUrl || null,
      ocrText: insertReceipt.ocrText || null,
      language: insertReceipt.language || null,
      analysisResult: insertReceipt.analysisResult || null,
      processedAt: new Date()
    };
    
    this.receipts.set(id, receipt);
    return receipt;
  }

  async getReceipt(id: number): Promise<Receipt | undefined> {
    return this.receipts.get(id);
  }

  async getAllReceipts(): Promise<Receipt[]> {
    return Array.from(this.receipts.values());
  }
}

// Export storage instance
export const storage = new MemStorage();
