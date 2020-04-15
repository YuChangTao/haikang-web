// I_CheckPluginInstall ——> I_InitPlugin ——> I_InsertOBJECTPlugin ——> I_CheckPluginVersion ——> I_Login ——>——>
var g_iWndIndex = 0; //可以不用设置这个变量，有窗口参数的接口中，不用传值，开发包会默认使用当前选择窗口
var szIP = "192.168.1.22"; //设备ip
var iChannelId = 1;
var username="admin";
var password="123456lk";//"Sma123@sma"
$(function () {

    // 检查插件是否已经安装过
    var iRet = WebVideoCtrl.I_CheckPluginInstall();
    if (-2 == iRet) {
        console.log("您的Chrome浏览器版本过高，不支持NPAPI插件！");
        return;
    } else if (-1 == iRet) {
        console.log("您还未安装过插件，双击开发包目录里的WebComponentsKit.exe安装！");
        return;
    }

    // 初始化插件参数
    WebVideoCtrl.I_InitPlugin(600, 600, {
        bWndFull: true,//是否支持单窗口双击全屏，默认支持 true:支持 false:不支持
        iWndowType: 1
    });

    //插入插件
    var yq = WebVideoCtrl.I_InsertOBJECTPlugin("divPlugin");
    console.log("容器是否成功"+(yq=="0"?"ok":"faile"));

    // 检查插件是否最新
    if (-1 == WebVideoCtrl.I_CheckPluginVersion()) {
        console.log("检测到新的插件版本，双击开发包目录里的WebComponentsKit.exe升级！");
        return;
    }

    //登出
    clickLogout();

    // WebVideoCtrl.I_GetIPInfoByMode("", "223.5.5.5", iPort, szDeviceInfo)

    //登陆
    WebVideoCtrl.I_Login(szIP, 1, "80", username,password, {
        success: function (xmlDoc) {
            console.log(" 登录成功！");
            setTimeout(function () {
                //获取通道信息
                getChannelInfo();
            }, 10);
            recordSearch();
        },
        error: function () {
            console.log(szIP + " 登录失败！I_GetLastError()="+errorGet());
        }
    });
});

//获取通道
function getChannelInfo() {
    // 模拟通道
    WebVideoCtrl.I_GetAnalogChannelInfo(szIP, {
        async: false,
        success: function (xmlDoc) {
            // var oChannels = $(xmlDoc).find("VideoInputChannel");
            var oChannels = xmlDoc.getElementsByTagName("VideoInputChannel");
            console.log("模拟通道："+ xmlDoc + "," +oChannels);

            $.each(oChannels, function (i) {
                var id = xmlDoc.getElementsByTagName("id")[i].childNodes[0].nodeValue;
                var inputPort = xmlDoc.getElementsByTagName("inputPort")[i].childNodes[0].nodeValue;
                var name = xmlDoc.getElementsByTagName("name")[i].childNodes[0].nodeValue;
                var videoFormat = xmlDoc.getElementsByTagName("videoFormat")[i].childNodes[0].nodeValue;
                console.log("通道id="+id +",通道号="+inputPort+",通道名="+name+",通道制式="+videoFormat);
                iChannelId = id;
            });
        },
        error: function () {
            console.log(szIP + " 获取模拟通道失败！I_GetLastError()="+errorGet());
        }
    });
    // 数字通道
    WebVideoCtrl.I_GetDigitalChannelInfo(szIP, {
        async: false,
        success: function (xmlDoc) {

            // var oChannels = $(xmlDoc).find("InputProxyChannelStatus");
            var oChannels = xmlDoc.getElementsByTagName("InputProxyChannelStatus");
            console.log("数字通道："+ xmlDoc + "," + oChannels);
            $.each(oChannels, function (i) {
                var id = xmlDoc.getElementsByTagName("id")[i].childNodes[0].nodeValue;
                var proxyProtocol = xmlDoc.getElementsByTagName("proxyProtocol")[i].childNodes[0].nodeValue;
                var addressingFormatType = xmlDoc.getElementsByTagName("addressingFormatType")[i].childNodes[0].nodeValue;
                var ipAddress = xmlDoc.getElementsByTagName("ipAddress")[i].childNodes[0].nodeValue;
                var managePortNo = xmlDoc.getElementsByTagName("managePortNo")[i].childNodes[0].nodeValue;
                var srcInputPort = xmlDoc.getElementsByTagName("srcInputPort")[i].childNodes[0].nodeValue;
                var userName = xmlDoc.getElementsByTagName("userName")[i].childNodes[0].nodeValue;
                var streamType = xmlDoc.getElementsByTagName("streamType")[i].childNodes[0].nodeValue;
                var online = xmlDoc.getElementsByTagName("online")[i].childNodes[0].nodeValue;
                console.log("通道id="+id +",接入协议="+proxyProtocol+",IP地址类型="+addressingFormatType+",IP地址="+
                    ipAddress+",管理端口号="+managePortNo+",IP通道号="+srcInputPort+",接入用户名="+userName+",码流类型="+streamType+",是否在线="+online);
            });
            console.log(szIP + " 获取数字通道成功！");
        },
        error: function () {
            console.log(szIP + " 获取数字通道失败！I_GetLastError()="+errorGet());
        }
    });
    // 零通道
    WebVideoCtrl.I_GetZeroChannelInfo(szIP, {
        async: false,
        success: function (xmlDoc) {
            var oChannels = $(xmlDoc).find("ZeroVideoChannel");
            console.log("零通道："+ xmlDoc + "," +oChannels);
            $.each(oChannels, function (i) {

            });
            console.log(szIP + " 获取零通道成功！");
        },
        error: function () {
            console.log(szIP + " 获取零通道失败！I_GetLastError()="+errorGet());
        }
    });
}

