const SessionEndedRequestHandler = require('../../lambda/handlers/SessionEndedRequestHandler');
const { mockHandlerInput } = require('../helpers/mockHandlerInput');

describe('SessionEndedRequestHandler', () => {
  describe('canHandle', () => {
    test('returns true for a SessionEndedRequest', () => {
      const hi = mockHandlerInput('SessionEndedRequest');
      expect(SessionEndedRequestHandler.canHandle(hi)).toBe(true);
    });

    test('returns false for an IntentRequest', () => {
      const hi = mockHandlerInput('IntentRequest', 'MarineWeatherIntent');
      expect(SessionEndedRequestHandler.canHandle(hi)).toBe(false);
    });

    test('returns false for a LaunchRequest', () => {
      const hi = mockHandlerInput('LaunchRequest');
      expect(SessionEndedRequestHandler.canHandle(hi)).toBe(false);
    });
  });

  describe('handle', () => {
    test('returns a response object without speaking', () => {
      const hi = mockHandlerInput('SessionEndedRequest');
      const response = SessionEndedRequestHandler.handle(hi);
      expect(response).toBeDefined();
      expect(hi.responseBuilder.speak).not.toHaveBeenCalled();
    });
  });
});
