import pool from './index';

// ✅ Add a new movie to the database
export const addMovie = async (movie: any) => {
    const query = `
        INSERT INTO movies 
        (title, genre, quality, rating, overview, released, casts, duration, country, thumbnailUrl, backgroundUrl, watchLink, created_at)
        VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
        RETURNING *;
    `;
    const values = [
        movie.title, movie.genre, movie.quality, movie.rating, movie.overview,
        movie.released, movie.casts, movie.duration, movie.country,
        movie.thumbnailUrl, movie.backgroundUrl, movie.watchLink
    ];

    try {
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (err) {
        console.error('Error inserting movie:', err);
    }
};

// ✅ Get a movie by title
export const getMovieByTitle = async (title: string) => {
    const query = `SELECT * FROM movies WHERE title ILIKE $1 LIMIT 1;`;
    try {
        const result = await pool.query(query, [title]);
        return result.rows[0] || null;
    } catch (err) {
        console.error('Error fetching movie:', err);
        return null;
    }
};

// ✅ Fetch all movies
export const getAllMovies = async () => {
    try {
        const result = await pool.query('SELECT * FROM movies;');
        return result.rows;
    } catch (err) {
        console.error('Error fetching movies:', err);
        return [];
    }
};
