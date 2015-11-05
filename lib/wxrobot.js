var xml2js = require('xml2js');

function sendMsg(obj, res) {
    var builder = new xml2js.Builder({rootName: "xml", headless: true, cdata: true});

    var xml = builder.buildObject(obj);

    console.log(xml);

    res.send(xml);
}


exports.responseMsg = function(msg, res){

    var parser = new xml2js.Parser({explicitArray: false});

    parser.parseString(msg, function(err, result){
        console.log(JSON.stringify(result));

        var msgObj = result.xml;
        var type = msgObj.MsgType;

        if ( 'text' == type ) {
            var resObj = {
                ToUserName: msgObj.FromUserName,
                FromUserName: msgObj.ToUserName,
                CreateTime: new Date().getTime(),
                MsgType: "text",
                Content: "你好"
            }
            sendMsg(resObj, res);
        }

        if ( 'event' == type ) {

        }

        //res.send("success");

    });

    // console.log(JSON.stringify(req.query));
    // console.log(JSON.stringify(req.body));


};