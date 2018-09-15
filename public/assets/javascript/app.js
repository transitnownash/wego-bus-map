/* globals $, L, moment, agencyData, routesData */

var refreshRate = 10 * 1000
var refreshAttempts = 1

var markers = {}
var tripUpdates = {}
var routeShapes = {}

// Sets up a map of Nashville
var map = L.map('map').setView([36.174465, -86.767960], 12)
L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: $('#attribution_template').html()
}).addTo(map)

// Adds the custom icon for a bus
var MapIcon = L.Icon.extend({
  options: {
    iconSize: [32, 32],
    popupAnchor: [0, -14],
    shadowSize: [32, 50],
    shadowAnchor: [16, 16]
  }
})

var busIcons = {
  'Nashville MTA': {
    stationary: new MapIcon({
      iconUrl: 'assets/images/wego-bus.svg',
      shadowUrl: null
    }),
    moving: new MapIcon({
      iconUrl: 'assets/images/wego-bus.svg',
      shadowUrl: 'assets/images/bus-tracks.svg'
    })
  },
  'Nashville RTA': {
    stationary: new MapIcon({
      iconUrl: 'assets/images/rta-bus.svg',
      shadowUrl: null
    }),
    moving: new MapIcon({
      iconUrl: 'assets/images/rta-bus.svg',
      shadowUrl: 'assets/images/bus-tracks.svg'
    })
  }
}

// Format popup
var formatPopup = function (e) {
  var popup = e.target.getPopup()
  var routeId = e.target.data.loc.vehicle.trip.route_id
  var tripId = e.target.data.loc.vehicle.trip.trip_id
  var loc = e.target.data.loc
  $.get('/gtfs/trips/' + tripId + '.json').done(function (tripData) {
    addShape(tripData.shape_id, routesData[routeId].route_color)
    var content = L.Util.template(
      $('#popup_template').html(),
      {
        vehicle: loc.vehicle.vehicle.label,
        route_short_name: routesData[routeId].route_short_name,
        route_long_name: routesData[routeId].route_long_name,
        trip_headsign: tripData.trip_headsign,
        route_color: routesData[routeId].route_color,
        route_text_color: routesData[routeId].route_text_color,
        trip: loc.vehicle.trip.trip_id,
        agency: agencyData[routesData[routeId].agency_id].agency_name,
        agency_url: agencyData[routesData[routeId].agency_id].agency_url,
        heading: formatDegreeToCompass(loc.vehicle.position.bearing),
        speed: formatVehicleSpeed(loc.vehicle.position.speed),
        updated: moment.unix(loc.vehicle.timestamp).format('h:mm a')
      }
    )
    popup.setContent(content)
    popup.update()
    $('.view-trip-details-link').on('click', function () {
      showTripDetails(loc.vehicle.trip.trip_id)
    })
  })
}

