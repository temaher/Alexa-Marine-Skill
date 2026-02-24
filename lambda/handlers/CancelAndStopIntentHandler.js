'use strict';

const Alexa = require('ask-sdk-core');
const { MESSAGES } = require('../constants');

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent' ||
        Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent')
    );
  },

  handle(handlerInput) {
    return handlerInput.responseBuilder.speak(MESSAGES.CANCEL).getResponse();
  },
};

module.exports = CancelAndStopIntentHandler;
