const { validationResult } = require('express-validator');
const ChatSession = require('../models/ChatSession');
const ChatMessage = require('../models/ChatMessage');
const n8nService = require('../services/n8nService');

const sendMessage = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { sessionId, userId, message } = req.body;

    console.log(`Received chat message - Session: ${sessionId}, User: ${userId}, Message: ${message}`);

    // Ensure session exists
    await ChatSession.create(sessionId, userId);

    // Save user message
    await ChatMessage.create(sessionId, 'user', message);

    // Call n8n webhook to get AI response
    let aiReply;
    try {
      aiReply = await n8nService.sendMessage(sessionId, userId, message);
    } catch (n8nError) {
      console.error('n8n service error:', n8nError);
      throw n8nError;
    }

    // Save AI response
    await ChatMessage.create(sessionId, 'ai', aiReply);

    // Return response
    res.json({
      success: true,
      reply: aiReply,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in sendMessage controller:', error);
    next(error);
  }
};

const getChatHistory = async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID is required'
      });
    }

    const messages = await ChatMessage.findBySessionId(sessionId);

    const formattedMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp
    }));

    res.json({
      success: true,
      messages: formattedMessages
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendMessage,
  getChatHistory
};

