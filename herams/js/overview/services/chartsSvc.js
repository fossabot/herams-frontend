'use strict';

/**
 * @ngdoc service
 * @name app-herams.service:chartsSvc
 * @description
 *   This service provides a set of methods to handle charts in the workspace pages
 */
angular.module('app-herams').service('chartsSvc', function($log,commonSvc) {

    function getConfig(chart_type) {
        return (chart_type == "bar")? CONFIG.overview.charts.bar : CONFIG.overview.charts.stacked;
    }

    function setChart(distData) {

         var chart_common_config = commonSvc.deepCopy(CONFIG.overview.charts.common);

         var chart = Object.assign(commonSvc.deepCopy(chart_common_config),getConfig(distData.type));
         chart.title.text = distData.title;
         chart.xAxis.categories = distData.labels;
         chart.series = distData.series;

         if (distData.type == "stacked") chart.colors = distData.colors;

         return chart;
    }


    return {
        loadChart: function(chart_dist_data,chart_html_container) {
            Highcharts.chart(chart_html_container, setChart(chart_dist_data));
        }
    }
});
