/**
 * Created by gannonhuiting on 3/22/16.
 */
inspectorApplication.controller('LayoutControl', function($scope, $http) {
    var ctrl = this;
    ctrl.test = test;
    ctrl.isAdmin;


    init();
    function init() {
        $http({
            method: 'GET',
            url: '/admin/users'
        }).then(function successCallback(response) {
            ctrl.isAdmin = response.data;
        });
    }
});