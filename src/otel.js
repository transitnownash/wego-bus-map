// OpenTelemetry initialization for Honeycomb.io in a CRA app
import { HoneycombWebSDK } from '@honeycombio/opentelemetry-web';
import { getWebAutoInstrumentations } from '@opentelemetry/auto-instrumentations-web';

const honeycombApiKey = process.env.REACT_APP_HONEYCOMB_API_KEY;
if (!honeycombApiKey) {
  // Skip tracing setup if no API key is present
  console.warn('Honeycomb API key not set; OpenTelemetry tracing is disabled.');
} else {
  const sdk = new HoneycombWebSDK({
    debug: true, // Set to false for production
    apiKey: honeycombApiKey,
    serviceName: process.env.REACT_APP_OTEL_SERVICE_NAME,
    instrumentations: [getWebAutoInstrumentations({
      '@opentelemetry/instrumentation-xml-http-request': { ignoreNetworkEvents: true },
      '@opentelemetry/instrumentation-fetch': { ignoreNetworkEvents: true },
      '@opentelemetry/instrumentation-document-load': { ignoreNetworkEvents: true },
    })],
  });

  sdk.start();
}
