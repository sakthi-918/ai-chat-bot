const axios = require('axios');

class N8nService {
  constructor() {
    this.webhookUrl = process.env.N8N_WEBHOOK_URL;
  }

  async sendMessage(sessionId, userId, message) {
    this.webhookUrl = process.env.N8N_WEBHOOK_URL;
    console.log('N8N_WEBHOOK_URL:', this.webhookUrl);
    try {
      const payload = {
        sessionId,
        userId,
        message
      };

      console.log(`Calling n8n webhook: ${this.webhookUrl}`);
      console.log(`Payload:`, JSON.stringify(payload, null, 2));

      const response = await axios.post(this.webhookUrl, payload, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 second timeout
      });

      console.log(`n8n response status: ${response.status}`);
      console.log(`n8n response data:`, JSON.stringify(response.data, null, 2));

      if (response.status === 200) {
        return response.data.output;
      }

      throw new Error(`Invalid response format from n8n webhook. Received: ${JSON.stringify(response.data)}`);
    } catch (error) {
      console.error('n8n service error:', error.message);
      if (error.response) {
        const errorDetails = error.response.data ? JSON.stringify(error.response.data) : error.response.statusText;
        throw new Error(`n8n webhook error (${error.response.status}): ${errorDetails}`);
      } else if (error.request) {
        throw new Error(`No response received from n8n webhook. Check if the URL is correct: ${this.webhookUrl}`);
      } else {
        throw new Error(`Error calling n8n webhook: ${error.message}`);
      }
    }
  }
}

module.exports = new N8nService();

