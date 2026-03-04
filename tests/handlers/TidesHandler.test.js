const TidesHandler = require('../../lambda/handlers/TidesHandler');
const tidesService = require('../../lambda/services/tidesService');
const locationService = require('../../lambda/services/locationService');
const { mockHandlerInput } = require('../helpers/mockHandlerInput');
const { MESSAGES } = require('../../lambda/constants');

jest.mock('../../lambda/services/tidesService');
jest.mock('../../lambda/services/locationService');
jest.mock('../../lambda/utils/dateUtils', () => ({
  todayNoaaFormat: jest.fn().mockReturnValue('20240601'),
  formatTideTime: jest.requireActual('../../lambda/utils/dateUtils').formatTideTime,
}));

const SAMPLE_PREDICTIONS = [
  { type: 'L', time: '2024-06-01 04:23', height: 0.42 },
  { type: 'H', time: '2024-06-01 10:51', height: 4.87 },
  { type: 'L', time: '2024-06-01 17:06', height: 0.31 },
  { type: 'H', time: '2024-06-01 23:22', height: 5.01 },
];

beforeEach(() => {
  jest.clearAllMocks();
  locationService.getNearestStationId.mockResolvedValue('8443970');
});

describe('TidesHandler', () => {
  describe('canHandle', () => {
    test('returns true for TidesIntent', () => {
      const hi = mockHandlerInput('IntentRequest', 'TidesIntent');
      expect(TidesHandler.canHandle(hi)).toBe(true);
    });

    test('returns false for MarineWeatherIntent', () => {
      const hi = mockHandlerInput('IntentRequest', 'MarineWeatherIntent');
      expect(TidesHandler.canHandle(hi)).toBe(false);
    });

    test('returns false for a LaunchRequest', () => {
      const hi = mockHandlerInput('LaunchRequest');
      expect(TidesHandler.canHandle(hi)).toBe(false);
    });
  });

  describe('handle — placeholder data (empty array)', () => {
    test('returns placeholder message when no predictions returned', async () => {
      tidesService.getTidePredictions.mockResolvedValue([]);
      const hi = mockHandlerInput('IntentRequest', 'TidesIntent');

      await TidesHandler.handle(hi);

      expect(hi.responseBuilder.speak).toHaveBeenCalledWith(
        expect.stringContaining(MESSAGES.TIDES_PLACEHOLDER),
      );
    });
  });

  describe('handle — real predictions', () => {
    test('speaks all tide events when no tideType slot is set', async () => {
      tidesService.getTidePredictions.mockResolvedValue(SAMPLE_PREDICTIONS);
      const hi = mockHandlerInput('IntentRequest', 'TidesIntent');

      await TidesHandler.handle(hi);

      const spokenText = hi.responseBuilder.speak.mock.calls[0][0];
      expect(spokenText).toContain('High tide');
      expect(spokenText).toContain('Low tide');
    });

    test('filters to high tides only when tideType=high', async () => {
      tidesService.getTidePredictions.mockResolvedValue(SAMPLE_PREDICTIONS);
      const hi = mockHandlerInput('IntentRequest', 'TidesIntent', { tideType: 'high' });

      await TidesHandler.handle(hi);

      const spokenText = hi.responseBuilder.speak.mock.calls[0][0];
      expect(spokenText).toContain('High tide');
      expect(spokenText).not.toContain('Low tide');
    });

    test('filters to low tides only when tideType=low', async () => {
      tidesService.getTidePredictions.mockResolvedValue(SAMPLE_PREDICTIONS);
      const hi = mockHandlerInput('IntentRequest', 'TidesIntent', { tideType: 'low' });

      await TidesHandler.handle(hi);

      const spokenText = hi.responseBuilder.speak.mock.calls[0][0];
      expect(spokenText).toContain('Low tide');
      expect(spokenText).not.toContain('High tide');
    });

    test('uses stationId slot value when provided', async () => {
      tidesService.getTidePredictions.mockResolvedValue(SAMPLE_PREDICTIONS);
      const hi = mockHandlerInput('IntentRequest', 'TidesIntent', { stationId: '8518750' });

      await TidesHandler.handle(hi);

      expect(tidesService.getTidePredictions)
        .toHaveBeenCalledWith('8518750', '20240601', '20240601');
      expect(locationService.getNearestStationId).not.toHaveBeenCalled();
    });

    test('mentions station ID in the response', async () => {
      tidesService.getTidePredictions.mockResolvedValue(SAMPLE_PREDICTIONS);
      const hi = mockHandlerInput('IntentRequest', 'TidesIntent');

      await TidesHandler.handle(hi);

      const spokenText = hi.responseBuilder.speak.mock.calls[0][0];
      expect(spokenText).toContain('8443970');
    });
  });

  describe('handle — empty filtered results', () => {
    test('returns "could not find" message when tideType filter matches nothing', async () => {
      // All predictions are H/L; filtering by an unrecognised letter yields empty
      tidesService.getTidePredictions.mockResolvedValue(SAMPLE_PREDICTIONS);
      const hi = mockHandlerInput('IntentRequest', 'TidesIntent', { tideType: 'x' });

      await TidesHandler.handle(hi);

      const spokenText = hi.responseBuilder.speak.mock.calls[0][0];
      expect(spokenText).toContain('could not find');
      expect(spokenText).toContain('x');
    });
  });

  describe('handle — error handling', () => {
    test('returns error message when tidesService throws', async () => {
      tidesService.getTidePredictions.mockRejectedValue(new Error('Timeout'));
      const hi = mockHandlerInput('IntentRequest', 'TidesIntent');

      await TidesHandler.handle(hi);

      expect(hi.responseBuilder.speak).toHaveBeenCalledWith(MESSAGES.ERROR);
    });
  });
});
