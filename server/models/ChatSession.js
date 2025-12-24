const { getPool } = require('../config/database');

class ChatSession {
  static async create(sessionId, userId) {
    try {
      const pool = getPool();
      const query = `
        INSERT INTO chat_sessions (session_id, user_id)
        VALUES ($1, $2)
        ON CONFLICT (session_id) DO NOTHING
        RETURNING *
      `;
      const result = await pool.query(query, [sessionId, userId]);
      return result.rows[0];
    } catch (error) {
      // Database not available - silently skip (messages will still work)
      if (error.message.includes('not initialized')) {
        console.warn('Database not available - skipping session save');
        return null;
      }
      throw error;
    }
  }

  static async findBySessionId(sessionId) {
    try {
      const pool = getPool();
      const query = 'SELECT * FROM chat_sessions WHERE session_id = $1';
      const result = await pool.query(query, [sessionId]);
      return result.rows[0];
    } catch (error) {
      if (error.message.includes('not initialized')) {
        return null;
      }
      throw error;
    }
  }
}

module.exports = ChatSession;

