inspectorApplication.controller('listFieldController', function($scope, $http) {
    var ctrl = this;

    ctrl.fields = [];
    ctrl.tillages = [];
    ctrl.irrigations = [];
    ctrl.crops = [];
    ctrl.boundaries = [];
    ctrl.fieldName = "";
    ctrl.crop = "";
    ctrl.tillage = "";
    ctrl.irrigation = "";
    ctrl.boundary = "";

    ctrl.fieldLoaded = false;
    ctrl.cropsLoaded = false;
    ctrl.irrigationLoaded = false;
    ctrl.tillageLoaded = false;
    ctrl.boundaryLoaded = false;

    ctrl.showingDisabled = false;
    ctrl.toggleActive = toggleActive;
    ctrl.ShowDisabled = ShowDisabled;
    ctrl.HideDisabled = HideDisabled;

    init();
    function init() {
        var url = '/api/field/me';
        if(ctrl.showingDisabled)
        url = '/api/field/all/';

        $http({
            method: 'GET',
            url: url
        }).then(function successCallback(response) {
            ctrl.fields = response.data;
            ctrl.fieldLoaded=true;
        }, function errorCallback(response) {
            console.error(response);
        });

        $http({
            method: 'GET',
            url: '/api/crop'
        }).then(function successCallback(response) {
            var tmp = response.data;
            for(var x=0; x<tmp.length; x++){
                ctrl.crops[tmp[x].id] = tmp[x].name;
            };
            ctrl.cropsLoaded=true;
        }, function errorCallback(response) {
            console.error(response);
        });

        $http({
            method: 'GET',
            url: '/api/irrigation'
        }).then(function successCallback(response) {
            var tmp = response.data;
            for(var x=0; x<tmp.length; x++){
                ctrl.irrigations[tmp[x].id] = tmp[x].name;
            }
            ctrl.irrigationLoaded=true;
        }, function errorCallback(response) {
            console.error(response);
        });

        $http({
            method: 'GET',
            url: '/api/tillage'
        }).then(function successCallback(response) {
            var tmp = response.data;
            for(var x=0; x<tmp.length; x++){
                ctrl.tillages[tmp[x].id] = tmp[x].name;
            }
            ctrl.tillageLoaded=true;
        }, function errorCallback(response) {
            console.error(response);
        });

        $http({
            method: 'GET',
            url: '/api/boundary/all'
        }).then(function successCallback(response) {
            var tmp = response.data;
            for(var x=0; x<tmp.length; x++){
                ctrl.boundaries[tmp[x].id-1] = tmp[x];
            }
            formatBoundaries(ctrl.boundaries);
            ctrl.boundaryLoaded=true;
        }, function errorCallback(response) {
            console.error(response);
        });
    }

    function toggleActive(field){
        console.log(field.active);
        var url = '/api/field/' + field.id + ((field.active == false) ? "/deactivate" : "/activate" );
        $http({
            method: 'GET',
            url: url
        }).then(function successCallback(response) {
            init();
        }, function errorCallback(response) {
            console.error(response);
        });
    }

    function ShowDisabled() {
        $http({
            method: 'GET',
            url: '/api/field/all'
        }).then(function successCallback(response) {
            ctrl.showingDisabled = true;
            ctrl.fields = response.data;
        }, function errorCallback(response) {
            console.error(response);
        });
    }

    function HideDisabled() {
        $http({
            method: 'GET',
            url: '/api/field/me'
        }).then(function successCallback(response) {
            ctrl.showingDisabled = false;
            ctrl.fields = response.data;
        }, function errorCallback(response) {
            console.error(response);
        });
    }

    function formatBoundaries(boundaries) {


        for(var x = 0; x < boundaries.length; x++) {
            if (boundaries[x]) {

                var minX = 100000;
                var maxX = -100000;
                var minY = 100000;
                var maxY = -100000;


                boundaries[x].image = "";
                for (var y = 0; y < boundaries[x].boundary[0].length; y++) {
                    if (y != 0)
                        boundaries[x].image += "|";

                    if (boundaries[x].boundary[0][y].x > maxX) {
                        maxX = boundaries[x].boundary[0][y].x;
                    }
                    if (boundaries[x].boundary[0][y].x < minX) {
                        minX = boundaries[x].boundary[0][y].x;
                    }

                    if (boundaries[x].boundary[0][y].y > maxY) {
                        maxY = boundaries[x].boundary[0][y].y;
                    }
                    if (boundaries[x].boundary[0][y].y < minY) {
                        minY = boundaries[x].boundary[0][y].y;
                    }


                    boundaries[x].image += boundaries[x].boundary[0][y].x + "," + boundaries[x].boundary[0][y].y;


                }


                var zoom = Math.max((maxX - minX), (maxY - minY)) / .01;
                boundaries[x].image = "https://maps.googleapis.com/maps/api/staticmap?zoom=" + zoom + "&size=300x300&maptype=satellite&key=AIzaSyCCGAjXuCpxKwqWc6kgkmCAv-ge2QnrQ1o&sensor=false"
                    + "&path=color:blue|weight:5|fillcolor:white|" + boundaries[x].image;


                if (boundaries[x].boundary.length > 1) {

                    for (var z = 1; z < boundaries[x].boundary.length; z++) {

                        var v = "&path=color:red|weight:5|fillcolor:white|";
                        for (var c = 0; c < boundaries[x].boundary[z].length; c++) {

                            if (c != 0)
                                v += "|";

                            v += boundaries[x].boundary[z][c].x + "," + boundaries[x].boundary[z][c].y;

                        }
                        boundaries[x].image += v;
                    }
                }
            }
        }
    }
});