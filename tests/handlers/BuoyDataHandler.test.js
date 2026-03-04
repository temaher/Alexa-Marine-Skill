const BuoyDataHandler = require('../../lambda/handlers/BuoyDataHandler');
const noaaService = require('../../lambda/services/noaaService');
const { mockHandlerInput } = require('../helpers/mockHandlerInput');
const { MESSAGES } = require('../../lambda/constants');

jest.mock('../../lambda/services/noaaService');

const REAL_BUOY = {
  _placeholder: false,
  buoyId: '46041',
  waveHeight: 5.906,
  wavePeriod: 10.0,
  waterTemperature: 59.0,
  windSpeed: 9.91,
  windDirection: 230,
};

const NULL_BUOY = {
  _placeholder: false,
  buoyId: '46041',
  waveHeight: null,
  wavePeriod: null,
  waterTemperature: null,
  windSpeed: null,
  windDirection: null,
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('BuoyDataHandler', () => {
  describe('canHandle', () => {
    test('returns true for BuoyDataIntent', () => {
      const hi = mockHandlerInput('IntentRequest', 'BuoyDataIntent');
      expect(BuoyDataHandler.canHandle(hi)).toBe(true);
    });

    test('returns false for MarineWeatherIntent', () => {
      const hi = mockHandlerInput('IntentRequest', 'MarineWeatherIntent');
      expect(BuoyDataHandler.canHandle(hi)).toBe(false);
    });

    test('returns false for a LaunchRequest', () => {
      const hi = mockHandlerInput('LaunchRequest');
      expect(BuoyDataHandler.canHandle(hi)).toBe(false);
    });
  });

  describe('handle — missing buoyId slot', () => {
    test('prompts for a buoy station when no buoyId slot is provided', async () => {
      const hi = mockHandlerInput('IntentRequest', 'BuoyDataIntent');
      await BuoyDataHandler.handle(hi);
      const spokenText = hi.responseBuilder.speak.mock.calls[0][0];
      expect(spokenText).toContain('Please specify a buoy station');
    });
  });

  describe('handle — real buoy data', () => {
    test('speaks wave height, period, temperature, and wind', async () => {
      noaaService.getBuoyData.mockResolvedValue(REAL_BUOY);
      const hi = mockHandlerInput('IntentRequest', 'BuoyDataIntent', { buoyId: '46041' });
      await BuoyDataHandler.handle(hi);
      const spokenText = hi.responseBuilder.speak.mock.calls[0][0];
      expect(spokenText).toContain('Wave height');
      expect(spokenText).toContain('wave period');
      expect(spokenText).toContain('water temperature');
      expect(spokenText).toContain('wind');
    });

    test('includes the buoy ID in speech', async () => {
      noaaService.getBuoyData.mockResolvedValue(REAL_BUOY);
      const hi = mockHandlerInput('IntentRequest', 'BuoyDataIntent', { buoyId: '46041' });
      await BuoyDataHandler.handle(hi);
      const spokenText = hi.responseBuilder.speak.mock.calls[0][0];
      expect(spokenText).toContain('46041');
    });

    test('omits null fields from speech', async () => {
      noaaService.getBuoyData.mockResolvedValue(NULL_BUOY);
      const hi = mockHandlerInput('IntentRequest', 'BuoyDataIntent', { buoyId: '46041' });
      await BuoyDataHandler.handle(hi);
      const spokenText = hi.responseBuilder.speak.mock.calls[0][0];
      expect(spokenText).toContain('No data available');
      expect(spokenText).not.toContain('Wave height');
    });

    test('calls getBuoyData with the slot value', async () => {
      noaaService.getBuoyData.mockResolvedValue(REAL_BUOY);
      const hi = mockHandlerInput('IntentRequest', 'BuoyDataIntent', { buoyId: '46087' });
      await BuoyDataHandler.handle(hi);
      expect(noaaService.getBuoyData).toHaveBeenCalledWith('46087');
    });
  });

  describe('handle — error handling', () => {
    test('returns error message when noaaService throws', async () => {
      noaaService.getBuoyData.mockRejectedValue(new Error('Network timeout'));
      const hi = mockHandlerInput('IntentRequest', 'BuoyDataIntent', { buoyId: '46041' });
      await BuoyDataHandler.handle(hi);
      expect(hi.responseBuilder.speak).toHaveBeenCalledWith(MESSAGES.ERROR);
    });
  });
});
