class ApiController < ApplicationController
  before_action :set_instance_variables
  require "erb"
  include ERB::Util
  
  def get_buses_for_stop 
    url = @base_url + 'siri/stop-monitoring.json?' + @api_key + '&MonitoringRef=' + params[:id].to_s 
    api_call(url) 
  end

  def get_stop_info
    url = @base_url + 'where/stop/MTA_' + params[:id].to_s + '.json?' + @api_key
    api_call(url) 
  end

  def get_stops_for_route 
    # the route name may include spaces, so it needs to be URL-encoded to avoid JSON parse errors
    url = @base_url + 'where/stops-for-route/' + url_encode(params[:id].to_s) + ".json?" + @api_key    
    api_call(url)    
  end

  def get_nearby_stops
    url = @base_url + 'where/stops-for-location.json?' + @api_key + '&lat=' + params[:lat].to_s + '&lon=' + params[:lon].to_s
    api_call(url)
  end

  def get_schedule_for_stop
    url = @base_url + 'where/schedule-for-stop/MTA_' + params[:id].to_s + '.json?' + @api_key
    api_call(url)
  end

  private

  def set_instance_variables 
    @base_url = 'http://bustime.mta.info/api/'
    @api_key = 'key=' + Rails.application.secrets.mta_api_key
  end

  def api_call(url)
    curl = Curl::Easy.new
    curl.url = url
    curl.http_get
    render json: JSON.parse(curl.body_str)
  end

end
