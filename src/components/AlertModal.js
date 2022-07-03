import { Modal, Container } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWarning } from '@fortawesome/free-solid-svg-icons';
import AlertItem from './AlertItem';

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
          {alerts.map((item, _index) => {
            let route = routes.find(r => r.route_gid === item.alert.informed_entity[0].route_id)
            return(
              <AlertItem key={item.id} alert={item.alert} route={route}></AlertItem>
            )
          })}
        </Container>
      </Modal.Body>
    </Modal>
  )
}

export default AlertModal;
