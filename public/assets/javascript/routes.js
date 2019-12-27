/* globals $, L, moment, handlebars, GTFS_BASE_URL */

var routeBox = Handlebars.compile($('#routeBlock').html())

$.getJSON(GTFS_BASE_URL + "/routes.json", {}, function (routes) {
  $(routes.data).each(function (i, route) {
    $('#routesContainer').append(routeBox(route))
  })
})
