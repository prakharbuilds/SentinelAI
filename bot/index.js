const { Client, GatewayIntentBits, Partials } = require('discord.js');
const config = require('./config');
const { analyzeText } = require('./utils/apiClient');
const { getAction, formatConfidence } = require('./utils/emotionHandler');

if (!config.discordToken) {
  throw new Error('DISCORD_TOKEN is missing. Add it to your .env file.');
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel],
});

// In-memory state.
const userCooldowns = new Map();
const userEmotionHistory = new Map();

function now() {
  return Date.now();
}

function addEmotionEvent(userId, emotion, confidence) {
  const events = userEmotionHistory.get(userId) || [];
  events.push({ emotion, confidence, ts: now() });

  // Keep only the most recent 50 events per user.
  const trimmed = events.slice(-50);
  userEmotionHistory.set(userId, trimmed);
}

function getRecentAngerCount(userId) {
  const events = userEmotionHistory.get(userId) || [];
  const cutoff = now() - config.repeatedAngerWindowMs;
  return events.filter((event) => event.emotion === 'anger' && event.ts >= cutoff).length;
}

function getEmotionSummary(userId, limit = 10) {
  const events = (userEmotionHistory.get(userId) || []).slice(-limit);
  if (!events.length) return 'No emotion data recorded yet.';

  return events
    .map((event) => {
      const time = new Date(event.ts).toLocaleTimeString('en-US', { hour12: false });
      return `• ${time} UTC — ${event.emotion} (${formatConfidence(event.confidence)})`;
    })
    .join('\n');
}

async function logForModerators(message) {
  console.log(`[MODLOG] ${message}`);

  if (!config.modLogChannelId) return;
  const modChannel = await client.channels.fetch(config.modLogChannelId).catch(() => null);
  if (modChannel && modChannel.isTextBased()) {
    await modChannel.send(`🛡️ ${message}`).catch(() => null);
  }
}

function canReplyToUser(userId) {
  const lastReply = userCooldowns.get(userId) || 0;
  if (now() - lastReply < config.cooldownMs) {
    return false;
  }
  userCooldowns.set(userId, now());
  return true;
}

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  const text = message.content?.trim();
  if (!text) return;

  if (text.toLowerCase() === '!emotionstats') {
    const summary = getEmotionSummary(message.author.id, 10);
    await message.reply(`Your recent emotion events:\n${summary}`);
    return;
  }

  let analysis;
  try {
    analysis = await analyzeText(text);
  } catch (error) {
    console.error('Emotion API failure:', error.message);
    await logForModerators(`Emotion API failed for user ${message.author.tag}: ${error.message}`);
    return;
  }

  const emotion = analysis.top_emotion;
  const confidence = analysis.confidence;

  addEmotionEvent(message.author.id, emotion, confidence);

  const action = getAction({
    emotion,
    confidence,
    thresholds: config.thresholds,
  });

  if (emotion === 'joy') {
    await logForModerators(
      `Positive message from ${message.author.tag} in #${message.channel.name}: confidence ${formatConfidence(confidence)}`,
    );
  }

  if (emotion === 'neutral' || action.type === 'ignore' || action.type === 'none' || action.type === 'log_positive') {
    return;
  }

  const repeatedAngerCount = getRecentAngerCount(message.author.id);
  if (emotion === 'anger' && repeatedAngerCount >= config.repeatedAngerCount) {
    await logForModerators(
      `Repeated anger detected for ${message.author.tag}: ${repeatedAngerCount} anger events in the last ${
        config.repeatedAngerWindowMs / 60000
      } minutes.`,
    );

    if (canReplyToUser(message.author.id)) {
      await message.reply(
        'This is a stronger warning: we have detected repeated angry messages. Please de-escalate to avoid moderation action.',
      );
    }
    return;
  }

  if (!canReplyToUser(message.author.id)) {
    await logForModerators(`Reply skipped due to rate limit for ${message.author.tag}.`);
    return;
  }

  await message.reply(action.message);
  await logForModerators(
    `Action=${action.type} for ${message.author.tag} | emotion=${emotion} | confidence=${formatConfidence(confidence)}`,
  );
});

client.login(config.discordToken);
