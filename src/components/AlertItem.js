import {format_timestamp, hex_is_light} from './../util.js';
import './AlertItem.scss'

function AlertItem({alert, route}) {
  const alertStyle = {
    borderColor: (route.route_color) ? '#' + route.route_color : '#eee',
    backgroundColor: (route.route_color) ? '#' + route.route_color : '#eee',
    color: hex_is_light(route.route_color) ? '#000' : '#FFF'
  }

  const alert_cause = (typeof alert.cause !== 'undefined')
    ? (<>{alert.cause} - </>)
    : (<></>)

  const alert_effect = (typeof alert.effect !== 'undefined')
    ? (<>{alert.effect} - </>)
    : (<></>)

  return(
    <div className="card mb-3" style={alertStyle}>
      <div className="card-header">
        <strong>{route.route_short_name} - {route.route_long_name}</strong>
      </div>
      <div className="card-body bg-light text-dark alert-item-text">
        <p>
          <strong>{alert.header_text.translation[0].text}</strong>
        </p>
        {alert.description_text.translation[0].text}
      </div>
      <div className="card-footer alert-item-footer">
        {alert_cause}
        {alert_effect}
        <strong>Posted:</strong> {format_timestamp(alert.active_period[0].start)}
      </div>
    </div>
  )
}

export default AlertItem
