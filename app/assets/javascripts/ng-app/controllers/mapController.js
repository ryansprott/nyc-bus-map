(function () {
    'use strict';

    angular.module('busMap').controller('MapController', mapController);

    mapController.$inject = ['uiGmapIsReady', '$scope'];

    function mapController(uiGmapIsReady, $scope) {
        var mc = this;
        var busMarkers = [];
        var stopMarkers = [];
        var polylines = [];
        var infoWindow;
        var mainMarker;
                
        mc.map = { center: { latitude: 40.7127837, longitude: -74.0059413 }, zoom: 15 };

        uiGmapIsReady.promise(1).then(function (instances) {
            instances.map(function (inst) {
                inst.map.setOptions({
                    scrollwheel: false,                    
                    mapTypeId: 'terrain'
                });
            });
        });

        function resetMap() {
            clearBusMarkers();
            clearPolylines();
            clearStopMarkers();
            if (infoWindow) infoWindow.close();
            if (mainMarker) mainMarker.setMap(null);
        }

        $scope.$on('searchSucceeded', function (event, data) {
            resetMap();
            uiGmapIsReady.promise(1).then(function (instances) {
                instances.map(function (inst) {
                    addMainMarker(inst);
                    addBusMarkers(inst);                    
                });
            });
        });

        $scope.$on('searchFailed', function (event, data) {
            resetMap();            
        });

        $scope.$on('drawRoutes', function (event, data) {            
            uiGmapIsReady.promise(1).then(function (instances) {
                instances.map(function (inst) {
                    addPolylines(inst, data.polylines, data.route.color);
                    addStopMarkers(inst, data);
                });
            });
        });

        $scope.$on('setCenter', function (event, data) {            
            var bus = data.MonitoredVehicleJourney;            
            uiGmapIsReady.promise(1).then(function (instances) {
                instances.map(function (inst) {
                    if (infoWindow) infoWindow.close();
                    var loc = new google.maps.LatLng(bus.VehicleLocation.Latitude, bus.VehicleLocation.Longitude);
                    inst.map.setCenter(loc);
                    infoWindow.setContent(getBusHtml(bus));
                    infoWindow.setPosition(loc);
                    infoWindow.open(inst.map);
                });
            });
        });

        function addMainMarker(inst) {
            var pos = new google.maps.LatLng($scope.vm.stopInfo.lat, $scope.vm.stopInfo.lon);
            if (mainMarker) mainMarker.setMap(null);
            mainMarker = new google.maps.Marker({
                map: inst.map,
                position: pos
            });
            inst.map.setOptions({ center: pos, zoom: 15 });
        }

        function addBusMarkers(inst) {
            infoWindow = new google.maps.InfoWindow({ content: '' });
            for (var j = 0; j < $scope.vm.busData.MonitoredStopVisit.length; j++) {
                var bus = $scope.vm.busData.MonitoredStopVisit[j];
                var loc = bus.MonitoredVehicleJourney.VehicleLocation;
                var marker = new google.maps.Marker({
                    map: inst.map,
                    url: bus.MonitoredVehicleJourney,
                    label: {
                        text: bus.MonitoredVehicleJourney.MonitoredCall.Extensions.Distances.StopsFromCall.toString(),
                        fontSize: '12px',
                        fontWeight: 'bold'
                    },
                    position: new google.maps.LatLng(loc.Latitude, loc.Longitude),
                    zIndex: j * -1,
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 12,
                        strokeOpacity: 1,
                        strokeColor: 'black',
                        strokeWeight: 2,
                        fillOpacity: 1,
                        fillColor: 'lightgray'
                    }
                });

                marker.addListener('click', function (e) {                    
                    infoWindow.setContent(getBusHtml(this.url));
                    infoWindow.open(inst.map, this);
                    inst.map.setOptions({ center: this.position, zoom: 15 });
                });

                busMarkers.push(marker);
            }
        }
        
        function addPolylines(inst, pl, color) {
            for (var i = 0; i < pl.length; i++) {
                polylines.push(new google.maps.Polyline({
                    map: inst.map,
                    path: google.maps.geometry.encoding.decodePath(pl[i].points),
                    strokeColor: '#' + color,
                    strokeOpacity: 1,
                    strokeWeight: 2,
                    fillColor: '#' + color,
                    fillOpacity: 1
                }));
            }
        }
        
        function addStopMarkers(inst, data) {                        
            for (var j = 0; j < data.stops.length; j++) {                
                var stop = data.stops[j];
                var pos = new google.maps.LatLng(stop.lat, stop.lon);
                var marker = new google.maps.Marker({
                    map: inst.map,
                    url: stop,
                    position: pos,
                    zIndex: -9999,
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 4,
                        fillColor: '#' + stop.routes[0].color,
                        strokeColor: '#' + stop.routes[0].color,
                        fillOpacity: 0.7,
                        strokeOpacity: 0.7
                    }
                });

                marker.addListener('click', function (e) {
                    $scope.vm.switchStop(this.url.code);
                });

                stopMarkers.push(marker);
            }
        }

        function clearBusMarkers() {
            for (var i = 0; i < busMarkers.length; i++) {
                busMarkers[i].setMap(null);
            }
        }

        function clearPolylines() {
            for (var i = 0; i < polylines.length; i++) {
                polylines[i].setMap(null);
            }
        }

        function clearStopMarkers() {
            for (var i = 0; i < stopMarkers.length; i++) {
                stopMarkers[i].setMap(null);
            }
        }

        function getBusHtml(bus) {
            var newHtml = '<div style="font-size: 1.2em;"><div>' + bus.PublishedLineName + ' to ' + bus.DestinationName + '</div>'
                + '<div>' + bus.MonitoredCall.Extensions.Distances.PresentableDistance
                + ' (' + bus.MonitoredCall.Extensions.Distances.StopsFromCall + ' stops)</div>';
            if (bus.MonitoredCall.ExpectedArrivalTime) {
                var newDate = new Date(bus.MonitoredCall.ExpectedArrivalTime);
                newHtml += '<div>Arriving at ' + formatDate(newDate) + '</div>';
            }
            newHtml += "</div>";
            return newHtml;
        }

        function formatDate(date) {
            var hours = date.getHours();
            var minutes = date.getMinutes();
            var ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12;
            minutes = minutes < 10 ? '0' + minutes : minutes;
            var strTime = hours + ':' + minutes + ' ' + ampm;
            return strTime;
        }
    }

})();
