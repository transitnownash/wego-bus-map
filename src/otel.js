// OpenTelemetry initialization for Honeycomb.io in a CRA app
import { HoneycombWebSDK } from '@honeycombio/opentelemetry-web';
import { getWebAutoInstrumentations } from '@opentelemetry/auto-instrumentations-web';

const honeycombApiKey = import.meta.env.VITE_HONEYCOMB_API_KEY;
if (!honeycombApiKey) {
  // Skip tracing setup if no API key is present
  console.warn('Honeycomb API key not set; OpenTelemetry tracing is disabled.');
} else {
  const sdk = new HoneycombWebSDK({
    debug: true, // Set to false for production
    apiKey: honeycombApiKey,
    serviceName: import.meta.env.VITE_OTEL_SERVICE_NAME,
    instrumentations: [getWebAutoInstrumentations({
      '@opentelemetry/instrumentation-xml-http-request': { ignoreNetworkEvents: true },
      '@opentelemetry/instrumentation-fetch': { ignoreNetworkEvents: true },
      '@opentelemetry/instrumentation-document-load': { ignoreNetworkEvents: true },
      // Disabled: @opentelemetry/instrumentation-user-interaction@0.65.0 crashes with
      // "Invalid value used as weak map key" when patching addEventListener calls whose
      // `this` is undefined (e.g. from web-vitals). Fixed upstream but not yet released:
      // https://github.com/open-telemetry/opentelemetry-js-contrib/issues/3639
      '@opentelemetry/instrumentation-user-interaction': { enabled: false },
    })],
  });

  sdk.start();
}
