import { createHash } from 'crypto';
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

// Define the database schema
type AnalysisRecord = {
  id: string;
  imageHash: string;
  dishName: string; // New field for semantic caching
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
    
    // Migrate database schema to add dishName column if it doesn't exist
    this.migrateDatabase();
  }
  
  // Migrate database schema
  private migrateDatabase() {
    try {
      // Check if dishName column exists
      const columns = this.db.prepare("PRAGMA table_info(analyses)").all() as { name: string }[];
      const hasDishNameColumn = columns.some(column => column.name === 'dishName');
      
      if (!hasDishNameColumn) {
        console.log('Migrating database: Adding dishName column');
        // Add dishName column
        this.db.exec('ALTER TABLE analyses ADD COLUMN dishName TEXT');
        
        // Update existing records to have dishName extracted from analysis
        this.updateExistingRecordsWithDishName();
      } else {
        // Column exists, but let's make sure existing records have dish names
        this.updateExistingRecordsWithDishName();
      }
    } catch (error) {
      console.error('Database migration error:', error);
    }
  }
  
  // Update existing records to extract dishName from analysis
  private updateExistingRecordsWithDishName() {
    console.log('Updating existing records with dishName');
    try {
      // Fix: Use proper SQL syntax for checking NULL or empty values
      const stmt = this.db.prepare('SELECT id, analysis FROM analyses WHERE dishName IS NULL');
      const records = stmt.all() as { id: string; analysis: string }[];
      
      if (records.length === 0) {
        console.log('No records need updating');
        return;
      }
      
      const updateStmt = this.db.prepare('UPDATE analyses SET dishName = ? WHERE id = ?');
      let updatedCount = 0;
      
      for (const record of records) {
        try {
          const analysis = JSON.parse(record.analysis);
          // Use the dishName from analysis, or a default if not available
          const dishName = (analysis.dishName && typeof analysis.dishName === 'string') ? analysis.dishName : 'Unknown Dish';
          updateStmt.run(dishName, record.id);
          updatedCount++;
        } catch (parseError) {
          console.error('Error parsing analysis for record', record.id, parseError);
          // Set a default value if parsing fails
          updateStmt.run('Unknown Dish', record.id);
          updatedCount++;
        }
      }
      
      console.log(`Updated ${updatedCount} records with dishName`);
    } catch (error) {
      console.error('Error updating existing records:', error);
    }
  }
  
  // Generate a hash for the image buffer to detect duplicates
  generateImageHash(buffer: ArrayBuffer): string {
    return createHash('sha256').update(Buffer.from(buffer)).digest('hex');
  }
  
  // Save analysis result
  saveAnalysis(imageHash: string, dishName: string, analysis: any): string {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const analysisStr = JSON.stringify(analysis);
    const createdAt = new Date().toISOString();
    
    const stmt = this.db.prepare(
      'INSERT OR REPLACE INTO analyses (id, imageHash, dishName, analysis, createdAt) VALUES (?, ?, ?, ?, ?)'
    );
    stmt.run(id, imageHash, dishName, analysisStr, createdAt);
    
    return id;
  }
  
  // Find analysis by image hash
  findAnalysisByImageHash(imageHash: string): AnalysisRecord | null {
    const stmt = this.db.prepare('SELECT * FROM analyses WHERE imageHash = ?');
    const result = stmt.get(imageHash) as AnalysisRecord | undefined;
    return result || null;
  }
  
  // Find analysis by dish name (semantic caching) - FIXED VERSION
  findAnalysisByDishName(dishName: string): AnalysisRecord | null {
    // First try exact match (case insensitive)
    let stmt = this.db.prepare('SELECT * FROM analyses WHERE dishName IS NOT NULL AND dishName != "" AND LOWER(dishName) = LOWER(?) ORDER BY createdAt DESC LIMIT 1');
    let result = stmt.get(dishName) as AnalysisRecord | undefined;
    
    if (result) {
      return result;
    }
    
    // If no exact match, try partial match but be more specific
    // Only match if the search term is a significant part of the dish name
    stmt = this.db.prepare('SELECT * FROM analyses WHERE dishName IS NOT NULL AND dishName != "" AND (LOWER(dishName) LIKE LOWER(?) OR LOWER(dishName) LIKE LOWER(?)) ORDER BY createdAt DESC LIMIT 1');
    result = stmt.get(`${dishName}%`, `% ${dishName} %`) as AnalysisRecord | undefined;
    
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