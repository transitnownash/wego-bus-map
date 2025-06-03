import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import Footer from '../components/Footer';
import TitleBar from '../components/TitleBar';
import { trace } from '@opentelemetry/api';

function NoMatch() {
  React.useEffect(() => {
    try {
      const tracer = trace.getTracer('react-404');
      tracer.startActiveSpan('404 Not Found', span => {
        span.recordException({
          name: 'NotFound',
          message: '404 page rendered (NoMatch component)'
        });
        span.setAttribute('component', 'NoMatch');
        span.setStatus({ code: 2, message: '404 Not Found' });
        span.end();
      });
    } catch (e) {
      // fail silently if telemetry is not available
    }
  }, []);

  return (
    <div>
      <TitleBar></TitleBar>
      <div className="container my-5 p-5 text-center">
        <h1><FontAwesomeIcon icon={faExclamationTriangle} /> Detour in Effect</h1>
        <p className="lead my-3">(You seem to have wandered off the route.)</p>
        <p>The content you were are looking for is not here.</p>
        <p>
          <Link to="/">Go to the Map</Link>
        </p>
      </div>
      <Footer></Footer>
    </div>
  );
}

export default NoMatch;
