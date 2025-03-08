CREATE TABLE movies (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    genre VARCHAR(255) NOT NULL,
    quality VARCHAR(50) NOT NULL,
    rating VARCHAR(10),
    overview TEXT,
    released VARCHAR(100),
    casts TEXT,
    duration INT,
    country TEXT,
    thumbnailUrl TEXT,
    backgroundUrl TEXT,
    watchLink TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    movie_id VARCHAR(255) REFERENCES movies(id),
    invoice_id VARCHAR(255) NOT NULL,
    amount INTEGER NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Scraper Progress Tracking
CREATE TABLE scraper_progress (
    key VARCHAR(50) PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Initialize scraper progress
INSERT INTO scraper_progress (key, value) VALUES 
    ('last_processed_index', '0'),
    ('is_running', 'false')
ON CONFLICT (key) DO NOTHING;

-- Indexing
CREATE INDEX idx_movies_title ON movies(title);
CREATE INDEX idx_movies_genre ON movies(genre);
CREATE INDEX idx_movies_rating ON movies(rating);
CREATE INDEX idx_movies_released ON movies(released);
