const Alexa = require('ask-sdk-core');
const noaaService = require('../services/noaaService');
const locationService = require('../services/locationService');
const { speak, pause } = require('../utils/speechUtils');
const { MESSAGES } = require('../constants');

const MarineWeatherHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'MarineWeatherIntent'
    );
  },

  async handle(handlerInput) {
    const slots = handlerInput.requestEnvelope.request.intent.slots || {};
    const zoneSlot = slots.forecastZone && slots.forecastZone.value;
    const stationSlot = slots.stationId && slots.stationId.value;

    try {
      const stationId = stationSlot || (await locationService.getNearestStationId(handlerInput));

      // Fetch current station weather conditions
      const weather = await noaaService.getStationWeather(stationId);

      let speechText;

      if (weather._placeholder) {
        // Data integration not yet implemented
        speechText = MESSAGES.WEATHER_PLACEHOLDER;
      } else {
        const windDir = weather.windDirection != null ? weather.windDirection : 'unknown';
        const windSpd = weather.windSpeed != null ? `${weather.windSpeed} knots` : 'unknown';
        const gusts = weather.windGust != null ? `gusting to ${weather.windGust} knots` : '';
        const airTempStr = weather.airTemperature != null
          ? `${weather.airTemperature} degrees` : 'unavailable';
        const waterTempStr = weather.waterTemperature != null
          ? `${weather.waterTemperature} degrees` : 'unavailable';

        speechText = `Current conditions at station ${stationId}: `
          + `${pause()}`
          + `Wind ${windDir} at ${windSpd}${gusts ? `, ${gusts}` : ''}.`
          + `${pause()}`
          + `Air temperature ${airTempStr}.`
          + `${pause()}`
          + `Water temperature ${waterTempStr}.`;
      }

      // If a forecast zone was provided, also fetch the marine zone forecast
      if (zoneSlot && !weather._placeholder) {
        const forecast = await noaaService.getMarineForecast(zoneSlot);
        if (forecast.periods && forecast.periods.length > 0) {
          const period = forecast.periods[0];
          const forecastText = period.detailedForecast || period.shortForecast;
          speechText += `${pause('700ms')}Marine forecast: ${forecastText}.`;
        }
      }

      return handlerInput.responseBuilder
        .speak(speak(speechText))
        .reprompt(MESSAGES.LAUNCH_REPROMPT)
        .getResponse();
    } catch (err) {
      console.error('MarineWeatherHandler error:', err);
      return handlerInput.responseBuilder
        .speak(MESSAGES.ERROR)
        .reprompt(MESSAGES.LAUNCH_REPROMPT)
        .getResponse();
    }
  },
};

module.exports = MarineWeatherHandler;
