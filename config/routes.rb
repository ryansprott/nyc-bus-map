Rails.application.routes.draw do
  root 'home#index'
  get '/get_buses_for_stop/:id' => 'api#get_buses_for_stop', as: 'get_buses_for_stop'
  get '/get_stop_info/:id' => 'api#get_stop_info', as: 'get_stop_info'
  get '/get_stops_for_route/:id' => 'api#get_stops_for_route', as: 'get_stops_for_route'
  get '/get_nearby_stops' => 'api#get_nearby_stops', as: 'get_nearby_stops'
  get '/get_schedule_for_stop/:id' => 'api#get_schedule_for_stop', as: 'get_schedule_for_stop' 
end
