const MarineAlertsHandler = require('../../lambda/handlers/MarineAlertsHandler');
const noaaService = require('../../lambda/services/noaaService');
const { mockHandlerInput } = require('../helpers/mockHandlerInput');
const { MESSAGES } = require('../../lambda/constants');

jest.mock('../../lambda/services/noaaService');

const SAMPLE_ALERTS = [
  { event: 'Small Craft Advisory', headline: 'SCA in effect until 6 PM', description: '...' },
  { event: 'Gale Warning', headline: 'Gale Warning in effect', description: '...' },
];

beforeEach(() => {
  jest.clearAllMocks();
});

describe('MarineAlertsHandler', () => {
  describe('canHandle', () => {
    test('returns true for MarineAlertsIntent', () => {
      const hi = mockHandlerInput('IntentRequest', 'MarineAlertsIntent');
      expect(MarineAlertsHandler.canHandle(hi)).toBe(true);
    });

    test('returns false for MarineWeatherIntent', () => {
      const hi = mockHandlerInput('IntentRequest', 'MarineWeatherIntent');
      expect(MarineAlertsHandler.canHandle(hi)).toBe(false);
    });

    test('returns false for a LaunchRequest', () => {
      const hi = mockHandlerInput('LaunchRequest');
      expect(MarineAlertsHandler.canHandle(hi)).toBe(false);
    });
  });

  describe('handle — missing forecastZone slot', () => {
    test('prompts for a forecast zone when no zone is provided', async () => {
      const hi = mockHandlerInput('IntentRequest', 'MarineAlertsIntent');
      await MarineAlertsHandler.handle(hi);
      const spokenText = hi.responseBuilder.speak.mock.calls[0][0];
      expect(spokenText).toContain('Please specify a forecast zone');
    });
  });

  describe('handle — active alerts', () => {
    test('speaks active alert event names', async () => {
      noaaService.getMarineAlerts.mockResolvedValue(SAMPLE_ALERTS);
      const hi = mockHandlerInput('IntentRequest', 'MarineAlertsIntent', {
        forecastZone: 'PZZ131',
      });
      await MarineAlertsHandler.handle(hi);
      const spokenText = hi.responseBuilder.speak.mock.calls[0][0];
      expect(spokenText).toContain('Small Craft Advisory');
      expect(spokenText).toContain('Gale Warning');
    });

    test('includes zone in speech', async () => {
      noaaService.getMarineAlerts.mockResolvedValue(SAMPLE_ALERTS);
      const hi = mockHandlerInput('IntentRequest', 'MarineAlertsIntent', {
        forecastZone: 'PZZ131',
      });
      await MarineAlertsHandler.handle(hi);
      const spokenText = hi.responseBuilder.speak.mock.calls[0][0];
      expect(spokenText).toContain('PZZ131');
    });

    test('calls getMarineAlerts with the zone slot value', async () => {
      noaaService.getMarineAlerts.mockResolvedValue(SAMPLE_ALERTS);
      const hi = mockHandlerInput('IntentRequest', 'MarineAlertsIntent', {
        forecastZone: 'PZZ136',
      });
      await MarineAlertsHandler.handle(hi);
      expect(noaaService.getMarineAlerts).toHaveBeenCalledWith('PZZ136');
    });
  });

  describe('handle — no active alerts', () => {
    test('returns NO_ALERTS message when alerts array is empty', async () => {
      noaaService.getMarineAlerts.mockResolvedValue([]);
      const hi = mockHandlerInput('IntentRequest', 'MarineAlertsIntent', {
        forecastZone: 'PZZ131',
      });
      await MarineAlertsHandler.handle(hi);
      const spokenText = hi.responseBuilder.speak.mock.calls[0][0];
      expect(spokenText).toContain(MESSAGES.NO_ALERTS);
    });
  });

  describe('handle — error handling', () => {
    test('returns error message when noaaService throws', async () => {
      noaaService.getMarineAlerts.mockRejectedValue(new Error('Network error'));
      const hi = mockHandlerInput('IntentRequest', 'MarineAlertsIntent', {
        forecastZone: 'PZZ131',
      });
      await MarineAlertsHandler.handle(hi);
      expect(hi.responseBuilder.speak).toHaveBeenCalledWith(MESSAGES.ERROR);
    });
  });
});
