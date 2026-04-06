function formatConfidence(value) {
  return `${(value * 100).toFixed(1)}%`;
}

function getAction({ emotion, confidence, thresholds }) {
  switch (emotion) {
    case 'anger':
      if (confidence > thresholds.anger) {
        return {
          type: 'warn',
          message:
            'Please keep the conversation respectful. I noticed elevated anger in your message.',
        };
      }
      return { type: 'none' };

    case 'sadness':
      if (confidence > thresholds.sadness) {
        return {
          type: 'support',
          message:
            'I am sorry you are feeling this way. If you want, take a pause and reach out to someone you trust.',
        };
      }
      return { type: 'none' };

    case 'disgust':
      if (confidence > thresholds.disgust) {
        return {
          type: 'caution',
          message:
            'Your message may come across as hostile. Please rephrase to keep the chat constructive.',
        };
      }
      return { type: 'none' };

    case 'fear':
      if (confidence > thresholds.fear) {
        return {
          type: 'support',
          message:
            'It sounds like you might be worried. You are not alone—take a breath and ask for help if needed.',
        };
      }
      return { type: 'none' };

    case 'joy':
      return { type: 'log_positive' };

    case 'neutral':
      return { type: 'ignore' };

    default:
      return { type: 'none' };
  }
}

module.exports = {
  getAction,
  formatConfidence,
};
