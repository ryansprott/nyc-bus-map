(function () {
    'use strict';

    angular.module('busMap').controller('MainController', mainController);

    mainController.$inject = ['busService', '$scope', '$timeout'];

    function mainController(busService, $scope, $timeout) {
        var vm = this;

        vm.switchStop = function (code) {
            vm.stopId = code;
            vm.doSearch();
            angular.element('#map-tab').trigger('click');
        }

        vm.doSearch = function () {                        
            if (vm.stopId) {                
                getBuses();
                getStopInfo();
                getArrivalTimes();
                vm.retrievedAt = new Date().toLocaleTimeString();
            }          
        }

        vm.recenterOnBus = function (bus) {
            $scope.$broadcast('setCenter', bus);
            angular.element('#map-tab').trigger('click');
        }

        function getBuses() {            
            busService.getBusesForStop(vm.stopId).then(function (data) {                
                var busData = data.data.Siri.ServiceDelivery.StopMonitoringDelivery[0];                
                if (busData.ErrorCondition) {
                    vm.stopInfo = { name: 'ERROR', direction: busData.ErrorCondition.Description };
                    initializeController();
                    $scope.$broadcast('searchFailed', vm.stopId);
                } else {
                    vm.busData = busData;
                    $scope.$broadcast('searchSucceeded', vm.stopId);
                }                                
            });
        }

        function getStopInfo() {
            busService.getStopInfo(vm.stopId).then(function (data) {
                if (data) {                    
                    vm.stopInfo = data.data.data;
                    getRoutes();
                    getNearbyStops();
                }
            });
        }

        function getArrivalTimes() {
            vm.arrivals = [];
            busService.getStopSchedule(vm.stopId).then(function (data) {
                var scheduleData = data.data.data.entry.stopRouteSchedules;                
                scheduleData.map(function (route) {
                    var routeName = route.routeId.slice(route.routeId.lastIndexOf('_') + 1)
                        + ' - ' + route.stopRouteDirectionSchedules[0].tripHeadsign;
                    route.stopRouteDirectionSchedules[0].scheduleStopTimes.map(function (time) {                        
                        var date = new Date(time.arrivalTime);
                        var now  = new Date();
                        if (date > now) {
                            // filter out past arrivals
                            vm.arrivals.push({
                                route: routeName,
                                time: time.arrivalTime
                            });
                        }
                    });
                });
                vm.arrivals.sort(function (a, b) { return (a.time > b.time) ? 1 : ((b.time > a.time) ? -1 : 0) });
            }).catch(function (error) {
                console.log(error);
            });
        }
        
        function getRoutes() {
            vm.routes = [];            
            vm.stopInfo.routes.map(function (route) {
                vm.routes.push({
                    shortName: route.shortName,
                    longName: route.longName,
                    via: route.description,
                    color: route.color,
                    textColor: route.textColor
                });

                busService.getRouteStops(route.id).then(function (data) {                    
                    $scope.$broadcast('drawRoutes', data.data.data);
                });
            });
        }

        function getNearbyStops() {
            busService.getNearbyStops(vm.stopInfo.lat, vm.stopInfo.lon).then(function (data) {
                vm.stops = data.data.data.stops;
            });
        }

        function initializeController() {            
            vm.routes   = [];
            vm.busData  = [];
            vm.stops    = [];
            vm.arrivals = [];
            //$timeout(timed, 60000);
        }

        function timed() {                        
            vm.doSearch();
            $timeout(timed, 60000);
        }

        initializeController();
    }

})();
