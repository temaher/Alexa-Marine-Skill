const nock = require('nock');
const noaaService = require('../../lambda/services/noaaService');
const { DEFAULT_STATION_ID } = require('../../lambda/constants');

// nock URL decomposition:
//   NOAA_API_BASE = https://api.tidesandcurrents.noaa.gov/api/prod/datagetter
//   NWS_API_BASE  = https://api.weather.gov
//   NDBC_BASE     = https://www.ndbc.noaa.gov/data/realtime2
const NOAA_ORIGIN = 'https://api.tidesandcurrents.noaa.gov';
const NOAA_PATH = '/api/prod/datagetter';
const NWS_ORIGIN = 'https://api.weather.gov';
const NDBC_ORIGIN = 'https://www.ndbc.noaa.gov';
const NDBC_PATH = '/data/realtime2';

afterEach(() => {
  nock.cleanAll();
});

// ---------------------------------------------------------------------------
// getStationWeather
// ---------------------------------------------------------------------------

describe('noaaService — getStationWeather', () => {
  const WIND_RESPONSE = {
    data: [{
      t: '2024-06-01 14:00', s: '12.3', d: 'NNE', g: '16.0',
    }],
  };
  const AIR_RESPONSE = { data: [{ t: '2024-06-01 14:00', v: '68.2' }] };
  const WATER_RESPONSE = { data: [{ t: '2024-06-01 14:00', v: '61.5' }] };

  function mockWeatherCalls(stationId = '8443970') {
    nock(NOAA_ORIGIN)
      .get(NOAA_PATH)
      .query((q) => q.product === 'wind' && q.station === stationId)
      .reply(200, WIND_RESPONSE);
    nock(NOAA_ORIGIN)
      .get(NOAA_PATH)
      .query((q) => q.product === 'air_temperature' && q.station === stationId)
      .reply(200, AIR_RESPONSE);
    nock(NOAA_ORIGIN)
      .get(NOAA_PATH)
      .query((q) => q.product === 'water_temperature' && q.station === stationId)
      .reply(200, WATER_RESPONSE);
  }

  test('returns _placeholder: false and parsed values', async () => {
    mockWeatherCalls();
    const result = await noaaService.getStationWeather('8443970');
    expect(result._placeholder).toBe(false);
    expect(result.stationId).toBe('8443970');
    expect(result.windSpeed).toBe(12.3);
    expect(result.windDirection).toBe('NNE');
    expect(result.windGust).toBe(16.0);
    expect(result.airTemperature).toBe(68.2);
    expect(result.waterTemperature).toBe(61.5);
    expect(result.timestamp).toBe('2024-06-01 14:00');
  });

  test('uses DEFAULT_STATION_ID when none supplied', async () => {
    mockWeatherCalls(DEFAULT_STATION_ID);
    const result = await noaaService.getStationWeather();
    expect(result.stationId).toBe(DEFAULT_STATION_ID);
  });

  test('makes exactly 3 parallel requests', async () => {
    mockWeatherCalls();
    await noaaService.getStationWeather('8443970');
    expect(nock.isDone()).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// getMarineForecast
// ---------------------------------------------------------------------------

describe('noaaService — getMarineForecast', () => {
  const FORECAST_RESPONSE = {
    properties: {
      periods: [
        { name: 'Today', shortForecast: 'Slight chop', detailedForecast: 'Seas 2 to 3 feet.' },
        { name: 'Tonight', shortForecast: 'Calm', detailedForecast: 'Seas 1 to 2 feet.' },
      ],
    },
  };

  test('calls /zones/forecast/{zone}/forecast and returns periods', async () => {
    nock(NWS_ORIGIN)
      .get('/zones/forecast/ANZ335/forecast')
      .reply(200, FORECAST_RESPONSE);

    const result = await noaaService.getMarineForecast('ANZ335');
    expect(result._placeholder).toBe(false);
    expect(result.zone).toBe('ANZ335');
    expect(result.periods).toHaveLength(2);
    expect(result.periods[0].name).toBe('Today');
  });

  test('returns all periods from the response', async () => {
    nock(NWS_ORIGIN)
      .get('/zones/forecast/ANZ338/forecast')
      .reply(200, FORECAST_RESPONSE);

    const result = await noaaService.getMarineForecast('ANZ338');
    expect(Array.isArray(result.periods)).toBe(true);
    expect(result.periods.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// getMarineAlerts
// ---------------------------------------------------------------------------

describe('noaaService — getMarineAlerts', () => {
  test('returns mapped alert properties when alerts are active', async () => {
    const ALERTS_RESPONSE = {
      features: [
        {
          properties: {
            event: 'Small Craft Advisory', headline: 'SCA issued', description: 'Winds 15-25 kt.',
          },
        },
        {
          properties: {
            event: 'Gale Warning', headline: 'Gale issued', description: 'Winds 35-45 kt.',
          },
        },
      ],
    };

    nock(NWS_ORIGIN)
      .get('/alerts/active')
      .query({ zone: 'ANZ335' })
      .reply(200, ALERTS_RESPONSE);

    const result = await noaaService.getMarineAlerts('ANZ335');
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(2);
    expect(result[0].event).toBe('Small Craft Advisory');
    expect(result[1].event).toBe('Gale Warning');
  });

  test('returns empty array when no alerts are active', async () => {
    nock(NWS_ORIGIN)
      .get('/alerts/active')
      .query({ zone: 'ANZ335' })
      .reply(200, { features: [] });

    const result = await noaaService.getMarineAlerts('ANZ335');
    expect(result).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// getBuoyData
// ---------------------------------------------------------------------------

describe('noaaService — getBuoyData', () => {
  // Columns (0-based): 5=WDIR 6=WSPD 7=GST 8=WVHT 9=DPD ... 14=WTMP
  // eslint-disable-next-line max-len
  const BUOY_TEXT = `#YY  MM DD hh mm WDIR WSPD GST  WVHT   DPD   APD MWD   PRES  ATMP  WTMP  DEWP  VIS PTDY  TIDE
#yr  mo dy hr mn degT m/s  m/s     m   sec   sec degT   hPa  degC  degC  degC  nmi  hPa    ft
2024 06 01 14 00  230  5.1  7.2   1.8  10.0   7.5 220 1013.0  18.0  15.0  12.0   MM   MM    MM`;

  test('returns _placeholder: false with converted numeric values', async () => {
    nock(NDBC_ORIGIN)
      .get(`${NDBC_PATH}/44025.txt`)
      .reply(200, BUOY_TEXT);

    const result = await noaaService.getBuoyData('44025');
    expect(result._placeholder).toBe(false);
    expect(result.buoyId).toBe('44025');
    expect(result.windDirection).toBe(230);
    expect(result.windSpeed).toBeCloseTo(5.1 * 1.94384, 3);
    expect(result.waveHeight).toBeCloseTo(1.8 * 3.28084, 3);
    expect(result.wavePeriod).toBe(10.0);
    expect(result.waterTemperature).toBeCloseTo((15.0 * 9) / 5 + 32, 3);
  });

  test('returns null for MM (missing) values', async () => {
    const BUOY_WITH_MM = `#YY  MM DD hh mm WDIR WSPD GST  WVHT   DPD   APD MWD   PRES  ATMP  WTMP
#yr  mo dy hr mn degT m/s  m/s     m   sec   sec degT   hPa  degC  degC
2024 06 01 14 00   MM   MM   MM    MM    MM    MM  MM      MM    MM    MM`;

    nock(NDBC_ORIGIN)
      .get(`${NDBC_PATH}/44025.txt`)
      .reply(200, BUOY_WITH_MM);

    const result = await noaaService.getBuoyData('44025');
    expect(result.windDirection).toBeNull();
    expect(result.windSpeed).toBeNull();
    expect(result.waveHeight).toBeNull();
    expect(result.wavePeriod).toBeNull();
    expect(result.waterTemperature).toBeNull();
  });
});
