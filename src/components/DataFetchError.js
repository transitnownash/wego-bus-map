import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import NoMatch from '../controllers/NoMatch';
import TitleBar from './TitleBar';
import Footer from './Footer';

function DataFetchError({ error }) {
  const navigate = useNavigate();

  // Send error context to browser
  console.error(error);

  let errorMessage = '';
  switch (error.name) {
    case 'AbortError':
      errorMessage = 'The API request took too long and was canceled.';
      break;
    case 'AxiosError':
      errorMessage = `${error.code}: ${error.message}`;
      break;
    default:
      errorMessage = `An unexpected error has ocurred: ${error.message}]`;
  }

  // Error returned was a 404, switch to that instead
  if (typeof error.response !== 'undefined' && error.response.status === 404) {
    return (<NoMatch></NoMatch>);
  }

  return (
    <>
      <TitleBar></TitleBar>
      <div className="container">
        <div className="card border-danger my-3">
          <div className="card-header bg-danger text-bg-danger">Site Error</div>
          <div className="card-body text-center">
            <p>{errorMessage}</p>
            <p>Try reloading the page or wait a few moments before trying again.</p>
            <Button onClick={() => navigate(0)}>Reload Page</Button>
          </div>
        </div>
        <details className="text-muted">
          <summary>{error.name} - {error.message}</summary>
          {error.response && (
            <span>
              <br />
              <pre>{JSON.stringify(error.response, null, 2)}</pre>
            </span>
          )}
        </details>
      </div>
      <Footer></Footer>
    </>
  );
}

DataFetchError.propTypes = {
  error: PropTypes.any.isRequired,
};

export default DataFetchError;
