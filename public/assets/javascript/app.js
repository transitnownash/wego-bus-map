/* globals $, L, moment, GTFS_BASE_URL */

const refreshRate = 5 * 1000
let refreshAttempts = 1

const markers = {}
const locationMarker = {}
const tripUpdates = {}
const routesData = {}
const agenciesData = {}
const routeShapes = {}
const stopsData = {}

// Sets up a map of Nashville
const map = L.map('map', {
  doubleClickZoom: false,
  center: L.latLng(36.166512, -86.781581),
  maxBounds: L.latLngBounds(
    L.latLng(36.725005, -87.579122), // northwest
    L.latLng(35.541600, -86.097066) // southeast
  ),
  zoom: 12
})

L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}{r}.png', {
  subdomains: 'abcd',
  maxZoom: 19,
  minZoom: 11,
  attribution: $('#attribution_template').html()
}).addTo(map)

const vehiclesLayer = L.layerGroup().addTo(map)
const routesLayer = L.layerGroup().addTo(map)
const stopsLayer = L.layerGroup().addTo(map)
const bcycleLayer = L.layerGroup().addTo(map)

L.control.layers(
  null,
  {
    'Vehicles': vehiclesLayer, // eslint-disable-line
    'Routes': routesLayer,     // eslint-disable-line
    'Stops': stopsLayer,       // eslint-disable-line
    'BCycle': bcycleLayer      // eslint-disable-line
  }
).addTo(map)

// Handle location detection success
map.on('locationerror', function (e) {
  console.error(e)
  return window.alert('Unable to find your location.')
})

// Handle location detection error
map.on('locationfound', function (e) {
  const radius = e.accuracy / 2
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
  locationMarker.marker = L.marker(e.latlng).addTo(map).bindPopup('Accuracy: ' + Math.round(radius) + ' meters').openPopup()
  locationMarker.radius = L.circle(e.latlng, radius).addTo(map)
  map.setView(e.latlng, 14)
})

// Adds the custom icon for a vehicle
const VehicleIcon = L.Icon.extend({
  options: {
    iconSize: [32, 32],
    popupAnchor: [0, -14],
    shadowSize: [32, 50],
    shadowAnchor: [16, 16]
  }
})

// Adds the custom icon for a transit stop
const StopIcon = L.Icon.extend({
  options: {
    iconUrl: 'assets/images/stop.svg',
    iconSize: [16, 16],
    shadowUrl: null
  }
})

