require 'sinatra/base'
require 'protobuf'
require 'google/transit/gtfs-realtime.pb'
require 'net/http'
require 'uri'

class WeGoBusMap < Sinatra::Base
  VEHICLE_POSITIONS_URL = 'http://transitdata.nashvillemta.org/TMGTFSRealTimeWebService/vehicle/vehiclepositions.pb'

  get '/' do
    erb :index
  end

  get '/vehicle_locations.json' do
    # Vehicle Locations
    positions = []
    data = Net::HTTP.get(URI.parse(VEHICLE_POSITIONS_URL))
    feed = Transit_realtime::FeedMessage.decode(data)
    for entity in feed.entity do
      positions << entity
    end
    response.headers['content-type'] = 'application/json'
    positions.to_json
  end

  # start the server if ruby file executed directly
  run! if app_file == $0
end
