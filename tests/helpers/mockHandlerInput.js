/**
 * Creates a minimal mock HandlerInput object suitable for testing handlers.
 *
 * @param {string} requestType  - 'LaunchRequest', 'IntentRequest', 'SessionEndedRequest'
 * @param {string} [intentName] - Intent name (required when requestType === 'IntentRequest')
 * @param {Object} [slots={}]   - Map of slot name → { value }
 * @returns {Object} Mock HandlerInput
 */
function mockHandlerInput(requestType, intentName = '', slots = {}) {
  const formattedSlots = Object.fromEntries(
    Object.entries(slots).map(([name, value]) => [name, { name, value }]),
  );

  const request = requestType === 'IntentRequest'
    ? {
      type: 'IntentRequest',
      intent: {
        name: intentName,
        slots: formattedSlots,
      },
    }
    : { type: requestType, reason: 'USER_INITIATED' };

  const speakMock = jest.fn();
  const repromptMock = jest.fn();
  const getResponseMock = jest.fn().mockReturnValue({ type: 'mock-response' });

  // Each builder method returns `this` so calls can be chained
  speakMock.mockReturnValue({
    reprompt: repromptMock.mockReturnValue({ getResponse: getResponseMock }),
    getResponse: getResponseMock,
  });

  return {
    requestEnvelope: {
      request,
      context: {
        System: {
          device: { deviceId: 'test-device-id' },
          apiEndpoint: 'https://api.amazonalexa.com',
          apiAccessToken: 'test-token',
        },
      },
      session: { new: true, sessionId: 'test-session-id' },
    },
    responseBuilder: {
      speak: speakMock,
      reprompt: repromptMock,
      getResponse: getResponseMock,
    },
    attributesManager: {
      getSessionAttributes: jest.fn().mockReturnValue({}),
      setSessionAttributes: jest.fn(),
      getPersistentAttributes: jest.fn().mockResolvedValue({}),
      setPersistentAttributes: jest.fn(),
    },
    serviceClientFactory: {},
  };
}

module.exports = { mockHandlerInput };