//查询录像文件
function recordSearch() {
    var iChannelID = "1";
    var szStartTime = "2019-12-26 00:00:00";
    var szEndTime = "2019-12-26 14:00:00";
    WebVideoCtrl.I_RecordSearch(szIP,iChannelID,szStartTime,szEndTime,{
        async: false,
        success :function (xmlDoc) {
            var numOfMatches = xmlDoc.getElementsByTagName("numOfMatches")[0].childNodes[0].nodeValue;
            console.log("numOfMatches="+numOfMatches);
        }
    });
}

//预览
function iStartRealPlay(){
    var iRet = WebVideoCtrl.I_StartRealPlay(szIP, {
        iStreamType: 1,//1主码流，2子码流
        iChannelID: iChannelId,//默认通道
        bZeroChannel: false
    });

    if (0 == iRet) {
        console.log("开始预览成功！");
    } else {
        console.log("开始预览失败！");
        console.log("预览I_GetLastError()="+errorGet());
    }

}

//回放
function playBack(){
    var startTime = $("sTime").val();
    var endTime = $("eTime").val();

    //获取当前窗口的信息
    var oWndInfo = WebVideoCtrl.I_GetWindowStatus(g_iWndIndex);
    // 初始化插件参数及插入插件
    WebVideoCtrl.I_InitPlugin(600, 600, {
        bWndFull: true,//是否支持单窗口双击全屏，默认支持 true:支持 false:不支持
        iWndowType: 1
    });

    if (oWndInfo != null) {// 已经在播放了，先停止
        WebVideoCtrl.I_Stop();
        console.log("已经在播放了，先停止");
    }else{
        var iRet = WebVideoCtrl.I_StartPlayback( szIP, {
            iChannelID: iChannelId,
            szStartTime: "2019-12-26 10:30:00",
            szEndTime: "2019-12-26 17:40:10"
        });

        if (0 == iRet) {
            console.log("开始回放成功！");
        } else {
            console.log("开始回放失败！");
            console.log("回放！I_GetLastError()="+errorGet());
        }
    }
}

//倒放
function reversePlayBack() {
    var iRet = WebVideoCtrl.I_ReversePlayback(szIP,{
        iChannelID: iChannelId,
        szStartTime: "2019-12-25 10:30:00",
        szEndTime: "2019-12-25 17:40:10"
    });
    if (0 == iRet) {
        console.log("开始倒放成功！");
    } else {
        console.log("停止倒放失败！");
        console.log("停止倒放！I_GetLastError()="+errorGet());
    }
}

//停止播放
function stopPlayback() {

    var iRet = WebVideoCtrl.I_Stop(g_iWndIndex);
    if (0 == iRet) {
        console.log("停止播放成功！");
    } else {
        console.log("停止播放失败！");
        console.log("停止播放！I_GetLastError()="+errorGet());
    }
}


