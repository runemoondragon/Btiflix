import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Configure PostgreSQL Connection
export const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'btiflix',
  password: process.env.DB_PASSWORD || '',
  port: parseInt(process.env.DB_PORT || '5432', 10)
});

// Test database connection and set encoding
pool.connect(async (err, client, release) => {
  if (err) {
    console.error('❌ Error connecting to the database:', err.stack);
  } else if (client) {
    try {
      await client.query('SET client_encoding TO UTF8');
      console.log('✅ Successfully connected to database');
    } catch (error) {
      console.error('❌ Error setting encoding:', error);
    } finally {
      release();
    }
  }
});

// Define movie data interface (for type safety)
export interface MovieData {
  id: string;
  title: string;
  genre: string;
  quality: string;
  rating: string;
  thumbnailUrl: string;
  backgroundUrl: string;
  watchLink: string;
  released: string;
  overview: string;
  casts: string;
  duration: string;
  country: string;
}

// Track scraper progress
export interface ScraperProgress {
  lastProcessedIndex: number;
  isRunning: boolean;
}

// Function to insert a movie into the database
export async function insertMovie(movie: MovieData): Promise<void> {
  try {
    // Convert `duration` from "120 min" → 120 (integer minutes)
    const duration = parseInt(movie.duration.replace(/\D/g, ''), 10) || null;

    await pool.query(
      `INSERT INTO movies 
       (id, title, genre, quality, rating, overview, released, casts, duration, country, thumbnailurl, backgroundurl, watchlink, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())
       ON CONFLICT (id) DO NOTHING;`,
      [
        movie.id,            // Ensure `id` is a string
        movie.title,
        movie.genre,
        movie.quality,
        movie.rating,
        movie.overview,
        movie.released,
        movie.casts,
        duration,            // Use parsed integer for duration
        movie.country,
        movie.thumbnailUrl,
        movie.backgroundUrl,
        movie.watchLink,
      ]
    );
    console.log(`✅ Inserted movie: ${movie.title}`);
  } catch (error) {
    console.error(`❌ Error inserting movie ${movie.title}:`, error);
  }
}

// Get the last processed index
export async function getLastProcessedIndex(): Promise<number> {
  try {
    const result = await pool.query(
      `SELECT value FROM scraper_progress WHERE key = 'last_processed_index';`
    );
    return parseInt(result.rows[0]?.value || '0', 10);
  } catch (error) {
    console.error('Error getting last processed index:', error);
    return 0;
  }
}

// Update the last processed index
export async function updateLastProcessedIndex(index: number): Promise<void> {
  try {
    await pool.query(
      `INSERT INTO scraper_progress (key, value) 
       VALUES ('last_processed_index', $1) 
       ON CONFLICT (key) DO UPDATE SET value = $1;`,
      [index.toString()]
    );
  } catch (error) {
    console.error('Error updating last processed index:', error);
  }
}

// Update scraper running status
export async function updateScraperStatus(isRunning: boolean): Promise<void> {
  try {
    await pool.query(
      `INSERT INTO scraper_progress (key, value) 
       VALUES ('is_running', $1) 
       ON CONFLICT (key) DO UPDATE SET value = $1;`,
      [isRunning.toString()]
    );
  } catch (error) {
    console.error('Error updating scraper status:', error);
  }
}

// Get scraper status
export async function getScraperStatus(): Promise<ScraperProgress> {
  try {
    const result = await pool.query(
      `SELECT key, value FROM scraper_progress WHERE key IN ('last_processed_index', 'is_running');`
    );
    
    const progress: ScraperProgress = {
      lastProcessedIndex: 0,
      isRunning: false
    };
    
    result.rows.forEach(row => {
      if (row.key === 'last_processed_index') {
        progress.lastProcessedIndex = parseInt(row.value, 10);
      } else if (row.key === 'is_running') {
        progress.isRunning = row.value === 'true';
      }
    });
    
    return progress;
  } catch (error) {
    console.error('Error getting scraper status:', error);
    return { lastProcessedIndex: 0, isRunning: false };
  }
}
