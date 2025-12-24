const express = require('express');
const { body, param } = require('express-validator');
const { sendMessage, getChatHistory } = require('../controllers/chatController');

const router = express.Router();

// Validation middleware
const validateSendMessage = [
  body('sessionId')
    .notEmpty()
    .withMessage('Session ID is required')
    .isString()
    .withMessage('Session ID must be a string'),
  body('userId')
    .notEmpty()
    .withMessage('User ID is required')
    .isString()
    .withMessage('User ID must be a string'),
  body('message')
    .notEmpty()
    .withMessage('Message is required')
    .isString()
    .withMessage('Message must be a string')
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage('Message must be between 1 and 5000 characters')
];

const validateSessionId = [
  param('sessionId')
    .notEmpty()
    .withMessage('Session ID is required')
    .isString()
    .withMessage('Session ID must be a string')
];

router.post('/send', validateSendMessage, sendMessage);
router.get('/history/:sessionId', validateSessionId, getChatHistory);

module.exports = router;

