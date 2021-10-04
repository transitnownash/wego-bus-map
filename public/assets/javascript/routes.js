/* globals $, L, moment, GTFS_BASE_URL */

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

const routesLayer = L.layerGroup().addTo(map)

const routeShapes = {}
const routeData = {
  route_gid: $('#route_header').data('route_gid'),
  route_color: $('#route_header').data('route_color')
}
$('tbody tr').each(function (i, el) {
  // Get shapes, draw on map
  const shapeId = $(el).data('shape_gid')
  if (!routeShapes[shapeId]) {
    $.get(GTFS_BASE_URL + '/shapes/' + shapeId + '.json').done(function (shapeData) {
      const plotPoints = $.map(shapeData.points, function (point) {
        return L.latLng(point.lat, point.lon)
      })
      if (!routeData.route_color) { routeData.route_color = 'bababa' }
      const color = '#' + routeData.route_color
      const routeShape = L.polyline(plotPoints, { color: color, weight: 8, opacity: 0.9 }).addTo(routesLayer)
      map.panTo(routeShape.getBounds().getCenter())
      map.fitBounds(routeShape.getBounds(), { padding: [20, 20] })
    })
  }
  routeShapes[shapeId] = true

  // Fade rows where trip has already happened
  const now = moment()
  const startTime = $(el).data('start_time')
  const endTime = $(el).data('end_time')
  if (now.isBetween(moment(startTime, moment.HTML5_FMT.TIME_SECONDS), moment(endTime, moment.HTML5_FMT.TIME_SECONDS))) {
    $(el).css({ border: 'solid 2px #' + routeData.route_color })
  } else {
    if (moment(startTime, moment.HTML5_FMT.TIME_SECONDS).isBefore(now)) {
      $(el).css({ opacity: 0.25 })
    }
  }
})
// Display Alerts
const displayRouteAlerts = function () {
  const renderedAlerts = {}
  $.get(GTFS_BASE_URL + '/realtime/alerts.json').done(function (alertData) {
    $(alertData).each(function (i, message) {
      $(message.alert.informed_entity).each(function (i, entity) {
        if (renderedAlerts[message.id]) {
          return
        }
        renderedAlerts[message.id] = true
        if (entity.route_id === routeData.route_gid) {
          if (!message.alert.effect) {
            message.alert.effect = 'Notice'
          }

          var alertClass = 'info'
          if (message.alert.effect === 'Detour' || message.alert.effect === 'Significant Delays') {
            alertClass = 'warning'
          }
          if (message.alert.effect === 'Reduced Service' || message.alert.effect === 'No Service') {
            alertClass = 'danger'
          }

          const content = L.Util.template(
            $('#alert_template').html(),
            {
              alert_class: alertClass,
              alert_effect: message.alert.effect,
              alert_cause: message.alert.cause ? ' (' + message.alert.cause + ')' : '',
              alert_heading: message.alert.header_text.translation[0].text,
              alert_body: message.alert.description_text.translation[0].text.replace(/(\n)/g, '<br />'),
              start_date: moment.unix(message.alert.active_period[0].start).format('l h:mm a'),
              end_date: moment.unix(message.alert.active_period[0].end).format('l h:mm a')
            }
          )
          $('#alert_container').append(content)
        }
      })
    })
  })
}

$(function () {
  // Format timetable; handles times that flow into next day
  $('.format-time').each(function (i, el) {
    const time = $(el).html()
    const formatted = moment().startOf('day').add(moment.duration(time)).format('h:mm a')
    $(el).html(formatted)
  })
  $('[data-toggle="tooltip"]').tooltip()
  displayRouteAlerts()
})
