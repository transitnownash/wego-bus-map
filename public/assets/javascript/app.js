/* globals $, L, moment */

var refreshRate = 10 * 1000
var refreshAttempts = 1

var markers = {}
var routeShapes = {}

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
    shadowSize: [32, 32],
    popupAnchor: [0, -14]
  }
})
var busIcon = new MapIcon({
  iconUrl: 'assets/images/wego-bus.svg'
})

// Format popup
var formatPopup = function (e) {
  var popup = e.target.getPopup()
  var routeId = e.target.data.loc.vehicle.trip.route_id
  var tripId = e.target.data.loc.vehicle.trip.trip_id
  var loc = e.target.data.loc
  $.get('/gtfs/routes/' + routeId + '.json').done(function (routeData) {
    $.get('/gtfs/trips/' + tripId + '.json').done(function (tripData) {
      addShape(tripData.shape_id, routeData.route_color)
      var content = L.Util.template(
        '<div class="popup-route-label" style="background-color: #{route_color}; color: #{route_text_color};">{route_short_name} - {route_long_name}</div><table class="popup-data-table"><tr><th>Headsign:</th><td>{trip_headsign}</td></tr><tr><th>Vehicle:</th><td>{vehicle}</td></tr><tr><th>Trip:</th><td>{trip}</td></tr><tr><th>Heading:</th><td>{heading}</td></tr><th>Updated:</th><td>{updated}</td></tr></table>',
        {
          vehicle: loc.vehicle.vehicle.label,
          route_short_name: routeData.route_short_name,
          route_long_name: routeData.route_long_name,
          trip_headsign: tripData.trip_headsign,
          route_color: routeData.route_color,
          route_text_color: routeData.route_text_color,
          trip: loc.vehicle.trip.trip_id,
          heading: formatDegreeToCompass(loc.vehicle.position.bearing),
          updated: moment.unix(loc.vehicle.timestamp).format('h:mm a')
        }
      )
      popup.setContent(content)
      popup.update()
    })
  })
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

var updateMap = function () {
  // Delete very outdated markers (likely no longer in the feed)
  $.each(markers, function (i, marker) {
    if (Math.round(((Date.now() / 1000) - markers[i].data.updated) / 60) >= 10) {
      map.removeLayer(markers[i])
      delete markers[i]
    }
  })

  $.get('/gtfs/realtime/vehiclepositions.json', function (data) {
    // Backoff attempts when no data present
    if (!data || data.length === 0) {
      refreshAttempts++
      console.log('No data returned. Trying again in ' + ((refreshRate * refreshAttempts) / 1000) + ' seconds')
      return
    // Reset it back to 1
    } else {
      refreshAttempts = 1
    }

    // Loop through feed
    $(data).each(function (i, loc) {
      // Find existing marker
      if (markers[loc.id]) {
        var latlng = L.latLng(loc.vehicle.position.latitude, loc.vehicle.position.longitude)
        markers[loc.id].slideTo(latlng, {duration: 1000})
        markers[loc.id].setOpacity(1)
        markers[loc.id].data.loc = loc
        markers[loc.id].data.updated = loc.vehicle.timestamp
        // Don't add tooltips for touch-enabled browsers (mobile)
        if (!L.Browser.touch) {
          markers[loc.id].bindTooltip(formatTooltip(loc))
        }
      // Not found, create a new one
      } else {
        markers[loc.id] = L.marker([loc.vehicle.position.latitude, loc.vehicle.position.longitude], {icon: busIcon}).bindPopup('Loading ...')
        markers[loc.id].on('click', formatPopup)
        // Don't add tooltips for touch-enabled browsers (mobile)
        if (!L.Browser.mobile) {
          markers[loc.id].bindTooltip(formatTooltip(loc))
        }
        markers[loc.id].addTo(map)
        markers[loc.id].data = { created: loc.vehicle.timestamp, updated: loc.vehicle.timestamp, loc: loc }
      }
      // Position is outdated, dim it a bit
      var locationAge = Math.round(((Date.now() / 1000) - loc.vehicle.timestamp) / 60)
      if (locationAge >= 5) {
        markers[loc.id].setOpacity(0.1)
      } else if (locationAge >= 2) {
        markers[loc.id].setOpacity(0.3)
      }
    })
  })

  // Check alert bubble
  checkForAlerts()

  // updateMap calls itself after a delay
  setTimeout(updateMap, refreshRate * refreshAttempts)
}

// Check for Alerts
var checkForAlerts = function () {
  $.get('/gtfs/realtime/alerts.json', function (data) {
    var alertIndicator = $('#alert_indicator')
    alertIndicator.hide()
    if (!data || data.length === 0) {
        return
    }
    alertIndicator.html(L.Util.template('🔔 Service Alert{plural}: <strong>{count}</strong>', {
      count: data.length,
      plural: data.length > 1 ? 's' : ''
    }))
    alertIndicator.show()
    alertIndicator.on('click', function (e) {
      displayAlerts(data)
    })
  })
}

// Display Alerts
var displayAlerts = function (data) {
  var alertContainer = $('#alerts')

  if (!data || data.length === 0) {
    return
  }

  var hideAlertsButton = $('<div class="alerts-close"><a href="#close">Close</a></div>').on('click', function (e) { alertContainer.hide() })
  alertContainer.empty().show()
  alertContainer.append(hideAlertsButton)

  $.each(data, function (i, alert) {
    var content = L.Util.template(
      '<div class="alert"><h2 class="alert-heading">{alert_heading}</h2><div class="alert-body">{alert_body}</div></div>',
      {
        alert_heading: alert.alert.header_text.translation[0].text,
        alert_body: alert.alert.description_text.translation[0].text.replace("\n", '<br />')
      }
    )
    $(alertContainer).append(content)
  })
}

// Add a shape to the map
var addShape = function (shapeId, color) {
  if (routeShapes[shapeId]) { return; }
  $.get('/gtfs/shapes/' + shapeId + '.json').done(function (shapeData) {
    var plotPoints = $.map(shapeData, function (point) {
      return L.latLng(point.shape_pt_lat, point.shape_pt_lon)
    })
    if (!color) { color = '000000' }
    color = '#' + color
    routeShapes[shapeId] = L.polyline(plotPoints, {color: color, weight: 8, opacity: 0.9}).addTo(map)
    routeShapes[shapeId].on('click', function (e) {
      map.removeLayer(e.target)
      delete routeShapes[shapeId]
    })
  })
}

// Update map on a schedule
updateMap()
