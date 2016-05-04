//基本配置
// 跳转页面路径配置

//创建模块
var ybgapp = angular.module('ybg-app', ['ngRoute']);
//建立模块间的映射关系 
ybgapp.config(['$routeProvider', function($routeProvider) {
    $routeProvider.
        //默认入口页
    otherwise({
            redirectTo: '/login'
        }).
        //登陆地址
    when('/login', {
            templateUrl: 'login.html',
            controller: login_model
        }).
        //个人-主页
    when('/me/index', {
            templateUrl: 'me-index.html',
            controller: me_model
        }).
        //工地-工地列表页
    when('/site/index', {
            templateUrl: 'site-index.html',
            controller: me_model
        }).
        //工地-新增工地
    when('/site/add', {
            templateUrl: 'site-add.html',
            controller: me_model
        }).
        //工地-编辑工地
    when('/site/edit', {
            templateUrl: 'site-edit.html',
            controller: me_model
        }).
        //工地-工地详情
    when('/site/more', {
            templateUrl: 'site-detail.html',
            controller: me_model
        })
}]);
