const Alexa = require('ask-sdk-core');
const { MESSAGES } = require('../constants');

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent'
    );
  },

  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(MESSAGES.HELP)
      .reprompt(MESSAGES.HELP)
      .getResponse();
  },
};

module.exports = HelpIntentHandler;
