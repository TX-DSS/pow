var xml2js = require('xml2js');

function sendMsg(obj, res) {
    var builder = new xml2js.Builder({rootName: "xml", headless: true, cdata: true});

    var xml = builder.buildObject(obj);

    console.log(xml);

    res.send(xml);
}

function handleEvents(msgObj, res) {
    if ( 'CLICK' == msgObj.Event ) {
        switch (msgObj.EventKey) {
            case 'V1001':
                // 最新公告
                var resObj = {
                    ToUserName: msgObj.FromUserName,
                    FromUserName: msgObj.ToUserName,
                    CreateTime: new Date().getTime(),
                    MsgType: "news",
                    ArticleCount: 2,
                    Articles: {
                        item: [{
                            Title: "公告标题1",
                            Description: "公告描述1",
                            PicUrl: "http://120.25.240.240/img/1.jpg",
                            Url: "http://120.25.240.240/page/1.html"
                        }, {
                            Title: "公告标题2",
                            Description: "公告描述2",
                            PicUrl: "http://120.25.240.240/img/2.jpg",
                            Url: "http://120.25.240.240/page/2.html"
                        }]
                    }
                }
                sendMsg(resObj, res);
                break;
            case 'V1003':
                // 联系方式查询
                var resObj = {
                    ToUserName: msgObj.FromUserName,
                    FromUserName: msgObj.ToUserName,
                    CreateTime: new Date().getTime(),
                    MsgType: "text",
                    Content: "请发送需要查询的联系人"
                }
                sendMsg(resObj, res);
                break;
            case 'V2003':
                // 近期交流会
                var resObj = {
                    ToUserName: msgObj.FromUserName,
                    FromUserName: msgObj.ToUserName,
                    CreateTime: new Date().getTime(),
                    MsgType: "news",
                    ArticleCount: 2,
                    Articles: {
                        item: [{
                            Title: "交流会标题1",
                            Description: "交流会描述1",
                            PicUrl: "http://120.25.240.240/img/1.jpg",
                            Url: "http://120.25.240.240/page/1.html"
                        }, {
                            Title: "交流会标题2",
                            Description: "交流会描述2",
                            PicUrl: "http://120.25.240.240/img/2.jpg",
                            Url: "http://120.25.240.240/page/2.html"
                        }]
                    }
                }
                sendMsg(resObj, res);
                break;
            case 'V3001':
                // 当日食堂菜谱
                var resObj = {
                    ToUserName: msgObj.FromUserName,
                    FromUserName: msgObj.ToUserName,
                    CreateTime: new Date().getTime(),
                    MsgType: "text",
                    Content: "当日食堂菜谱：\n1. 珍珠丸子 \n2. 宫保鸡丁 \n3. 农家小炒肉"
                }
                sendMsg(resObj, res);
                break;
            case 'V3003':
                // 本周兴趣小组活动
                var resObj = {
                    ToUserName: msgObj.FromUserName,
                    FromUserName: msgObj.ToUserName,
                    CreateTime: new Date().getTime(),
                    MsgType: "text",
                    Content: "本周兴趣小组活动：\n周二. 足球\n周四. 羽毛球 \n周五. 篮球"
                }
                sendMsg(resObj, res);
                break;
            case 'V3004':
                // 近期园区活动
                var resObj = {
                    ToUserName: msgObj.FromUserName,
                    FromUserName: msgObj.ToUserName,
                    CreateTime: new Date().getTime(),
                    MsgType: "news",
                    ArticleCount: 2,
                    Articles: {
                        item: [{
                            Title: "园区活动标题1",
                            Description: "园区活动描述1",
                            PicUrl: "http://120.25.240.240/img/1.jpg",
                            Url: "http://120.25.240.240/page/1.html"
                        }, {
                            Title: "园区活动标题2",
                            Description: "园区活动描述2",
                            PicUrl: "http://120.25.240.240/img/2.jpg",
                            Url: "http://120.25.240.240/page/2.html"
                        }]
                    }
                }
                sendMsg(resObj, res);
                break;
            default:
                var resObj = {
                    ToUserName: msgObj.FromUserName,
                    FromUserName: msgObj.ToUserName,
                    CreateTime: new Date().getTime(),
                    MsgType: "text",
                    Content: "功能暂未开放"
                }
                sendMsg(resObj, res);
        }
    } else {
        res.send("success");
    }
}

exports.responseMsg = function(msg, res){

    var parser = new xml2js.Parser({explicitArray: false});

    parser.parseString(msg, function(err, result){
        //console.log(JSON.stringify(result));
        var msgObj = result.xml;
        var type = msgObj.MsgType;

        switch (type) {
            case 'text': 
                if ( "张三" == msgObj.Content ) {
                    var resObj = {
                        ToUserName: msgObj.FromUserName,
                        FromUserName: msgObj.ToUserName,
                        CreateTime: new Date().getTime(),
                        MsgType: "text",
                        Content: "张三的联系方式：\n123456789"
                    }
                    sendMsg(resObj, res);
                } else {
                    res.send("success");
                }
                break;
            case 'event':
                handleEvents(msgObj, res);
                break;
            default:
                res.send("success");
        }

    });

    // console.log(JSON.stringify(req.query));
    // console.log(JSON.stringify(req.body));
};