/**
 * Created by gannonhuiting on 2/2/16.
 */

inspectorApplication.controller('adminListCtrl', function($scope, $http) {

    var ctrl = this;
    ctrl.users = [];
    ctrl.types = [];
    ctrl.type = "";

    ctrl.selectUser = selectUser;
    ctrl.remove = remove;
    ctrl.add = add;

    ctrl.showEdit = false;
    ctrl.currentUser = "";
    ctrl.fieldName = "";

    init();
    function init() {
        getInfo();
    }

    function remove(type)
    {
        $http.post('/admin/'+ctrl.currentUser.id+'/remove', {
            title: type.title
        }).success(function(success) {
            window.location.href = "/admin/list";
        }).error(function(error) {
            console.log(error);
        });
    }

    function add(type)
    {
        var url = "/admin/"+ctrl.currentUser.id+"/add";
        $http.post(url,{
                title: type
        }).success(function(success) {
            window.location.href = "/admin/list";
        }).error(function(error) {
            console.log(error);
        });
        ctrl.reload = false;
    }


    function selectUser(user)
    {
        ctrl.currentUser = user;
        ctrl.showEdit = true;
    }



    function getInfo() {
        $http({
            method: 'GET',
            url: '/admin/types'
        }).then(function successCallback(response) {

            ctrl.types = response.data;
        });
        $http({
            method: 'GET',
            url: '/admin/users'
        }).then(function successCallback(response) {
            ctrl.users = response.data;
        }, function errorCallback(response) {
            console.error("response error "+response);
        });
    }
});