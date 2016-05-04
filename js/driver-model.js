 'use strict';

//登陆模块
function login_model($scope, $http, $location) {
    DidYouLogin('login'); //判断是否登陆
    $scope.login = {
        mobile: getCookie("mobile"), //13162429296
        password: getCookie("password") //xihuanni2
    };
    var login = $scope.login;

    // 切换成测试版本
    // localStorage.removeItem("baseurl");
    if (getCookie("baseurl") === null || getCookie("baseurl") === '') {
        $scope.openTest = false;
    } else {
        $scope.openTest = true; 
    }

    $scope.change_to_test_model = function($event) {
        setCookie("baseurl", "http://58.20.51.164:8083/", 365);
        if ($scope.openTest != true) {
            $scope.openTest = true;
            $.toast("已进测试环境，好好干活，别乱提bug");
        } else {
            $scope.openTest = false;
            delCookie("baseurl")
        }
    }
    console.log($location.search().h); 

    //登陆请求
    // var ajaxUrl = publicAjaxUrl + "Mobile/Login/";
    $scope.submit = function() {
        setCookie("mobile", $scope.login.mobile, 365);
        setCookie("password", $scope.login.password, 365);
        if ($scope.login.mobile == '' || $scope.login.mobile == undefined) {
            $.toast("手机号码不能为空");
            return;
        };
        if (!rule_mobile.test($scope.login.mobile)) {
            $.toast("手机号码格式错误");
            return;
        };
        if ($scope.login.password == '' || $scope.login.password == undefined) {
            $.toast("密码不能为空");
            return;
        };
        $.showIndicator();
        var myData = {
            "User": {
                "mobile": $scope.login.mobile,
                "password": $scope.login.password
            }
        };

        console.log(Url("weixin/signin"));
        $http.post(Url("weixin/signin"), myData).error(function(data) {
            error();
            $.hideIndicator();
        }).success(function(data) {
            $.hideIndicator();
            console.log(data);
            if (data.status == 'success') {
                setCookie("uid", data.results.uid, 365);
                setCookie("ak", data.results.ak, 365);
                var getData = {
                    'User': {
                        'ak': data.results.ak,
                        'uid': data.results.uid
                    }
                }
                $http.post(Url('weixin/personalcenter'), getData).error(function() {
                    error();
                }).success(function(data) {
                    console.log(data);
                    setCookie('user_info', JSON.stringify(data.results), 365);
                    var hasFrom = $location.search().h;
                    console.log(hasFrom);
                    if (!hasFrom) {
                        window.location.href = "#/me/index";
                    } else {
                        window.location.href = "#/" + hasFrom;
                    }


                })
            } else if (data.status == 'failure') {
                $.toast(data.status);
                console.log(JSON.stringify(data.results));
            }

        })
    }
}

// 我的页面
function me_model($scope, $http) {
    DidYouLogin("me/index"); //检测是否登陆

    //更多选项
    $scope.more_option = function() {
        var buttons1 = [{
            text: '退出账户',
            bold: true,
            color: 'danger',
            onClick: function() {
                // $.toast("您已退出账号");
                delCookie("uid");
                delCookie("baseurl");
                delCookie("user_info");
                delCookie("ak");
                location.href = "#/login"
            }
        }];
        var buttons2 = [{
            text: '取消',
            //bg: 'danger'
        }];
        var groups = [buttons1, buttons2];
        $.actions(groups);
    }

    //获取个人信息
    var mydata = {
            'User': {
                'uid': getCookie('uid'),
                'ak': getCookie('ak')
            }
        }
    if (getCookie("user_info")) {
        var parseUserInfo = JSON.parse(getCookie("user_info"));
        $scope.me = parseUserInfo;
    }
    $http.post(Url('weixin/personalcenter'), mydata).error(function() {
        error();
        $.hideIndicator();
    }).success(function(data) {
        console.log(data);
        if (data.status === 'success') {
            var info = data.results;
            setCookie("user_info", JSON.stringify(info), 365);
            $scope.me = info;
        } else {
            // $.toast(data.status);
        }
        $.hideIndicator();
    })

}

