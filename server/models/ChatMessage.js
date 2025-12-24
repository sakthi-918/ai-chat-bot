const { getPool } = require('../config/database');

class ChatMessage {
  static async create(sessionId, role, content) {
    try {
      const pool = getPool();
      const query = `
        INSERT INTO chat_messages (session_id, role, content)
        VALUES ($1, $2, $3)
        RETURNING *
      `;
      const result = await pool.query(query, [sessionId, role, content]);
      return result.rows[0];
    } catch (error) {
      // Database not available - silently skip (messages will still work)
      if (error.message.includes('not initialized')) {
        console.warn('Database not available - skipping message save');
        return null;
      }
      throw error;
    }
  }

  static async findBySessionId(sessionId) {
    try {
      const pool = getPool();
      const query = `
        SELECT id, session_id, role, content, created_at as timestamp
        FROM chat_messages
        WHERE session_id = $1
        ORDER BY created_at ASC
      `;
      const result = await pool.query(query, [sessionId]);
      return result.rows;
    } catch (error) {
      if (error.message.includes('not initialized')) {
        return []; // Return empty array if database not available
      }
      throw error;
    }
  }
}

module.exports = ChatMessage;

