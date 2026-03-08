/**
 * locationService.js
 *
 * Resolves an Alexa device's location to the nearest NOAA tidal station.
 *
 * Requires the Alexa permission:
 *   alexa::devices:all:address:country_and_postal_code:read
 */

const axios = require('axios');
const { DEFAULT_STATION_ID, HTTP_TIMEOUT } = require('../constants');

const httpClient = axios.create({ timeout: HTTP_TIMEOUT });

const NOAA_STATIONS_URL = 'https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations.json';
const ZIPPOPOTAM_BASE = 'https://api.zippopotam.us';

/**
 * Thrown when the user has not granted the device location permission.
 * Handlers should catch this and send a permissions consent card.
 */
class LocationPermissionError extends Error {
  constructor() {
    super('Device location permission not granted');
    this.name = 'LocationPermissionError';
  }
}

/**
 * Great-circle distance in km between two lat/lon pairs (Haversine formula).
 *
 * @param {number} lat1
 * @param {number} lon1
 * @param {number} lat2
 * @param {number} lon2
 * @returns {number}
 */
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Returns the nearest NOAA station ID for the user's device location.
 * Throws LocationPermissionError if the user has not granted location permission.
 * Falls back to DEFAULT_STATION_ID if geocoding or station lookup fails.
 *
 * @param {import('ask-sdk-core').HandlerInput} handlerInput
 * @returns {Promise<string>} NOAA station ID
 * @throws {LocationPermissionError} if device address permission is denied
 */
async function getNearestStationId(handlerInput) {
  // Step 1: get postal code — re-throw permission errors, fall back on other failures
  let postalCode;
  try {
    const { deviceId } = handlerInput.requestEnvelope.context.System.device;
    const deviceAddressClient = handlerInput.serviceClientFactory.getDeviceAddressServiceClient();
    const address = await deviceAddressClient.getCountryAndPostalCode(deviceId);
    postalCode = address.postalCode;
  } catch (err) {
    if (err.statusCode === 403 || err.name === 'ServiceError') {
      throw new LocationPermissionError();
    }
    console.error('locationService: device address lookup failed:', err.message);
    return DEFAULT_STATION_ID;
  }

  // Steps 2–4: geocode + nearest station — fall back on any failure
  try {
    const geoRes = await httpClient.get(`${ZIPPOPOTAM_BASE}/us/${postalCode}`);
    const [place] = geoRes.data.places;
    const lat = parseFloat(place.latitude);
    const lon = parseFloat(place.longitude);

    const stationsRes = await httpClient.get(NOAA_STATIONS_URL, {
      params: { type: 'waterlevels', units: 'english' },
    });
    const { stations } = stationsRes.data;

    let nearest = stations[0];
    let minDist = haversineDistance(lat, lon, nearest.lat, nearest.lng);
    for (let i = 1; i < stations.length; i += 1) {
      const dist = haversineDistance(lat, lon, stations[i].lat, stations[i].lng);
      if (dist < minDist) {
        minDist = dist;
        nearest = stations[i];
      }
    }
    return nearest.id;
  } catch (err) {
    console.error('locationService: geocode/station lookup failed:', err.message);
    return DEFAULT_STATION_ID;
  }
}

module.exports = { getNearestStationId, haversineDistance, LocationPermissionError };
