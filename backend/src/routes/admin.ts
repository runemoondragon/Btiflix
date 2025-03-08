import express from 'express';
import { getMoviesFromSitemaps } from '../services/movieParser';
import { getLastProcessedIndex, updateLastProcessedIndex } from '../db/movieRepository';

const router = express.Router();

// Start or resume scraping
router.post('/start-scraper', async (req, res) => {
    try {
        const lastIndex = await getLastProcessedIndex();
        console.log(`🔄 Resuming scraper from index: ${lastIndex}`);
        
        // Start scraping in background
        getMoviesFromSitemaps(lastIndex)
            .then(async ({ processedCount, lastProcessedIndex }) => {
                await updateLastProcessedIndex(lastProcessedIndex);
                console.log(`✅ Processed ${processedCount} new movies`);
            })
            .catch(error => console.error('❌ Scraper error:', error));

        res.json({ 
            message: 'Scraper started in background', 
            resumingFrom: lastIndex 
        });
    } catch (error) {
        console.error('❌ Error starting scraper:', error);
        res.status(500).json({ error: 'Failed to start scraper' });
    }
});

// Get scraper status
router.get('/scraper-status', async (req, res) => {
    try {
        const lastIndex = await getLastProcessedIndex();
        res.json({ 
            lastProcessedIndex: lastIndex,
            isRunning: global.scraperRunning || false
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get scraper status' });
    }
});

export default router; 