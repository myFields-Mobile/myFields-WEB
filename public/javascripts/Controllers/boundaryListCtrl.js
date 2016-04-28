inspectorApplication.controller('BoundaryListController', function($scope, $http) {
  var ctrl = this;
  ctrl.boundaries = [];
  ctrl.showingDisabled = false;
  ctrl.isLoading = false;
  ctrl.ShowDisabled = ShowDisabled;
  ctrl.HideDisabled = HideDisabled;
  ctrl.ToggleActive = ToggleActive;


  init();
  function init() {
    console.log("show");
    var url = '/api/boundary';
    if(ctrl.showingDisabled)
      url = '/api/boundary/all';

    ctrl.isLoading = true;
    $http({
      method: 'GET',
      url: url
    }).then(function successCallback(response) {
      console.log("display GET response");
      console.log(response);
      //debugger
      ctrl.boundaries = response.data;
      //debugger;
      console.log(response.data);
      formatBoundaries(ctrl.boundaries);
      ctrl.isLoading = false;
    }, function errorCallback(response) {
      console.log(response);
    });
  }

  function ToggleActive(boundary) {
    $http({
      method: 'POST',
      url: '/api/boundary/' + boundary.id + "/update",
      data: {
        active: boundary.active
      }
    }).then(function successCallback(response) {
      init();
    }, function errorCallback(response) {
      console.log(response);
    });
  }

  function ShowDisabled() {
    console.log("Show Disabled");
    $http({
      method: 'GET',
      url: '/api/boundary/all'
    }).then(function successCallback(response) {
      ctrl.showingDisabled = true;
      ctrl.boundaries = response.data;
      formatBoundaries(ctrl.boundaries);
    }, function errorCallback(response) {
      console.log(response);
    });
  }

  function HideDisabled() {

    $http({
      method: 'GET',
      url: '/api/boundary'
    }).then(function successCallback(response) {
      ctrl.showingDisabled = false;
      ctrl.boundaries = response.data;
      formatBoundaries(ctrl.boundaries);
    }, function errorCallback(response) {
      console.log(response);
    });

  }

  function formatBoundaries(boundaries) {
    console.log("format boundaries");

    for(var x = 0; x < boundaries.length; x++) {


      //boundaries[x].image = "";
      //boundaries[x].image = "https://maps.googleapis.com/maps/api/staticmap?zoom=16&size=300x300&maptype=satellite&key=AIzaSyCCGAjXuCpxKwqWc6kgkmCAv-ge2QnrQ1o&sensor=false"
      //     + "&path=color:red|weight:5|fillcolor:white|";

      //boundaries[x].image += "|";
      //boundaries[x].image += 0+","+0;
      var minX = 100000;
      var maxX = -100000;
      var minY = 100000;
      var maxY = -100000;

      console.log("boudary: "+boundaries[x].name);
      console.log(boundaries[x].boundary);

      boundaries[x].image = "";
      for(var y = 0; y < boundaries[x].boundary[0].length; y++) {
        if(y != 0)
          boundaries[x].image += "|";


        if(boundaries[x].boundary[0][y].x > maxX)
        {
          maxX = boundaries[x].boundary[0][y].x;
        }
        if(boundaries[x].boundary[0][y].x < minX)
        {
          minX = boundaries[x].boundary[0][y].x;
        }

        if(boundaries[x].boundary[0][y].y > maxY)
        {
          maxY = boundaries[x].boundary[0][y].y;
        }
        if(boundaries[x].boundary[0][y].y < minY)
        {
          minY = boundaries[x].boundary[0][y].y;
        }


        boundaries[x].image += boundaries[x].boundary[0][y].x + "," + boundaries[x].boundary[0][y].y;


      }

      var zoom = Math.max((maxX-minX),(maxY-minY))/.01;
      //var zoom = "16";
      //console.log(maxX-minX);
      //console.log(zoom);
      console.log(boundaries[x].image);
      boundaries[x].image = "https://maps.googleapis.com/maps/api/staticmap?zoom="+zoom+"&size=300x300&maptype=satellite&key=AIzaSyCCGAjXuCpxKwqWc6kgkmCAv-ge2QnrQ1o&sensor=false"
          + "&path=color:blue|weight:5|fillcolor:white|" + boundaries[x].image;

      //debugger;
      console.log("test ");
      console.log(boundaries[x].boundary);
      //debugger;
      if(boundaries[x].boundary.length > 1) {
        //debugger;
        for (var z = 1; z < boundaries[x].boundary.length; z++) {
          //debugger;
          var v = "&path=color:red|weight:5|fillcolor:white|";
          for (var c = 0; c < boundaries[x].boundary[z].length; c++) {
            //debugger;
            if (c != 0)
              v += "|";

            v += boundaries[x].boundary[z][c].x + "," + boundaries[x].boundary[z][c].y;

          }
          boundaries[x].image+=v;
        }
      }



      console.log("image string for "+ boundaries[x].name+ ": "+boundaries[x].image);

      debugger;


    }
  }
});