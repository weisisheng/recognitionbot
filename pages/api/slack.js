import { WebClient } from '@slack/web-api';

// Initialize Slack WebClient
const slackClient = new WebClient(process.env.SLACK_BOT_TOKEN);

// Simple in-memory cache
let userCache = null;
let channelCache = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Simple rate limiting
let lastApiCallTime = 0;
const API_CALL_INTERVAL = 1000; // 1 second between API calls

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const payload = req.body?.payload ? JSON.parse(req.body.payload) : null;
      
      if (payload) {
        if (payload.type === 'shortcut' && payload.callback_id === 'open_kudos_modal') {
          await openKudosModal(payload.trigger_id);
          return res.status(200).json({ message: 'Modal opened successfully' });
        } 
        else if (payload.type === 'view_submission' && payload.view.callback_id === 'kudos_modal') {
          await handleViewSubmission(payload);
          return res.status(200).json({});
        } else {
          console.log('Callback ID does not match or invalid payload type.');
          return res.status(400).json({ error: 'Invalid payload type or callback_id' });
        }
      } else {
        console.log('No payload found in request.');
        return res.status(400).json({ error: 'No payload' });
      }
    } catch (error) {
      console.error('Error handling Slack request:', error);
      return res.status(500).json({ error: 'Server Error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function fetchData() {
  const currentTime = Date.now();
  if (currentTime - lastFetchTime < CACHE_DURATION && userCache && channelCache) {
    return { userOptions: userCache, channelOptions: channelCache };
  }

  await rateLimitedCall(() => Promise.resolve()); // Ensure we wait before making API calls

  const [usersList, channelsList] = await Promise.all([
    rateLimitedCall(() => slackClient.users.list()),
    rateLimitedCall(() => slackClient.conversations.list({ types: 'public_channel,private_channel' }))
  ]);

  userCache = usersList.members
    .filter(user => !user.is_bot && !user.deleted && user.id !== 'USLACKBOT')
    .map(user => ({
      text: { type: 'plain_text', text: user.real_name || user.name },
      value: user.id
    }));

  channelCache = channelsList.channels
    .map(channel => ({
      text: { type: 'plain_text', text: channel.name },
      value: channel.id
    }));

  lastFetchTime = currentTime;
  return { userOptions: userCache, channelOptions: channelCache };
}

async function rateLimitedCall(apiCall) {
  const currentTime = Date.now();
  if (currentTime - lastApiCallTime < API_CALL_INTERVAL) {
    await new Promise(resolve => setTimeout(resolve, API_CALL_INTERVAL - (currentTime - lastApiCallTime)));
  }
  lastApiCallTime = Date.now();
  return apiCall();
}

async function openKudosModal(triggerId) {
  try {
    const { userOptions, channelOptions } = await fetchData();

    await rateLimitedCall(() => slackClient.views.open({
      trigger_id: triggerId,
      view: {
        type: 'modal',
        callback_id: 'kudos_modal',
        title: { type: 'plain_text', text: 'Send Kudos' },
        blocks: [
          {
            type: 'input',
            block_id: 'user_select_block',
            label: { type: 'plain_text', text: 'Who do you want to recognize?' },
            element: {
              type: 'static_select',
              action_id: 'user_select',
              placeholder: { type: 'plain_text', text: 'Select a user' },
              options: userOptions
            },
          },
          {
            type: 'input',
            block_id: 'kudos_message_block',
            label: { type: 'plain_text', text: 'Kudos Message' },
            element: {
              type: 'plain_text_input',
              action_id: 'kudos_message',
              multiline: true,
            },
          },
          {
            type: 'input',
            block_id: 'channel_select_block',
            label: { type: 'plain_text', text: 'Select the Channel' },
            element: {
              type: 'static_select',
              action_id: 'channel_select',
              placeholder: { type: 'plain_text', text: 'Select a channel' },
              options: channelOptions
            },
          },
        ],
        submit: { type: 'plain_text', text: 'Send' },
      },
    }));
  } catch (error) {
    console.error('Error opening Kudos modal:', error);
    throw error;
  }
}

async function handleViewSubmission(payload) {
  const submittedValues = payload.view.state.values;
  const recognizedUser = submittedValues.user_select_block.user_select.selected_option.value;
  const kudosMessage = submittedValues.kudos_message_block.kudos_message.value;
  const selectedChannel = submittedValues.channel_select_block.channel_select.selected_option.value;

  try {
    await rateLimitedCall(() => slackClient.chat.postMessage({
      channel: selectedChannel,
      text: `<@${recognizedUser}> received kudos! :tada: ${kudosMessage}`,
    }));
  } catch (error) {
    console.error('Error sending kudos message:', error);
    throw error;
  }
}