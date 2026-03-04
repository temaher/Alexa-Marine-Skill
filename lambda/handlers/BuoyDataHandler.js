const Alexa = require('ask-sdk-core');
const noaaService = require('../services/noaaService');
const { speak, pause, degreesToCardinal } = require('../utils/speechUtils');
const { MESSAGES } = require('../constants');

const BuoyDataHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'BuoyDataIntent'
    );
  },

  async handle(handlerInput) {
    const slots = handlerInput.requestEnvelope.request.intent.slots || {};
    const buoySlot = slots.buoyId && slots.buoyId.value;

    if (!buoySlot) {
      return handlerInput.responseBuilder
        .speak(speak(
          'Please specify a buoy station. '
          + 'Try asking for buoy conditions at Cape Elizabeth or Neah Bay.',
        ))
        .reprompt(MESSAGES.LAUNCH_REPROMPT)
        .getResponse();
    }

    try {
      const buoy = await noaaService.getBuoyData(buoySlot);

      const parts = [];
      if (buoy.waveHeight !== null) {
        parts.push(`Wave height ${buoy.waveHeight.toFixed(1)} feet`);
      }
      if (buoy.wavePeriod !== null) {
        parts.push(`wave period ${buoy.wavePeriod} seconds`);
      }
      if (buoy.waterTemperature !== null) {
        parts.push(`water temperature ${buoy.waterTemperature.toFixed(0)} degrees`);
      }
      if (buoy.windSpeed !== null) {
        const dir = buoy.windDirection !== null
          ? `${degreesToCardinal(buoy.windDirection)} ` : '';
        parts.push(`wind ${dir}at ${buoy.windSpeed.toFixed(0)} knots`);
      }

      const speechText = parts.length > 0
        ? `Buoy ${buoySlot} conditions: ${pause()}${parts.join(`${pause()}`)}.`
        : `No data available for buoy ${buoySlot}.`;

      return handlerInput.responseBuilder
        .speak(speak(speechText))
        .reprompt(MESSAGES.LAUNCH_REPROMPT)
        .getResponse();
    } catch (err) {
      console.error('BuoyDataHandler error:', err);
      return handlerInput.responseBuilder
        .speak(MESSAGES.ERROR)
        .reprompt(MESSAGES.LAUNCH_REPROMPT)
        .getResponse();
    }
  },
};

module.exports = BuoyDataHandler;
