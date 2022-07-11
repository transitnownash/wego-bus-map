import React from 'react';
import PropTypes from 'prop-types';
import TitleBar from './TitleBar';
import Footer from './Footer';
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function DataFetchError({error}) {
  const navigate = useNavigate();

  let errorMessage = '';
  switch (error.name) {
    case 'AbortError':
      errorMessage = 'The API request took too long and was canceled.';
      break;
    default:
      errorMessage = 'An unexpected error has ocurred.';
      break;
  }

  return(
    <>
      <TitleBar></TitleBar>
      <div className="container">
        <div className="card border-danger my-3">
          <div className="card-header bg-danger text-light">Site Error</div>
          <div className="card-body text-center">
            <p>{errorMessage}</p>
            <p>Try reloading the page or wait a few moments before trying again.</p>
            <Button onClick={() => navigate(0)}>Reload Page</Button>
          </div>
        </div>
        <details className="text-muted">
          <summary>Details</summary>
          {error.name} - {error.message}
        </details>
      </div>
      <Footer></Footer>
    </>
  );
}

DataFetchError.propTypes = {
  error: PropTypes.instanceOf(DOMException)
};

export default DataFetchError;
