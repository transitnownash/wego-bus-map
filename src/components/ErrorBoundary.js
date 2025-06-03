import React from 'react';
import PropTypes from 'prop-types';
import { trace } from '@opentelemetry/api';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(_error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    this.setState({ error });
    // You can also log the error to an error reporting service
    console.error(error, info);
    try {
      const tracer = trace.getTracer('react-error-boundary');
      tracer.startActiveSpan('React ErrorBoundary', span => {
        span.recordException(error);
        span.setAttribute('component', 'ErrorBoundary');
        span.setAttribute('react.error.info', JSON.stringify(info));
        if (typeof window !== 'undefined') {
          span.setAttribute('window.location', window.location.href);
          span.setAttribute('window.pathname', window.location.pathname);
          span.setAttribute('window.hash', window.location.hash);
          span.setAttribute('window.search', window.location.search);
          span.setAttribute('user_agent', window.navigator.userAgent);
        }
        span.setStatus({ code: 2, message: error.message }); // 2 = ERROR
        span.end();
      });
    } catch (e) {
      // fail silently if telemetry is not available
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <>
          <div className="container">
          <div className="card border-danger my-3">
            <div className="card-header bg-danger text-bg-danger">Site Error</div>
              <div className="card-body text-center">
                <p>An unexpected error has ocurred. Try reloading the page or wait a few moments before trying again.</p>
                {this.state.error
                  && (<div className="bg-light p-3 text-start" style={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>{JSON.stringify(this.state.error.message)}</div>)
                }
                <a href="" className="btn btn-primary">Reload Page</a>
              </div>
            </div>
          </div>
        </>
      );
    }
    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ErrorBoundary;
