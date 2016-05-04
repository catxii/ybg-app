// 公共通用的的方法

//请求地址
var Url = function(url) {
    var baseurl = getCookie("baseurl") || "http://s.chezhaipei.com/";
    // var baseurl =  "http://api.yunbaogong.cn/";
    // var baseurl = "http://192.168.1.111:8083/";
    // var baseurl = "http://58.20.51.164:8083/"; 
    // var baseurl =  "http://s.chezhaipei.com/";
    return baseurl + url;
}

// // 后台返回到前台时 
// document.addEventListener("resume", resumeFn, false);

// function resumeFn() {
//     versionRefresh("后台切换到前台");
// }


var closePopup = function(boxname) {
    $.closeModal(boxname);
}

//返回按钮弹出确定
function gobackbtn() {
    // 按返回键提示是否退出
    plus.key.addEventListener('backbutton', function() {
        history.back();
    });
}
document.addEventListener("plusready", gobackbtn, false);

/****** 操作cookie  *******/

// 设置cookie
function setCookie(c_name, value, expiredays) {
    var exdate = new Date()
    exdate.setDate(exdate.getDate() + expiredays)
    document.cookie = c_name + "=" + escape(value) +
        ((expiredays == null) ? "" : ";expires=" + exdate.toGMTString())
}
// 读取cookie
function getCookie(c_name) {
    if (document.cookie.length > 0) {
        c_start = document.cookie.indexOf(c_name + "=")
        if (c_start != -1) {
            c_start = c_start + c_name.length + 1
            c_end = document.cookie.indexOf(";", c_start)
            if (c_end == -1) c_end = document.cookie.length
            return unescape(document.cookie.substring(c_start, c_end))
        }
    }
    return ""
}
// 删除某个cookie的key
function delCookie(name) {
    var exp = new Date();
    exp.setTime(exp.getTime() - 1);
    var cval = getCookie(name);
    if (cval != null)
        document.cookie = name + "=" + cval + ";expires=" + exp.toGMTString();
}


// 判断用户当前是否登陆过期
var DidYouLogin = function(x) { 
    // if (!getCookie("uid")) {
    //     console.log("没有登陆");
    //     if (x != 'login') {
    //         $.toast("登陆信息过期，请重新登陆");
    //         window.location.href = "#/login?h=" + x;
    //     }
    // } else if (x == 'login') {
    //     window.location.href = "#/me/index";
    // }

}

// 拨打电话
function callPhone(num) {
    plus.device.dial(num, false);
}

// 获取json长度
function getJsonLength(jsondata) {
    var length = 0;
    for (var i in jsondata) {
        length++;
    }
    return length;
}

// 请求方法
function zpAjax($http, method, url, mydata, getData) {
    $http({
        url: url,
        data: $.param(mydata),
        method: method,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' }
    }).success(function(data) {
        getData(data);
    });
}

// 获取验证短信
function getCode(time, model_name, phoneNumber, $http) {
    var time = time;
    var myData = {
        mobile: phoneNumber,
        scenarios: model_name
    }
    if (myData.mobile == '' || myData.mobile == undefined) {
        $.toast("手机号码不能为空");
        return;
    };
    if (!rule_mobile.test(myData.mobile)) {
        $.toast("手机号码格式错误");
        return;
    };
    $http.post(Url("passport/smsvalid"), myData).error(function() {
        error();
    }).success(function(data) {
        var data = JSON.parse(data);
        console.log(data);
        if (data.status === 'success') {
            $.toast("短信发送成功");

            function timer() {
                time--;
                $(".code_btn").text(time + " 秒后重新获取").addClass("disabled");
                if (time == 0) {
                    clearInterval(timeover);
                    $(".code_btn").text("获取验证码").removeClass("disabled");
                }
            }
            var timeover = setInterval(timer, 1000);
        } else {
            $.toast(data.results.info);
        }
    })
}


// 正则验证条件
var rule_mobile = /^1[3,4,5,6,7,8]{1}[0-9]{1}[0-9]{8}$/; //验证手机号码
var rule_password = /^\w{6,12}$/; //验证密码
var rule_price = /^(0|\d{1,8})(\.\d{1,2})?$/; //验证价格，小数点后面两位
var rule_number = /^\d*$/; //验证数字
var rule_email = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+$/; //验证邮箱



// 获取网址参数
function getArgument(x) { // 获取网址最后的参数
    var array = window.location.hash.split("/");
    var argumentArray = array[array.length - 1];
    var argument = argumentArray.substring(x, argumentArray.length);
    console.log(argument)
    return argument;
}

// 更新中提示
function showLoading(text) {
    var p = text || "数据更新中...";
    var html = "<div class='black-loading-bar'><i class='loading-ball'></i> <span class='loading-text'>" + p + "</span></div>";
    $(".content").append(html);
}

function hideLoading() {
    $(".black-loading-bar").remove();
}


// 网络错误提示
function error(address) {
    $.toast("请求失败，请检查网络");
    $.hideIndicator();
    if (address) {
        window.location.href = address;
    }
}

// 数据为空时
function emptyinfo(boolean, obj, text) {
    if (text) {
        obj.emptytext = text;
    }
    obj.empty = boolean;
}

// 全局作用域
ybgapp.controller('global_model', function($scope, $http) {
    $scope.$root.check_driver_map = function(coord) {
        // 打开地图
        $.popup(".popup-driver-map");
        var map = new BMap.Map("l-map");
        var array = coord.split(",");
        var point = new BMap.Point(array[0], array[1]);
        console.log(point);
        // map.centerAndZoom(point, 15);
        // var marker = new BMap.Marker(point); // 创建标注
        // map.addOverlay(marker); // 将标注添加到地图中
        // marker.setAnimation(BMAP_ANIMATION_BOUNCE); //跳动的动画
        map.centerAndZoom(point, 15);
        map.addControl(new BMap.ZoomControl()); //添加地图缩放控件
        var marker1 = new BMap.Marker(point); //创建标注
        map.addOverlay(marker1); // 将标注添加到地图中
        //创建信息窗口
        var infoWindow1 = new BMap.InfoWindow("司机当前位置（五分钟内）");
        marker1.openInfoWindow(infoWindow1); 
    }

    // 关闭弹窗，address为需要关闭的弹窗popup后面一截地址
    $scope.$root.closePopup = function(address){
        console.log(".popup-"+address);
        $.closeModal(".popup-"+address);
    }

})