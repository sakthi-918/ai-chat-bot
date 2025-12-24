const { Pool } = require('pg');

let pool = null;

const connectDB = async () => {
  try {
    // Validate required environment variables
    const requiredVars = ['AIVEN_DB_HOST', 'AIVEN_DB_USER', 'AIVEN_DB_PASSWORD', 'AIVEN_DB_NAME'];
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.warn(`⚠️  Database not configured. Missing variables: ${missingVars.join(', ')}`);
      console.warn('⚠️  Chat messages will not be saved to database. Configure Aiven database to enable persistence.');
      return; // Allow server to start without database
    }

    console.log('Attempting to connect to database...');
    console.log(`Host: ${process.env.AIVEN_DB_HOST}:${process.env.AIVEN_DB_PORT || 5432}`);
    console.log(`Database: ${process.env.AIVEN_DB_NAME}`);
    console.log(`User: ${process.env.AIVEN_DB_USER}`);

    pool = new Pool({
      host: process.env.AIVEN_DB_HOST,
      port: process.env.AIVEN_DB_PORT || 5432,
      user: process.env.AIVEN_DB_USER,
      password: process.env.AIVEN_DB_PASSWORD,
      database: process.env.AIVEN_DB_NAME,
      ssl: {
        rejectUnauthorized: false
      }
    });

    // Test connection
    const client = await pool.connect();
    console.log('Database connected successfully');
    
    // Initialize tables
    await initializeTables(client);
    client.release();
  } catch (error) {
    console.error('Database connection error:', error.message);
    console.error('Error details:', error);
    throw error;
  }
};

const initializeTables = async (client) => {
  try {
    // Create ChatSessions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS chat_sessions (
        session_id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create ChatMessages table
    await client.query(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id SERIAL PRIMARY KEY,
        session_id VARCHAR(255) NOT NULL,
        role VARCHAR(10) NOT NULL CHECK (role IN ('user', 'ai')),
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES chat_sessions(session_id) ON DELETE CASCADE
      )
    `);

    // Create indexes for better query performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id 
      ON chat_messages(session_id)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at 
      ON chat_messages(created_at)
    `);

    console.log('Database tables initialized');
  } catch (error) {
    console.error('Error initializing tables:', error);
    throw error;
  }
};

const getPool = () => {
  if (!pool) {
    throw new Error('Database pool not initialized. Call connectDB() first.');
  }
  return pool;
};

module.exports = {
  connectDB,
  getPool
};

