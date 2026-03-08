/**
 * noaaService.js
 *
 * Client for NOAA and NWS data APIs:
 *   - NOAA CO-OPS API  (tides, meteorological station data)
 *   - NWS Weather API  (marine zone forecasts, active alerts)
 *   - NDBC             (buoy observations)
 */

const axios = require('axios');
const {
  DEFAULT_STATION_ID,
  HTTP_TIMEOUT,
  NOAA_API_BASE,
  NWS_API_BASE,
  NDBC_BASE,
} = require('../constants');

const httpClient = axios.create({
  timeout: HTTP_TIMEOUT,
  headers: {
    // NWS API policy requires a descriptive User-Agent header.
    'User-Agent': 'AlexaMarineSkill/1.0 (contact@example.com)',
  },
});

// ---------------------------------------------------------------------------
// Station weather (NOAA CO-OPS)
// ---------------------------------------------------------------------------

/**
 * Fetches current meteorological conditions for a NOAA CO-OPS station.
 *
 * @param {string} [stationId] - NOAA station ID (defaults to DEFAULT_STATION_ID)
 * @returns {Promise<{
 *   _placeholder: boolean,
 *   stationId: string,
 *   timestamp: string|null,
 *   windSpeed: number|null,       // knots
 *   windDirection: string|null,   // cardinal, e.g. "NNE"
 *   windGust: number|null,        // knots
 *   airTemperature: number|null,  // °F
 *   waterTemperature: number|null // °F
 * }>}
 */
async function getStationWeather(stationId = DEFAULT_STATION_ID) {
  const params = {
    station: stationId,
    date: 'latest',
    units: 'english',
    time_zone: 'lst_ldt',
    format: 'json',
  };

  const [windRes, airRes, waterRes] = await Promise.all([
    httpClient.get(NOAA_API_BASE, { params: { ...params, product: 'wind' } }),
    httpClient.get(NOAA_API_BASE, { params: { ...params, product: 'air_temperature' } }),
    httpClient.get(NOAA_API_BASE, { params: { ...params, product: 'water_temperature' } }),
  ]);

  const wind = windRes.data.data[0];
  return {
    _placeholder: false,
    stationId,
    timestamp: wind.t,
    windSpeed: parseFloat(wind.s),
    windDirection: wind.d,
    windGust: parseFloat(wind.g),
    airTemperature: parseFloat(airRes.data.data[0].v),
    waterTemperature: parseFloat(waterRes.data.data[0].v),
  };
}

// ---------------------------------------------------------------------------
// Marine zone forecast (NWS)
// ---------------------------------------------------------------------------

/**
 * Fetches an NWS marine zone forecast.
 *
 * @param {string} zone - NWS forecast zone code (e.g. 'ANZ335')
 * @returns {Promise<{
 *   _placeholder: boolean,
 *   zone: string,
 *   periods: Array<{ name: string, shortForecast: string, detailedForecast: string }>
 * }>}
 */
async function getMarineForecast(zone) {
  const res = await httpClient.get(`${NWS_API_BASE}/zones/forecast/${zone}/forecast`);
  return {
    _placeholder: false,
    zone,
    periods: res.data.properties.periods,
  };
}

// ---------------------------------------------------------------------------
// Active marine alerts (NWS)
// ---------------------------------------------------------------------------

/**
 * Fetches active NWS marine alerts for a zone.
 *
 * @param {string} zone - NWS zone code (e.g. 'ANZ335')
 * @returns {Promise<Array<{ event: string, headline: string, description: string }>>}
 */
async function getMarineAlerts(zone) {
  const res = await httpClient.get(`${NWS_API_BASE}/alerts/active`, {
    params: { zone },
  });
  return res.data.features.map((f) => f.properties);
}

// ---------------------------------------------------------------------------
// NDBC buoy observations
// ---------------------------------------------------------------------------

/**
 * Fetches the latest NDBC buoy observation for a given buoy station.
 *
 * @param {string} buoyId - NDBC station ID (e.g. '44025')
 * @returns {Promise<{
 *   _placeholder: boolean,
 *   buoyId: string,
 *   waveHeight: number|null,      // feet (converted from meters)
 *   wavePeriod: number|null,      // seconds
 *   waterTemperature: number|null,// °F  (converted from °C)
 *   windSpeed: number|null,       // knots (converted from m/s)
 *   windDirection: number|null    // degrees true
 * }>}
 */
async function getBuoyData(buoyId) {
  const res = await httpClient.get(`${NDBC_BASE}/${buoyId}.txt`, {
    responseType: 'text',
  });

  const lines = res.data
    .split('\n')
    .filter((l) => !l.startsWith('#') && l.trim());

  // Use .trim() to handle optional leading whitespace in NDBC data lines
  const cols = lines[0].trim().split(/\s+/);

  const MS_TO_KNOTS = 1.94384;
  const M_TO_FT = 3.28084;
  const toF = (c) => (c * 9) / 5 + 32;
  const parse = (val) => (val === 'MM' ? null : parseFloat(val));

  const wdirRaw = parse(cols[5]);
  const wspdRaw = parse(cols[6]);
  const wvhtRaw = parse(cols[8]); // WVHT at index 8 (after GST at 7)
  const dpdRaw = parse(cols[9]); // DPD at index 9
  const wtmpRaw = parse(cols[14]);

  return {
    _placeholder: false,
    buoyId,
    windDirection: wdirRaw,
    windSpeed: wspdRaw !== null ? wspdRaw * MS_TO_KNOTS : null,
    waveHeight: wvhtRaw !== null ? wvhtRaw * M_TO_FT : null,
    wavePeriod: dpdRaw,
    waterTemperature: wtmpRaw !== null ? toF(wtmpRaw) : null,
  };
}

module.exports = {
  getStationWeather,
  getMarineForecast,
  getMarineAlerts,
  getBuoyData,
  // Expose httpClient for testing purposes
  _httpClient: httpClient,
};
