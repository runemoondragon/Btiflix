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
