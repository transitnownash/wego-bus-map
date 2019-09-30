/* globals $, L, moment, GTFS_BASE_URL */

var refreshRate = 10 * 1000
var refreshAttempts = 1

var markers = {}
var locationMarker = {}
var tripUpdates = {}
var routesData = {}
var agenciesData = {}
var routeShapes = {}
var stopsData = {}

// Sets up a map of Nashville
var map = L.map('map', {
  doubleClickZoom: false,
  center: L.latLng(36.166512, -86.781581),
  maxBounds: L.latLngBounds(
    L.latLng(36.723875, -87.564893), // northwest
    L.latLng(35.594362, -86.227080) // southeast
  ),
  zoom: 12
})

L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}{r}.png', {
  subdomains: 'abcd',
  maxZoom: 19,
  minZoom: 11,
  attribution: $('#attribution_template').html(),
}).addTo(map)

var vehiclesLayer = L.layerGroup().addTo(map)
var routesLayer = L.layerGroup().addTo(map)

L.control.layers(
  null,
  {
    'Vehicles': vehiclesLayer,
    'Routes': routesLayer
  }
).addTo(map)

// Handle location detection success
map.on('locationerror', function (e) {
  console.error(e)
  return window.alert('Unable to find your location.')
})

// Handle location detection error
map.on('locationfound', function (e) {
  var radius = e.accuracy / 2
  if (locationMarker.marker) {
    map.removeLayer(locationMarker.marker)
  }
  if (locationMarker.radius) {
    map.removeLayer(locationMarker.radius)
  }
  // If marker is outside of maxBounds, show error
  if (!map.options.maxBounds.contains(e.latlng)) {
    return window.alert('Your location is outside of the bounds of this map.')
  }
  locationMarker = {
    marker: L.marker(e.latlng).addTo(map).bindPopup('Accuracy: ' + Math.round(radius) + ' meters').openPopup(),
    radius: L.circle(e.latlng, radius).addTo(map)
  }
  map.setView(e.latlng, 14)
})

// Adds the custom icon for a vehicle
var VehicleIcon = L.Icon.extend({
  options: {
    iconSize: [32, 32],
    popupAnchor: [0, -14],
    shadowSize: [32, 50],
    shadowAnchor: [16, 16]
  }
})

// Adds the custom icon for a transit stop
var StopIcon = L.Icon.extend({
  options: {
    iconUrl: 'assets/images/stop.svg',
    iconSize: [16, 16],
    shadowUrl: null,
  }
})

// Route types and agencies have different markers
var getIcons = function (routeData) {
  var iconPath = 'assets/images/nashville-mta/' + routeData.route_type + '.svg'
  var shadowPath = '/assets/images/' + routeData.route_type + '-shadow.svg'
  switch (routeData.agency_gid) {
    case 'Nashville MTA':
      iconPath = 'assets/images/nashville-mta/' + routeData.route_type + '.svg'
      break
    case 'Nashville RTA':
      iconPath = 'assets/images/nashville-rta/' + routeData.route_type + '.svg'
      break
  }
  return {
    stationary: new VehicleIcon({
      iconUrl: iconPath,
      shadowUrl: null
    }),
    moving: new VehicleIcon({
      iconUrl: iconPath,
      shadowUrl: shadowPath
    })
  }
}

