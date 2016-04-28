inspectorApplication.controller('inspectionListCtrl', function($scope, $http) {
  var ctrl = this;
  ctrl.inspections = [];
  ctrl.isLoading = false;
  ctrl.showingDisabled = false;
  ctrl.ToggleActive = ToggleActive;
  ctrl.ShowDisabled = ShowDisabled;
  ctrl.ShowEnabled = ShowEnabled;

  init();
  function init() {
    ctrl.isLoading = true;

    var url = '/api/inspection/requested';
    if(ctrl.showingDisabled)
      url = '/api/inspection/requested/all';

    $http({
      method: 'GET',
      url: url
    })
    .then(
      function successCallback(response) {
        ctrl.isLoading = false;
        ctrl.inspections = response.data;
      },
      function errorCallback(error) {
        console.error(error);
      }
    );
  }

  function ShowDisabled() {
    ctrl.isLoading = true;
    ctrl.showingDisabled = true;

    $http({
      method: 'GET',
      url: '/api/inspection/requested/all'
    })
      .then(
        function successCallback(response) {
          ctrl.isLoading = false;
          ctrl.inspections = response.data;
        },
        function errorCallback(error) {
          console.error(error);
        }
      );
  }

  function ShowEnabled() {
    ctrl.showingDisabled = false;
    ctrl.isLoading = true;

    $http({
      method: 'GET',
      url: '/api/inspection/requested'
    })
      .then(
        function successCallback(response) {
          ctrl.isLoading = false;
          ctrl.inspections = response.data;
        },
        function errorCallback(error) {
          console.error(error);
        }
      );
  }

  function ToggleActive(inspection) {
    var url = '/api/inspection/' + inspection.id + '/activate';
    if(!inspection.active)
      url = '/api/inspection/' + inspection.id + '/deactivate';

    $http({
      method: 'GET',
      url: url,
      data: {
        active: inspection.active
      }
    }).then(function successCallback(response) {
      init();
    }, function errorCallback(error) {
      console.error(error);
    });
  }
});