// 订单主页
function order_index_model($scope, $http, $location) {
    DidYouLogin("order/wait-send?type=TB"); //检测是否登陆
    var orderListArray = []; //数据列表数组
    var current_page = 1; //初始页数
    $scope.showStart = true; //是否显示加载按钮
    $scope.showEnd = false; //是否显示没有更多提示

    var mydata = {
        'User': {
            'uid': getCookie('uid'),
            'ak': getCookie('ak')
        }
    }
    var getOrderListFn = function(page, page_size) {
            var pageType = $location.search().type;
            $scope.active = pageType;
            if (pageType != 'undefined') {
                mydata.Waybill = {
                    status: pageType
                };
            };
            if (page) {
                mydata.Waybill.page = page;
            };
            // 每次请求的数量
            mydata.Waybill.page_size = page_size;

            $.showIndicator();
            console.log(mydata)
            $http.post(Url('weixin/waybill'), mydata).error(function() {
                error();
                $.hideIndicator();
            }).success(function(data) {
                console.log(data);
                current_page++;
                console.log("页码" + current_page);
                for (var i = 0; i < data.results.length; i++) {
                    orderListArray.push(data.results[i]);
                };
                if (data.max_page===1 || current_page === data.max_page) {
                    $scope.showStart = false; //是否显示加载按钮
                    $scope.showEnd = true; //是否显示没有更多提示
                };
                console.log(orderListArray);
                $scope.orderlist = orderListArray;
                $.hideIndicator();
            })
        }
        // 默认加载列表
    getOrderListFn(1, 10);

    // 加载更多数据
    var max_page = getCookie("max_page");

    $scope.getOldList = function() {
        getOrderListFn(current_page, 10);
    }


    // 点击搜索按钮
    $scope.searchClick = function(data) {
        // $.toast("当前页面只能搜索\""+data+"\"状态的订单");
        $.popup(".popup-search-view");
        // $("#search_kit").click();
    }

    // 搜索订单
    $(document).on("input", "#search_kit", function() {
        mydata.Waybill.keyword = $scope.$root.search;
        mydata.Waybill.page_size = 50;
        $.showIndicator();
        $http.post(Url('weixin/waybill'), mydata).error(function() {
            error();
        }).success(function(data) {
            console.log(data);
            $scope.$root.orderlist = data.results;
            $.hideIndicator();
        })
    })


    // 查看订单详情
    $scope.$root.viewOrderDetail = function(data) {
        $.showIndicator();
        console.log(data);
        mydata.Waybill = {
            id: data,
        };
        console.log(JSON.stringify(mydata));
        $http.post(Url('weixin/waybillview'), mydata).error(function() {
            error();
            $.hideIndicator();
        }).success(function(data) {
            console.log(data.results);
            $.popup(".popup-order-view");
            $scope.$root.orderDetail = data.results;
            $.hideIndicator();
        })

    }


    function cancelOrder(id, callback) {
        $.confirm('确定要取消订单吗？',
            function() {
                mydata.Waybill = {
                    id: id
                };
                console.log(mydata)
                $http.post(Url('weixin/waybillcancel'), mydata).error(function() {
                    error();
                }).success(function(data) {
                    console.log(data.results);
                    if (data.status === 'success') {
                        $.toast("订单已取消");
                        callback(data);
                        window.location.reload();
                    } else {
                        $.toast(data.results.info)

                    }
                })
            }
        );
    }
    $scope.cancelOrder = function(id, $index) {
        cancelOrder(id, function(data) {
            console.log($index);
            $scope.orderlist[$index].waybill_status_code = 0;
        })
    }
    $scope.$root.cancelOrder = function(id) {
        console.log(id);
        cancelOrder(id, function() {
            $.closeModal(".popup-order-view");
            window.location.reload();
        })
    }
}

// 订单详情
function order_detail_model($scope, $http) {
    DidYouLogin(); //检测是否登陆
    // 查看订单详情
    $scope.viewOrderDetail = function() {
        $.popup(".popup-car-view");
    }
}

// 个人配送说明
function send_state_model($scope, $http) {
    // DidYouLogin(); //检测是否登陆
}
