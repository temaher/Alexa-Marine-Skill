# CLAUDE.md — Alexa Marine Skill

This file documents the project structure, development workflows, and conventions
for the Alexa Marine Skill. It is intended to help AI assistants (and new developers)
understand the codebase and work effectively in it.

---

## Project Overview

**Alexa-Marine-Skill** is an Amazon Alexa custom skill that provides marine and
nautical information to users via voice. Typical capabilities include:

- Marine weather forecasts (wind, wave height, swell, visibility)
- Tidal predictions (high/low tide times and heights)
- NOAA buoy and station data (water temperature, wave period, current conditions)
- Coastal and offshore forecast zones
- Sunrise/sunset and moon phase for navigation

The skill is deployed as an AWS Lambda function and invoked by the Alexa service.

---

## Repository Structure

```
Alexa-Marine-Skill/
├── lambda/                      # Lambda function source code
│   ├── index.js (or index.ts)   # Entry point – exports `handler`
│   ├── handlers/                # Individual intent handlers
│   │   ├── LaunchRequestHandler.js
│   │   ├── MarineWeatherHandler.js
│   │   ├── TidesHandler.js
│   │   ├── HelpIntentHandler.js
│   │   ├── CancelAndStopIntentHandler.js
│   │   └── SessionEndedRequestHandler.js
│   ├── services/                # External API clients
│   │   ├── noaaService.js       # NOAA CO-OPS / NWS API calls
│   │   ├── tidesService.js      # Tide prediction logic
│   │   └── locationService.js   # Resolve user location to nearest station
│   ├── utils/                   # Shared helpers
│   │   ├── speechUtils.js       # SSML building helpers
│   │   └── dateUtils.js         # Date/time formatting
│   ├── constants.js             # Skill ID, API base URLs, slot values
│   └── package.json             # Lambda dependencies
├── interactionModels/
│   └── custom/
│       └── en-US.json           # Alexa interaction model (intents, slots, utterances)
├── skill-package/
│   └── skill.json               # Skill manifest (invocation name, endpoints, permissions)
├── tests/                       # Unit and integration tests
│   ├── handlers/
│   └── services/
├── .ask/                        # ASK CLI configuration
│   └── ask-states.json
├── .env.example                 # Template for required environment variables
├── package.json                 # Root-level scripts (deploy, test, lint)
├── .eslintrc.js                 # ESLint configuration
├── .prettierrc                  # Prettier configuration
└── CLAUDE.md                    # This file
```

---

## Technology Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 18.x (AWS Lambda) |
| Alexa SDK | `ask-sdk-core` v2, `ask-sdk-model` |
| HTTP client | `axios` |
| Testing | Jest + `ask-sdk-test` |
| Linting | ESLint (Airbnb config) + Prettier |
| Deployment | ASK CLI v2 (`ask deploy`) |
| CI | GitHub Actions |

---

## Development Setup

### Prerequisites

- Node.js 18+
- AWS CLI configured with a deployment role
- ASK CLI v2: `npm install -g ask-cli`
- An Amazon Developer account with the skill registered

### Install

```bash
npm install            # root-level tooling
cd lambda && npm install  # Lambda dependencies
```

### Environment Variables

Copy `.env.example` to `.env` and fill in values:

```
ASK_SKILL_ID=amzn1.ask.skill.<uuid>
NOAA_API_BASE=https://api.tidesandcurrents.noaa.gov/api/prod/datagetter
NWS_API_BASE=https://api.weather.gov
DEFAULT_STATION_ID=8443970   # fallback NOAA station
```

**Never commit `.env` to source control.**

---

## Key Conventions

### Intent Handlers

Each intent is a separate file in `lambda/handlers/`. Every handler must export an
object conforming to the `RequestHandler` interface:

```js
const MarineWeatherHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === 'MarineWeatherIntent'
    );
  },
  async handle(handlerInput) {
    // ...
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(repromptText)
      .getResponse();
  },
};

module.exports = MarineWeatherHandler;
```

Register handlers in `index.js` in priority order:

```js
exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    LaunchRequestHandler,
    MarineWeatherHandler,
    TidesHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler,
    IntentReflectorHandler,   // catch-all, must be last
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
```

### Interaction Model (`en-US.json`)

- All marine-specific slot types live under `languageModel.types`.
- When adding a new intent, add it to `languageModel.intents` **and** define at
  least 10 sample utterances.
- Keep utterances natural and varied; Alexa's NLU benefits from paraphrase diversity.
- Slot names use camelCase: `{stationId}`, `{forecastZone}`, `{tideType}`.

### SSML Speech

- Build all speech strings using the helpers in `utils/speechUtils.js`.
- Avoid raw SSML strings scattered through handler files.
- Use `<break time="500ms"/>` to pace lists of data points.
- Keep each Alexa turn under ~8 seconds of audio.

### External API Calls

