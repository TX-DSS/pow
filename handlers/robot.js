var cheerio = require('cheerio');
var superagent = require('superagent-charset');

exports.func = function(req, res, next){

    switch(req.body.opt){
        case 'analyseLinkArea':
            var msg = req.body.msg;
            var char = msg.isGBKCharset=="true"?"gbk":"UTF-8";
            superagent.get(msg.siteURL)
                .charset(char)
                .end(function(err, sres) {
                    // 常规的错误处理
                    if (err) {
                        return next(err);
                    }
                    // sres.text 里面存储着网页的 html 内容，将它传给 cheerio.load 之后
                    // 就可以得到一个实现了 jquery 接口的变量，我们习惯性地将它命名为 `$`
                    // 剩下就都是 jquery 的内容了
                    var $ = cheerio.load(sres.text);
                    var items = [];
                    $(''+msg.targetArea+' a').each(function(index, element) {
                        var $element = $(element);
                        items.push({
                            title: $element.text(),
                            link: $element.attr('href'),
                            site: msg.siteURL
                        });
                    });

                    //console.log(items);
                    res.json({
                        isSuccess: true,
                        msg: {
                            siteURL: msg.siteURL,
                            targetArea: msg.targetArea,
                            linkList: items
                        }
                    });

                });
            break;
        default:
            break;
    }

};
