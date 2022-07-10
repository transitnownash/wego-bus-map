import React from 'react';
import PropTypes from 'prop-types';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(_error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({error: error})
    // You can also log the error to an error reporting service
    console.error(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return(
        <>
          <div className="container">
            <div className="card my-3 border-danger">
              <div className="card-header bg-danger text-light">Site Error</div>
              <div className="card-body">An unexpected error has ocurred. Try reloading the page or wait a few moments before trying again.</div>
              {this.state.error &&
                (<div className="card-body"><div className="bg-light p-3" style={{fontFamily: 'monospace', whiteSpace: 'pre-wrap'}}>{JSON.stringify(this.state.error.message)}</div></div>)
              }
            </div>
          </div>
        </>
      );
    }
    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired
}

export default ErrorBoundary;
