const ErrorHandler = require('../../lambda/handlers/ErrorHandler');
const { mockHandlerInput } = require('../helpers/mockHandlerInput');
const { MESSAGES } = require('../../lambda/constants');

describe('ErrorHandler', () => {
  describe('canHandle', () => {
    test('always returns true', () => {
      expect(ErrorHandler.canHandle()).toBe(true);
    });
  });

  describe('handle', () => {
    test('speaks the error message', () => {
      const hi = mockHandlerInput('LaunchRequest');
      ErrorHandler.handle(hi, new Error('something went wrong'));
      expect(hi.responseBuilder.speak).toHaveBeenCalledWith(MESSAGES.ERROR);
    });

    test('adds a reprompt', () => {
      const hi = mockHandlerInput('LaunchRequest');
      ErrorHandler.handle(hi, new Error('oops'));
      expect(hi.responseBuilder.reprompt).toHaveBeenCalledWith(MESSAGES.LAUNCH_REPROMPT);
    });

    test('returns a response object', () => {
      const hi = mockHandlerInput('LaunchRequest');
      const response = ErrorHandler.handle(hi, new Error('oops'));
      expect(response).toBeDefined();
    });
  });
});
