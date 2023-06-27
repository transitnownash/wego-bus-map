import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBicycle, faClock, faExclamationTriangle, faMapMarkedAlt, faMobile,
} from '@fortawesome/free-solid-svg-icons';
import TransitMap from '../components/TransitMap';
import LoadingScreen from '../components/LoadingScreen';
import { getJSON, renderUnixTimestamp } from '../util';
import DataFetchError from '../components/DataFetchError';
import TitleBar from '../components/TitleBar';
import Footer from '../components/Footer';

const GBFS_BASE_URL = 'https://gbfs.bcycle.com/bcycle_nashville';
const REFRESH_GBFS_TTL = 60 * 1000;

function BCycle() {
  const [bCycleStations, setBCycleStations] = useState([]);
  const [bCycleStationsStatus, setBCycleStationStatus] = useState([]);
  const [isBCycleStationsLoaded, setBCycleStationsLoaded] = useState(false);
  const [isBCycleStationsStatusLoaded, setBCycleStationsStatusLoaded] = useState(false);
  const [isMapRendered, setMapRendered] = useState(false);
  const [dataFetchError, setDataFetchError] = useState(false);
  const map = useRef(null);

  // Consolidated check that things are ready to go
  const isUIReady = [isBCycleStationsLoaded, isBCycleStationsStatusLoaded].every((a) => a === true);

  useEffect(() => {
    getJSON(`${GBFS_BASE_URL}/station_information.json`)
      .then((s) => setBCycleStations(s.data.stations))
      .then(() => setBCycleStationsLoaded(true))
      .catch((error) => setDataFetchError(error));

    getJSON(`${GBFS_BASE_URL}/station_status.json`)
      .then((s) => setBCycleStationStatus(s.data.stations))
      .then(() => setBCycleStationsStatusLoaded(true))
      .catch((error) => setDataFetchError(error));

    // Refresh BCycle station status at a set interval
    const refreshBCycleStatus = setInterval(() => {
      if (!isUIReady) {
        return;
      }
      getJSON(`${GBFS_BASE_URL}/station_status.json`)
        .then((s) => setBCycleStationStatus(s.data.stations));
    }, REFRESH_GBFS_TTL);

    // Run on unmount
    return () => {
      clearInterval(refreshBCycleStatus);
    };
  }, [isUIReady]);

  if (dataFetchError) {
    return (<DataFetchError error={dataFetchError}></DataFetchError>);
  }

  if (!isUIReady) {
    return (<LoadingScreen />);
  }

  // Combine BCycle data into one hash
  if (bCycleStations.length > 0 && bCycleStationsStatus.length > 0) {
    bCycleStations.forEach((station, index) => {
      bCycleStations[index].status = bCycleStationsStatus.find((s) => station.station_id === s.station_id);
      // Remove if no status available
      if (!bCycleStations[index].status) {
        delete bCycleStations[index];
      }
    });
  }

  // Calculate system stats
  const initialValue = 0;
  const totalStations = bCycleStations.reduce(
    (previousValue, currentValue) => previousValue + (currentValue.status.is_installed),
    initialValue,
  );
  const bikesAvailable = bCycleStations.reduce(
    (previousValue, currentValue) => previousValue + (currentValue.status.is_renting ? currentValue.status.num_bikes_available : 0),
    initialValue,
  );
  const docksAvailable = bCycleStations.reduce(
    (previousValue, currentValue) => previousValue + (currentValue.status.is_returning ? currentValue.status.num_docks_available : 0),
    initialValue,
  );
  const offlineStations = bCycleStations.reduce(
    (previousValue, currentValue) => previousValue + (currentValue.status.is_renting == 0 || currentValue.status.is_returning == 0 ? 1 : 0),
    initialValue,
  );

  // Set the map to center on the available stations
  const allPoints = [];
  bCycleStations.map((s) => allPoints.push([s.lat, s.lon]));
  const getStationBounds = L.latLngBounds(allPoints);
  const center = getStationBounds.getCenter();

  if (map.current && !isMapRendered) {
    map.current.fitBounds(getStationBounds, { padding: [25, 25] });
    setMapRendered(true);
  }

  return (
    <div>
      <TitleBar />
      <div className="container">
        <TransitMap map={map} bCycleStations={bCycleStations} center={center}></TransitMap>
        <div className="row mb-3">
          <div className="col-sm-3 text-center">
            <div>
              <div className="h1 my-2">{totalStations}</div>
              <div>Total Stations</div>
            </div>
          </div>
          <div className="col-sm-3 text-center">
            <div>
              <div className="h1 my-2">{offlineStations}</div>
              <div>Offline Stations</div>
            </div>
          </div>
          <div className="col-sm-3 text-center">
            <div>
              <div className="h1 my-2">{bikesAvailable}</div>
              <div>Bikes Available</div>
            </div>
          </div>
          <div className="col-sm-3 text-center">
            <div>
              <div className="h1 my-2">{docksAvailable}</div>
              <div>Docks Available</div>
            </div>
          </div>
        </div>
        <div className="">
          {bCycleStations.map((station) => {
            // Ignore if stations doesn't have status, or if it isn't "installed"
            if (typeof station.status === 'undefined' || !station.status.is_installed) {
              return;
            }

            let warning = '';
            if (!station.status.is_renting || !station.status.is_returning) {
              warning = (
                <div className="p-2 bg-warning text-bg-warning text-center">
                  {!station.status.is_renting && (
                    <div><FontAwesomeIcon icon={faExclamationTriangle} fixedWidth={true}></FontAwesomeIcon> Not Renting Bikes</div>
                  )}
                  {!station.status.is_returning && (
                    <div><FontAwesomeIcon icon={faExclamationTriangle} fixedWidth={true}></FontAwesomeIcon> Not Allowing Returns of Bikes</div>
                  )}
                </div>
              );
            }

            return (
              <div key={station.station_id} className="card mb-3">
                <div className="card-header bcycle-station-name">{station.name}</div>
                {warning}
                <div className="card-body">
                  <div className="row">
                    <div className="col-sm-6 mb-3">
                      <div className="row">
                        <div className="col-sm-6 text-center">
                          <div className={(!station.status.is_renting || station.status.num_bikes_available === 0) ? 'bcycle-inactive' : ''}>
                            <div className="h1 my-2"><FontAwesomeIcon icon={faBicycle} fixedWidth={true}></FontAwesomeIcon> {station.status.num_bikes_available}</div>
                            <div>Bikes Available</div>
                          </div>
                        </div>
                        <div className="col-sm-6 text-center">
                          <div className={(!station.status.is_returning || station.status.num_docks_available === 0) ? 'bcycle-inactive' : ''}>
                            <div className="h1 my-2">{station.status.num_docks_available}</div>
                            <div>Docks Available</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-sm-6 small">
                      <dl className="row mb-0">
                        <dt className="col-5"><FontAwesomeIcon icon={faMapMarkedAlt} fixedWidth={true}></FontAwesomeIcon> Address</dt>
                        <dd className="col-7"><a href={`https://www.google.com/maps/dir/?api=1&travelmode=transit&destination=${station.lat}%2C${station.lon}`} rel='noreferrer' target="_blank">{station.address}</a></dd>
                        <dt className="col-5"><FontAwesomeIcon icon={faMobile} fixedWidth={true}></FontAwesomeIcon> Rental Link</dt>
                        <dd className="col-7">
                          <div className="btn-group" role="group">
                            <a href={station.rental_uris.ios} className="btn btn-sm border border-secondary" target={'_blank'} rel={'noreferrer'}>iOS</a>
                            <a href={station.rental_uris.android} className="btn btn-sm border border-secondary" target={'_blank'} rel={'noreferrer'}>Android</a>
                          </div>
                        </dd>
                        <dt className="col-5"><FontAwesomeIcon icon={faClock} fixedWidth={true}></FontAwesomeIcon> Updated</dt>
                        <dd className="col-7">{renderUnixTimestamp(station.status.last_reported)}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default BCycle;
