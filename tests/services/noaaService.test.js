'use strict';

const nock = require('nock');
const noaaService = require('../../lambda/services/noaaService');
const { NOAA_API_BASE, NWS_API_BASE, NDBC_BASE } = require('../../lambda/constants');

afterEach(() => {
  nock.cleanAll();
});

describe('noaaService — placeholder behaviour', () => {
  describe('getStationWeather', () => {
    test('returns a placeholder object with correct shape', async () => {
      const result = await noaaService.getStationWeather('8443970');

      expect(result).toMatchObject({
        _placeholder: true,
        stationId: '8443970',
        windSpeed: null,
        windDirection: null,
        windGust: null,
        airTemperature: null,
        waterTemperature: null,
      });
    });

    test('uses DEFAULT_STATION_ID when none is supplied', async () => {
      const result = await noaaService.getStationWeather();
      expect(result.stationId).toBe(require('../../lambda/constants').DEFAULT_STATION_ID);
    });

    test('returns _placeholder: true before real integration', async () => {
      const result = await noaaService.getStationWeather('8518750');
      expect(result._placeholder).toBe(true);
    });
  });

  describe('getMarineForecast', () => {
    test('returns a placeholder object with the requested zone', async () => {
      const result = await noaaService.getMarineForecast('ANZ335');

      expect(result).toMatchObject({
        _placeholder: true,
        zone: 'ANZ335',
        periods: [],
      });
    });

    test('periods is always an array', async () => {
      const result = await noaaService.getMarineForecast('ANZ338');
      expect(Array.isArray(result.periods)).toBe(true);
    });
  });

  describe('getMarineAlerts', () => {
    test('returns an empty array placeholder', async () => {
      const result = await noaaService.getMarineAlerts('ANZ335');
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(0);
    });
  });

  describe('getBuoyData', () => {
    test('returns a placeholder object with the requested buoyId', async () => {
      const result = await noaaService.getBuoyData('44025');

      expect(result).toMatchObject({
        _placeholder: true,
        buoyId: '44025',
        waveHeight: null,
        wavePeriod: null,
        waterTemperature: null,
        windSpeed: null,
        windDirection: null,
      });
    });
  });
});

// ---------------------------------------------------------------------------
// These tests will be un-skipped once real API integration is implemented.
// They serve as a specification for the expected API contract.
// ---------------------------------------------------------------------------
describe.skip('noaaService — real API integration (TODO)', () => {
  describe('getStationWeather', () => {
    test('calls NOAA CO-OPS API with correct params and returns parsed data', async () => {
      nock(NOAA_API_BASE)
        .get('')
        .query(true)
        .reply(200, {
          data: [{ t: '2024-06-01 14:00', s: '12.3', d: 'NNE', g: '16.0' }],
        });

      const result = await noaaService.getStationWeather('8443970');

      expect(result._placeholder).toBe(false);
      expect(result.windSpeed).toBe(12.3);
      expect(result.windDirection).toBe('NNE');
    });
  });

  describe('getMarineForecast', () => {
    test('calls NWS zone and gridpoint endpoints and returns periods', async () => {
      // Real integration test — fill in with actual nock intercepts
      const result = await noaaService.getMarineForecast('ANZ335');
      expect(result._placeholder).toBe(false);
      expect(result.periods.length).toBeGreaterThan(0);
    });
  });

  describe('getBuoyData', () => {
    test('parses NDBC plaintext format and returns converted units', async () => {
      const result = await noaaService.getBuoyData('44025');
      expect(result._placeholder).toBe(false);
      expect(typeof result.waveHeight).toBe('number');
    });
  });
});
