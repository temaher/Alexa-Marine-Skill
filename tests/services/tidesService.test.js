const nock = require('nock');
const tidesService = require('../../lambda/services/tidesService');
const { DEFAULT_STATION_ID } = require('../../lambda/constants');

const NOAA_ORIGIN = 'https://api.tidesandcurrents.noaa.gov';
const NOAA_PATH = '/api/prod/datagetter';

afterEach(() => {
  nock.cleanAll();
});

// ---------------------------------------------------------------------------
// getTidePredictions
// ---------------------------------------------------------------------------

describe('tidesService — getTidePredictions', () => {
  const PREDICTIONS_RESPONSE = {
    predictions: [
      { t: '2024-06-01 04:23', v: '0.42', type: 'L' },
      { t: '2024-06-01 10:51', v: '4.87', type: 'H' },
      { t: '2024-06-01 17:06', v: '0.31', type: 'L' },
      { t: '2024-06-01 23:22', v: '5.01', type: 'H' },
    ],
  };

  test('returns array of parsed tide objects', async () => {
    nock(NOAA_ORIGIN)
      .get(NOAA_PATH)
      .query((q) => q.product === 'predictions' && q.station === '8443970')
      .reply(200, PREDICTIONS_RESPONSE);

    const result = await tidesService.getTidePredictions('8443970', '20240601', '20240601');
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(4);
  });

  test('maps type, time, and height correctly', async () => {
    nock(NOAA_ORIGIN)
      .get(NOAA_PATH)
      .query(true)
      .reply(200, PREDICTIONS_RESPONSE);

    const result = await tidesService.getTidePredictions('8443970', '20240601', '20240601');
    expect(result[0]).toEqual({ type: 'L', time: '2024-06-01 04:23', height: 0.42 });
    expect(result[1]).toEqual({ type: 'H', time: '2024-06-01 10:51', height: 4.87 });
  });

  test('type values are H or L', async () => {
    nock(NOAA_ORIGIN)
      .get(NOAA_PATH)
      .query(true)
      .reply(200, PREDICTIONS_RESPONSE);

    const result = await tidesService.getTidePredictions('8443970', '20240601', '20240601');
    result.forEach((p) => expect(['H', 'L']).toContain(p.type));
  });

  test('uses DEFAULT_STATION_ID when stationId is omitted', async () => {
    nock(NOAA_ORIGIN)
      .get(NOAA_PATH)
      .query((q) => q.station === DEFAULT_STATION_ID)
      .reply(200, PREDICTIONS_RESPONSE);

    const result = await tidesService.getTidePredictions(undefined, '20240601', '20240601');
    expect(result).toHaveLength(4);
  });
});

// ---------------------------------------------------------------------------
// getCurrentWaterLevel
// ---------------------------------------------------------------------------

describe('tidesService — getCurrentWaterLevel', () => {
  const WATER_LEVEL_RESPONSE = {
    data: [{ t: '2024-06-01 14:00', v: '2.34' }],
  };

  test('returns _placeholder: false with numeric waterLevel', async () => {
    nock(NOAA_ORIGIN)
      .get(NOAA_PATH)
      .query((q) => q.product === 'water_level' && q.station === '8443970')
      .reply(200, WATER_LEVEL_RESPONSE);

    const result = await tidesService.getCurrentWaterLevel('8443970');
    expect(result._placeholder).toBe(false);
    expect(result.stationId).toBe('8443970');
    expect(result.waterLevel).toBe(2.34);
    expect(result.timestamp).toBe('2024-06-01 14:00');
  });

  test('uses DEFAULT_STATION_ID when none is supplied', async () => {
    nock(NOAA_ORIGIN)
      .get(NOAA_PATH)
      .query((q) => q.station === DEFAULT_STATION_ID)
      .reply(200, WATER_LEVEL_RESPONSE);

    const result = await tidesService.getCurrentWaterLevel();
    expect(result.stationId).toBe(DEFAULT_STATION_ID);
  });

  test('waterLevel is parsed as a float', async () => {
    nock(NOAA_ORIGIN)
      .get(NOAA_PATH)
      .query(true)
      .reply(200, { data: [{ t: '2024-06-01 14:00', v: '3.99' }] });

    const result = await tidesService.getCurrentWaterLevel('8443970');
    expect(typeof result.waterLevel).toBe('number');
    expect(result.waterLevel).toBe(3.99);
  });
});
