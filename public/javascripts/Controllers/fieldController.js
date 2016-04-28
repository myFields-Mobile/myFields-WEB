inspectorApplication.controller('FieldController', function($scope, $http) {
    var ctrl = this;

    ctrl.tillages=[];
    ctrl.irrigations=[];
    ctrl.crops = [];
    ctrl.boundaries = [];
    ctrl.processing = false;
    ctrl.fieldName = "";
    ctrl.crop = "";
    ctrl.tillage = "";
    ctrl.irrigation = "";
    ctrl.boundary = "";
    ctrl.CreateField = CreateField;
    init();

    function init() {

        $http({
            method: 'GET',
            url: '/api/crop'
        }).then(function successCallback(response) {
            ctrl.crops = response.data;
        }, function errorCallback(response) {
            console.error(response);
        });

        $http({
            method: 'GET',
            url: '/api/irrigation'
        }).then(function successCallback(response) {
            ctrl.irrigations = response.data;
        }, function errorCallback(response) {
            console.error(response);
        });

        $http({
            method: 'GET',
            url: '/api/tillage'
        }).then(function successCallback(response) {
            ctrl.tillages = response.data;
        }, function errorCallback(response) {
            console.error(response);
        });

        $http({
            method: 'GET',
            url: '/api/boundary'
        }).then(function successCallback(response) {
            ctrl.boundaries = response.data;
        }, function errorCallback(response) {
            console.error(response);
        });
    }

    function CreateField() {
        ctrl.processing = true;

        $http.post('/field/create', {
            name: ctrl.fieldName,
            BoundaryId: ctrl.boundary.toString(),
            IrrigationId: ctrl.irrigation.toString(),
            TillageId: ctrl.tillage.toString(),
            CropId: ctrl.crop.toString()
        }).then(function(success) {
            window.location.href = '/field/list'
        }, function(error) {
            console.error(error);
        });
        ctrl.processing = false;
    }

});