- All outbound HTTP calls go through a service module in `lambda/services/`.
- Use `axios` with a timeout of 5000ms.
- Always handle API errors gracefully and return a user-friendly Alexa reprompt rather
  than throwing.
- NOAA API responses use metric or US customary units depending on the `units`
  parameter; default to `english` (US customary).

### Error Handling

- The top-level `ErrorHandler` in `index.js` catches all unhandled errors and
  responds with a generic apology speech string.
- Log errors with `console.error(error)` so CloudWatch captures them.
- Do not expose raw error messages or stack traces to the user in speech.

---

## Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run a single test file
npx jest tests/handlers/MarineWeatherHandler.test.js
```

Tests use `ask-sdk-test` to simulate `HandlerInput` objects without a live Alexa
endpoint. Mock all external HTTP calls with `jest.mock` or `nock`.

**Required coverage thresholds** (enforced in CI):
- Statements: 80%
- Branches: 75%
- Functions: 80%

---

## Deployment

```bash
# Build and deploy to dev stage
ask deploy --profile default

# Deploy only the Lambda (skip skill manifest / model)
ask deploy --target lambda

# Deploy interaction model only
ask deploy --target skill-metadata
```

The ASK CLI reads endpoint ARN and skill ID from `.ask/ask-states.json`. Do not
edit that file manually.

### Stages

| Stage | Lambda alias | Purpose |
|---|---|---|
| `development` | `dev` | Local testing, feature work |
| `staging` | `staging` | Pre-release QA with real Alexa devices |
| `production` | `live` | Published skill |

---

## CI/CD (GitHub Actions)

The workflow (`.github/workflows/ci.yml`) runs on every push and PR:

1. `npm ci` — install dependencies
2. `npm run lint` — ESLint + Prettier check
3. `npm test` — Jest with coverage enforcement
4. On merge to `main` — `ask deploy` to the `staging` Lambda alias

Production promotion is manual via the Amazon Developer Console or a separate
workflow with an approval gate.

---

## Adding a New Feature

1. **Define the intent** in `interactionModels/custom/en-US.json` with intents,
   slots, and sample utterances.
2. **Create the handler** in `lambda/handlers/<FeatureName>Handler.js`.
3. **Add any external calls** in a service file under `lambda/services/`.
4. **Register the handler** in `lambda/index.js` before the catch-all reflector.
5. **Write unit tests** in `tests/handlers/` and `tests/services/`.
6. **Update `skill.json`** if new permissions are required (e.g., device address).
7. **Deploy** to the dev stage and test with the Alexa Developer Console simulator.

---

## Common NOAA Endpoints Used

| Data Type | Endpoint |
|---|---|
| Water level / tides | `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter` |
| Meteorological data | `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?product=wind` |
| Marine forecast | `https://api.weather.gov/zones/forecast/{zone}` |
| Active alerts | `https://api.weather.gov/alerts/active?zone={zone}` |
| Buoy observations | `https://www.ndbc.noaa.gov/data/realtime2/{stationId}.txt` |

All NOAA/NWS APIs are free and do not require an API key, but requests should
include a `User-Agent` header per NWS API policy:

```js
headers: { 'User-Agent': 'AlexaMarineSkill/1.0 (contact@example.com)' }
```

---

## Skill Permissions

The skill requests the following Alexa permissions (declared in `skill.json`):

- `alexa::devices:all:address:country_and_postal_code:read` — resolve user
  location to nearest NOAA station

No payments, account linking, or ISP features are used.

---

## Coding Style

- ES2020+ features are fine; avoid `var`, prefer `const`/`let`.
- Async handlers use `async/await`, not raw Promises or callbacks.
- Maximum line length: 100 characters.
- Single quotes for strings; trailing commas in multi-line structures.
- Run `npm run lint:fix` before committing to auto-fix formatting issues.

---

## Useful Commands

```bash
npm run lint          # Lint all JS files
npm run lint:fix      # Auto-fix lint/formatting issues
npm test              # Run Jest test suite
npm run test:watch    # Watch mode for TDD
ask deploy            # Full deploy (Lambda + model + manifest)
ask dialog            # Interactive voice simulation in the terminal
ask run               # Start local Lambda tunnel for Alexa testing
```

---

## Glossary

| Term | Meaning |
|---|---|
| **Station** | A NOAA tidal/meteorological station (identified by a numeric ID) |
| **Forecast zone** | NWS zone code for marine forecasts (e.g., `ANZ335`) |
| **Buoy** | NDBC data buoy, identified by 5-char station ID (e.g., `44025`) |
| **SSML** | Speech Synthesis Markup Language — XML dialect used in Alexa responses |
| **HandlerInput** | The `ask-sdk-core` object passed to every handler; contains request envelope, attributes manager, response builder |
| **Intent** | A named action the user wants to perform (maps to a handler) |
| **Slot** | A variable within an utterance (e.g., `{city}` in "weather in {city}") |
| **Reprompt** | A follow-up speech prompt read if the user doesn't respond |
