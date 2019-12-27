require 'dotenv/load'
require 'sinatra/base'
require 'sinatra/content_for'
require 'net/http'
require 'uri'
require 'fileutils'
require 'date'

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
    erb :routes
  end

  # start the server if ruby file executed directly
  run! if app_file == $PROGRAM_NAME
end
