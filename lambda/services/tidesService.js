/**
 * tidesService.js
 *
 * Fetches tide predictions and water level data from the NOAA CO-OPS API.
 */

const axios = require('axios');
const { DEFAULT_STATION_ID, HTTP_TIMEOUT, NOAA_API_BASE } = require('../constants');

const httpClient = axios.create({
  timeout: HTTP_TIMEOUT,
  headers: {
    'User-Agent': 'AlexaMarineSkill/1.0 (contact@example.com)',
  },
});

// ---------------------------------------------------------------------------
// Tide predictions
// ---------------------------------------------------------------------------

/**
 * Fetches high/low tide predictions for a station over a date range.
 *
 * @param {string} [stationId]  - NOAA station ID
 * @param {string} [beginDate]  - Start date, YYYYMMDD
 * @param {string} [endDate]    - End date, YYYYMMDD
 * @returns {Promise<Array<{ type: 'H'|'L', time: string, height: number }>>}
 *   Each element represents one high or low tide event.
 */
async function getTidePredictions(
  stationId = DEFAULT_STATION_ID,
  beginDate = undefined,
  endDate = undefined,
) {
  const res = await httpClient.get(NOAA_API_BASE, {
    params: {
      station: stationId,
      product: 'predictions',
      datum: 'MLLW',
      begin_date: beginDate,
      end_date: endDate,
      interval: 'hilo',
      units: 'english',
      time_zone: 'lst_ldt',
      format: 'json',
    },
  });
  return res.data.predictions.map((p) => ({
    type: p.type,
    time: p.t,
    height: parseFloat(p.v),
  }));
}

// ---------------------------------------------------------------------------
// Current water level
// ---------------------------------------------------------------------------

/**
 * Fetches the latest observed water level for a station.
 *
 * @param {string} [stationId] - NOAA station ID
 * @returns {Promise<{
 *   _placeholder: boolean,
 *   stationId: string,
 *   waterLevel: number|null, // feet above MLLW
 *   timestamp: string|null   // 'YYYY-MM-DD HH:MM'
 * }>}
 */
async function getCurrentWaterLevel(stationId = DEFAULT_STATION_ID) {
  const res = await httpClient.get(NOAA_API_BASE, {
    params: {
      station: stationId,
      product: 'water_level',
      date: 'latest',
      datum: 'MLLW',
      units: 'english',
      time_zone: 'lst_ldt',
      format: 'json',
    },
  });
  const obs = res.data.data[0];
  return {
    _placeholder: false,
    stationId,
    waterLevel: parseFloat(obs.v),
    timestamp: obs.t,
  };
}

module.exports = {
  getTidePredictions,
  getCurrentWaterLevel,
  _httpClient: httpClient,
};
