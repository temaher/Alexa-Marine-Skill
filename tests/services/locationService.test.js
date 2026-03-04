const { getNearestStationId } = require('../../lambda/services/locationService');
const { DEFAULT_STATION_ID } = require('../../lambda/constants');
const { mockHandlerInput } = require('../helpers/mockHandlerInput');

describe('locationService', () => {
  describe('getNearestStationId', () => {
    test('returns the default station ID', async () => {
      const hi = mockHandlerInput('IntentRequest', 'MarineWeatherIntent');
      const stationId = await getNearestStationId(hi);
      expect(stationId).toBe(DEFAULT_STATION_ID);
    });

    test('returns a string', async () => {
      const hi = mockHandlerInput('IntentRequest', 'MarineWeatherIntent');
      const stationId = await getNearestStationId(hi);
      expect(typeof stationId).toBe('string');
    });
  });
});
