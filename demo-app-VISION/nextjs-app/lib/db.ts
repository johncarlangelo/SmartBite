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
  
  // Close the database connection
  close(): void {
    this.db.close();
  }
}

// Export singleton instance
export const db = new DatabaseService();