// Format popup
var formatPopup = function (e) {
  var popup = e.target.getPopup()
  var routeId = e.target.data.loc.vehicle.trip.route_id
  var tripId = e.target.data.loc.vehicle.trip.trip_id
  var loc = e.target.data.loc
  $.get(GTFS_BASE_URL + '/trips/' + tripId + '.json').done(function (tripData) {
    displayRoute(tripData)
    var content = L.Util.template(
      $('#vehicle_popup_template').html(),
      {
        vehicle: loc.vehicle.vehicle.label,
        route_short_name: routesData[routeId].route_short_name,
        route_long_name: routesData[routeId].route_long_name,
        trip_headsign: tripData.trip_headsign,
        route_color: routesData[routeId].route_color,
        route_text_color: routesData[routeId].route_text_color,
        trip: loc.vehicle.trip.trip_id,
        agency: agenciesData[routesData[routeId].agency_gid].agency_name,
        agency_url: agenciesData[routesData[routeId].agency_gid].agency_url,
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

// Format stop popup
var formatStopPopup = function (stop, route) {
  return L.Util.template(
    $('#stop_popup_template').html(),
    {
      stop_gid: stop.stop_gid,
      stop_sequence: stop.stop_sequence,
      route_color: route.route_color,
      route_text_color: route.route_text_color,
      stop_name: stopsData[stop.stop_gid].stop_name,
      stop_description: stopsData[stop.stop_gid].stop_desc || '',
      scheduled: (stop.arrival_time) ? moment(stop.arrival_time).utc().format('h:mm a') : 'N/A'
    }
  )
}

// Format vehicle tooltip
var formatVehicleTooltip = function (loc) {
  return L.Util.template(
    $('#vehicle_tooltip_template').html(),
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

// Format stop tooltip
var formatStopTooltip = function (stop, route) {
  return L.Util.template(
    $('#stop_tooltip_template').html(),
    {
      stop_gid: stop.stop_gid,
      stop_sequence: stop.stop_sequence,
      route_color: route.route_color,
      route_text_color: route.route_text_color,
      stop_name: stopsData[stop.stop_gid].stop_name,
      stop_description: stopsData[stop.stop_gid].stop_desc || '',
      scheduled: (stop.arrival_time) ? moment(stop.arrival_time).utc().format('h:mm a') : 'N/A'
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
  return (typeof speed !== 'undefined') ? Math.round((speed * 2.2369) * 1000000) + ' mph' : 'N/A'
}

var updateMap = function () {
  // Delete very outdated markers (likely no longer in the feed)
  $.each(markers, function (i, marker) {
    if (Math.round(((Date.now() / 1000) - markers[i].data.updated) / 60) >= 10) {
      map.removeLayer(markers[i])
      delete markers[i]
    }
  })

  $.get(GTFS_BASE_URL + '/realtime/vehicle_positions.json', function (data) {
    // Backoff attempts when no data present
    if (!data || data.length === 0) {
      refreshAttempts++
      console.log('No data returned. Trying again in ' + ((refreshRate * refreshAttempts) / 1000) + ' seconds')
      $('.no-data-overlay').show()
      return
    // Reset it back to 1
    } else {
      refreshAttempts = 1
      $('.no-data-overlay').hide()
    }

    // Loop through feed
    $(data).each(function (i, loc) {
      if (typeof routesData[loc.vehicle.trip.route_id] === 'undefined') {
        return
      }
      var busIcon = getIcons(routesData[loc.vehicle.trip.route_id])
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
        if (!L.Browser.mobile) {
          markers[loc.id].bindTooltip(formatVehicleTooltip(loc))
        }
      // Not found, create a new one
      } else {
        markers[loc.id] = L.marker([loc.vehicle.position.latitude, loc.vehicle.position.longitude], {icon: busIcon.stationary}).bindPopup($('popup_loading_template').html())
        markers[loc.id].on('click', formatPopup)
        // Don't add tooltips for touch-enabled browsers (mobile)
        if (!L.Browser.mobile) {
          markers[loc.id].bindTooltip(formatVehicleTooltip(loc))
        }
        markers[loc.id].addTo(vehiclesLayer)
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
  $.get(GTFS_BASE_URL + '/realtime/alerts.json', function (data) {
    var alertIndicator = $('.alert-indicator')
    if (!data) {
      data = []
    }
    alertIndicator.html(L.Util.template(
      $('#alert_indicator_template').html(),
      {
        count: data.length,
        plural: data.length !== 1 ? 's' : ''
      }
    ))
    alertIndicator.on('click', function (e) {
      displayAlerts(data)
    })
  })
}

// Display Alerts
var displayAlerts = function (data) {
  var alertContainer = $('#service_alerts')
  alertContainer.empty()
  if (!data || data.length === 0) {
    var content = L.Util.template($('#alert_empty_template').html(), {})
    $(alertContainer).append(content)
    $('#service_alerts_modal').modal('show')
  }

  // Add the group container
  var alertGroup = L.Util.template(
    $('#alert_group_template').html(),
    {}
  )
  $(alertContainer).append(alertGroup);

  var alertTypeCounts = {}

  $.each(data, function (i, message) {
    if (!message.alert.effect) {
      message.alert.effect = 'Notice'
    }

    var alertType = message.alert.effect.toLowerCase().replace(' ', '_')

    var alert_class = 'info'
    if (message.alert.effect == 'Detour' || message.alert.effect == 'Significant Delays') {
      alert_class = 'warning'
    }
    if (message.alert.effect == 'Reduced Service' || message.alert.effect == 'No Service') {
      alert_class = 'danger'
    }

    // Create the container for the alerts if not present
    if (!$('#alert-group-' + alertType).length) {
      alertTypeCounts[alertType] = 0
      $('#alertGroup').append(L.Util.template(
        $('#alert_group_item_template').html(),
        {
          type: alertType,
          displayType: message.alert.effect
        }
      ))
    }

    var content = L.Util.template(
      $('#alert_template').html(),
      {
        alert_class: alert_class,
        alert_effect: message.alert.effect,
        alert_cause: message.alert.cause ? ' (' + message.alert.cause +')' : '',
        alert_heading: message.alert.header_text.translation[0].text,
        alert_body: message.alert.description_text.translation[0].text.replace(/(\n)/g, '<br />'),
        start_date: moment.unix(message.alert.active_period[0].start).format('l h:mm a'),
        end_date: moment.unix(message.alert.active_period[0].end).format('l h:mm a')
      }
    )
    $('#alert-group-' + alertType).append(content)
    // Increment counter
    alertTypeCounts[alertType]++
    $('#alert-group-count-' + alertType).html(
      alertTypeCounts[alertType]
    )
  })
  $('#service_alerts_modal').modal('show')
}

// Display the location button
var displayLocationButton = function () {
  var mapToolsContainer = $('.map-tools')
  var locationButton = $(L.Util.template(
    $('#location_button_template').html()
  ))
  $(locationButton).on('click', function (e) {
    map.locate()
  })
  $(mapToolsContainer).append(locationButton)
}

// Display route shape and stops on the map
var displayRoute = function (tripData) {
  var shapeId = tripData.shape_gid
  if (routeShapes[shapeId]) {
    return
  }
  var routeLayer = L.layerGroup().addTo(routesLayer)
  var routeData = routesData[tripData.route_gid]
  $.get(GTFS_BASE_URL + '/shapes/' + shapeId + '.json').done(function (shapeData) {
    $.get(GTFS_BASE_URL + '/trips/' + tripData.trip_gid + '/stop_times').done(function (stopTimesData) {
      $.each(stopTimesData.data, function (i, row) {
        var stopMarker = L.marker([stopsData[row.stop_gid].stop_lat, stopsData[row.stop_gid].stop_lon], {icon: new StopIcon()}).bindPopup(formatStopPopup(row, routeData))
        if (!L.Browser.mobile) {
          stopMarker.bindTooltip(formatStopTooltip(row, routeData))
        }
        stopMarker.addTo(routeLayer)
      })
    })
    var plotPoints = $.map(shapeData.points, function (point) {
      return L.latLng(point.lat, point.lon)
    })
    if (!routeData.route_color) { routeData.route_color = 'bababa' }
    var color = '#' + routeData.route_color
    routeShapes[shapeId] = L.polyline(plotPoints, {color: color, weight: 8, opacity: 0.9}).addTo(routeLayer)
    if (!L.Browser.mobile) {
      routeShapes[shapeId].bindTooltip('Route ' + routeData.route_short_name + ' (click to remove)')
    }
    routeShapes[shapeId].on('click', function (e) {
      map.removeLayer(routeLayer)
      delete routeShapes[shapeId]
    })
  })
}

// Load trip updates
var checkForTripUpdates = function () {
  $.get(GTFS_BASE_URL + '/realtime/trip_updates.json').done(function (updateData) {
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
  $.get(GTFS_BASE_URL + '/trips/' + tripId + '.json').done(function (tripData) {
    var routeId = tripData.route_gid
    if (typeof tripUpdates[tripId] === 'undefined') {
      console.log('tripId', tripId)
      $('#trip_details').html(L.Util.template(
        $('#trip_details_unavailable_template').html(),
        {
          route_short_name: routesData[routeId].route_short_name,
          route_long_name: routesData[routeId].route_long_name,
          trip_headsign: tripData.trip_headsign,
          route_color: routesData[routeId].route_color,
          route_text_color: routesData[routeId].route_text_color,
          agency: agenciesData[routesData[routeId].agency_gid].agency_name,
          agency_url: agenciesData[routesData[routeId].agency_gid].agency_url,
          trip: tripId
        }
      ))
      return
    }

    $.get(GTFS_BASE_URL + '/trips/' + tripId + '/stop_times.json').done(function (stopTimesResult) {
      var stopTimes = {}
      $.each(stopTimesResult.data, function (key, value) {
        stopTimes[value.stop_sequence] = value
      })
      $('#trip_details').html(L.Util.template(
        $('#trip_details_template').html(),
        {
          route_short_name: routesData[routeId].route_short_name,
          route_long_name: routesData[routeId].route_long_name,
          trip_headsign: tripData.trip_headsign,
          route_color: routesData[routeId].route_color,
          route_text_color: routesData[routeId].route_text_color,
          agency: agenciesData[routesData[routeId].agency_gid].agency_name,
          agency_url: agenciesData[routesData[routeId].agency_gid].agency_url,
          trip: tripData.trip_gid,
          start_time: moment(tripUpdates[tripId].trip_update.trip.start_time, 'hh:mm:ss').format('h:mm a'),
          updated: (tripUpdates[tripId].trip_update.timestamp) ? moment.unix(tripUpdates[tripId].trip_update.timestamp).format('h:mm a') : 'Not yet started.',
          vehicle: tripUpdates[tripId].trip_update.vehicle.label
        }
      ))
      var stopTimeUpdatesTableBody = $('#trip_stop_time_updates tbody')
      $(stopTimeUpdatesTableBody).empty()
      var rowHighlighted = false
      $.each(tripUpdates[tripId].trip_update.stop_time_update, function (i, update) {
        var time = false
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
            stop_name: stopsData[update.stop_id].stop_name,
            stop_description: stopsData[update.stop_id].stop_desc || '',
            eta: (time) ? moment.unix(time).format('h:mm a') : 'N/A',
            scheduled: (stopTimes[update.stop_sequence].arrival_time) ? moment(stopTimes[update.stop_sequence].arrival_time).utc().format('h:mm a') : 'N/A'
          }
        ))
        // Dim rows in the past
        if (time <= Math.round(Date.now() / 1000)) {
          row.addClass('text-muted')
        }
        // Trip must have started, no previous rows highlighted and the time must be in the future
        if (tripUpdates[tripId].trip_update.timestamp && !rowHighlighted && time >= Math.round(Date.now() / 1000)) {
          row.addClass('table-info')
          $('td .badge-info', row).removeClass('badge-info').addClass('badge-light')
          rowHighlighted = true
        }
        $(stopTimeUpdatesTableBody).append(row)
      })
    })
  })
}

// Check for location services
if (navigator.geolocation) {
  displayLocationButton()
}

// Load agency and route data
$.get(GTFS_BASE_URL + '/routes.json', function (result1) {
  $.each(result1['data'], function (i, row) {
    routesData[row.route_gid] = row
    /* ID and short name may not match, and the RTFS uses the short name */
    routesData[row.route_short_name] = row
  })
  $.get(GTFS_BASE_URL + '/agencies.json', function (result2) {
    $.each(result2['data'], function (i, row) {
      agenciesData[row.agency_gid] = row
    })
    $.get(GTFS_BASE_URL + '/stops?per_page=10000', function (result3) {
      $.each(result3['data'], function (i, row) {
        stopsData[row.stop_gid] = row
      })
      // Update map on a schedule
      updateMap()
    })
  })
})
