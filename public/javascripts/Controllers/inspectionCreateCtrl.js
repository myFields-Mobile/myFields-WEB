inspectorApplication.controller('InspectionCreateController', function($scope, $http) {
    var ctrl = this;
    ctrl.field = null;
    ctrl.fields = [];
    ctrl.CreateInspection = CreateInspection;
    init();

    function init(){
        $http({
            method: 'GET',
            url: '/api/field'
        }).then(function successCallback(response) {
            ctrl.fields = response.data;
            formatImages(ctrl.fields);
        }, function errorCallback(response) {
            console.error(response);
        });
    }

    function CreateInspection() {
        $http.post('/inspection/create', {
          FieldId: ctrl.field.id
        }).then(function() {
            window.location.href = '/inspection/list'
        }, function(error) {
            console.error(error);
        });
    }
});
