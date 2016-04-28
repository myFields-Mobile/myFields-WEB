inspectorApplication.controller('AdminAssignController', function($scope, $http) {
    var ctrl = this;
    ctrl.inspectors = [];
    ctrl.usersLoaded = false;
    ctrl.inspectionsLoaded = false;
    ctrl.inspections =[];
    ctrl.selectedInspection ="";
    ctrl.selectedInspector ="";
    ctrl.accept = accept;
    ctrl.decline = decline;
    ctrl.getStatus = getStatus;
    ctrl.assignInspector = assignInspector;
    ctrl.getName = getName;
    init();

    function init() {
        $http({
            method: 'GET',
            url: '/admin/users'
        }).then(function successCallback(response) {
            ctrl.inspectors = validate(response.data);
            ctrl.usersLoaded =true;
        }, function errorCallback(response) {
            console.error(response);
        });
        getInspections();
    }

    function validate(users)
    {
        var result =[];
        var length = users.length;

        for(var j = 0; j < length; j++)
        {
            var userTypes = users[j].UserTypes;
            userTypes.forEach(function(currentType) {
                if('Inspector' == currentType.title) {
                    result.push(users[j]);
                }
            });
        }

        return result;
    }

    function getInspections(){
        ctrl.inspectionsLoaded = false;
        ctrl.selectedInspection = "";
        ctrl.selectedInspector="";
        $http({
            method: 'GET',
            url: '/api/inspection/all'
        }).then(function successCallback(response) {
            ctrl.inspections = response.data;
            ctrl.inspectionsLoaded = true;
        }, function errorCallback(response) {
            console.error(response);
        });

    }

    function getName(userid){
        var ret = userid;
        ctrl.inspectors.forEach(function(usr) {
            if(userid == usr.id) {
                ret = usr.firstName+" "+usr.lastName;
                return;
            }
        });
        return ret;
    }

    function assignInspector() {
        $http.post('/api/inspection/'+ctrl.selectedInspection+'/assign', {
            inspector_id: ctrl.selectedInspector
        }).then(function(success) {
            getInspections();
        }, function(error) {
            console.error(error);
        });
        ctrl.processing = false;
    }

    function accept() {
        $http({
            method: 'GET',
            url: '/api/inspection/'+ctrl.selectedInspection+'/accept'
        })
            .then(
            function successCallback(response) {
                getInspections();
            },
            function errorCallback(error) {
                console.error(error);
            }
        );
    }

    function decline() {
        $http({
            method: 'GET',
            url: '/api/inspection/'+ctrl.selectedInspection+'/decline'
        })
            .then(
            function successCallback(response) {
                getInspections();
            },
            function errorCallback(error) {
                console.error(error);
            }
        );
    }

    function getStatus(status){
        if(status == null){
            return ''
        }
        else if(status){
            return 'Accepted'
        }
        else{
            return 'Declined'
        }
    }


});