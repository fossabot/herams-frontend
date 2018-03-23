'use strict';

/**
 * @ngdoc service
 * @name app-herams.service:MainMapSvc
 * @description
 *   This service provides a set of methods to handle leaflet on the main page
 */
angular.module('app-herams').service('MainMapSvc', function($rootScope,$state,$timeout,$window,$compile,$log,commonSvc,esriSvc,LayerPopupSvc) {


    return {

        /**
         * @name MainMapSvc.createMainMap
         * @description
         *   returns a leaflet map object after creation according to params
         */
        createMainMap: function (container,config) {

            /* Creating map */
            var map = L.map(container,
                {zoomControl: false})
                .setView(
                    [config.center.lat, config.center.long],
                    config.zoom
                );

            /* Adding required basemaps - imagery, countrynames, etc.. */
            for (var i in config.basemaps) {
                var tmp = L.tileLayer(config.basemaps[i]).addTo(map);
            }

            return map;

        },


        /**
        * @name MainMapSvc.addLayersToMainMap
        * @description
        *  adds ESRI layers to a leaflet map using the esriSvc
        *  with custom popup using the LayerPopupSvc
         *  @Params:
         *  - map: reference to the leaflet Map instance
         *  - layers: array of layers as configured in 'home_data.json'
         *  - statuses: array of possible statuses for each layer as configured in 'home_data.json'
        */

        addLayersToMainMap: function (map, layers, statuses) {
            for (var i in layers) {
                var status = statuses[layers[i].status];
                esriSvc.getEsriShape(map, layers[i], status.color);
            }
        },


        /**
        * @name MainMapSvc.addcircleMarkerToMainMap
        * @description
        *  adds circle Markers to Map
        *  with custom popup using the LayerPopupSvc
         *  @Params:
         *  - map: reference to the leaflet Map instance
         *  - layers: array of layers as configured in 'home_data.json'
         *  - statuses: array of possible statuses for each layer as configured in 'home_data.json'
        */

        addcircleMarkerToMainMap: function(map, layers, statuses) {
            for (var i in layers) {
                var status = statuses[layers[i].status];
                console.log(status);
                var latlng = L.latLng(layers[i].geodata.lat, layers[i].geodata.long);
                var geojson = L.circleMarker(latlng, {
                            radius:CONFIG.home.shapeRadius,
                            fillColor : status.color,
                        color: status.color,
                        weight: 1,
                        opacity: 1,
                        fillOpacity: CONFIG.home.layersOpacity
                    }).addTo(map);

                if (layers[i].stats != null) {
                   LayerPopupSvc.addPopup(map,geojson,layers[i]);
                }
            }
/*
            for (var i in layers) {
                var status = statuses[layers[i].status];
                var latlng = L.latLng(layers[i]geodata.lat, layers[i]geodata.lat);
                var geojson = L.circleMarker(latlng, {
                            radius:CONFIG.home.shapeRadius,
                            style: {
                                color       : status.color,
                                weight      : 1,
                                fillOpacity : CONFIG.home.layersOpacity,
                                fillColor   : status.color
                            }
                        }).addTo(refMap);

                if (layers[i].stats != null) {
                   LayerPopupSvc.addPopup(refMap,geojson,layerData);
                }
            }
*/
        }
    }
});
