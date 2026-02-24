const LaunchRequestHandler = require('../../lambda/handlers/LaunchRequestHandler');
const { mockHandlerInput } = require('../helpers/mockHandlerInput');
const { MESSAGES } = require('../../lambda/constants');

describe('LaunchRequestHandler', () => {
  describe('canHandle', () => {
    test('returns true for a LaunchRequest', () => {
      const handlerInput = mockHandlerInput('LaunchRequest');
      expect(LaunchRequestHandler.canHandle(handlerInput)).toBe(true);
    });

    test('returns false for an IntentRequest', () => {
      const handlerInput = mockHandlerInput('IntentRequest', 'MarineWeatherIntent');
      expect(LaunchRequestHandler.canHandle(handlerInput)).toBe(false);
    });

    test('returns false for a SessionEndedRequest', () => {
      const handlerInput = mockHandlerInput('SessionEndedRequest');
      expect(LaunchRequestHandler.canHandle(handlerInput)).toBe(false);
    });
  });

  describe('handle', () => {
    test('calls speak with the launch message', () => {
      const handlerInput = mockHandlerInput('LaunchRequest');
      LaunchRequestHandler.handle(handlerInput);
      expect(handlerInput.responseBuilder.speak).toHaveBeenCalledWith(MESSAGES.LAUNCH);
    });

    test('returns a response object', () => {
      const handlerInput = mockHandlerInput('LaunchRequest');
      const response = LaunchRequestHandler.handle(handlerInput);
      expect(response).toBeDefined();
    });
  });
});
