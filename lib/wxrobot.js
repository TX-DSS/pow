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