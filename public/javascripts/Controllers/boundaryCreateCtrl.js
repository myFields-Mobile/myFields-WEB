inspectorApplication.controller('BoundaryController', function($scope, $http) {
  var boundary = this;
  var map;
  var polygon;
  var cutout = [];
  var cutoutIndex = 0;

  boundary.polygonPoints = [];
  boundary.cutoutPoints = [],[];

  boundary.markers = [];
  boundary.estimatedCenter = {};
  boundary.boundaryName = "";

  boundary.outerBoundaryCreated = false;
  boundary.canCreateCutout = false;

  boundary.CreateOuterBoundary = CreateOuterBoundary;
  boundary.CreateEntireBoundary = CreateEntireBoundary;
  boundary.CreateCutout = CreateCutout;
  boundary.Undo = Undo;
  boundary.ClearAll = ClearAll;

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
  } else {
    document.getElementById("Map").innerHTML = "Geolocation is not supported by this browser.";
  }

  function CreateEntireBoundary()
  {
    console.log("Create Entire Boundary")
    console.log(boundary.cutoutPoints);
    debugger;
    $http.post('/boundary/create', {
      name: boundary.boundaryName,
      outerPoints: boundary.polygonPoints,
      cutoutPoints: boundary.cutoutPoints
    }).success(function(success) {
      console.log(success);
      window.location.href = '/boundary/list'
    }).error(function(error) {
      console.log(error);
    });

  }


  function CreateOuterBoundary() {


    //debugger;
    //$scope.apply(function(){});

    console.log(boundary.polygonPoints.toString());
    boundary.outerBoundaryCreated = true;
    for(var x = 0; x < boundary.markers.length; x++) {
      map.removeMarker(boundary.markers[x]);
    }

    boundary.markers = [];

    //$http.post('/boundary/create', {
    //  name: boundary.boundaryName,
    //  points: boundary.polygonPoints
    //}).then(function(success) {
    //  window.location.href = '/boundary/list'
    //}, function(error) {
    //  debugger;
    //  console.log(error);
    //});
  }
  function CreateCutout(){
    console.log(boundary.cutoutPoints[cutoutIndex].toString());
    boundary.outerBoundaryCreated = true;
    for(var x = 0; x < boundary.markers.length; x++) {
      map.removeMarker(boundary.markers[x]);
    }
    boundary.markers = [];
    cutoutIndex++;
  }

  function DrawAllBoundaries()
  {
    if(boundary.outerBoundaryCreated)
    {
      DrawCutout();
    }
    else
    {
      DrawPolygon();
    }
  }

  function Undo() {
    if(!boundary.outerBoundaryCreated)
    {
      if (boundary.polygonPoints.length == 0)
        return;

      var lastIndex = boundary.polygonPoints.length - 1;

      boundary.polygonPoints.splice(lastIndex, 1);
      map.removeMarker(boundary.markers[lastIndex]);
      boundary.markers.splice(lastIndex, 1);



      DrawAllBoundaries();
    }
    else
    {
      if (boundary.cutoutPoints[cutoutIndex].length == 0) {
        if (cutoutIndex == 0)
          return;
        else
          cutoutIndex--;
        return;
      }


      //debugger;
      var lastIndex = boundary.cutoutPoints[cutoutIndex].length - 1;

      boundary.cutoutPoints[cutoutIndex].splice(lastIndex, 1);
      map.removeMarker(boundary.markers[lastIndex]);
      boundary.markers.splice(lastIndex, 1);
      //debugger;

      boundary.canCreateCutout = (boundary.cutoutPoints[cutoutIndex].length > 2);


      DrawAllBoundaries();
    }
    //DrawPolygon();
    //debugger;
  }

  function ClearAll() {
    if (!boundary.outerBoundaryCreated)
    {
      boundary.polygonPoints = [];
      for (var x = 0; x < boundary.markers.length; x++) {
        map.removeMarker(boundary.markers[x]);
      }
      boundary.markers = [];

      map.removeMarker(boundary.estimatedCenterMarker);
      boundary.estimatedCenterMarker = null;

      DrawAllBoundaries();
    }
    else
    {
      var numberOfPoly = cutoutIndex;
      for(var i = numberOfPoly; i > 0; i--) {
        boundary.cutoutPoints[i] = [];
        for (var x = 0; x < boundary.markers.length; x++) {
          map.removeMarker(boundary.markers[x]);
        }
        boundary.markers = [];

        map.removeMarker(boundary.estimatedCenterMarker);
        boundary.estimatedCenterMarker = null;


        DrawAllBoundaries();
        cutoutIndex--;
      }
    }
    //DrawPolygon();
    // debugger;
  }

  function DrawPolygon() {
    //debugger;
    if(polygon)
      polygon.setMap(null);

    if(boundary.polygonPoints.length > 2) {
      polygon = map.drawPolygon({
        paths: boundary.polygonPoints, // pre-defined polygon shape
        strokeColor: '#BBD8E9',
        strokeOpacity: 1,
        strokeWeight: 3,
        fillColor: '#BBD8E9',
        fillOpacity: 0.4,
        draggableCursor: 'crosshair',
        click: function(e) {
          //debugger;
          var tempMarker = map.addMarker({
            lat: e.latLng.lat(),
            lng: e.latLng.lng(),
            title: 'Marker'
          });


          $scope.$apply(function () {
            if(!boundary.outerBoundaryCreated) {
              boundary.polygonPoints.push([e.latLng.lat(), e.latLng.lng()]);
              if(polygon)
                polygon.setMap(null);
            } else {
              if(boundary.cutoutPoints[cutoutIndex]==null) {
                boundary.cutoutPoints[cutoutIndex] = [];
              }
              boundary.cutoutPoints[cutoutIndex].push([e.latLng.lat(), e.latLng.lng()]);
            }

            boundary.markers.push(tempMarker);
            boundary.canCreateCutout = (boundary.cutoutPoints[cutoutIndex].length > 2);
          });

          //if(polygon)
          //  polygon.setMap(null);

          DrawAllBoundaries();
        }
      });
    }
  }

  function DrawCutout()
  {
    //debugger;
    if(cutout[cutoutIndex])
      cutout[cutoutIndex].setMap(null);

    if(typeof boundary.cutoutPoints[cutoutIndex] != 'undefined' || boundary.cutoutPoints[cutoutIndex].length > 2)
    {
      if(boundary.markers.length == 0 && boundary.cutoutPoints[cutoutIndex].length > 0)
      {
        for(var x = 0; x < boundary.cutoutPoints[cutoutIndex].length; x++)
        {

          var tempMarker = map.addMarker({
            lat: boundary.cutoutPoints[cutoutIndex][x].latLng.lat(),
            lng: boundary.cutoutPoints[cutoutIndex][x].latLng.lng(),
            title: 'Marker'
          });

          debugger;
          //boundary.cutoutPoints[cutoutIndex]
        }
      }

      //debugger;
      cutout[cutoutIndex] = map.drawPolygon(
          {
            paths: boundary.cutoutPoints[cutoutIndex], // pre-defined polygon shape
            strokeColor: '#96281B',
            strokeOpacity: 1,
            strokeWeight: 3,
            fillColor: '#E74C3C',
            fillOpacity: 0.4,
            draggableCursor: 'crosshair',
            click: function(e)
            {
              //debugger;
              var tempMarker = map.addMarker({
                lat: e.latLng.lat(),
                lng: e.latLng.lng(),
                title: 'Marker'
              });

              $scope.$apply(function () {
                //debugger;
                if(typeof boundary.cutoutPoints[cutoutIndex] == 'undefined')
                {
                  boundary.cutoutPoints[cutoutIndex] = [];
                }
                boundary.cutoutPoints[cutoutIndex].push([e.latLng.lat(), e.latLng.lng()]);
                boundary.markers.push(tempMarker);
                //debugger;
                boundary.canCreateCutout = (boundary.cutoutPoints[cutoutIndex].length > 2);
              });

              if(cutout[cutoutIndex])
                cutout[cutoutIndex].setMap(null);

              DrawAllBoundaries();
            }
          }
      )
    }
  }

  function showPosition(position) {
    //debugger;
    map = new GMaps({
      div: '#Map',
      lat: position.coords.latitude,
      lng: position.coords.longitude,
      mapTypeId: google.maps.MapTypeId.TERRAIN,
      draggableCursor: 'crosshair',

      click: function (e) {

        //debugger;
        if(!boundary.outerBoundaryCreated)
        {
          var tempMarker = map.addMarker({
            lat: e.latLng.lat(),
            lng: e.latLng.lng(),
            title: 'Marker'
          });


          $scope.$apply(function () {
            boundary.polygonPoints.push([e.latLng.lat(), e.latLng.lng()]);
            boundary.markers.push(tempMarker);
          });


          if (boundary.polygonPoints.length > 2) {
            if (polygon)
              polygon.setMap(null);

            DrawAllBoundaries();
            // DrawPolygon();
            //debugger;
          }
        }
        else
        {
          var tempMarker = map.addMarker({
            lat: e.latLng.lat(),
            lng: e.latLng.lng(),
            title: 'Marker'
          });

          if(boundary.cutoutPoints[cutoutIndex] == null)
          {
            boundary.cutoutPoints[cutoutIndex] = [];
          }
          $scope.$apply(function () {
            boundary.cutoutPoints[cutoutIndex].push([e.latLng.lat(), e.latLng.lng()]);
            boundary.markers.push(tempMarker);
            boundary.canCreateCutout = (boundary.cutoutPoints[cutoutIndex].length > 2);
          });

          if (boundary.cutoutPoints[cutoutIndex].length > 2) {
            if (cutout[cutoutIndex])
              cutout[cutoutIndex].setMap(null);

            DrawAllBoundaries();
            // DrawPolygon();
            //debugger;
          }
        }
      }
    });
  }
});
