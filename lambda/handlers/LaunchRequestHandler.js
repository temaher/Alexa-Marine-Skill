const Alexa = require('ask-sdk-core');
const { MESSAGES } = require('../constants');

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
  },

  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(MESSAGES.LAUNCH)
      .reprompt(MESSAGES.LAUNCH_REPROMPT)
      .getResponse();
  },
};

module.exports = LaunchRequestHandler;
