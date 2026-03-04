const Alexa = require('ask-sdk-core');

const LaunchRequestHandler = require('./handlers/LaunchRequestHandler');
const MarineWeatherHandler = require('./handlers/MarineWeatherHandler');
const TidesHandler = require('./handlers/TidesHandler');
const BuoyDataHandler = require('./handlers/BuoyDataHandler');
const MarineAlertsHandler = require('./handlers/MarineAlertsHandler');
const HelpIntentHandler = require('./handlers/HelpIntentHandler');
const CancelAndStopIntentHandler = require('./handlers/CancelAndStopIntentHandler');
const SessionEndedRequestHandler = require('./handlers/SessionEndedRequestHandler');
const IntentReflectorHandler = require('./handlers/IntentReflectorHandler');
const ErrorHandler = require('./handlers/ErrorHandler');

exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    LaunchRequestHandler,
    MarineWeatherHandler,
    TidesHandler,
    BuoyDataHandler,
    MarineAlertsHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler,
    IntentReflectorHandler, // catch-all — must be last
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
