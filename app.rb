require 'dotenv/load'
require 'sinatra/base'
require 'sinatra/content_for'
require 'net/http'
require 'uri'
require 'fileutils'
require 'date'
require 'active_support/core_ext/time'

def api_request(path)
  uri = URI.parse("#{ENV['GTFS_BASE_URL']}#{path}")
  response = Net::HTTP.get_response(uri)
  JSON.parse(response.body)
end

##
# WeGo Bus Map
class WeGoBusMap < Sinatra::Base
  helpers Sinatra::ContentFor

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
    routes = response['data']
    erb :routes, locals: { routes: routes }
  end

  get '/routes/:route_gid/?' do
    route = api_request "/routes/#{params['route_gid'].to_i}"
    response = api_request "/routes/#{params['route_gid'].to_i}/trips"
    trips = response['data']
    erb :route, locals: { route: route, trips: trips }
  end

  # start the server if ruby file executed directly
  run! if app_file == $PROGRAM_NAME
end
