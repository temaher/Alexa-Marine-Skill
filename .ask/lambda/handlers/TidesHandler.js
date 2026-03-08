const Alexa = require('ask-sdk-core');
const tidesService = require('../services/tidesService');
const { getNearestStationId, LocationPermissionError } = require('../services/locationService');
const { speak, pause } = require('../utils/speechUtils');
const { formatTideTime, todayNoaaFormat } = require('../utils/dateUtils');
const { MESSAGES } = require('../constants');

const TidesHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'TidesIntent'
    );
  },

  async handle(handlerInput) {
    const slots = handlerInput.requestEnvelope.request.intent.slots || {};
    const tideTypeSlot = slots.tideType && slots.tideType.value;
    const stationSlot = slots.stationId && slots.stationId.value;

    try {
      const stationId = stationSlot || (await getNearestStationId(handlerInput));
      const today = todayNoaaFormat();

      // Fetch tide predictions and current water level in parallel
      const [predictions, waterLevelData] = await Promise.all([
        tidesService.getTidePredictions(stationId, today, today),
        tidesService.getCurrentWaterLevel(stationId).catch(() => null),
      ]);

      if (!predictions || predictions.length === 0) {
        return handlerInput.responseBuilder
          .speak(speak(MESSAGES.TIDES_PLACEHOLDER))
          .reprompt(MESSAGES.LAUNCH_REPROMPT)
          .getResponse();
      }

      // Optionally filter to just high or low tides
      const filtered = tideTypeSlot
        ? predictions.filter((p) => p.type === tideTypeSlot.toUpperCase()[0])
        : predictions;

      if (filtered.length === 0) {
        const type = tideTypeSlot || 'tide';
        const speechText = `I could not find any ${type} tide predictions`
          + ` for today at station ${stationId}.`;
        return handlerInput.responseBuilder
          .speak(speak(speechText))
          .reprompt(MESSAGES.LAUNCH_REPROMPT)
          .getResponse();
      }

      const parts = filtered.map((p) => {
        const label = p.type === 'H' ? 'High tide' : 'Low tide';
        const time = formatTideTime(p.time);
        const height = p.height != null ? `, ${p.height} feet` : '';
        return `${label} at ${time}${height}`;
      });

      // Prepend current water level if available
      const waterLevelPrefix = (waterLevelData && !waterLevelData._placeholder)
        ? `Current water level ${waterLevelData.waterLevel} feet. ${pause()}`
        : '';

      const speechText = [
        waterLevelPrefix,
        `Today's tide predictions for station ${stationId}: `,
        pause(),
        parts.join(pause()),
      ].join('');

      return handlerInput.responseBuilder
        .speak(speak(speechText))
        .reprompt(MESSAGES.LAUNCH_REPROMPT)
        .getResponse();
    } catch (err) {
      if (err instanceof LocationPermissionError) {
        return handlerInput.responseBuilder
          .speak(MESSAGES.LOCATION_PERMISSION_REQUIRED)
          .withAskForPermissionsConsentCard(
            ['alexa::devices:all:address:country_and_postal_code:read'],
          )
          .getResponse();
      }
      console.error('TidesHandler error:', err);
      return handlerInput.responseBuilder
        .speak(MESSAGES.ERROR)
        .reprompt(MESSAGES.LAUNCH_REPROMPT)
        .getResponse();
    }
  },
};

module.exports = TidesHandler;
