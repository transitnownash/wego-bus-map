import { getWebInstrumentations, initializeFaro } from '@grafana/faro-web-sdk';
import { TracingInstrumentation } from '@grafana/faro-web-tracing';

const faroUrl = import.meta.env.VITE_FARO_URL;
const gtfsBaseUrl = import.meta.env.VITE_GTFS_BASE_URL;
if (!faroUrl) {
  console.warn('Faro URL not set; Grafana Frontend Observability is disabled.');
} else {
  initializeFaro({
    url: faroUrl,
    app: {
      name: 'wego-bus-map',
      environment: import.meta.env.MODE,
    },
    instrumentations: [
      ...getWebInstrumentations(),
      new TracingInstrumentation({
        instrumentationOptions: {
          propagateTraceHeaderCorsUrls: gtfsBaseUrl
            ? [new RegExp(`^${gtfsBaseUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`)]
            : [],
        },
      }),
    ],
  });
}
