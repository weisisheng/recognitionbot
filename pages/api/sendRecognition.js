import { WebClient } from '@slack/web-api';

// Initialize Slack WebClient
const slackClient = new WebClient(process.env.SLACK_BOT_TOKEN);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { recognizedUser, kudosMessage, selectedChannel } = req.body;

      // Send the recognition message
      await slackClient.chat.postMessage({
        channel: selectedChannel,
        text: `<@${recognizedUser}> received kudos: ${kudosMessage}`,
      });

      return res.status(200).json({ message: 'Recognition sent successfully' });
    } catch (error) {
      console.error('Error sending recognition:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    // Method Not Allowed for non-POST requests
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
}