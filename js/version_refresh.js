
// 获取版本号
function versionRefresh(ready) {

    // 获取版本号
    var wgtVer = null;

    function plusReady() {
        // 获取本地应用资源版本号
        plus.runtime.getProperty(plus.runtime.appid, function(inf) {
            wgtVer = inf.version;
            console.log("当前应用版本：" + wgtVer);
        });
    }
    if (window.plus) {
        plusReady();
    } else {
        document.addEventListener('plusready', plusReady, false);
    }
    // 检测更新
    var checkUrl = "http://www.mucch.com/test_neibu/check.php";

    function checkUpdate() {
        // if (ready) {
        //     plus.nativeUI.showWaiting("检测更新...");
        // }
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            switch (xhr.readyState) {
                case 4:
                    plus.nativeUI.closeWaiting();
                    if (xhr.status == 200) {
                        console.log("检测更新成功：" + xhr.responseText);
                        var newVer = xhr.responseText;
                        if (wgtVer && newVer && (wgtVer != newVer)) {
                            // downWgt(); // 下载升级包
                            $.confirm('请尽量在wifi环境更新', '检测到新版本，是否更新？',
                                function() {
                                    downWgt(); // 下载升级包
                                },
                                function() {
                                    $.toast("您取消了更新");
                                }
                            );
                        } else {
                            console.log("当前已是最新版本");
                            if (ready==="Y") {
                                $.toast("当前已是最新版本！");
                            }
                        }
                    } else {
                        console.log("检测更新失败！");
                        plus.nativeUI.alert("检测更新失败！");
                    }
                    break;
                default:
                    break;
            }
        }
        xhr.open('GET', checkUrl);
        xhr.send();
    }
    // 下载wgt文件
    var wgtUrl = "http://www.mucch.com/test_neibu/H5210F830.wgt";

    function downWgt() {
        plus.nativeUI.showWaiting("下载更新文件...");
        plus.downloader.createDownload(wgtUrl, {
            filename: "_doc/update/"
        }, function(d, status) {
            if (status == 200) {
                console.log("下载wgt成功：" + d.filename);
                $.toast("即将安装更新文件，请稍候...");
                installWgt(d.filename); // 安装wgt包
            } else {
                console.log("下载wgt失败！");
                plus.nativeUI.alert("下载更新文件失败！");
            }
            plus.nativeUI.closeWaiting();
        }).start();
    }
    // 更新应用资源
    function installWgt(path) {
        plus.nativeUI.showWaiting("安装更新包...");
        plus.runtime.install(path, {}, function() {
            $.toast("更新完成，即将重启！");
            plus.runtime.restart(); //重启应用
        }, function(e) {
            plus.nativeUI.closeWaiting();
            $.toast("更新失败[" + e.code + "]：" + e.message);
        });
        plus.nativeUI.closeWaiting();
    }
    console.log(ready);
    if (ready) {
        checkUpdate();
        return;
    }
    document.addEventListener("plusready", checkUpdate, false);
}
versionRefresh();

