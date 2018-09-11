require 'sinatra/base'
require 'protobuf'
require 'google/transit/gtfs-realtime.pb'
require 'net/http'
require 'uri'
require 'gtfs_reader'

# Configure the static parsing of GTFS feeds
GtfsData = { agency: {}, routes: {}, trips: {}, shapes: {} }
GtfsReader.config do
  return_hashes true
  sources do
    default do
      url File.join(__dir__, './data/gtfs/google_transit.zip')
      before { |etag| puts "Processing GTFS source with tag #{etag}..." }
      handlers do
        agency { |row| GtfsData[:agency][row[:agency_id]] = row }
        routes { |row| GtfsData[:routes][row[:route_id]] = row }
        shapes do |row|
          GtfsData[:shapes][row[:shape_id]] = [] unless GtfsData[:shapes][row[:shape_id]]
          GtfsData[:shapes][row[:shape_id]] << row
        end
        trips { |row| GtfsData[:trips][row[:trip_id]] = row }
      end
    end
  end
end

##
# WeGo Bus Map
class WeGoBusMap < Sinatra::Base
  VEHICLE_POSITIONS_URL = 'http://transitdata.nashvillemta.org/TMGTFSRealTimeWebService/vehicle/vehiclepositions.pb'.freeze

  before do
    GtfsReader.update :default if GtfsData[:routes].empty?
  end

  get '/' do
    erb :index
  end

  get '/vehicle_locations.json' do
    # Vehicle Locations
    positions = []
    data = Net::HTTP.get(URI.parse(VEHICLE_POSITIONS_URL))
    feed = Transit_realtime::FeedMessage.decode(data)

    feed.entity.each do |entity|
      positions << entity
    end
    response.headers['content-type'] = 'application/json'
    positions.to_json
  end

  get '/gtfs/routes.json' do
    response.headers['content-type'] = 'application/json'
    GtfsData[:routes].to_json
  end

  get '/gtfs/routes/:route_id.json' do
    data = GtfsData[:routes][params['route_id']] || not_found
    response.headers['content-type'] = 'application/json'
    data.to_json
  end

  get '/gtfs/trips.json' do
    response.headers['content-type'] = 'application/json'
    GtfsData[:trips].to_json
  end

  get '/gtfs/trips/:trip_id.json' do
    data = GtfsData[:trips][params['trip_id']] || not_found
    response.headers['content-type'] = 'application/json'
    data.to_json
  end

  get '/gtfs/shapes.json' do
    response.headers['content-type'] = 'application/json'
    GtfsData[:shapes].to_json
  end

  get '/gtfs/shapes/:shape_id.json' do
    data = GtfsData[:shapes][params['shape_id']] || not_found
    response.headers['content-type'] = 'application/json'
    data.to_json
  end

  # start the server if ruby file executed directly
  run! if app_file == $PROGRAM_NAME
end
