"use strict";


/**
 * @ngdoc controller
 * @name phc_dashboard.controller:BaseCtrl
 * @description
 *   This controller is used on all the pages except the HF card which doesn't inherit from base
 */
angular.module('app-herams')
    .controller('MainCtrl', function($scope,$compile,$log,$timeout,commonSvc,filtersSvc,HFMapSvc,chartsSvc) {

        /* - SCOPE VARS - */
        $scope.charts = {};

        $scope.categories = [];
        $scope.catIDSelect = [0,0,0];
        $scope.catNameSelect = [0,0,0];
        $scope.mapdata = {};

        $scope.tables = [];

        $scope.tmpFilters = [];

        /* - SCOPE METHODS - */
        $scope.date = new Date();
        $scope.getAdvancedFiltersCnt = filtersSvc.getAdvancedFiltersCnt;

        /* ui-router */
        $scope.home = function() {
            commonSvc.home();
        };

        /* Data Load */
        init();

        /* layout launch */
        $scope.launchLayout = launchLayout;

        /* - MISC SETUP CALLS - */
        setPartnersClick();


        /* - WINDOW EVENTS - */
        function scrollPartners() {
            $('.partners-list-grp').hide();
            $('.partners-list').removeClass('fullHeight');
        }

        function resizer() {

            for (var i=0;i<$scope.charts.length;i++) {
                var targ = '#chart'+(i+1);
                $( targ ).empty();
            }

            chartsSvc.destroyCharts();
            chartsSvc.setCharts($scope.charts);

            HFMapSvc.refreshLayout();
        }


        /* - LOADs - */

        function filteredLoad(url) {
            return commonSvc.loadData(url,filtersSvc.getHTTPFilters());
        }

        function init() {
             return filteredLoad(commonSvc.getWSPaths('overview')).then(loadSuccess)
                        .catch(loadFailure)
                        .then(loadFinally);

            function loadSuccess(httpResponse) {

                $scope.categories = httpResponse.data.results.categories;

                commonSvc.setUsrInfo($scope,httpResponse.data.results.userinfo);
                commonSvc.setLoginPopover($scope);
            }

            function loadFailure(httpResponse) {
                $log.info('There has been an error Overview Data');
            }

            function loadFinally(httpResponse) {
                loadFilters();
                launchLayout($scope.categories[0]);
            }
        }

        function loadAdvanced() {
             return commonSvc.loadData('https://herams-dev.westeurope.cloudapp.azure.com/aping/filters?pid=374').then(loadSuccess)
                        .catch(loadFailure)
                        .then(loadFinally);

            function loadSuccess(httpResponse) {
                $scope.LSQuestions = httpResponse.data.groups;
            }

            function loadFailure(httpResponse) {
                $log.info('There has been an error loading Filters');
            }

            function loadFinally(httpResponse) {
                $log.info('load filters finally');
            }
        }

        function loadFilters() {
             return commonSvc.loadData('https://herams-dev.westeurope.cloudapp.azure.com/aping/global-filters').then(loadSuccess)
                        .catch(loadFailure)
                        .then(loadFinally);

            function loadSuccess(httpResponse) {

                filtersSvc.setFiltersData(httpResponse.data.results);
                $scope.states  = filtersSvc.getStatesList();
                $scope.hftypes  = filtersSvc.getHFTypesList();

            }

            function loadFailure(httpResponse) {
                $log.info('There has been an error loading Filters');
            }

            function loadFinally(httpResponse) {
                loadAdvanced();
                $log.info('load filters finally');
            }
        }

        function loadCharts(charts_url, callback) {
            return filteredLoad(charts_url).then(loadSuccess)
                        .catch(loadFailure)
                        .then(loadFinally);

            function loadSuccess(httpResponse) {

                $scope.charts = (httpResponse.data.stats)? httpResponse.data.stats : httpResponse.data;

                for (var i in $scope.charts) {
                    if ($scope.charts[i].type == "table") $scope.tables.push(processTableData($scope.charts[i]));
                }
            }

            function loadFailure(err) {
                $log.info('Error loading Charts Data: ',err);
            }

            function loadFinally(httpResponse) {
                callback();
            }
        }

        function loadMap(map_url) {
            return filteredLoad(map_url).then(loadSuccess)
                        .catch(loadFailure)
                        .then(loadFinally);

            function loadSuccess(httpResponse) {
                // $log.info('load map info: ',httpResponse.data.results);

                $scope.mapdata = httpResponse.data.results;
                HFMapSvc.createMap('mapid-wkspace',$scope.mapdata);
            }

            function loadFailure(err) {
                $log.info('Error loading Map Data: ',err);
            }

            function loadFinally() {
                // $log.info('Ready to process after map load');

                $('.loading').hide();
                $('.main-content').show();

                $(window).off('resize', resizer);
                $(window).resize(resizer);

                $timeout(function() {
                    resizer();
                },100);

            }
        }


        /* - UI - */
        function setPartnersClick() {

            /* Partners */
            $('.partners-list-btn').click(function() {
                $('.partners-list-grp').show();
                $('.partners-list').addClass('fullHeight');
                $('.partners-list-cache').click(function() {
                    $('.partners-list-grp').hide();
                    $('.partners-list').removeClass('fullHeight');
                });
            });

            $(window).scroll(scrollPartners);

        }

        function getLayout(layoutType) {

            var rawLayout;
            switch(layoutType) {
                case "layout14":
                    rawLayout = "<layout14></layout14>";
                    break;
                case "layout13":
                    rawLayout = "<layout13></layout13>";
                    break;
            }
            return rawLayout

        }

        function launchLayout(category,level) {

            if (level==undefined) level = 0;

            // RESETS
            $scope.mapdata = {};
            $scope.charts  = {};
            $scope.tables  = [];
            $( ".main-content" ).empty();
            chartsSvc.destroyCharts();

            $scope.catNameSelect[level] = category.name;
            $scope.catIDSelect[level]   = category.id;

            // LAYOUTS (as directives)
             var rawlayout = getLayout(category.layout);
             var linkFn    = $compile(rawlayout);
             var layout    = linkFn($scope);

            $('.main-content').html(layout);
            $('.main-content').hide();
            $('.loading').show();


            // LOADS
            $timeout(function() {
                var f = function() {
                    loadMap(category.ws_map_url);
                };
                loadCharts(category.ws_chart_url,f);
            }, 1500)

        }


        /* - LAYOUTS DATA - */
        function processTableData(data) {

            var table_data = {},
                table_rows = data.rows;

            table_data.name = data.name;

            table_data.cols = data.columns;
            table_data.rows = [];

            for (var i in table_rows) {
                var tmp = [];
                for(var o in table_rows[i]) {
                    tmp.push(table_rows[i][o]);
                }
                table_data.rows.push(tmp);
            }

            return table_data;
        }


        /* - APPLY FILTERS DATA - */
        function applyFilters() {

             return commonSvc.loadData(commonSvc.getWSPaths('overview'),filtersSvc.applyHTTPFilters($scope.date)).then(loadSuccess)
                        .catch(loadFailure)
                        .then(loadFinally);

            function loadSuccess(httpResponse) {

                $scope.categories = httpResponse.data.results.categories;
            }

            function loadFailure(httpResponse) {
                $log.info('There has been an error Overview Data');
            }

            function loadFinally(httpResponse) {
                launchLayout($scope.categories[0]);
            }
        }

        $scope.applyFilters=applyFilters;



    })
    .directive('layout14', function() {

        return {
            templateUrl: '/js/overview/directives/layouts/layout_1_4.html',
            restrict: 'E',
            replace: true
         }

    })
    .directive('layout13', function() {

        return {
            templateUrl: '/js/overview/directives/layouts/layout_1_3.html',
            restrict: 'E',
            replace: true
         }

    })
    .directive('datavizTable', function() {

        return {
            templateUrl: '/js/overview/directives/dataviz/dataviz-table.html',
            restrict: 'E',
            replace: true
         }

    });
