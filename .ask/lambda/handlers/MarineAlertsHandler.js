const Alexa = require('ask-sdk-core');
const noaaService = require('../services/noaaService');
const { speak, pause } = require('../utils/speechUtils');
const { MESSAGES } = require('../constants');

const MarineAlertsHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'MarineAlertsIntent'
    );
  },

  async handle(handlerInput) {
    const slots = handlerInput.requestEnvelope.request.intent.slots || {};
    const zoneSlot = slots.forecastZone && slots.forecastZone.value;

    if (!zoneSlot) {
      return handlerInput.responseBuilder
        .speak(speak(
          'Please specify a forecast zone. '
          + 'Try asking for alerts for Puget Sound or Hood Canal.',
        ))
        .reprompt(MESSAGES.LAUNCH_REPROMPT)
        .getResponse();
    }

    try {
      const alerts = await noaaService.getMarineAlerts(zoneSlot);

      let speechText;
      if (!alerts || alerts.length === 0) {
        speechText = MESSAGES.NO_ALERTS;
      } else {
        const parts = alerts.map((a) => a.event || a.headline);
        speechText = `Active marine alerts for zone ${zoneSlot}: `
          + `${pause()}${parts.join(`${pause()}`)}.`;
      }

      return handlerInput.responseBuilder
        .speak(speak(speechText))
        .reprompt(MESSAGES.LAUNCH_REPROMPT)
        .getResponse();
    } catch (err) {
      console.error('MarineAlertsHandler error:', err);
      return handlerInput.responseBuilder
        .speak(MESSAGES.ERROR)
        .reprompt(MESSAGES.LAUNCH_REPROMPT)
        .getResponse();
    }
  },
};

module.exports = MarineAlertsHandler;
