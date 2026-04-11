-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    age INTEGER,
    gender VARCHAR(50),
    height DECIMAL,
    weight DECIMAL,
    profile_photo TEXT,
    role VARCHAR(50) DEFAULT 'user'
);

-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    steps INTEGER DEFAULT 0,
    calories_burned DECIMAL DEFAULT 0,
    activity_type VARCHAR(255),
    date TEXT DEFAULT (date('now'))
);

-- Create diet_logs table
CREATE TABLE IF NOT EXISTS diet_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    food_name VARCHAR(255) NOT NULL,
    calories INTEGER DEFAULT 0,
    meal_type VARCHAR(100),
    date TEXT DEFAULT (date('now'))
);

-- Create water_intake table
CREATE TABLE IF NOT EXISTS water_intake (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL DEFAULT 0,
    date TEXT DEFAULT (date('now'))
);
