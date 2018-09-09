/* globals $, L, moment */

var refreshRate = 10 * 1000

// Sets up a map of Nashville
var map = L.map('map').setView([36.174465, -86.767960], 12)
L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, Tiles courtesy of <a href="http://hot.openstreetmap.org/" target="_blank">Humanitarian OpenStreetMap Team</a>'
}).addTo(map)

// Adds the custom icon for a bus
var MapIcon = L.Icon.extend({
  options: {
    shadowUrl: 'assets/images/wego-bus-shadow.svg',
    iconSize: [32, 32],
    shadowSize: [32, 32]
  }
})
var busIcon = new MapIcon({
  iconUrl: 'assets/images/wego-bus.svg'
})

// Format popup
var formatPopup = function (loc) {
  return '<strong>Vehicle:</strong> ' + loc.vehicle.vehicle.label +
    '<br /><strong>Route:</strong> ' + loc.vehicle.trip.route_id +
    '<br /><strong>Trip:</strong> ' + loc.vehicle.trip.trip_id +
    '<br /><strong>Heading:</strong> ' + formatDegreeToCompass(loc.vehicle.position.bearing) +
    '<br /><strong>Updated: </strong>' + formatTime(loc.vehicle.timestamp)
}

// Format tooltip
var formatTooltip = function (loc) {
  return 'Vehicle ' + loc.vehicle.vehicle.label +
    ' / Route ' + loc.vehicle.trip.route_id
}

// Convert degrees to nearest ordinal direction
var formatDegreeToCompass = function (num) {
  if (!num || typeof num === 'undefined') {
    return 'N/A'
  }
  var val = Math.floor((num / 22.5) + 0.5)
  var arr = [
    'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE',
    'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW',
    'NW', 'NNW'
  ]
  return arr[(val % 16)]
}

// Format unix timestamp as date/time
var formatTime = function (time) {
  return moment.unix(time).format('h:mm a')
}

var markers = {}

var updateMap = function () {
  $.get('/vehicle_locations.json', function (data) {
    if (!data || data.length === 0) {
      throw new Error('Could not load data!')
    }

    // Loop through feed
    $(data).each(function (i, loc) {
      // Find existing marker
      if (markers[loc.id]) {
        var latlng = L.latLng(loc.vehicle.position.latitude, loc.vehicle.position.longitude)
        markers[loc.id].setLatLng(latlng).bindPopup(formatPopup(loc))
        // Don't add tooltips for touch-enabled browsers (mobile)
        if (!L.Browser.touch) {
          markers[loc.id].bindTooltip(formatTooltip(loc))
        }
      // Not found, create a new one
      } else {
        markers[loc.id] = L.marker([loc.vehicle.position.latitude, loc.vehicle.position.longitude], {icon: busIcon}).bindPopup(formatPopup(loc))
        // Don't add tooltips for touch-enabled browsers (mobile)
        if (!L.Browser.touch) {
          markers[loc.id].bindTooltip(formatTooltip(loc))
        }
        markers[loc.id].addTo(map)
      }
      // Position is outdated, dim it a bit
      if (Math.round(((Date.now() / 1000) - loc.vehicle.timestamp) / 60) > 5) {
        markers[loc.id].setOpacity(0.3)
      }
    })
  })
}

// Update map on a schedule
updateMap()
setInterval(function () {
  updateMap()
}, refreshRate)
