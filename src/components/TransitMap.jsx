import React, {
  useState, useCallback, useEffect, useMemo,
} from 'react';
import PropTypes from 'prop-types';
import {
  MapContainer, TileLayer, LayersControl, LayerGroup, Polyline, FeatureGroup, GeoJSON,
  // CircleMarker, Tooltip, Popup,
} from 'react-leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import L from 'leaflet';
import VehicleMarker, { isVehiclePositionStale } from './VehicleMarker';
import 'leaflet/dist/leaflet.css';
import './TransitMap.scss';
import StopMarker from './StopMarker';
import { formatShapePoints } from '../util';
import LocationMarker from './LocationMarker';
import BCycleMarker from './BCycleMarker';
import LocateButton from './LocateButton';
import RetailLocationMarker from './RetailLocationMarker';

const CARTO_API_KEY = import.meta.env.VITE_CARTO_API_KEY;
const EMPTY_OBJECT = {};
const EMPTY_ARRAY = [];

const regionMaxBounds = [
  [36.725005, -87.579122], // northwest
  [35.486335, -86.097066], // southeast
];

const countyBorderStyle = {
  fillColor: 'transparent', opacity: 0.5, color: 'gray', dashArray: 4,
};

// Map of key -> first item with that key, matching Array#find semantics
function indexFirst(items, keysOf) {
  const index = new Map();
  items.forEach((item) => {
    keysOf(item).forEach((key) => {
      if (!index.has(key)) {
        index.set(key, item);
      }
    });
  });
  return index;
}

function groupBy(items, keysOf) {
  const groups = new Map();
  items.forEach((item) => {
    keysOf(item).forEach((key) => {
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key).push(item);
    });
  });
  return groups;
}

// Fix paths for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

