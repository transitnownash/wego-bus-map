import React from 'react';
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

            <p>This project is an implementation of the <a href="https://developers.google.com/transit/gtfs-realtime/">General Transit Feed Specification (GTFS) Realtime</a> feed for Nashville, Tennessee&apos;s <a href="http://www.wegotransit.com/">WeGo Public Transit</a> bus system. It displays all vehicle locations on a map in conjunction with <a href="https://developers.google.com/transit/gtfs/">GTFS Static</a> data updated periodically when the agency announces service changes.</p>

            <p>The source code <a href="https://github.com/transitnownash/wego-bus-map">is available on <i className="fab fa-github"></i> GitHub</a>.</p>
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
            Backend
            <ul>
              <li><a href="https://github.com/transitnownash/gtfs-rails-api">GTFS Rails API</a></li>
              <li><a href="https://create-react-app.dev/">Create React App</a></li>
            </ul>
          </div>
          <div className="col-sm-6">
            User Interface
            <ul>
              <li><a href="https://getbootstrap.com/">Bootstrap</a></li>
              <li><a href="https://fontawesome.com/">Font Awesome</a></li>
              <li><a href="https://reactjs.org/">React</a></li>
            </ul>
            Mapping
            <ul>
              <li><a href="http://leafletjs.com/">Leaflet</a></li>
              <li><a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a></li>
              <li><a href="http://cartodb.com/attributions">CartoDB</a></li>
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
