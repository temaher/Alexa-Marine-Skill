const nock = require('nock');
const {
  getNearestStationId,
  haversineDistance,
  LocationPermissionError,
} = require('../../lambda/services/locationService');
const { DEFAULT_STATION_ID } = require('../../lambda/constants');
const { mockHandlerInput } = require('../helpers/mockHandlerInput');

const ZIPPOPOTAM_ORIGIN = 'https://api.zippopotam.us';
const NOAA_STATIONS_ORIGIN = 'https://api.tidesandcurrents.noaa.gov';
const NOAA_STATIONS_PATH = '/mdapi/prod/webapi/stations.json';

afterEach(() => {
  nock.cleanAll();
});

// ---------------------------------------------------------------------------
// Helper: build a HandlerInput with a mock device address service client
// ---------------------------------------------------------------------------

function buildHandlerInput({ postalCode = '98101', deviceId = 'test-device-id' } = {}) {
  const getCountryAndPostalCode = jest.fn().mockResolvedValue({
    countryCode: 'US',
    postalCode,
  });
  const getDeviceAddressServiceClient = jest.fn().mockReturnValue({
    getCountryAndPostalCode,
  });

  const base = mockHandlerInput('IntentRequest', 'MarineWeatherIntent');
  base.requestEnvelope.context.System.device.deviceId = deviceId;
  base.serviceClientFactory = { getDeviceAddressServiceClient };
  return { handlerInput: base, getCountryAndPostalCode, getDeviceAddressServiceClient };
}

const STATIONS_RESPONSE = {
  stations: [
    {
      id: '9447130', name: 'Seattle', lat: 47.603, lng: -122.339,
    },
    {
      id: '9443090', name: 'Port Angeles', lat: 48.123, lng: -123.44,
    },
    {
      id: '9446484', name: 'Tacoma', lat: 47.266, lng: -122.413,
    },
  ],
};

// ZIP 98101 = downtown Seattle
const GEO_RESPONSE = {
  places: [{ latitude: '47.6062', longitude: '-122.3321' }],
};

function setupHappyPath(postalCode = '98101') {
  nock(ZIPPOPOTAM_ORIGIN)
    .get(`/us/${postalCode}`)
    .reply(200, GEO_RESPONSE);

  nock(NOAA_STATIONS_ORIGIN)
    .get(NOAA_STATIONS_PATH)
    .query(true)
    .reply(200, STATIONS_RESPONSE);
}

// ---------------------------------------------------------------------------
// haversineDistance (pure function)
// ---------------------------------------------------------------------------

describe('locationService — haversineDistance', () => {
  test('returns 0 for identical coordinates', () => {
    expect(haversineDistance(47.6, -122.3, 47.6, -122.3)).toBe(0);
  });

  test('returns a positive number for different coordinates', () => {
    expect(haversineDistance(47.6, -122.3, 48.0, -122.8)).toBeGreaterThan(0);
  });

  test('is symmetric', () => {
    const d1 = haversineDistance(47.6, -122.3, 48.0, -122.8);
    const d2 = haversineDistance(48.0, -122.8, 47.6, -122.3);
    expect(d1).toBeCloseTo(d2, 5);
  });
});

// ---------------------------------------------------------------------------
// getNearestStationId
// ---------------------------------------------------------------------------

describe('locationService — getNearestStationId', () => {
  test('returns nearest station ID when permission is granted', async () => {
    setupHappyPath();
    const { handlerInput } = buildHandlerInput({ postalCode: '98101' });
    const stationId = await getNearestStationId(handlerInput);
    // Seattle coordinates → nearest is the Seattle station
    expect(stationId).toBe('9447130');
  });

  test('calls getCountryAndPostalCode with the correct deviceId', async () => {
    setupHappyPath();
    const { handlerInput, getCountryAndPostalCode } = buildHandlerInput({
      deviceId: 'my-device-id',
      postalCode: '98101',
    });
    await getNearestStationId(handlerInput);
    expect(getCountryAndPostalCode).toHaveBeenCalledWith('my-device-id');
  });

  test('returns a string', async () => {
    setupHappyPath();
    const { handlerInput } = buildHandlerInput({ postalCode: '98101' });
    const stationId = await getNearestStationId(handlerInput);
    expect(typeof stationId).toBe('string');
  });

  test('throws LocationPermissionError when permission is denied (403)', async () => {
    const { handlerInput, getCountryAndPostalCode } = buildHandlerInput();
    const err = new Error('Forbidden');
    err.statusCode = 403;
    getCountryAndPostalCode.mockRejectedValue(err);

    await expect(getNearestStationId(handlerInput)).rejects.toThrow(LocationPermissionError);
  });

  test('returns DEFAULT_STATION_ID when geocoding fails (404)', async () => {
    nock(ZIPPOPOTAM_ORIGIN)
      .get('/us/00000')
      .reply(404);

    const { handlerInput } = buildHandlerInput({ postalCode: '00000' });
    const stationId = await getNearestStationId(handlerInput);
    expect(stationId).toBe(DEFAULT_STATION_ID);
  });

  test('returns DEFAULT_STATION_ID when NOAA stations API fails (500)', async () => {
    nock(ZIPPOPOTAM_ORIGIN)
      .get('/us/98101')
      .reply(200, GEO_RESPONSE);

    nock(NOAA_STATIONS_ORIGIN)
      .get(NOAA_STATIONS_PATH)
      .query(true)
      .reply(500);

    const { handlerInput } = buildHandlerInput({ postalCode: '98101' });
    const stationId = await getNearestStationId(handlerInput);
    expect(stationId).toBe(DEFAULT_STATION_ID);
  });
});
