/* globals $, L, moment, handlebars, GTFS_BASE_URL */

// Sets up a map of Nashville
var map = L.map('map', {
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
  attribution: $('#attribution_template').html(),
}).addTo(map)

var routesLayer = L.layerGroup().addTo(map)

var routeShapes = {}
var routeData = {
  route_color: $('#route_header').data('route_color'),
}
$('tbody tr').each(function(i, el) {
  // Get shapes, draw on map
  var shapeId = $(el).data('shape_gid')
  if (!routeShapes[shapeId]) {
    $.get(GTFS_BASE_URL + '/shapes/' + shapeId + '.json').done(function (shapeData) {
      var plotPoints = $.map(shapeData.points, function (point) {
        return L.latLng(point.lat, point.lon)
      })
      if (!routeData.route_color) { routeData.route_color = 'bababa' }
      var color = '#' + routeData.route_color
      var routeShape = L.polyline(plotPoints, {color: color, weight: 8, opacity: 0.9}).addTo(routesLayer)
      map.panTo(routeShape.getBounds().getCenter())
    })
  }
  routeShapes[shapeId] = true

  // Fade rows where trip has already happened
  var now = moment()
  var start_time = $(el).data('start_time')
  var end_time = $(el).data('end_time')
  if (now.isBetween(moment(start_time, moment.HTML5_FMT.TIME_SECONDS), moment(end_time, moment.HTML5_FMT.TIME_SECONDS))) {
    $(el).css({border: 'solid 2px #' + routeData.route_color})
  } else {
    if (moment(start_time, moment.HTML5_FMT.TIME_SECONDS).isBefore(now)) {
      $(el).css({opacity: 0.25})
    }
  }
})

$(function () {
  $('[data-toggle="tooltip"]').tooltip()
})
