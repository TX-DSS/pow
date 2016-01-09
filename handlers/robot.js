var cheerio = require('cheerio');
var superagent = require('superagent-charset');
var Q = require('q');
var PageRule = require('../models/page-rule.js');
var SiteSchedule = require('../models/site-schedule.js');
var LinkAutoCaptured = require('../models/link-auto-captured.js');

function handleError(err, res) {
    res.json({
        isSuccess: false,
        err: err
    });
}

function superagentGetURL(url, charset) {
    var deferred = Q.defer();
    superagent.get(url)
        .charset(charset)
        .end(function(err, sres) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(sres);
            }
        });
    return deferred.promise; // the promise is returned
}

function analysePage(msg) {
    var deferred = Q.defer();
    var charset = msg.isGBKCharset == "true" ? "gbk" : "utf-8";
    superagentGetURL(msg.pageURL, charset)
        .then(function(res) {
            var $ = cheerio.load(res.text);
            var title = msg.titleArea ? $(msg.titleArea).text() : "";
            var author = msg.authorArea ? $(msg.authorArea).text() : "";
            var time = msg.timeArea ? $(msg.timeArea).text() : "";
            var content = msg.contentArea ? $(msg.contentArea).html() : "";
            var obj = {
                sourceURL: msg.pageURL,
                title: title,
                author: author,
                publishTime: time,
                originContent: content
            }
            deferred.resolve(obj);
        })
        .catch(function(err){
            deferred.reject(err);
        })
    return deferred.promise; // the promise is returned
}

function analyseLinkArea(msg) {
    var deferred = Q.defer();
    var charset = msg.isGBKCharset == "true" ? "gbk" : "utf-8";
    var items = [];
    superagentGetURL(msg.siteURL, charset)
        .then(function(res) {
            var $ = cheerio.load(res.text);
            var promiseArray = [];
            $('' + msg.targetArea + ' a').each(function(index, element) {
                var url =  $(element).attr('href');
                items.push({
                    title: $(element).text(),
                    link: url,
                    siteURL: msg.siteURL,
                    targetArea: msg.targetArea,
                    ruleId: ""
                });
                promiseArray.push(findLinkPageRule(url));
            });
            return Q.all(promiseArray);
        })
        .then(function(ruleids){
            var promiseArray = [];
            for ( var i=0,l=ruleids.length; i<l; i++) {
                items[i].ruleId = ruleids[i];
                promiseArray.push(saveCapturedLink(items[i]));
            }
            return Q.all(promiseArray);
        })
        .then(function(result){
            deferred.resolve(result);
        })
        .catch(function(err){
            deferred.reject(err);
        })
    return deferred.promise; // the promise is returned
}

function findLinkPageRule(url) {
    var deferred = Q.defer();
    var baseurl = url.split('://')[1].split('/')[0];
    // 获取链接对应的规则
    PageRule.find({
        baseURL: eval('/'+baseurl+'/')
    }).exec(function(err, result){
            if (err) {
                deferred.reject(err);
            } else {
                if ( !result || !result.length ) {
                    deferred.resolve("");
                } else {
                    var ruleid = result[0].ruleId;
                    var baseurl = result[0].baseURL;
                    for ( var i=1,l=result.length; i<l; i++ ) {
                        if ( result[i].length > baseurl.length ) {
                            ruleid = result[i].ruleId;
                            baseurl = result[i].baseURL;
                        }
                    }
                    deferred.resolve(ruleid);
                }
            }
        });
    return deferred.promise; // the promise is returned
}

function saveCapturedLink(obj) {
    var deferred = Q.defer();
    var linkAutoCaptured = new LinkAutoCaptured({
        linkURL: obj.link,
        linkTitle: obj.title,
        sourceSite: obj.siteURL,
        ruleId: [obj.ruleId],
        state: ""
    });
    linkAutoCaptured.save(function(err, result) {
        if (err) {
            deferred.reject(err);
        } else {
            deferred.resolve(result);
        }
    });
    return deferred.promise; // the promise is returned
}

exports.func = function(req, res, next) {

    var act = req.body.action;
    var msg = req.body.message;

    switch (act) {
        case 'analyseLinkArea':
            analyseLinkArea(msg)
                .then(function(msg) {
                    //console.log(arguments);
                    res.json({
                        isSuccess: true,
                        msg: msg
                    });
                })
                .catch(function(err) {
                    res.json({
                        isSuccess: false,
                        msg: err
                    });
                })
            break;
        case 'analysePage':
            analysePage(msg)
                .then(function(msg) {
                    res.json({
                        isSuccess: true,
                        msg: msg
                    });
                })
                .catch(function(err) {
                    res.json({
                        isSuccess: false,
                        msg: err
                    });
                })
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
            pageRule.save(function(err, result) {
                if (err) return handleError(err, res);
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
            if ('unlearned' == msg.opt) {
                query.where('ruleId').equals([]);
            }
            query.exec(function(err, result) {
                if (err) {
                    res.json({
                        isSuccess: false,
                        msg: err
                    });
                } else {
                    res.json({
                        isSuccess: true,
                        msg: result
                    });
                }
            });
            break;
        default:
            res.json({
                isSuccess: false,
                msg: "Error Input"
            });
    }

};
