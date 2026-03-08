module.exports = {
  SKILL_NAME: 'Marine Skill',

  // External API base URLs (overridable via environment variables)
  NOAA_API_BASE:
    process.env.NOAA_API_BASE
    || 'https://api.tidesandcurrents.noaa.gov/api/prod/datagetter',
  NWS_API_BASE: process.env.NWS_API_BASE || 'https://api.weather.gov',
  NDBC_BASE:
    process.env.NDBC_BASE || 'https://www.ndbc.noaa.gov/data/realtime2',

  // Fallback NOAA station: Seattle, WA — Puget Sound / Elliott Bay (9447130)
  DEFAULT_STATION_ID: process.env.DEFAULT_STATION_ID || '9447130',

  HTTP_TIMEOUT: 5000,

  // Canned speech strings
  MESSAGES: {
    LAUNCH:
      'Welcome to Marine Skill. You can ask me for marine weather, '
      + 'tide predictions, or buoy conditions. What would you like to know?',
    LAUNCH_REPROMPT:
      'Try asking for marine weather, tide times, buoy conditions, or marine alerts. '
      + 'What would you like?',
    HELP:
      'You can ask for marine weather by saying "what is the marine weather", '
      + 'get tide information by saying "when is high tide", '
      + 'check buoy conditions by saying "buoy data for Cape Elizabeth", '
      + 'or ask "are there any marine alerts". '
      + 'What would you like to know?',
    CANCEL: 'Goodbye, and stay safe on the water!',
    ERROR:
      'Sorry, I had trouble getting that information. Please try again.',
    WEATHER_PLACEHOLDER:
      'Marine weather data integration is coming soon. '
      + 'I will be able to provide wind speed, wave height, and visibility conditions.',
    TIDES_PLACEHOLDER:
      'Tide prediction data integration is coming soon. '
      + 'I will be able to provide high and low tide times and heights.',
    BUOY_PLACEHOLDER:
      'Buoy observation data integration is coming soon. '
      + 'I will be able to report wave period, water temperature, and swell direction.',
    NO_ALERTS: 'There are no active marine alerts for that zone.',
    LOCATION_PERMISSION_REQUIRED:
      'To find your nearest station, I need access to your device location. '
      + 'Please open the Alexa app to grant location permission.',
    FALLBACK:
      "Sorry, I'm not sure how to help with that. "
      + 'Try asking for marine weather, tide times, buoy conditions, or marine alerts.',
  },
};