// Format tooltip
var formatTooltip = function (loc) {
  return L.Util.template(
    $('#tooltip_template').html(),
    {
      vehicle: loc.vehicle.vehicle.label,
      trip: loc.vehicle.trip.trip_id,
      route_short_name: routesData[loc.vehicle.trip.route_id].route_short_name,
      route_long_name: routesData[loc.vehicle.trip.route_id].route_long_name,
      route_color: routesData[loc.vehicle.trip.route_id].route_color,
      route_text_color: routesData[loc.vehicle.trip.route_id].route_text_color
    }
  )
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

// Format speed from (micro?)meters per second to miles per hour
var formatVehicleSpeed = function (speed) {
  return (speed) ? Math.round((speed * 2.2369) * 1000000) + ' mph' : 'N/A'
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
      var busIcon = busIcons[routesData[loc.vehicle.trip.route_id].agency_id]
      // Find existing marker
      if (markers[loc.id]) {
        var latlng = L.latLng(loc.vehicle.position.latitude, loc.vehicle.position.longitude)
        markers[loc.id].slideTo(latlng, {duration: 1000})
        markers[loc.id].setRotationShadowAngle(loc.vehicle.position.bearing)
        markers[loc.id].setOpacity(1)
        markers[loc.id].data.loc = loc
        markers[loc.id].data.updated = loc.vehicle.timestamp
        // Update an open popup
        if (markers[loc.id].isPopupOpen()) {
          formatPopup({target: markers[loc.id]})
        }
        // Don't add tooltips for touch-enabled browsers (mobile)
        if (!L.Browser.touch) {
          markers[loc.id].bindTooltip(formatTooltip(loc))
        }
      // Not found, create a new one
      } else {
        markers[loc.id] = L.marker([loc.vehicle.position.latitude, loc.vehicle.position.longitude], {icon: busIcon.stationary}).bindPopup($('popup_loading_template').html())
        markers[loc.id].on('click', formatPopup)
        // Don't add tooltips for touch-enabled browsers (mobile)
        if (!L.Browser.mobile) {
          markers[loc.id].bindTooltip(formatTooltip(loc))
        }
        markers[loc.id].addTo(map)
        markers[loc.id].data = { created: loc.vehicle.timestamp, updated: loc.vehicle.timestamp, loc: loc }
      }
      // Set shadow if bus is moving
      if (loc.vehicle.position.bearing) {
        markers[loc.id].setIcon(busIcon.moving)
        markers[loc.id].setRotationShadowAngle(loc.vehicle.position.bearing)
      } else {
        markers[loc.id].setIcon(busIcon.stationary)
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

  // Check for trip updates
  checkForTripUpdates()

  // Check for alerts
  checkForAlerts()

  // updateMap calls itself after a delay
  setTimeout(updateMap, refreshRate * refreshAttempts)
}

// Check for Alerts
var checkForAlerts = function () {
  $.get('/gtfs/realtime/alerts.json', function (data) {
    var alertIndicator = $('.alert-indicator')
    alertIndicator.hide()
    if (!data || data.length === 0) {
      return
    }
    alertIndicator.html(L.Util.template(
      $('#alert_indicator_template').html(),
      {
        count: data.length,
        plural: data.length > 1 ? 's' : ''
      }
    ))
    alertIndicator.show()
    alertIndicator.on('click', function (e) {
      displayAlerts(data)
    })
  })
}

// Display Alerts
var displayAlerts = function (data) {
  var alertContainer = $('#service_alerts')

  if (!data || data.length === 0) {
    return
  }

  alertContainer.empty()

  $.each(data, function (i, alert) {
    var content = L.Util.template(
      $('#alert_template').html(),
      {
        alert_heading: alert.alert.header_text.translation[0].text,
        alert_body: alert.alert.description_text.translation[0].text.replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '<br />'),
        start_date: moment.unix(alert.alert.active_period[0].start).format('l h:mm a'),
        end_date: moment.unix(alert.alert.active_period[0].end).format('l h:mm a')
      }
    )
    $(alertContainer).append(content)
  })
  $('#serviceAlertsModal').modal('show')
}

// Add a shape to the map
var addShape = function (shapeId, color) {
  if (routeShapes[shapeId]) { return }
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

// Load Trip Updates
var checkForTripUpdates = function () {
  $.get('/gtfs/realtime/tripupdates.json').done(function (updateData) {
    if (!updateData || updateData.length === 0) {
      return
    }

    $.each(updateData, function (i, update) {
      tripUpdates[update.trip_update.trip.trip_id] = update
    })
  })
}

// Show trip details in a modal
var showTripDetails = function (tripId) {
  var tripModal = $('#trip_details_modal')
  tripModal.modal('show')
  $.get('/gtfs/trips/' + tripId + '.json').done(function (tripData) {
    var routeId = tripData.route_id
    if (typeof tripUpdates[tripId] === 'undefined') {
      $('#trip_details').html(L.Util.template(
        $('#trip_details_unavailable_template').html(),
        {
          route_short_name: routesData[routeId].route_short_name,
          route_long_name: routesData[routeId].route_long_name,
          trip_headsign: tripData.trip_headsign,
          route_color: routesData[routeId].route_color,
          route_text_color: routesData[routeId].route_text_color,
          agency: agencyData[routesData[routeId].agency_id].agency_name,
          agency_url: agencyData[routesData[routeId].agency_id].agency_url,
          trip: tripData.trip_id
        }
      ))
      return
    }

    $('#trip_details').html(L.Util.template(
      $('#trip_details_template').html(),
      {
        route_short_name: routesData[routeId].route_short_name,
        route_long_name: routesData[routeId].route_long_name,
        trip_headsign: tripData.trip_headsign,
        route_color: routesData[routeId].route_color,
        route_text_color: routesData[routeId].route_text_color,
        agency: agencyData[routesData[routeId].agency_id].agency_name,
        agency_url: agencyData[routesData[routeId].agency_id].agency_url,
        trip: tripData.trip_id,
        start_time: moment('2000-01-01 ' + tripUpdates[tripId].trip_update.trip.start_time).format('h:mm a'),
        updated: (tripUpdates[tripId].trip_update.timestamp) ? moment.unix(tripUpdates[tripId].trip_update.timestamp).format('h:mm a') : 'Not yet started.',
        vehicle: tripUpdates[tripId].trip_update.vehicle.label
      }
    ))
    var stopTimeUpdatesTableBody = $('#trip_stop_time_updates tbody')
    $(stopTimeUpdatesTableBody).empty()
    var rowHighlighted = false
    $.each(tripUpdates[tripId].trip_update.stop_time_update, function (i, update) {
      var time = ''
      if (typeof update.departure !== 'undefined') {
        time = update.departure.time
      }
      if (typeof update.arrival !== 'undefined') {
        time = update.arrival.time
      }
      var row = $(L.Util.template(
        $('#trip_stop_time_update_body').html(),
        {
          stop_sequence: update.stop_sequence,
          stop_id: update.stop_id,
          time: moment.unix(time).format('h:mm a')
        }
      ))
      // Trip must have started, no previous rows highlighted and the time must be in the future
      if (time <= Math.round(Date.now() / 1000)) {
        row.addClass('text-muted')
      }
      if (tripUpdates[tripId].trip_update.timestamp && !rowHighlighted && time >= Math.round(Date.now() / 1000)) {
        row.addClass('table-info')
        $('td .badge-info', row).removeClass('badge-info').addClass('badge-light')
        rowHighlighted = true
      }
      $(stopTimeUpdatesTableBody).append(row)
    })
  })
}

// Update map on a schedule
updateMap()
