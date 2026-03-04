const CancelAndStopIntentHandler = require('../../lambda/handlers/CancelAndStopIntentHandler');
const { mockHandlerInput } = require('../helpers/mockHandlerInput');
const { MESSAGES } = require('../../lambda/constants');

describe('CancelAndStopIntentHandler', () => {
  describe('canHandle', () => {
    test('returns true for AMAZON.CancelIntent', () => {
      const hi = mockHandlerInput('IntentRequest', 'AMAZON.CancelIntent');
      expect(CancelAndStopIntentHandler.canHandle(hi)).toBe(true);
    });

    test('returns true for AMAZON.StopIntent', () => {
      const hi = mockHandlerInput('IntentRequest', 'AMAZON.StopIntent');
      expect(CancelAndStopIntentHandler.canHandle(hi)).toBe(true);
    });

    test('returns false for other intents', () => {
      const hi = mockHandlerInput('IntentRequest', 'MarineWeatherIntent');
      expect(CancelAndStopIntentHandler.canHandle(hi)).toBe(false);
    });

    test('returns false for a LaunchRequest', () => {
      const hi = mockHandlerInput('LaunchRequest');
      expect(CancelAndStopIntentHandler.canHandle(hi)).toBe(false);
    });
  });

  describe('handle', () => {
    test('speaks the cancel message', () => {
      const hi = mockHandlerInput('IntentRequest', 'AMAZON.CancelIntent');
      CancelAndStopIntentHandler.handle(hi);
      expect(hi.responseBuilder.speak).toHaveBeenCalledWith(MESSAGES.CANCEL);
    });

    test('returns a response object', () => {
      const hi = mockHandlerInput('IntentRequest', 'AMAZON.StopIntent');
      const response = CancelAndStopIntentHandler.handle(hi);
      expect(response).toBeDefined();
    });
  });
});
