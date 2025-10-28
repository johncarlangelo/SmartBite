import { createHash } from 'crypto';
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

// Define the database schema
type AnalysisRecord = {
  id: string;
  imageHash: string;
  analysis: string; // JSON stringified
  createdAt: string; // ISO string
};

class DatabaseService {
  private db: Database.Database;
  
  constructor() {
    // Ensure the database directory exists
    const dbDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    
    // Initialize the database
    this.db = new Database(path.join(dbDir, 'analyses.db'));
    
    // Create the table if it doesn't exist
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS analyses (
        id TEXT PRIMARY KEY,
        imageHash TEXT UNIQUE NOT NULL,
        analysis TEXT NOT NULL,
        createdAt TEXT NOT NULL
      )
    `);
  }
  
  // Generate a hash for the image buffer to detect duplicates
  generateImageHash(buffer: ArrayBuffer): string {
    return createHash('sha256').update(Buffer.from(buffer)).digest('hex');
  }
  
  // Save analysis result
  saveAnalysis(imageHash: string, analysis: any): string {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const analysisStr = JSON.stringify(analysis);
    const createdAt = new Date().toISOString();
    
    const stmt = this.db.prepare(
      'INSERT OR REPLACE INTO analyses (id, imageHash, analysis, createdAt) VALUES (?, ?, ?, ?)'
    );
    stmt.run(id, imageHash, analysisStr, createdAt);
    
    return id;
  }
  
  // Find analysis by image hash
  findAnalysisByImageHash(imageHash: string): AnalysisRecord | null {
    const stmt = this.db.prepare('SELECT * FROM analyses WHERE imageHash = ?');
    const result = stmt.get(imageHash) as AnalysisRecord | undefined;
    return result || null;
  }
  
  // Get analysis by ID
  getAnalysisById(id: string): AnalysisRecord | null {
    const stmt = this.db.prepare('SELECT * FROM analyses WHERE id = ?');
    const result = stmt.get(id) as AnalysisRecord | undefined;
    return result || null;
  }
  
  // Get all analyses (for admin/debug purposes)
  getAllAnalyses(): AnalysisRecord[] {
    const stmt = this.db.prepare('SELECT * FROM analyses');
    return stmt.all() as AnalysisRecord[];
  }
  
  // Get recent analyses (for recommendations)
  getRecentAnalyses(limit: number = 10): AnalysisRecord[] {
    const stmt = this.db.prepare('SELECT * FROM analyses ORDER BY createdAt DESC LIMIT ?');
    return stmt.all(limit) as AnalysisRecord[];
  }
  
  // Get analyses by cuisine type (for pattern recognition)
  getAnalysesByCuisine(cuisineType: string): AnalysisRecord[] {
    const stmt = this.db.prepare('SELECT * FROM analyses WHERE json_extract(analysis, "$.cuisineType") = ? ORDER BY createdAt DESC');
    return stmt.all(cuisineType) as AnalysisRecord[];
  }
  
  // Get analyses within calorie range (for recommendations)
  getAnalysesByCalorieRange(minCal: number, maxCal: number): AnalysisRecord[] {
    const stmt = this.db.prepare(`
      SELECT * FROM analyses 
      WHERE CAST(json_extract(analysis, '$.nutrition.calories') AS INTEGER) BETWEEN ? AND ?
      ORDER BY createdAt DESC
    `);
    return stmt.all(minCal, maxCal) as AnalysisRecord[];
  }
  
  // Clear all analyses from database
  clearAllAnalyses(): number {
    const stmt = this.db.prepare('SELECT COUNT(*) as count FROM analyses');
    const { count } = stmt.get() as { count: number };
    
    this.db.prepare('DELETE FROM analyses').run();
    console.log(`🗑️ Cleared ${count} analyses from database`);
    
    return count;
  }
  
  // Clear analyses older than specified days
  clearOldAnalyses(days: number): number {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const cutoffISO = cutoffDate.toISOString();
    
    const stmt = this.db.prepare('SELECT COUNT(*) as count FROM analyses WHERE createdAt < ?');
    const { count } = stmt.get(cutoffISO) as { count: number };
    
    this.db.prepare('DELETE FROM analyses WHERE createdAt < ?').run(cutoffISO);
    console.log(`🗑️ Cleared ${count} analyses older than ${days} days from database`);
    
    return count;
  }
  
  // Clear analyses by cuisine type
  clearAnalysesByCuisine(cuisineType: string): number {
    const stmt = this.db.prepare('SELECT COUNT(*) as count FROM analyses WHERE json_extract(analysis, "$.cuisineType") = ?');
    const { count } = stmt.get(cuisineType) as { count: number };
    
    this.db.prepare('DELETE FROM analyses WHERE json_extract(analysis, "$.cuisineType") = ?').run(cuisineType);
    console.log(`🗑️ Cleared ${count} ${cuisineType} analyses from database`);
    
    return count;
  }
  
  // Clear analyses with calories above threshold
  clearAnalysesByCalories(caloriesAbove: number): number {
    const stmt = this.db.prepare(`
      SELECT COUNT(*) as count FROM analyses 
      WHERE CAST(json_extract(analysis, '$.nutrition.calories') AS INTEGER) > ?
    `);
    const { count } = stmt.get(caloriesAbove) as { count: number };
    
    this.db.prepare(`
      DELETE FROM analyses 
      WHERE CAST(json_extract(analysis, '$.nutrition.calories') AS INTEGER) > ?
    `).run(caloriesAbove);
    console.log(`🗑️ Cleared ${count} high-calorie analyses from database`);
    
    return count;
  }
  
  // Get database statistics
  getDatabaseStats(): {
    totalRecords: number;
    oldestRecord: string | null;
    newestRecord: string | null;
    totalSize: number;
  } {
    const countStmt = this.db.prepare('SELECT COUNT(*) as count FROM analyses');
    const { count } = countStmt.get() as { count: number };
    
    if (count === 0) {
      return {
        totalRecords: 0,
        oldestRecord: null,
        newestRecord: null,
        totalSize: 0
      };
    }
    
    const oldestStmt = this.db.prepare('SELECT createdAt FROM analyses ORDER BY createdAt ASC LIMIT 1');
    const newestStmt = this.db.prepare('SELECT createdAt FROM analyses ORDER BY createdAt DESC LIMIT 1');
    
    const oldest = oldestStmt.get() as { createdAt: string } | undefined;
    const newest = newestStmt.get() as { createdAt: string } | undefined;
    
    // Get database file size
    const dbPath = path.join(process.cwd(), 'data', 'analyses.db');
    const totalSize = fs.existsSync(dbPath) ? fs.statSync(dbPath).size : 0;
    
    return {
      totalRecords: count,
      oldestRecord: oldest?.createdAt || null,
      newestRecord: newest?.createdAt || null,
      totalSize
    };
  }
  
  // Close the database connection
  close(): void {
    this.db.close();
  }
}

// Export singleton instance
export const db = new DatabaseService();