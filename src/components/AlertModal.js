import React from 'react'
import PropTypes from 'prop-types'
import { Modal, Container } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faWarning } from '@fortawesome/free-solid-svg-icons'
import AlertList from './AlertList'

function AlertModal({alerts, show, onHide, routes}) {
  return(
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
  )
}

AlertModal.propTypes = {
  alerts: PropTypes.array,
  show: PropTypes.bool,
  onHide: PropTypes.func,
  routes: PropTypes.array
}

AlertModal.defaultProps = {
  alerts: [],
  show: false,
  onHide: () => { console.error('No onHide function set!') },
  routes: []
}

export default AlertModal;
