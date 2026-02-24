'use strict';

const Alexa = require('ask-sdk-core');
const { MESSAGES } = require('../constants');

/**
 * Catch-all handler — triggered when no other handler can handle the request.
 * Useful for debugging; must be registered last.
 */
const IntentReflectorHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
  },

  handle(handlerInput) {
    const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
    console.warn(`Unhandled intent: ${intentName}`);
    return handlerInput.responseBuilder
      .speak(MESSAGES.FALLBACK)
      .reprompt(MESSAGES.LAUNCH_REPROMPT)
      .getResponse();
  },
};

module.exports = IntentReflectorHandler;
