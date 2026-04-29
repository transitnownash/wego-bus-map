import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Container } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWarning } from '@fortawesome/free-solid-svg-icons';
import AlertList from './AlertList';

function AlertModal({
  alerts, routes, show, onHide,
}) {
  return (
    <Modal show={show} onHide={onHide} aria-labelledby="alerts_modal">
      <Modal.Header closeButton>
        <Modal.Title id="alerts_modal">
          <FontAwesomeIcon icon={faWarning} fixedWidth></FontAwesomeIcon> Service Alerts
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Container>
          <AlertList alerts={alerts} routes={routes}></AlertList>
        </Container>
      </Modal.Body>
    </Modal>
  );
}

AlertModal.propTypes = {
  alerts: PropTypes.array.isRequired,
  routes: PropTypes.array.isRequired,
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
};

export default AlertModal;
