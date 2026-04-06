const dotenv = require('dotenv');

dotenv.config();

const config = {
  discordToken: process.env.DISCORD_TOKEN,
  clientId: process.env.DISCORD_CLIENT_ID,
  guildId: process.env.DISCORD_GUILD_ID,
  apiBaseUrl: process.env.EMOTION_API_URL || 'http://127.0.0.1:5000',
  modLogChannelId: process.env.MOD_LOG_CHANNEL_ID || '',
  cooldownMs: Number(process.env.REPLY_COOLDOWN_MS || 45000),
  repeatedAngerWindowMs: Number(process.env.REPEATED_ANGER_WINDOW_MS || 10 * 60 * 1000),
  repeatedAngerCount: Number(process.env.REPEATED_ANGER_COUNT || 3),
  thresholds: {
    anger: Number(process.env.THRESHOLD_ANGER || 0.8),
    sadness: Number(process.env.THRESHOLD_SADNESS || 0.7),
    disgust: Number(process.env.THRESHOLD_DISGUST || 0.75),
    fear: Number(process.env.THRESHOLD_FEAR || 0.75),
  },
};

module.exports = config;
