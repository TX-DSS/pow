var cheerio = require('cheerio');
var superagent = require('superagent-charset');

exports.func = function(req, res, next){

    var opt = req.body.opt;
    var msg = req.body.msg;

    switch(opt){
        case 'analyseLinkArea':
            var charset = msg.isGBKCharset=="true"?"gbk":"utf-8";
            superagent.get(msg.siteURL)
                .charset(charset)
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
        case 'analysePage':
            var charset = msg.isGBKCharset=="true"?"gbk":"utf-8";
            superagent.get(msg.pageURL)
                .charset(charset)
                .end(function(err, sres) {
                    if (err) {
                        return next(err);
                    }

                    var $ = cheerio.load(sres.text);

                    var title = msg.titleArea?$(msg.titleArea).text():"";
                    var author = msg.authorArea?$(msg.authorArea).text():"";
                    var time = msg.timeArea?$(msg.timeArea).text():"";
                    var content = msg.contentArea?$(msg.contentArea).html():"";

                    //console.log(items);
                    res.json({
                        isSuccess: true,
                        msg: {
                            sourceURL: msg.pageURL,
                            title: title,
                            author: author,
                            publishTime: time,
                            originContent: content
                        }
                    });

                });
            break;
        default:
            res.json({
                isSuccess: false,
                msg: "Error Input"
            });
    }

};