// Route types and agencies have different markers
const getIcons = function (routeData) {
  const iconPath = 'assets/images/' + routeData.route_type + '.svg'
  const shadowPath = 'assets/images/' + routeData.route_type + '-shadow.svg'
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
const formatPopup = function (e) {
  const popup = e.target.getPopup()
  const routeId = e.target.data.loc.vehicle.trip.route_id
  const tripId = e.target.data.loc.vehicle.trip.trip_id
  const loc = e.target.data.loc
  $.get(GTFS_BASE_URL + '/trips/' + tripId + '.json').done(function (tripData) {
    displayRoute(tripData)
    const content = L.Util.template(
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
const formatStopPopup = function (stop, route) {
  return L.Util.template(
    $('#stop_popup_template').html(),
    {
      stop_gid: stop.stop_gid,
      stop_sequence: stop.stop_sequence,
      route_color: route.route_color,
      route_text_color: route.route_text_color,
      stop_name: stopsData[stop.stop_gid].stop_name,
      stop_description: stopsData[stop.stop_gid].stop_desc || '',
      scheduled: (stop.arrival_time) ? moment(stop.arrival_time, moment.HTML5_FMT.TIME_SECONDS).format('h:mm a') : 'N/A'
    }
  )
}

// Format vehicle tooltip
const formatVehicleTooltip = function (loc) {
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
const formatStopTooltip = function (stop, route) {
  return L.Util.template(
    $('#stop_tooltip_template').html(),
    {
      stop_gid: stop.stop_gid,
      stop_sequence: stop.stop_sequence,
      route_color: route.route_color,
      route_text_color: route.route_text_color,
      stop_name: stopsData[stop.stop_gid].stop_name,
      stop_description: stopsData[stop.stop_gid].stop_desc || '',
      scheduled: (stop.arrival_time) ? moment(stop.arrival_time, moment.HTML5_FMT.TIME_SECONDS).format('h:mm a') : 'N/A'
    }
  )
}

// Convert degrees to nearest ordinal direction
const formatDegreeToCompass = function (num) {
  if (!num || typeof num === 'undefined') {
    return 'N/A'
  }
  const val = Math.floor((num / 22.5) + 0.5)
  const arr = [
    'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE',
    'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW',
    'NW', 'NNW'
  ]
  return arr[(val % 16)]
}

// Format speed from (micro?)meters per second to miles per hour
const formatVehicleSpeed = function (speed) {
  return (typeof speed !== 'undefined') ? Math.round(speed * 2.2369) + ' mph' : 'N/A'
}

const updateMap = function () {
  // Delete very outdated markers (likely no longer in the feed)
  $.each(markers, function (i) {
    if (Math.round(((Date.now() / 1000) - markers[i].data.updated) / 60) >= 10) {
      map.removeLayer(markers[i])
      markers[i].remove()
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
      // A marker that doesn't have corresponding data
      if (typeof routesData[loc.vehicle.trip.route_id] === 'undefined') {
        console.error(
          'No matching route found!',
          'Route ID: ' + loc.vehicle.trip.route_id,
          'Trip ID: ' + loc.vehicle.trip.trip_id,
          'Vehicle: ' + loc.vehicle.vehicle.label,
          'Payload:', loc
        )
        return
      }
      const busIcon = getIcons(routesData[loc.vehicle.trip.route_id])
      // Find existing marker
      if (markers[loc.id]) {
        const latlng = L.latLng(loc.vehicle.position.latitude, loc.vehicle.position.longitude)
        markers[loc.id].slideTo(latlng, { duration: 1000 })
        markers[loc.id].setRotationShadowAngle(loc.vehicle.position.bearing)
        markers[loc.id].setOpacity(1)
        markers[loc.id].data.loc = loc
        markers[loc.id].data.updated = loc.vehicle.timestamp
        // Update an open popup
        if (markers[loc.id].isPopupOpen()) {
          formatPopup({ target: markers[loc.id] })
        }
        // Don't add tooltips for touch-enabled browsers (mobile)
        if (!L.Browser.mobile) {
          markers[loc.id].bindTooltip(formatVehicleTooltip(loc))
        }
      // Not found, create a new one
      } else {
        markers[loc.id] = L.marker([loc.vehicle.position.latitude, loc.vehicle.position.longitude], { icon: busIcon.stationary }).bindPopup($('popup_loading_template').html())
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
      const locationAge = Math.round(((Date.now() / 1000) - loc.vehicle.timestamp) / 60)
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
const checkForAlerts = function () {
  $.get(GTFS_BASE_URL + '/realtime/alerts.json', function (data) {
    const alertIndicator = $('.alert-indicator')
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
    alertIndicator.on('click', function () {
      displayAlerts(data)
    })
  })
}

// Display Alerts
const displayAlerts = function (data) {
  const alertContainer = $('#service_alerts')
  alertContainer.empty()
  if (!data || data.length === 0) {
    const content = L.Util.template($('#alert_empty_template').html(), {})
    $(alertContainer).append(content)
    $('#service_alerts_modal').modal('show')
  }

  // Add the group container
  const alertGroup = L.Util.template(
    $('#alert_group_template').html(),
    {}
  )
  $(alertContainer).append(alertGroup)

  const alertTypeCounts = {}

  $.each(data, function (i, message) {
    if (!message.alert.effect) {
      message.alert.effect = 'Notice'
    }

    const alertType = message.alert.effect.toLowerCase().replace(' ', '_')

    let alertClass = 'info'
    if (message.alert.effect === 'Detour' || message.alert.effect === 'Significant Delays') {
      alertClass = 'warning'
    }
    if (message.alert.effect === 'Reduced Service' || message.alert.effect === 'No Service') {
      alertClass = 'danger'
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

    const startDate = moment.unix(message.alert.active_period[0].start)
    const endDate = moment.unix(message.alert.active_period[0].end)
    let duration = 'From ' + startDate.format('LLL') + ' to ' + endDate.format('LLL')
    const rawDuration = startDate.toString() + ' - ' + endDate.toString()
    if (endDate.year() > 2050) {
      duration = 'Since ' + startDate.format('LLL')
    }

    const content = L.Util.template(
      $('#alert_template').html(),
      {
        alert_class: alertClass,
        alert_effect: message.alert.effect,
        alert_cause: message.alert.cause ? ' (' + message.alert.cause + ')' : '',
        alert_heading: message.alert.header_text.translation[0].text,
        alert_body: message.alert.description_text.translation[0].text.replace(/(\n)/g, '<br />'),
        duration: duration,
        duration_raw: rawDuration
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
const displayLocationButton = function () {
  const mapToolsContainer = $('.map-tools')
  const locationButton = $(L.Util.template(
    $('#location_button_template').html()
  ))
  $(locationButton).on('click', function () {
    map.locate()
  })
  $(mapToolsContainer).append(locationButton)
}

// Display route shape and stops on the map
const displayRoute = function (tripData) {
  const shapeId = tripData.shape_gid
  // prevents teh same shape from being drawn multiple times on click
  if (routeShapes[shapeId]) {
    return
  }
  const routeLayer = L.layerGroup().addTo(routesLayer)
  const stopLayer = L.layerGroup().addTo(stopsLayer)
  const routeData = routesData[tripData.route_gid]
  $.get(GTFS_BASE_URL + '/shapes/' + shapeId + '.json').done(function (shapeData) {
    $.get(GTFS_BASE_URL + '/trips/' + tripData.trip_gid + '/stop_times').done(function (stopTimesData) {
      $.each(stopTimesData.data, function (i, row) {
        const stopMarker = L.marker([stopsData[row.stop_gid].stop_lat, stopsData[row.stop_gid].stop_lon], { icon: new StopIcon() }).bindPopup(formatStopPopup(row, routeData))
        if (!L.Browser.mobile) {
          stopMarker.bindTooltip(formatStopTooltip(row, routeData))
        }
        stopMarker.addTo(stopLayer)
      })
    })
    const plotPoints = $.map(shapeData.points, function (point) {
      return L.latLng(point.lat, point.lon)
    })
    if (!routeData.route_color) { routeData.route_color = 'bababa' }
    const color = '#' + routeData.route_color
    routeShapes[shapeId] = L.polyline(plotPoints, { color: color, weight: 8, opacity: 0.9 }).addTo(routeLayer)
    routeShapes[shapeId].setText(routeData.route_short_name + ' - ' + routeData.route_long_name + '►     ', {
      repeat: true,
      offset: -5,
      attributes: {
        fill: color,
        'font-weight': 'bold',
        'font-size': 10,
        opacity: 0.4
      }
    })
    if (!L.Browser.mobile) {
      routeShapes[shapeId].bindTooltip('Route ' + routeData.route_short_name + ' (click to remove)')
    }
    routeShapes[shapeId].on('click', function () {
      stopsLayer.removeLayer(stopLayer)
      routesLayer.removeLayer(routeLayer)
      // Allows the shape to be redrawn
      routeShapes[shapeId] = false
    })
  })
}

// Load trip updates
const checkForTripUpdates = function () {
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
const showTripDetails = function (tripId) {
  const tripModal = $('#trip_details_modal')
  tripModal.modal('show')
  $.get(GTFS_BASE_URL + '/trips/' + tripId + '.json').done(function (tripData) {
    const routeId = tripData.route_gid
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
      const stopTimes = {}
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
      const stopTimeUpdatesTableBody = $('#trip_stop_time_updates tbody')
      $(stopTimeUpdatesTableBody).empty()
      let rowHighlighted = false
      $.each(tripUpdates[tripId].trip_update.stop_time_update, function (i, update) {
        let time = false
        if (typeof update.departure !== 'undefined') {
          time = update.departure.time
        }
        if (typeof update.arrival !== 'undefined') {
          time = update.arrival.time
        }
        const row = $(L.Util.template(
          $('#trip_stop_time_update_body').html(),
          {
            stop_sequence: update.stop_sequence,
            stop_id: update.stop_id,
            stop_name: stopsData[update.stop_id].stop_name,
            stop_description: stopsData[update.stop_id].stop_desc || '',
            eta: (time) ? moment.unix(time).format('h:mm a') : 'N/A',
            scheduled: (stopTimes[update.stop_sequence].arrival_time) ? moment(stopTimes[update.stop_sequence].arrival_time, moment.HTML5_FMT.TIME_SECONDS).format('h:mm a') : 'N/A'
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
  $.each(result1.data, function (i, row) {
    routesData[row.route_gid] = row
    /* ID and short name may not match, and the RTFS uses the short name */
    routesData[row.route_short_name] = row
  })
  $.get(GTFS_BASE_URL + '/agencies.json', function (result2) {
    $.each(result2.data, function (i, row) {
      agenciesData[row.agency_gid] = row
    })
    $.get(GTFS_BASE_URL + '/stops?per_page=10000', function (result3) {
      $.each(result3.data, function (i, row) {
        stopsData[row.stop_gid] = row
      })
      // Update map on a schedule
      updateMap()
    })
  })
})
