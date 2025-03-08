import express from 'express';
import cors from 'cors';
import movieRoutes from './routes/movieRoutes';
import adminRoutes from './routes/admin';

const app = express();
const port = process.env.PORT || 3001;

// Enable CORS with specific options
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  exposedHeaders: ['Content-Length', 'Content-Type']
}));

// Parse JSON bodies
app.use(express.json());

// Use movie routes
app.use('/api', movieRoutes);

// Use admin routes
app.use('/api/admin', adminRoutes);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!', details: err.message });
});

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
}); 