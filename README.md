# AI Chatbot System

A production-ready AI chatbot system built with MERN stack, n8n workflow orchestration, and Aiven database hosting.

## Architecture

```
User (React UI) → Express Backend → n8n Webhook → AI Model → Response → Database → User
```

## Tech Stack

- **Frontend**: React 18
- **Backend**: Node.js + Express
- **Database**: PostgreSQL (Aiven)
- **Workflow**: n8n
- **AI**: OpenAI (via n8n)

## Project Structure

```
chat-bot/
├── server/
│   ├── config/
│   │   └── database.js          # Database connection and initialization
│   ├── controllers/
│   │   └── chatController.js    # Request handlers
│   ├── middleware/
│   │   └── errorHandler.js       # Centralized error handling
│   ├── models/
│   │   ├── ChatSession.js        # Session model
│   │   └── ChatMessage.js        # Message model
│   ├── routes/
│   │   └── chatRoutes.js         # API routes
│   ├── services/
│   │   └── n8nService.js         # n8n webhook integration
│   └── index.js                  # Express server entry point
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   └── ChatBot.js        # Main chat UI component
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── n8n-workflow.json             # n8n workflow configuration
├── .env.example                  # Environment variables template
└── README.md
```

## Prerequisites

- Node.js 16+ and npm
- PostgreSQL database (Aiven account)
- n8n instance (cloud or self-hosted)
- OpenAI API key (or other LLM provider)

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
# Install root dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..
```

Or use the convenience script:
```bash
npm run install-all
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# n8n Webhook URL
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/chat

# Aiven Database Configuration
AIVEN_DB_HOST=your-db-host.a.aivencloud.com
AIVEN_DB_PORT=12345
AIVEN_DB_USER=avnadmin
AIVEN_DB_PASSWORD=your-password
AIVEN_DB_NAME=defaultdb
```

### 3. Set Up Aiven Database

1. Create a PostgreSQL service on Aiven
2. Get your connection details from the Aiven console
3. Update `.env` with your Aiven credentials
4. The application will automatically create required tables on first run

### 4. Set Up n8n Workflow

#### Option A: Import Workflow (Recommended)

1. Open your n8n instance
2. Click "Import from File" or "Import from URL"
3. Upload `n8n-workflow.json`
4. Configure the OpenAI node with your API key:
   - Click on the "OpenAI" node
   - Add your OpenAI API credentials
5. Activate the workflow
6. Copy the webhook URL and update `N8N_WEBHOOK_URL` in `.env`

#### Option B: Manual Setup

1. Create a new workflow in n8n
2. Add a **Webhook** node:
   - Method: POST
   - Path: `chat`
   - Response Mode: "Respond to Webhook"
3. Add an **OpenAI** node (or your preferred AI model):
   - Connect it to the webhook
   - Configure with your API key
   - Set model (e.g., `gpt-3.5-turbo`)
   - Map the user message: `{{ $json.body.message }}`
4. Add a **Set** node to format the response:
   - Set `reply` to `{{ $json.choices[0].message.content }}`
   - Set `confidence` to `0.95`
5. Add a **Respond to Webhook** node:
   - Response Body: `{{ $json }}`
6. Activate the workflow and copy the webhook URL

### 5. Run the Application

#### Development Mode (Both Server and Client)

```bash
npm run dev
```

This will start:
- Backend server on `http://localhost:5000`
- React app on `http://localhost:3000`

#### Run Separately

```bash
# Backend only
npm run server

# Frontend only (in another terminal)
npm run client
```

## API Endpoints

### POST /api/chat/send

Send a message to the chatbot.

**Request Body:**
```json
{
  "sessionId": "session_123",
  "userId": "user_456",
  "message": "Hello, how are you?"
}
```

**Response:**
```json
{
  "success": true,
  "reply": "I'm doing well, thank you! How can I help you today?",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### GET /api/chat/history/:sessionId

Retrieve chat history for a session.

**Response:**
```json
{
  "success": true,
  "messages": [
    {
      "role": "user",
      "content": "Hello",
      "timestamp": "2024-01-01T12:00:00.000Z"
    },
    {
      "role": "ai",
      "content": "Hi! How can I help you?",
      "timestamp": "2024-01-01T12:00:01.000Z"
    }
  ]
}
```

## Database Schema

### chat_sessions
- `session_id` (VARCHAR, PRIMARY KEY)
- `user_id` (VARCHAR)
- `created_at` (TIMESTAMP)

### chat_messages
- `id` (SERIAL, PRIMARY KEY)
- `session_id` (VARCHAR, FOREIGN KEY)
- `role` (VARCHAR: 'user' | 'ai')
- `content` (TEXT)
- `created_at` (TIMESTAMP)

## Features

- ✅ Real-time chat interface
- ✅ Message history persistence
- ✅ Session management
- ✅ Loading indicators
- ✅ Error handling
- ✅ Responsive design
- ✅ Automatic table creation
- ✅ Input validation
- ✅ Centralized error handling

## Production Deployment

### Backend

1. Set `NODE_ENV=production` in `.env`
2. Use a process manager like PM2:
   ```bash
   npm install -g pm2
   pm2 start server/index.js --name chatbot-api
   ```

### Frontend

1. Build the React app:
   ```bash
   cd client
   npm run build
   ```
2. Serve the `build` folder with a web server (nginx, Apache, etc.)

### Environment Variables

Ensure all production environment variables are set securely (use your hosting platform's secret management).

## Troubleshooting

### Database Connection Issues

- Verify Aiven credentials in `.env`
- Check if your IP is whitelisted in Aiven firewall settings
- Ensure SSL is enabled (handled automatically in the code)

### n8n Webhook Issues

- Verify the webhook URL is correct
- Check if the workflow is activated
- Test the webhook directly with a tool like Postman
- Check n8n execution logs for errors

### CORS Issues

- Ensure the backend CORS middleware is configured correctly
- Check that the frontend is using the correct API URL

## License

ISC

## Support

For issues or questions, please check the logs and ensure all environment variables are correctly configured.

