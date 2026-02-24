'use strict';

const tidesService = require('../../lambda/services/tidesService');
const { DEFAULT_STATION_ID } = require('../../lambda/constants');

describe('tidesService — placeholder behaviour', () => {
  describe('getTidePredictions', () => {
    test('returns an empty array placeholder', async () => {
      const result = await tidesService.getTidePredictions('8443970', '20240601', '20240601');
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(0);
    });

    test('returns an empty array when called with no arguments', async () => {
      const result = await tidesService.getTidePredictions();
      expect(Array.isArray(result)).toBe(true);
    });

    test('accepts any station ID without throwing', async () => {
      await expect(
        tidesService.getTidePredictions('8518750', '20240601', '20240601'),
      ).resolves.not.toThrow();
    });
  });

  describe('getCurrentWaterLevel', () => {
    test('returns a placeholder object with correct shape', async () => {
      const result = await tidesService.getCurrentWaterLevel('8443970');

      expect(result).toMatchObject({
        _placeholder: true,
        stationId: '8443970',
        waterLevel: null,
        timestamp: null,
      });
    });

    test('uses DEFAULT_STATION_ID when none is supplied', async () => {
      const result = await tidesService.getCurrentWaterLevel();
      expect(result.stationId).toBe(DEFAULT_STATION_ID);
    });

    test('returns _placeholder: true before real integration', async () => {
      const result = await tidesService.getCurrentWaterLevel('8461490');
      expect(result._placeholder).toBe(true);
    });
  });
});

// ---------------------------------------------------------------------------
// Skipped until real NOAA CO-OPS integration is implemented.
// ---------------------------------------------------------------------------
describe.skip('tidesService — real API integration (TODO)', () => {
  test('getTidePredictions returns H and L entries for valid station and date', async () => {
    const result = await tidesService.getTidePredictions('8443970', '20240601', '20240601');
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty('type');
    expect(result[0]).toHaveProperty('time');
    expect(result[0]).toHaveProperty('height');
    expect(['H', 'L']).toContain(result[0].type);
  });

  test('getCurrentWaterLevel returns a numeric water level', async () => {
    const result = await tidesService.getCurrentWaterLevel('8443970');
    expect(result._placeholder).toBe(false);
    expect(typeof result.waterLevel).toBe('number');
  });
});
