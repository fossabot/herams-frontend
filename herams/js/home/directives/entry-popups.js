'use strict';

/**
 * @ngdoc directive
 * @name app-herams.directive:entryPopup
 * @restrict E
 * @scope
 *   @param {type} description
 * @description
 *   Lorem ipsum
 * @example
 *   <entry-popup />
 */
angular.module('app-herams').directive('entryPopup', function($log,ChartConfigSvc) {

    function getLayerDataFromName(allLayers,countryname) {
        for (var i in allLayers) {
          if (allLayers[i].name == countryname) return allLayers[i];
        }
    }

    return {
        templateUrl: '/js/home/directives/entry-popups.html',
        restrict: 'E',
        replace: true,
        scope: {
            countryname:"@"
        },
        controller: function($scope) {},
        link: function($scope, $el, $attr) {

            var HOMEDATA = $scope.$parent.homedata;
            var layerData = getLayerDataFromName(HOMEDATA.layers,$scope.countryname);

            $scope.data = layerData.stats;

            var pie1 = ChartConfigSvc.setTmpChart(layerData.stats.charts[0].percentage,HOMEDATA.config.colors.donut_color1),
                pie2 = ChartConfigSvc.setTmpChart(layerData.stats.charts[1].percentage,HOMEDATA.config.colors.donut_color2),
                pie3 = ChartConfigSvc.setTmpChart(layerData.stats.charts[2].percentage,HOMEDATA.config.colors.donut_color3);

            ChartConfigSvc.setAfterAnimate(pie1,function() {
                $('charts-percents:nth-child(1)').css('display','block');
            })


            $('#indic1-chart').highcharts(pie1);
            $('#indic2-chart').highcharts(pie2);
            $('#indic3-chart').highcharts(pie3);

        }
    }

});