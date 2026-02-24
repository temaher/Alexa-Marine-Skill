/**
 * noaaService.js
 *
 * Client for NOAA and NWS data APIs:
 *   - NOAA CO-OPS API  (tides, meteorological station data)
 *   - NWS Weather API  (marine zone forecasts, active alerts)
 *   - NDBC             (buoy observations)
 *
 * All public functions currently return PLACEHOLDER objects.
 * Replace each TODO block with a real axios call once integration is ready.
 */

const axios = require('axios');
const { DEFAULT_STATION_ID, HTTP_TIMEOUT } = require('../constants');

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
  // TODO: Replace this placeholder with a real NOAA CO-OPS API call.
  //
  // Endpoint (wind):
  //   GET ${NOAA_API_BASE}
  //     ?station=${stationId}
  //     &product=wind
  //     &date=latest
  //     &units=english
  //     &time_zone=lst_ldt
  //     &format=json
  //
  // Endpoint (air & water temperature):
  //   GET ${NOAA_API_BASE}
  //     ?station=${stationId}
  //     &product=air_temperature   (repeat for water_temperature)
  //     &date=latest
  //     &units=english
  //     &time_zone=lst_ldt
  //     &format=json
  //
  // Response shape (wind):
  //   { data: [{ t: '2024-01-01 12:00', s: '12.3', d: 'NNE', g: '15.1' }] }
  //
  // Example real implementation:
  //   const [windRes, airRes, waterRes] = await Promise.all([
  //     httpClient.get(NOAA_API_BASE, { params: { station: stationId, product: 'wind',
  //       date: 'latest', units: 'english', time_zone: 'lst_ldt', format: 'json' } }),
  //     httpClient.get(NOAA_API_BASE, { params: { station: stationId, product: 'air_temperature',
  //       date: 'latest', units: 'english', time_zone: 'lst_ldt', format: 'json' } }),
  //     httpClient.get(NOAA_API_BASE, { params: { station: stationId, product: 'water_temperature',
  //       date: 'latest', units: 'english', time_zone: 'lst_ldt', format: 'json' } }),
  //   ]);
  //   const wind = windRes.data.data[0];
  //   return {
  //     _placeholder: false,
  //     stationId,
  //     timestamp: wind.t,
  //     windSpeed: parseFloat(wind.s),
  //     windDirection: wind.d,
  //     windGust: parseFloat(wind.g),
  //     airTemperature: parseFloat(airRes.data.data[0].v),
  //     waterTemperature: parseFloat(waterRes.data.data[0].v),
  //   };

  return {
    _placeholder: true,
    stationId,
    timestamp: null,
    windSpeed: null,
    windDirection: null,
    windGust: null,
    airTemperature: null,
    waterTemperature: null,
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
  // TODO: Replace this placeholder with a real NWS API call.
  //
  // Step 1 — resolve zone to a forecast office grid point:
  //   GET ${NWS_API_BASE}/zones/forecast/${zone}
  //   Response: { properties: { forecastOffice: '<office>', gridX: n, gridY: n } }
  //
  // Step 2 — fetch the forecast:
  //   GET ${NWS_API_BASE}/gridpoints/<office>/<gridX>,<gridY>/forecast
  //   Response: { properties: { periods: [ { name, shortForecast, detailedForecast } ] } }
  //
  // Example real implementation:
  //   const zoneRes = await httpClient.get(`${NWS_API_BASE}/zones/forecast/${zone}`);
  //   const { forecastOffice, gridX, gridY } = zoneRes.data.properties;
  //   const fcstRes = await httpClient.get(
  //     `${forecastOffice}/gridpoints/${gridX},${gridY}/forecast`
  //   );
  //   return { _placeholder: false, zone, periods: fcstRes.data.properties.periods };

  return {
    _placeholder: true,
    zone,
    periods: [],
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
async function getMarineAlerts() {
  // TODO: Replace this placeholder with a real NWS alerts call.
  //
  // Endpoint:
  //   GET ${NWS_API_BASE}/alerts/active?zone=${zone}
  //   Response: { features: [{ properties: { event, headline, description } }] }
  //
  // Example real implementation:
  //   const res = await httpClient.get(`${NWS_API_BASE}/alerts/active`, {
  //     params: { zone },
  //   });
  //   return res.data.features.map((f) => f.properties);

  return [];
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
  // TODO: Replace this placeholder with a real NDBC plaintext data call.
  //
  // Endpoint:
  //   GET ${NDBC_BASE}/${buoyId}.txt
  //   Response: space-delimited plaintext; first non-header line is the latest observation.
  //
  // Column indices (0-based) for standard meteorological file:
  //   0  YY   1  MM   2  DD   3  hh   4  mm
  //   5  WDIR (degrees true)
  //   6  WSPD (m/s)
  //   9  WVHT (meters)
  //  10  DPD  (dominant wave period, seconds)
  //  14  WTMP (°C)
  //
  // Example real implementation:
  //   const res = await httpClient.get(`${NDBC_BASE}/${buoyId}.txt`, {
  //     responseType: 'text',
  //   });
  //   const lines = res.data.split('\n').filter((l) => !l.startsWith('#') && l.trim());
  //   const cols = lines[0].split(/\s+/);
  //   const MS_TO_KNOTS = 1.94384;
  //   const M_TO_FT = 3.28084;
  //   const C_TO_F = (c) => (c * 9) / 5 + 32;
  //   return {
  //     _placeholder: false,
  //     buoyId,
  //     windDirection: parseFloat(cols[5]),
  //     windSpeed: parseFloat(cols[6]) * MS_TO_KNOTS,
  //     waveHeight: parseFloat(cols[9]) * M_TO_FT,
  //     wavePeriod: parseFloat(cols[10]),
  //     waterTemperature: C_TO_F(parseFloat(cols[14])),
  //   };

  return {
    _placeholder: true,
    buoyId,
    waveHeight: null,
    wavePeriod: null,
    waterTemperature: null,
    windSpeed: null,
    windDirection: null,
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
