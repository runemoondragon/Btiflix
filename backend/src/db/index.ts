import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'btiflix',
  password: process.env.DB_PASSWORD || 'BTIonelove',
  port: Number(process.env.DB_PORT) || 5432,
});

pool.connect()
  .then(() => console.log('✅ Database connected successfully'))
  .catch(err => console.error('❌ Database connection error:', err));

export default pool;
