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

    function formatImages(fields) {
      fields.forEach(function(field) {

        field.image = "https://maps.googleapis.com/maps/api/staticmap?&zoom=15&size=600x600&maptype=satellite&key=AIzaSyCCGAjXuCpxKwqWc6kgkmCAv-ge2QnrQ1o&sensor=false";

        field.Boundary.boundary.coordinates.forEach(function(coordinates, index) {
          var tempColor = "blue";
          if(index != 0) {
            tempColor = "red";
          }

          var tempPath = "&path=color:" + tempColor + "|weight:5|fillcolor:white";

          coordinates.forEach(function(coordinate) {
            tempPath += "|" + coordinate[0] + "," + coordinate[1];
          });

          field.image += tempPath;
        });
      });
    }
});
