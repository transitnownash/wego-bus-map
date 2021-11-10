require 'dotenv/load'
require 'sinatra/base'
require 'sinatra/content_for'
require 'net/http'
require 'uri'
require 'fileutils'
require 'date'
require 'sinatra/cors'

def api_request(path)
  uri = URI.parse("#{ENV['GTFS_BASE_URL']}#{path}")
  response = Net::HTTP.get_response(uri)
  JSON.parse(response.body)
end

##
# WeGo Bus Map
class WeGoBusMap < Sinatra::Base
  helpers Sinatra::ContentFor

  accessibility_messages = {
    wheelchairs: [
      'No accessibility information for the trip.',
      'Vehicle being used on this particular trip can accommodate at least one rider in a wheelchair.',
      'No riders in wheelchairs can be accommodated on this trip.'
    ],
    bikes: [
      'No bike information for the trip.',
      'Vehicle being used on this particular trip can accommodate at least one bicycle.',
      'No bicycles are allowed on this trip.'
    ]
  }

  set :allow_origin, 'https://gtfs.transitnownash.org'

  configure :development, :test do
    set :force_ssl, (ENV['FORCE_SSL'] == '1')
  end

  configure :production do
    set :force_ssl, true
  end

  before do
    @google_analytics_id = ENV['GOOGLE_ANALYTICS_ID'] || ''
  end

  get '/' do
    erb :index, layout: 'layouts/app'.to_sym
  end

  get '/about/?' do
    erb :about
  end

  get '/routes/?' do
    response = api_request '/routes'
    routes = response['data'].sort_by! {|s| s['route_gid'][/\d+/].to_i}
    erb :routes, locals: { routes: routes }
  end

  get '/routes/:route_gid/?' do
    route = api_request "/routes/#{params['route_gid'].to_i}"
    response = api_request "/routes/#{params['route_gid'].to_i}/trips"
    trips = response['data']
    erb :route, locals: { route: route, trips: trips, accessibility_messages: accessibility_messages }
  end

  # start the server if ruby file executed directly
  run! if app_file == $PROGRAM_NAME
end
