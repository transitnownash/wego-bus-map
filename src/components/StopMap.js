import React from 'react';
import PropTypes from 'prop-types';
import { MapContainer, TileLayer, LayersControl, LayerGroup } from 'react-leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './TransitMap.scss';
import './StopMarker';
import LocationMarker from './LocationMarker';
import StopMarker from './StopMarker';

// Fix paths for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
	iconUrl: markerIcon,
	iconRetinaUrl: markerIcon2x,
	shadowUrl: markerShadow,
});

function StopMap({stops, alerts, map, mapControls, center, zoom}) {
  const getStopAlertsById = function (stopCode) {
    let stopAlerts = [];
    alerts.forEach(a => {
      a.alert.informed_entity.forEach(e => {
        if (e.stop_id === stopCode) {
          stopAlerts.push(a);
        }
      });
    });
    return stopAlerts;
  };

  const cityMaxBounds = [
    [36.725005, -87.579122], // northwest
    [35.541600, -86.097066]  // southeast
  ];

  return(
    <MapContainer ref={map} className="map-container" center={center} zoom={zoom} scrollWheelZoom={true} maxBounds={cityMaxBounds} doubleClickZoom={false}>
      <TileLayer
        attribution='&copy; <a href="http://www.openstreetmap.org/copyright" target="blank">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions" target="blank">CartoDB</a>; <a href="http://www.wegotransit.com" target="blank">WeGo</a>'
        url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}{r}.png"
        subdomains='abcd'
        minZoom={11}
        maxZoom={19}
      />
      <LayersControl position="topright">
        {stops.length > 0 &&
          <LayersControl.Overlay checked={true} name="Stops">
            <LayerGroup>
              {stops.map((item, _index) => {
                let stopAlerts = getStopAlertsById(item.stop_code);
                return(<StopMarker key={item.id} stop={item} stopAlerts={stopAlerts}></StopMarker>);
              })}
             </LayerGroup>
          </LayersControl.Overlay>
        }
        {(typeof mapControls.topRight !== 'undefined') &&
          (
            <>{mapControls.topRight}</>
          )
        }
      </LayersControl>
      <LocationMarker map={map}></LocationMarker>
      {(typeof mapControls.bottomLeft !== 'undefined') &&
        (
          <>{mapControls.bottomLeft}</>
        )
      }
    </MapContainer>
  );
}

StopMap.propTypes = {
  stops: PropTypes.array,
  alerts: PropTypes.array,
  map: PropTypes.any.isRequired,
  mapControls: PropTypes.object,
  center: PropTypes.array,
  zoom: PropTypes.number
};

StopMap.defaultProps = {
  stops: [],
  alerts: [],
  mapControls: {},
  center: [36.166512, -86.781581],
  zoom: 12
};

export default StopMap;
