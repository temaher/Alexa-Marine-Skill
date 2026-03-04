const HelpIntentHandler = require('../../lambda/handlers/HelpIntentHandler');
const { mockHandlerInput } = require('../helpers/mockHandlerInput');
const { MESSAGES } = require('../../lambda/constants');

describe('HelpIntentHandler', () => {
  describe('canHandle', () => {
    test('returns true for AMAZON.HelpIntent', () => {
      const hi = mockHandlerInput('IntentRequest', 'AMAZON.HelpIntent');
      expect(HelpIntentHandler.canHandle(hi)).toBe(true);
    });

    test('returns false for other intents', () => {
      const hi = mockHandlerInput('IntentRequest', 'MarineWeatherIntent');
      expect(HelpIntentHandler.canHandle(hi)).toBe(false);
    });

    test('returns false for a LaunchRequest', () => {
      const hi = mockHandlerInput('LaunchRequest');
      expect(HelpIntentHandler.canHandle(hi)).toBe(false);
    });
  });

  describe('handle', () => {
    test('speaks the help message', () => {
      const hi = mockHandlerInput('IntentRequest', 'AMAZON.HelpIntent');
      HelpIntentHandler.handle(hi);
      expect(hi.responseBuilder.speak).toHaveBeenCalledWith(MESSAGES.HELP);
    });

    test('sets a reprompt with the help message', () => {
      const hi = mockHandlerInput('IntentRequest', 'AMAZON.HelpIntent');
      HelpIntentHandler.handle(hi);
      expect(hi.responseBuilder.reprompt).toHaveBeenCalledWith(MESSAGES.HELP);
    });

    test('returns a response object', () => {
      const hi = mockHandlerInput('IntentRequest', 'AMAZON.HelpIntent');
      const response = HelpIntentHandler.handle(hi);
      expect(response).toBeDefined();
    });
  });
});
