const MarineWeatherHandler = require('../../lambda/handlers/MarineWeatherHandler');
const noaaService = require('../../lambda/services/noaaService');
const locationService = require('../../lambda/services/locationService');
const { mockHandlerInput } = require('../helpers/mockHandlerInput');
const { MESSAGES } = require('../../lambda/constants');

jest.mock('../../lambda/services/noaaService');
jest.mock('../../lambda/services/locationService');

const PLACEHOLDER_WEATHER = {
  _placeholder: true,
  stationId: '8443970',
  timestamp: null,
  windSpeed: null,
  windDirection: null,
  windGust: null,
  airTemperature: null,
  waterTemperature: null,
};

const REAL_WEATHER = {
  _placeholder: false,
  stationId: '8443970',
  timestamp: '2024-06-01 14:00',
  windSpeed: 12.3,
  windDirection: 'NNE',
  windGust: 16.0,
  airTemperature: 68,
  waterTemperature: 62,
};

beforeEach(() => {
  jest.clearAllMocks();
  locationService.getNearestStationId.mockResolvedValue('8443970');
});

describe('MarineWeatherHandler', () => {
  describe('canHandle', () => {
    test('returns true for MarineWeatherIntent', () => {
      const hi = mockHandlerInput('IntentRequest', 'MarineWeatherIntent');
      expect(MarineWeatherHandler.canHandle(hi)).toBe(true);
    });

    test('returns false for TidesIntent', () => {
      const hi = mockHandlerInput('IntentRequest', 'TidesIntent');
      expect(MarineWeatherHandler.canHandle(hi)).toBe(false);
    });

    test('returns false for a LaunchRequest', () => {
      const hi = mockHandlerInput('LaunchRequest');
      expect(MarineWeatherHandler.canHandle(hi)).toBe(false);
    });
  });

  describe('handle — placeholder data', () => {
    test('returns the placeholder message when service is not yet integrated', async () => {
      noaaService.getStationWeather.mockResolvedValue(PLACEHOLDER_WEATHER);
      const hi = mockHandlerInput('IntentRequest', 'MarineWeatherIntent');

      await MarineWeatherHandler.handle(hi);

      expect(noaaService.getStationWeather).toHaveBeenCalledWith('8443970');
      expect(hi.responseBuilder.speak).toHaveBeenCalledWith(
        expect.stringContaining(MESSAGES.WEATHER_PLACEHOLDER),
      );
    });

    test('uses station slot value when provided', async () => {
      noaaService.getStationWeather.mockResolvedValue(PLACEHOLDER_WEATHER);
      const hi = mockHandlerInput('IntentRequest', 'MarineWeatherIntent', {
        stationId: '8518750',
      });

      await MarineWeatherHandler.handle(hi);

      expect(noaaService.getStationWeather).toHaveBeenCalledWith('8518750');
      // Location service should NOT be called when slot is present
      expect(locationService.getNearestStationId).not.toHaveBeenCalled();
    });

    test('falls back to locationService when no station slot', async () => {
      noaaService.getStationWeather.mockResolvedValue(PLACEHOLDER_WEATHER);
      const hi = mockHandlerInput('IntentRequest', 'MarineWeatherIntent');

      await MarineWeatherHandler.handle(hi);

      expect(locationService.getNearestStationId).toHaveBeenCalledWith(hi);
    });
  });

  describe('handle — real data', () => {
    test('speaks wind conditions from real weather data', async () => {
      noaaService.getStationWeather.mockResolvedValue(REAL_WEATHER);
      const hi = mockHandlerInput('IntentRequest', 'MarineWeatherIntent');

      await MarineWeatherHandler.handle(hi);

      const spokenText = hi.responseBuilder.speak.mock.calls[0][0];
      expect(spokenText).toContain('NNE');
      expect(spokenText).toContain('12.3');
    });

    test('includes gust speed in speech when present', async () => {
      noaaService.getStationWeather.mockResolvedValue(REAL_WEATHER);
      const hi = mockHandlerInput('IntentRequest', 'MarineWeatherIntent');

      await MarineWeatherHandler.handle(hi);

      const spokenText = hi.responseBuilder.speak.mock.calls[0][0];
      expect(spokenText).toContain('16');
    });
  });

  describe('handle — error handling', () => {
    test('returns error message when noaaService throws', async () => {
      noaaService.getStationWeather.mockRejectedValue(new Error('Network error'));
      const hi = mockHandlerInput('IntentRequest', 'MarineWeatherIntent');

      await MarineWeatherHandler.handle(hi);

      expect(hi.responseBuilder.speak).toHaveBeenCalledWith(MESSAGES.ERROR);
    });
  });
});
