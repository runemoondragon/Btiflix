import express from 'express';
import { pool } from '../db/movieRepository';

const router = express.Router();

router.get('/movies', async (req, res) => {
  console.log('📥 Backend: Received request for movies');
  
  try {
    // Set client encoding to UTF8
    await pool.query('SET client_encoding TO UTF8');
    
    // Fetch all movies
    const result = await pool.query('SELECT * FROM movies ORDER BY created_at DESC');
    console.log(`✅ Backend: Found ${result.rows.length} movies`);
    
    if (result.rows.length > 0) {
      console.log('🎬 Backend: Sample movie:', result.rows[0]);
    } else {
      console.warn('⚠️ Backend: No movies found in database');
    }
    
    res.json(result.rows);
  } catch (error: any) {
    console.error('❌ Backend Error:', error);
    res.status(500).json({ 
      error: 'Database error', 
      details: error?.message || 'Unknown error'
    });
  }
});

export default router; 