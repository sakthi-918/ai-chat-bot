# Troubleshooting Guide

## Common Error: "Sorry, I encountered an error. Please try again."

This error message appears when the backend fails to process a chat message. Follow these steps to diagnose:

### Step 1: Check Server Console Logs

Look at your backend server console (where you ran `npm run server`). You should now see detailed error messages that will help identify the issue.

### Step 2: Check Configuration

Visit `http://localhost:5000/api/debug/config` in your browser to see which environment variables are configured.

### Step 3: Common Issues and Solutions

#### Issue 1: N8N_WEBHOOK_URL Not Set

**Symptoms:**
- Error message: "N8N_WEBHOOK_URL environment variable is not set"
- Console shows: "Missing required environment variables"

**Solution:**
1. Make sure you have a `.env` file in the root directory
2. Copy `.env.example` to `.env` if you haven't already
3. Add your n8n webhook URL:
   ```
   N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/chat
   ```
4. Restart your server

#### Issue 2: Database Connection Failed

**Symptoms:**
- Error message: "Database connection refused" or "Database host not found"
- Console shows database connection errors

**Solution:**
1. Verify your Aiven database credentials in `.env`:
   ```
   AIVEN_DB_HOST=your-db-host.a.aivencloud.com
   AIVEN_DB_PORT=12345
   AIVEN_DB_USER=avnadmin
   AIVEN_DB_PASSWORD=your-password
   AIVEN_DB_NAME=defaultdb
   ```
2. Check if your IP is whitelisted in Aiven firewall settings
3. Verify the database service is running in Aiven console
4. Test connection using a PostgreSQL client

#### Issue 3: n8n Webhook Not Responding

**Symptoms:**
- Error message: "No response received from n8n webhook"
- Console shows n8n service errors

**Solution:**
1. Verify the n8n workflow is **activated** (not just saved)
2. Test the webhook URL directly:
   ```bash
   curl -X POST https://your-n8n-instance.com/webhook/chat \
     -H "Content-Type: application/json" \
     -d '{"sessionId":"test","userId":"test","message":"hello"}'
   ```
3. Check n8n execution logs for errors
4. Verify the OpenAI API key is configured in n8n
5. Ensure the webhook response format matches:
   ```json
   {
     "reply": "Your AI response here"
   }
   ```

#### Issue 4: Invalid n8n Response Format

**Symptoms:**
- Error message: "Invalid response format from n8n webhook"
- Console shows the received response data

**Solution:**
1. Check the n8n workflow's "Respond to Webhook" node
2. Ensure it returns JSON with a `reply` field:
   ```json
   {
     "reply": "{{ $json.choices[0].message.content }}"
   }
   ```
3. The response can also be a plain string or have a `message` field

#### Issue 5: CORS Errors

**Symptoms:**
- Browser console shows CORS errors
- Network tab shows preflight failures

**Solution:**
1. Verify the backend CORS middleware is enabled (it should be)
2. Check that the frontend is calling the correct API URL
3. Ensure both frontend and backend are running

### Step 4: Enable Detailed Logging

The improved error handling now logs:
- Full error messages
- n8n request/response details
- Database connection status
- Request payloads

Check your server console for these logs when an error occurs.

### Step 5: Test Individual Components

#### Test Database Connection
```bash
# Using psql (if installed)
psql -h your-db-host.a.aivencloud.com -p 12345 -U avnadmin -d defaultdb
```

#### Test Backend API Directly
```bash
# Health check
curl http://localhost:5000/health

# Send a test message
curl -X POST http://localhost:5000/api/chat/send \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test-session",
    "userId": "test-user",
    "message": "Hello"
  }'
```

#### Test n8n Webhook
```bash
curl -X POST YOUR_N8N_WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test",
    "userId": "test",
    "message": "test message"
  }'
```

### Step 6: Check Browser Console

Open your browser's developer console (F12) and check:
1. Network tab - see the actual API request/response
2. Console tab - see any JavaScript errors
3. Look for the detailed error message in the chat UI

### Still Having Issues?

1. Check that all environment variables are set correctly
2. Verify all services are running (database, n8n, backend)
3. Review server console logs for detailed error messages
4. Test each component individually (database, n8n, API)

The improved error handling will now show you exactly what's wrong!

