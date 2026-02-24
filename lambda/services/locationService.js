/**
 * locationService.js
 *
 * Resolves an Alexa device's location to the nearest NOAA tidal station.
 *
 * Requires the Alexa permission:
 *   alexa::devices:all:address:country_and_postal_code:read
 *
 * Currently returns the DEFAULT_STATION_ID as a placeholder.
 * Replace the TODO block with real Device Address API + nearest-station logic.
 */

const { DEFAULT_STATION_ID } = require('../constants');

/**
 * Returns the nearest NOAA station ID for the user's device location.
 *
 * @param {import('ask-sdk-core').HandlerInput} handlerInput
 * @returns {Promise<string>} NOAA station ID
 */
// eslint-disable-next-line no-unused-vars
async function getNearestStationId(handlerInput) {
  // TODO: Replace this placeholder with real Alexa Device Address API resolution.
  //
  // Step 1 — retrieve device address:
  //   const { deviceId } = handlerInput.requestEnvelope.context.System.device;
  //   const { apiEndpoint, apiAccessToken } = handlerInput.requestEnvelope.context.System;
  //   const deviceAddressClient =
  //     handlerInput.serviceClientFactory.getDeviceAddressServiceClient();
  //   const address = await deviceAddressClient.getCountryAndPostalCode(deviceId);
  //   // address: { countryCode: 'US', postalCode: '02101' }
  //
  // Step 2 — convert postal code to lat/lon (e.g. via Census Geocoder or a zip-code DB):
  //   const { lat, lon } = await geocodePostalCode(address.postalCode, address.countryCode);
  //
  // Step 3 — query NOAA metadata API for nearest water-level station:
  //   GET https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations.json
  //       ?type=waterlevels&units=english
  //   Then find the station with minimum great-circle distance to (lat, lon).
  //
  // Step 4 — return that station's ID string.
  //
  // NOTE: If the user has not granted location permission, catch the FORBIDDEN error
  //       and ask for permission via Alexa.askForPermissionsConsentCard().

  return DEFAULT_STATION_ID;
}

module.exports = { getNearestStationId };
