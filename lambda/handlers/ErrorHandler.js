const { MESSAGES } = require('../constants');

const ErrorHandler = {
  canHandle() {
    return true;
  },

  handle(handlerInput, error) {
    console.error('Unhandled error:', error);
    return handlerInput.responseBuilder
      .speak(MESSAGES.ERROR)
      .reprompt(MESSAGES.LAUNCH_REPROMPT)
      .getResponse();
  },
};

module.exports = ErrorHandler;
