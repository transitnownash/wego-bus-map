import React from 'react'
import { faRoute } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Link } from "react-router-dom"
import transitNowIcon from '../resources/transitnow.png'

function MapLinks() {
  return(
    <>
      <Link to="/about" className="leaflet-control"><img src={transitNowIcon} height="35" width="35" alt="Transit Now" /></Link>
      <Link to="/routes" className="leaflet-control"><FontAwesomeIcon icon={faRoute} fixedWidth={true} size={'2x'} /></Link>
    </>
  )
}

export default MapLinks
