var cheerio = require('cheerio');
var superagent = require('superagent-charset');
var PageRule = require('../models/page-rule.js');
var SiteSchedule = require('../models/site-schedule.js');
var LinkAutoCaptured = require('../models/link-auto-captured.js');

function handleError(err, res) {
    res.json({
        isSuccess: false,
        err: err
    });
}

exports.func = function(req, res, next){

    var act = req.body.action;
    var msg = req.body.message;

    switch(act){
        case 'analyseLinkArea':
            var charset = msg.isGBKCharset=="true"?"gbk":"utf-8";
            superagent.get(msg.siteURL)
                .charset(charset)
                .end(function(err, sres) {
                    if (err) return handleError(err, res);

                    var $ = cheerio.load(sres.text);
                    var items = [];
                    $(''+msg.targetArea+' a').each(function(index, element) {
                        // var $element = $(element);
                        // var url = $element.attr('href');
                        // var baseurl = url.split('://')[1].split('/')[0];
                        //
                        // // 获取链接对应的规则
                        // PageRule.find({
                        //     baseURL: eval('/'+baseurl+'/')
                        // }).
                        // exec(function(err, result){
                        //     if (err) return handleError(err, res);
                        //
                        // });

                        items.push({
                            title: $element.text(),
                            link: $element.attr('href'),
                            site: msg.siteURL
                        });
                        // var linkAutoCaptured = new LinkAutoCaptured({
                        //     linkURL: items[index].link,
                        //     linkTitle: item[index].title,
                        //     sourceSite: msg.siteURL
                        // });
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
        case 'learnPageRule':
            var pageRule = new PageRule({
                baseURL: msg.baseURL,
                titleArea: msg.titleArea,
                authorArea: msg.authorArea,
                publishTimeArea: msg.publishTimeArea,
                contentArea: msg.contentArea,
                category: msg.category
            });
            pageRule.save(function(err, result){
                if(err) return handleError(err, res);
                res.json({
                    isSuccess: true,
                    msg: {
                        ruleId: result.ruleId
                    }
                });
            });
            break;
        case 'queryCapturedLinks':
            var query = LinkAutoCaptured.find();
            if ( 'unlearned' == msg.opt ) {
                query.where('ruleId').equals([]);
            }
            query.exec(function(err, result){
                if (err) return handleError(err, res);
                res.json({
                    isSuccess: true,
                    msg: result
                });
            });
        default:
            res.json({
                isSuccess: false,
                msg: "Error Input"
            });
    }

};
