import React from 'react'
import { useState } from "react"
import { Marker, Popup, Circle, useMapEvents } from "react-leaflet"
import L from 'leaflet'
import userLocationIcon from '../resources/user-location.svg'

function LocationMarker() {
  const [position, setPosition] = useState(null)
  const [accuracy, setAccuracy] = useState(null)

  const LocationMarkerIcon = L.Icon.extend({
    options: {
      iconUrl: userLocationIcon,
      iconSize: [32, 32],
      popupAnchor: [0, -14],
      shadowUrl: null
    }
  })
  const icon = new LocationMarkerIcon()

  const map = useMapEvents({
    locationfound(e) {
      if (!map.options.maxBounds.contains(e.latlng)) {
        window.alert('Your location is outside of the bounds of this map.')
        return
      }
      setPosition(e.latlng)
      setAccuracy(e.accuracy)
      map.flyTo(e.latlng, 14)
    },
    locationerror(e) {
      console.error(e);
      window.alert('Unable to find your location. (' + e.message + ')')
    }
  })

  return position === null ? null : (
    <>
      <Marker position={position} icon={icon}>
        <Popup><strong>Your location.</strong><br />Accuracy: {accuracy} meters</Popup>
      </Marker>
      <Circle center={position} radius={accuracy}></Circle>
    </>
  )
}

export default LocationMarker
