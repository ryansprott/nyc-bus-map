(function () {
    'use strict';

    angular.module('busMap').service('busService', busService);

    busService.$inject = ['$http'];

    function busService($http) {        
        this.getBusesForStop = function(stopId) {
            var url = '/get_buses_for_stop/' + stopId;
            return fetchData(url);
        }

        this.getStopInfo = function (stopId) {
            var url = '/get_stop_info/' + stopId;
            return fetchData(url);
        }

        this.getRouteStops = function (routeId) {
            var url = '/get_stops_for_route/' + routeId;
            return fetchData(url);
        }

        this.getNearbyStops = function (lat, lon) {
            var url = '/get_nearby_stops?lat=' + lat + '&lon=' + lon;
            return fetchData(url);
        }

        this.getStopSchedule = function (stopId) {
            var url = '/get_schedule_for_stop/' + stopId;            
            return fetchData(url);
        }

        function fetchData(url) {            
            return $http.get(url).then(function (data) {
                return data;
            }).catch(function (error) {
                console.log('Error fetching ' + url + ': ' + error.statusText + ' ' + error.status);
            });
        }
    }

})();
