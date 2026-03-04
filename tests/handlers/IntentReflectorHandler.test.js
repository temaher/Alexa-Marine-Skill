const IntentReflectorHandler = require('../../lambda/handlers/IntentReflectorHandler');
const { mockHandlerInput } = require('../helpers/mockHandlerInput');
const { MESSAGES } = require('../../lambda/constants');

describe('IntentReflectorHandler', () => {
  describe('canHandle', () => {
    test('returns true for any IntentRequest', () => {
      const hi = mockHandlerInput('IntentRequest', 'SomeUnknownIntent');
      expect(IntentReflectorHandler.canHandle(hi)).toBe(true);
    });

    test('returns false for a LaunchRequest', () => {
      const hi = mockHandlerInput('LaunchRequest');
      expect(IntentReflectorHandler.canHandle(hi)).toBe(false);
    });

    test('returns false for a SessionEndedRequest', () => {
      const hi = mockHandlerInput('SessionEndedRequest');
      expect(IntentReflectorHandler.canHandle(hi)).toBe(false);
    });
  });

  describe('handle', () => {
    test('speaks the fallback message', () => {
      const hi = mockHandlerInput('IntentRequest', 'SomeUnknownIntent');
      IntentReflectorHandler.handle(hi);
      expect(hi.responseBuilder.speak).toHaveBeenCalledWith(MESSAGES.FALLBACK);
    });

    test('adds a reprompt with the launch reprompt', () => {
      const hi = mockHandlerInput('IntentRequest', 'SomeUnknownIntent');
      IntentReflectorHandler.handle(hi);
      expect(hi.responseBuilder.reprompt).toHaveBeenCalledWith(MESSAGES.LAUNCH_REPROMPT);
    });

    test('returns a response object', () => {
      const hi = mockHandlerInput('IntentRequest', 'SomeUnknownIntent');
      const response = IntentReflectorHandler.handle(hi);
      expect(response).toBeDefined();
    });
  });
});