//单帧播放，每调用一次，播放一帧数据。回放和倒放时可以调用
function iFrame() {
    var iRet = WebVideoCtrl.I_Frame(g_iWndIndex);
    if (0 == iRet) {
        console.log("单帧播放成功！");
    } else {
        console.log("单帧播放失败！");
        console.log("单帧播放！I_GetLastError()="+errorGet());
    }
}

//暂停播放，回放和倒放时可以调用
function iPause() {
    var iRet = WebVideoCtrl.I_Pause(g_iWndIndex);
    if (0 == iRet) {
        console.log("暂停播放成功！");
    } else {
        console.log("暂停播放失败！");
        console.log("暂停播放！I_GetLastError()="+errorGet());
    }
}

//恢复播放，把播放状态从单帧/暂停恢复到正常播放状态
function iResume() {
    var iRet = WebVideoCtrl.I_Resume(g_iWndIndex);
    if (0 == iRet) {
        console.log("恢复播放成功！");
    } else {
        console.log("恢复播放失败！");
        console.log("恢复播放！I_GetLastError()="+errorGet());
    }
}

//减速播放，每调用一次，播放速度降低一个等级，插件最大支持 1/8 倍速到 8 倍速，设备自身可能也有限制
function iPlaySlow() {
    var iRet = WebVideoCtrl.I_PlaySlow(g_iWndIndex);
    if (0 == iRet) {
        console.log("减速播放成功！");
    } else {
        console.log("减速播放失败！");
        console.log("减速播放！I_GetLastError()="+errorGet());
    }
}

//加速播放，每调用一次，播放速度增加一个等级，插件最大支持 1/8 倍速到 8 倍速，设备自身可能也有限制。
function iPlayFast() {
    var iRet = WebVideoCtrl.I_PlayFast(g_iWndIndex);
    if (0 == iRet) {
        console.log("加速播放成功！");
    } else {
        console.log("加速播放失败！");
        console.log("加速播放！I_GetLastError()="+errorGet());
    }
}

//获取当前播放的码流的 OSD 时间，可以用于制作回放进度
function getOSDTime() {
    var oWndInfo = WebVideoCtrl.I_GetWindowStatus(g_iWndIndex);

    if (oWndInfo != null) {
        var szTime = WebVideoCtrl.I_GetOSDTime();
        if (szTime != -1) {
            console.log("获取SOD时间成功！OSD="+szTime);
        } else {
            console.log("获取SOD时间失败！I_GetLastError()="+errorGet());
        }
    }
}

//打开声音
function openSound() {
    var iRet = WebVideoCtrl.I_OpenSound(g_iWndIndex);

    if (0 == iRet) {
        console.log("打开声音成功！");
    } else {
        console.log("打开声音失败！I_GetLastError()="+errorGet());
    }
}

//关闭声音
function closeSound() {
    var iRet = WebVideoCtrl.I_OpenSound(g_iWndIndex);

    if (0 == iRet) {
        console.log("关闭声音成功！");
    } else {
        console.log("关闭声音失败！I_GetLastError()="+errorGet());
    }
}

//设置音量
function setVolume() {
    var iRet = WebVideoCtrl.I_SetVolume(50,g_iWndIndex);

    if (0 == iRet) {
        console.log("设置声音成功！");
    } else {
        console.log("设置声音失败！I_GetLastError()="+errorGet());
    }
}

//抓取图片
function capturePic() {
    var iRet = WebVideoCtrl.I_CapturePic("test",g_iWndIndex);

    if (0 == iRet) {
        console.log("抓取图片成功！");
        getLocalCfg();
    } else {
        console.log("抓取图片失败！I_GetLastError()="+errorGet());
    }
}

function getLocalCfg() {
    var localCfg = WebVideoCtrl.I_GetLocalCfg();
    console.log(localCfg);
}


//退出
function clickLogout() {

    if (szIP == "") {
        return;
    }

    var iRet = WebVideoCtrl.I_Logout(szIP);
    if (0 == iRet) {
        console.log("退出成功！");
    } else {
        console.log("退出失败！");
    }
}


function errorGet(){
    return WebVideoCtrl.I_GetLastError();
}