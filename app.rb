require 'dotenv/load'
require 'sinatra/base'
require 'sinatra/content_for'
require 'protobuf'
require 'google/transit/gtfs-realtime.pb'
require 'net/http'
require 'uri'
require 'gtfs_reader'
require 'fileutils'
require 'date'

##
# WeGo Bus Map
class WeGoBusMap < Sinatra::Base
  VEHICLE_POSITIONS_URL = 'http://transitdata.nashvillemta.org/TMGTFSRealTimeWebService/vehicle/vehiclepositions.pb'.freeze
  TRIP_UPDATES_URL = 'http://transitdata.nashvillemta.org/TMGTFSRealTimeWebService/tripupdate/tripupdates.pb'.freeze
  ALERTS_URL = 'http://transitdata.nashvillemta.org/TMGTFSRealTimeWebService/alert/alerts.pb'.freeze
  DATA_DIRECTORY = File.join(__dir__, 'data', 'gtfs')
  CACHE_DIRECTORY = File.join(__dir__, 'cache')
  REALTIME_CACHE_TTL = 5
  GTFS_STATIC_CACHE_TTL = 300

  # Set up cache directory
  FileUtils.mkdir_p CACHE_DIRECTORY

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
    @agencies = File.read(File.join(DATA_DIRECTORY, 'agency.json'))
    @routes = File.read(File.join(DATA_DIRECTORY, 'routes.json'))
    erb :index, layout: 'layouts/app'.to_sym
  end

  get '/about/?' do
    erb :about
  end

  get '/gtfs/realtime/vehiclepositions.json' do
    cacheFile = File.join(CACHE_DIRECTORY, 'vehiclepositions.json')
    if File.exist?(cacheFile) and (Time.now - File.stat(cacheFile).mtime).to_i <= REALTIME_CACHE_TTL
      cache_control :public, max_age: REALTIME_CACHE_TTL
      response.headers['content-type'] = 'application/json'
      return File.read(cacheFile)
    end

    positions = []
    data = Net::HTTP.get(URI.parse(VEHICLE_POSITIONS_URL))
    feed = Transit_realtime::FeedMessage.decode(data)

    feed.entity.each do |entity|
      positions << entity
    end

    File.open(cacheFile, 'w') do |f|
      f.write positions.to_json
      f.close
    end

    cache_control :public, max_age: REALTIME_CACHE_TTL
    response.headers['content-type'] = 'application/json'
    positions.to_json
  end

  get '/gtfs/realtime/tripupdates.json' do
    cacheFile = File.join(CACHE_DIRECTORY, 'tripupdates.json')
    if File.exist?(cacheFile) and (Time.now - File.stat(cacheFile).mtime).to_i <= REALTIME_CACHE_TTL
      cache_control :public, max_age: REALTIME_CACHE_TTL
      response.headers['content-type'] = 'application/json'
      return File.read(cacheFile)
    end

    updates = []
    data = Net::HTTP.get(URI.parse(TRIP_UPDATES_URL))
    feed = Transit_realtime::FeedMessage.decode(data)
    feed.entity.each do |entity|
      updates << entity
    end

    File.open(cacheFile, 'w') do |f|
      f.write updates.to_json
      f.close
    end

    cache_control :public, max_age: REALTIME_CACHE_TTL
    response.headers['content-type'] = 'application/json'
    updates.to_json
  end

  get '/gtfs/realtime/alerts.json' do
    cacheFile = File.join(CACHE_DIRECTORY, 'alerts.json')
    if File.exist?(cacheFile) and (Time.now - File.stat(cacheFile).mtime).to_i <= REALTIME_CACHE_TTL
      cache_control :public, max_age: REALTIME_CACHE_TTL
      response.headers['content-type'] = 'application/json'
      return File.read(cacheFile)
    end

    alerts = []
    data = Net::HTTP.get(URI.parse(ALERTS_URL))
    feed = Transit_realtime::FeedMessage.decode(data)
    feed.entity.each do |entity|
      alerts << entity
    end

    File.open(cacheFile, 'w') do |f|
      f.write alerts.to_json
      f.close
    end

    cache_control :public, max_age: REALTIME_CACHE_TTL
    response.headers['content-type'] = 'application/json'
    alerts.to_json
  end

  get '/gtfs/trips/:trip_id.json' do
    cache_control :public, max_age: GTFS_STATIC_CACHE_TTL
    response.headers['content-type'] = 'application/json'
    File.read(File.join(DATA_DIRECTORY, 'trips', "#{params['trip_id']}.json"))
  end

  get '/gtfs/shapes/:shape_id.json' do
    cache_control :public, max_age: GTFS_STATIC_CACHE_TTL
    response.headers['content-type'] = 'application/json'
    File.read(File.join(DATA_DIRECTORY, 'shapes', "#{params['shape_id']}.json"))
  end

  # start the server if ruby file executed directly
  run! if app_file == $PROGRAM_NAME
end