function TransitMap({
  routes = [],
  agencies = [],
  vehicleMarkers = [],
  routeShapes = [],
  routeStops = [],
  alerts = [],
  tripUpdates = [],
  map,
  bCycleStations = [],
  retailLocations = [],
  mapControls = {},
  center = [36.166512, -86.781581],
  zoom = 12,
}) {
  const [shapes, setShapes] = useState(routeShapes);
  const doSetShapes = useCallback((val) => {
    setShapes(val);
  }, [setShapes]);

  const [stops, setStops] = useState(routeStops);
  const doSetStops = useCallback((val) => {
    setStops(val);
  }, [setStops]);

  const routesById = useMemo(() => indexFirst(routes, (r) => [r.route_gid, r.route_short_name]), [routes]);
  const agenciesById = useMemo(() => indexFirst(agencies, (a) => [a.agency_gid]), [agencies]);
  const tripUpdatesByTripId = useMemo(() => indexFirst(tripUpdates, (i) => [i.trip_update.trip.trip_id]), [tripUpdates]);
  const alertsByRouteId = useMemo(() => groupBy(alerts, (a) => [a.alert.informed_entity?.[0]?.route_id]), [alerts]);
  // One entry per matching informed entity, so an alert can repeat for a stop
  const alertsByStopId = useMemo(() => groupBy(alerts, (a) => (a.alert.informed_entity || []).map((e) => e.stop_id)), [alerts]);

  const getRouteDataById = (routeId) => routesById.get(routeId) || EMPTY_OBJECT;
  const getAgencyDataById = (agencyId) => agenciesById.get(agencyId) || EMPTY_OBJECT;
  const getRouteAlertsById = (routeId) => alertsByRouteId.get(routeId) || EMPTY_ARRAY;
  const getStopAlertsById = (stopCode) => alertsByStopId.get(stopCode) || EMPTY_ARRAY;
  const getTripUpdateById = (tripId) => tripUpdatesByTripId.get(tripId);

  const getStopUpdateByTripAndId = function (tripId, stopCode) {
    let stopUpdate = {};
    const trip = tripUpdatesByTripId.get(tripId);
    if (trip) {
      trip.trip_update.stop_time_update.forEach((stu) => {
        if (stu.stop_id === stopCode) {
          stopUpdate = stu;
        }
      });
    }
    return stopUpdate;
  };

  // ~400 KB of GeoJSON, so keep it out of the main bundle
  const [countyBorders, setCountyBorders] = useState(null);
  useEffect(() => {
    let isMounted = true;
    import('../lib/davidson_county_borders.json').then((module) => {
      if (isMounted) {
        setCountyBorders(module.default);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const shapeEventHandlers = useMemo(() => ({
    click: (_e) => {
      setShapes([]);
      setStops([]);
    },
  }), []);

  const shapePositions = useMemo(
    () => shapes.map((item) => ({ item, positions: formatShapePoints(item.points) })),
    [shapes],
  );

  const locateUserOnMap = function (map) {
    if (typeof map.current !== 'undefined' && map.current) {
      map.current.locate();
    }
  };

  return (
    <MapContainer ref={map} className="map-container" center={center} zoom={zoom} scrollWheelZoom={true} maxBounds={regionMaxBounds} doubleClickZoom={false}>
      <TileLayer
        attribution='&copy; <a href="http://www.openstreetmap.org/copyright" target="blank">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions" target="blank">CartoDB</a>; <a href="http://www.wegotransit.com" target="blank">WeGo</a>'
        url={`https://basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}{r}.png?key=${CARTO_API_KEY}`}
        minZoom={10}
        maxZoom={19}
        className='map-tiles'
      />
      <LayersControl position="topright">
        {vehicleMarkers.length > 0 && (
          <>
            <LayersControl.Overlay checked={true} name="Vehicles">
              <LayerGroup>
                {vehicleMarkers.filter((i) => i.vehicle.trip).map((item, index) => {
                  const route = getRouteDataById(item.vehicle.trip.route_id);
                  const routeAlerts = getRouteAlertsById(item.vehicle.trip.route_id);
                  const agency = getAgencyDataById(route ? route.agency_gid : {});
                  const tripUpdate = getTripUpdateById(item.vehicle.trip.trip_id);
                  return (
                    <VehicleMarker key={item.id ?? index} vehiclePositionData={item} route={route} agency={agency} tripUpdate={tripUpdate} shapeSetter={doSetShapes} stopSetter={doSetStops} alerts={routeAlerts} isStale={isVehiclePositionStale(item)}></VehicleMarker>
                  );
                })}
              </LayerGroup>
            </LayersControl.Overlay>
            <LayersControl.Overlay checked={false} name="Vehicles (No Route)">
              <LayerGroup>
                {vehicleMarkers.filter((i) => !i.vehicle.trip).map((item, index) => {
                  return (
                    <VehicleMarker key={item.id ?? index} vehiclePositionData={item} agency={EMPTY_OBJECT} shapeSetter={doSetShapes} stopSetter={doSetStops} route={EMPTY_OBJECT} isStale={isVehiclePositionStale(item)}></VehicleMarker>
                  );
                })}
              </LayerGroup>
            </LayersControl.Overlay>
          </>
        )}
        {shapes.length > 0
          && <LayersControl.Overlay checked={true} name="Routes">
            <LayerGroup>
              {shapePositions.map(({ item, positions }) => (
                  <FeatureGroup key={item.shape_gid} eventHandlers={item.shapeEventHandlers ?? shapeEventHandlers}>
                    <Polyline weight={12} positions={positions} color='#ffffff'></Polyline>
                    <Polyline weight={8} positions={positions} color={`#${item.route_color}`}></Polyline>
                  </FeatureGroup>
              ))}
            </LayerGroup>
          </LayersControl.Overlay>
        }
        {stops.length > 0
          && <LayersControl.Overlay checked={true} name="Stops">
            <LayerGroup>
              {(() => {
                return stops.map((item, _index) => {
                  const stopAlerts = getStopAlertsById(item.stop.stop_code);
                  const stopUpdate = getStopUpdateByTripAndId(item.trip_gid, item.stop.stop_code);
                  // Use a composite key to guarantee uniqueness even for repeated stops within a trip
                  const stopKey = `${item.trip_gid}-${item.stop_sequence}`;
                  return (<StopMarker key={stopKey} stop={item.stop} stopTime={item} stopUpdate={stopUpdate} stopAlerts={stopAlerts}></StopMarker>);
                });
              })()}
             </LayerGroup>
          </LayersControl.Overlay>
        }
        {bCycleStations.length > 0
          && <LayersControl.Overlay checked={true} name="BCycle Stations">
            <LayerGroup>
              {bCycleStations.map((item, _index) => (
                  <BCycleMarker key={item.station_id} station={item}></BCycleMarker>
              ))}
             </LayerGroup>
          </LayersControl.Overlay>
        }
        {retailLocations.length > 0
          && <LayersControl.Overlay checked={false} name="QuickTicket Retailers">
            <LayerGroup>
              {retailLocations.map((item, _index) => (
                  <RetailLocationMarker key={`${item.location_code || item.id || `${item.latitude}-${item.longitude}`}-${_index}`} retailLocation={item}></RetailLocationMarker>
              ))}
             </LayerGroup>
          </LayersControl.Overlay>
        }

        <LayersControl.Overlay checked={true} name="City Border">
          {countyBorders ? (
            <GeoJSON data={countyBorders} style={countyBorderStyle}></GeoJSON>
          ) : (
            <LayerGroup></LayerGroup>
          )}
        </LayersControl.Overlay>

        {(typeof mapControls.topRight !== 'undefined')
          && (
            <>{mapControls.topRight}</>
          )
        }
      </LayersControl>
      <LocationMarker map={map}></LocationMarker>
      {(typeof mapControls.bottomLeft !== 'undefined')
        ? (
          <>{mapControls.bottomLeft}</>
        ) : (
          <div className="d-flex map-bottom-left-container">
            <LocateButton buttonAction={() => locateUserOnMap(map)}></LocateButton>
          </div>
        )
      }
    </MapContainer>
  );
}

TransitMap.propTypes = {
  routes: PropTypes.array,
  agencies: PropTypes.array,
  vehicleMarkers: PropTypes.array,
  routeShapes: PropTypes.array,
  routeStops: PropTypes.array,
  alerts: PropTypes.array,
  tripUpdates: PropTypes.array,
  map: PropTypes.any.isRequired,
  bCycleStations: PropTypes.array,
  retailLocations: PropTypes.array,
  mapControls: PropTypes.object,
  center: PropTypes.any,
  zoom: PropTypes.number,
};

export default TransitMap;
