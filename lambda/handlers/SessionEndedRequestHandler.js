'use strict';

const Alexa = require('ask-sdk-core');

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
  },

  handle(handlerInput) {
    const reason = handlerInput.requestEnvelope.request.reason;
    console.log(`Session ended with reason: ${reason}`);
    // SessionEndedRequest must return an empty response
    return handlerInput.responseBuilder.getResponse();
  },
};

module.exports = SessionEndedRequestHandler;
