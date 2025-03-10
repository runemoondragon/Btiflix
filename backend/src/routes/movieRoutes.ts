import express from 'express';
import { pool } from '../db/movieRepository';

const router = express.Router();

router.get('/movies', async (req, res) => {
  console.log('📥 Backend: Received request for movies with filters:', {
    rawQuery: req.query,
    q: req.query.q,
    genre: req.query.genre,
    quality: req.query.quality,
    min_rating: req.query.min_rating,
    release_year: req.query.release_year,
    limit: req.query.limit
  });
  
  try {
    // Set client encoding to UTF8
    await pool.query('SET client_encoding TO UTF8');
    
    // Build the query with filters
    let query = 'SELECT * FROM movies WHERE 1=1';
    const params: any[] = [];
    let paramCount = 1;

    // Add search filter
    if (req.query.q) {
      query += ` AND (LOWER(title) LIKE $${paramCount} OR LOWER(genre) LIKE $${paramCount})`;
      params.push(`%${req.query.q.toString().toLowerCase()}%`);
      paramCount++;
    }

    // Add genre filter
    if (req.query.genre) {
      // Handle comma-separated genres in the database case-insensitively
      console.log('🎭 Applying genre filter:', {
        requestedGenre: req.query.genre,
        patterns: [
          req.query.genre.toString(),
          `${req.query.genre.toString()},%`,
          `%, ${req.query.genre.toString()},%`,
          `%, ${req.query.genre.toString()}`
        ]
      });
      
      query += ` AND (
        genre = $${paramCount} OR 
        genre LIKE $${paramCount + 1} OR 
        genre LIKE $${paramCount + 2} OR
        genre LIKE $${paramCount + 3}
      )`;
      const genre = req.query.genre.toString();
      params.push(
        genre, // Exact match
        `${genre},%`, // Genre at start with comma
        `%, ${genre},%`, // Genre in middle
        `%, ${genre}` // Genre at end
      );
      paramCount += 4;
    }

    // Add quality filter
    if (req.query.quality) {
      query += ` AND quality = $${paramCount}`;
      params.push(req.query.quality.toString());
      paramCount++;
    }

    // Add rating filter
    if (req.query.min_rating) {
      query += ` AND CAST(NULLIF(rating, '') AS FLOAT) >= $${paramCount}`;
      params.push(parseFloat(req.query.min_rating.toString()));
      paramCount++;
    }

    // Add year filter
    if (req.query.release_year) {
      query += ` AND EXTRACT(YEAR FROM released::date) = $${paramCount}`;
      params.push(parseInt(req.query.release_year.toString()));
      paramCount++;
    }

    // Add limit
    const limit = Math.min(parseInt(req.query.limit?.toString() || '100'), 200);
    query += ` ORDER BY created_at DESC LIMIT $${paramCount}`;
    params.push(limit);

    console.log('🔍 Executing query:', { 
      query,
      params,
      paramCount
    });
    
    // Execute the query
    const result = await pool.query(query, params);
    console.log(`✅ Backend: Found ${result.rows.length} movies with filters:`, {
      sampleMovie: result.rows[0] ? {
        title: result.rows[0].title,
        genre: result.rows[0].genre,
        quality: result.rows[0].quality,
        rating: result.rows[0].rating
      } : null,
      totalResults: result.rows.length,
      appliedFilters: {
        genre: req.query.genre,
        quality: req.query.quality,
        min_rating: req.query.min_rating,
        release_year: req.query.release_year
      }
    });
    
    res.json(result.rows);
  } catch (error: any) {
    console.error('❌ Backend Error:', {
      error: error.message,
      query: req.query,
      stack: error.stack
    });
    res.status(500).json({ 
      error: 'Database error', 
      details: error?.message || 'Unknown error'
    });
  }
});

export default router; 