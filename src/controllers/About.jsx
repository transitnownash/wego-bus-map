import React from 'react';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import TitleBar from '../components/TitleBar';
import Footer from '../components/Footer';
import logo from '../resources/logo.svg';

function About() {
  return (
    <div>
      <TitleBar></TitleBar>
      <div className="container about">
        <div className="row">
          <div className="col-lg-8">
            <p className="lead">Produced in collaboration with <a href="https://transitnownash.org/">Transit Now Nashville</a>, a local grassroots organization whose mission is to raise awareness of the benefits of regional mass transit options for the people living in the Greater Nashville Area.</p>

            <p>This project is an implementation of the <a href="https://gtfs.org/documentation/realtime/reference/">General Transit Feed Specification (GTFS) Realtime</a> feed for Nashville, Tennessee&apos;s <a href="https://www.wegotransit.com/">WeGo Public Transit</a> system. It maps live bus and train positions alongside <a href="https://gtfs.org/documentation/schedule/reference/">GTFS Static</a> data updated periodically when the agency announces service changes, so you can browse routes and their shapes, look up a stop and see its next departures, and follow service alerts and trip updates as they are published. Optional map layers add Nashville BCycle bikeshare stations and the retail outlets that sell WeGo fare media.</p>

            <p>The source code <a href="https://github.com/transitnownash/wego-bus-map">is available on <FontAwesomeIcon icon={faGithub} /> GitHub</a>.</p>
          </div>
          <div className="col-lg-4 text-center text-lg-right">
            <img src={logo} width="320" height="320" className="img-fluid" alt="Logo" />
          </div>
        </div>

        <hr />

        <h2 className="h4">Data Sources &amp; Technology</h2>
        <div className="row">
          <div className="col-sm-6">
            <a href="https://www.wegotransit.com/contact-us/developer-data-requests/">WeGo Public Transit</a> via <a href="https://database.mobilitydata.org/">Mobility Database</a>
            <ul>
              <li><a href="https://github.com/MobilityData/mobility-database-catalogs/blob/main/catalogs/sources/gtfs/schedule/us-tennessee-nashville-metropolitan-transit-authority-nashville-mta-gtfs-360.json">Static GTFS</a></li>
              <li><a href="https://github.com/MobilityData/mobility-database-catalogs/blob/main/catalogs/sources/gtfs/realtime/us-tennessee-nashville-metropolitan-transit-authority-nashville-mta-gtfs-rt-sa-1621.json">Realtime Service Alerts</a></li>
              <li><a href="https://github.com/MobilityData/mobility-database-catalogs/blob/main/catalogs/sources/gtfs/realtime/us-tennessee-nashville-metropolitan-transit-authority-nashville-mta-gtfs-rt-tu-1620.json">Realtime Trip Updates</a></li>
              <li><a href="https://github.com/MobilityData/mobility-database-catalogs/blob/main/catalogs/sources/gtfs/realtime/us-tennessee-nashville-metropolitan-transit-authority-nashville-mta-gtfs-rt-vp-1622.json">Realtime Vehicle Positions</a></li>
            </ul>
            Other Data
            <ul>
              <li><a href="https://gbfs.bcycle.com/bcycle_nashville/gbfs.json">Nashville BCycle</a> via <a href="https://gbfs.org/">GBFS</a></li>
              <li><a href="https://www.arcgis.com/home/item.html?id=803be76266104be78b695c6fec137dc7">WeGo Retail Outlets</a> via ArcGIS</li>
            </ul>
            Backend
            <ul>
              <li><a href="https://github.com/transitnownash/gtfs-rails-api">GTFS Rails API</a></li>
            </ul>
            Build &amp; Tooling
            <ul>
              <li><a href="https://vite.dev/">Vite</a></li>
              <li><a href="https://vitest.dev/">Vitest</a></li>
              <li><a href="https://eslint.org/">ESLint</a></li>
              <li><a href="https://sass-lang.com/">Sass</a></li>
            </ul>
          </div>
          <div className="col-sm-6">
            User Interface
            <ul>
              <li><a href="https://getbootstrap.com/">Bootstrap</a></li>
              <li><a href="https://react-bootstrap.netlify.app/">React Bootstrap</a></li>
              <li><a href="https://fontawesome.com/">Font Awesome</a></li>
              <li><a href="https://react.dev/">React</a></li>
              <li><a href="https://reactrouter.com/">React Router</a></li>
              <li><a href="https://day.js.org/">Day.js</a></li>
            </ul>
            Mapping
            <ul>
              <li><a href="https://leafletjs.com/">Leaflet</a></li>
              <li><a href="https://react-leaflet.js.org/">React Leaflet</a></li>
              <li><a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a></li>
              <li><a href="https://carto.com/attributions">CARTO</a></li>
              <li><a href="https://github.com/hanying33/Leaflet.RotatedMarkerWithShadow">Leaflet.RotatedMarkerWithShadow</a></li>
              <li><a href="https://github.com/hugobarragon/react-leaflet-drift-marker">react-leaflet-drift-marker</a></li>
            </ul>
          </div>
        </div>
      </div>
      <Footer></Footer>
    </div>
  );
}

export default About;
