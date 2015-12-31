(function(exports){
    var Class = {
        create : function() {
            return function() {
                this.Init.apply(this, arguments);
            }
        }
    }

    var Bind = function(tar, func) {
        return function() {
            func.apply(tar, arguments);
        }
    }

    var RobotAjaxReq = function(reqMsg, func) {
        $.modal('<div>Please wait...</div>', {
            opacity: 40,
            overlayCss: {backgroundColor:"#000"},
            containerCss:{
                backgroundColor: "#333",
                height: 36,
                padding: 8,
                width: 160,
                color: "#fff",
                textAlign: 'center'
            }
        });
        $.ajax({
            method: "POST",
            url: "http://robot.pow.com:3000",
            data: reqMsg
        }).done(function(data) {
            $.modal.close();
            func(data);
        })
    }

    var RoboTrainerApp = Class.create();
    RoboTrainerApp.prototype = {
        Init: function() {
            this.siteMap = {};
            this.AppHeaderDom = $("#appHeader");
            this.AppLeftDom = $("#appLeft");

            $("#appLeft").bind("click", Bind(this, this.HandleAppLeftClick));
            $("#appLeft").bind("dblclick", Bind(this, this.HandleAppLeftDblclick));

            $("#goBtn").bind("click", Bind(this, this.HandleGoBtnClick));
            $("#analyseAndAddBtn").bind("click", Bind(this, this.AnalyseAndAddSite));
            $("#testBtn").bind("click", Bind(this, this.TestPage));

            this._learnPageRule = Bind(this, this.learnPageRule);

            document.oncontextmenu=function(event) {
                event.preventDefault ? event.preventDefault() : event.returnValue=false;
            }
        },
        HandleAppLeftClick: function(e) {
            var target = e.target;
            if ( target.getAttribute("role")=="site" || target.parentNode.getAttribute("role")=="site" ) {
                var site = (target.getAttribute("role")=="site")?target:((target.parentNode.getAttribute("role")=="site")?target.parentNode:null);
                if (null==site) return;
                var ul = site.parentNode.getElementsByTagName("ul")[0];
                if ( !ul.getAttribute("style") ) {
                    site.getElementsByTagName("i")[0].setAttribute("class", "folder");
                    ul.setAttribute("style", "display:none");
                }
                else {
                    site.getElementsByTagName("i")[0].setAttribute("class", "unfolder");
                    ul.setAttribute("style", "");
                }
            }
        },
        HandleAppLeftDblclick: function(e) {
            var target = e.target;
            var role = target.getAttribute("role")
            var li = (role=="link")?target:null;
            if (null==li) return;
            var url = li.getAttribute("linkurl");
            this.openLink(url);
        },
        HandleGoBtnClick: function(e) {
            var url = $("#pageUrlInput").val();
            this.openLink(url);
        },
        UpdateLinklist: function() {
            RobotAjaxReq({
                action: "queryCapturedLinks",
                message: {
                    opt: "all"
                }
            }, function(data) {
                // 组装siteMap
                console.log(data);

                // $("#appLeft>ul").empty();
                // for ( var key in this.siteMap ) {
                //     var site = this.siteMap[key];
                //     var linksHTML = '';
                //     $(site.linkList).each(function(ind, obj) {
                //         linksHTML += ' <li role="link" linkurl="'+obj.link+'"><i class="xmlFile"></i>'+obj.title+'</li>';
                //     });
                //     $('<li><div role="site" linkurl="'+site.siteURL+'"><i class="unfolder"></i>'+key+'</div><ul>'+linksHTML+'</ul></li>').appendTo($("#appLeft>ul"));
                // }
            });
        },
        AnalyseAndAddSite: function() {
            var url = $("#pageUrlInput").val();
            var tar = $("#targetLinkArea").val();
            var isGBK = $("#isGBKCharset").is(":checked");

            var app = this;

            var handleAjaxSucc = function(data) {
                if ( !data.isSuccess ) {
                    console.log(data);
                    return;
                }
                app.UpdateLinklist();
            }

            RobotAjaxReq({
                action: "analyseLinkArea",
                message: {
                    siteURL: url,
                    targetArea: tar,
                    isGBKCharset: isGBK
                }
            }, handleAjaxSucc);
        },
        TestPage: function() {
            var url = $("#pageUrlInput").val();
            var title = $("#titleArea").val();
            var author = $("#authorArea").val();
            var time = $("#timeArea").val();
            var content = $("#contentArea").val();

            var app = this;

            var handleAjaxSucc = function(data) {
                console.log(data);
                if ( !data.isSuccess ) {
                    //handleError(data);
                    return;
                }
                app.pagePreview(data.msg);
            }

            RobotAjaxReq({
                action: "analysePage",
                message: {
                    pageURL: url,
                    titleArea: title,
                    authorArea: author,
                    timeArea: time,
                    contentArea: content
                }
            }, handleAjaxSucc);
        },
        pagePreview: function(data) {

            var app = this;

            $.modal($('#pagePreviewModal').html(), {
                opacity: 40,
                overlayCss: {backgroundColor:"#000"},
                containerCss:{
                    backgroundColor: "#fff",
                    left: "25%",
                    height: "auto",
                    width: "50%"
                },
                overlayClose: true,
                onShow: function() {
                    $("#previewTitle").html(data.title);
                    $("#previewAuthor").html(data.author);
                    $("#previewTime").html(data.publishTime);
                    $("#previewContent").html(data.originContent);
                    $("#learnBtn").bind("click", app._learnPageRule);
                    $("#closePreViewBtn").bind("click", function(){$.modal.close();});
                }
            });
        },
        learnPageRule: function() {
            var url = $("#pageUrlInput").val();
            var title = $("#titleArea").val();
            var author = $("#authorArea").val();
            var time = $("#timeArea").val();
            var content = $("#contentArea").val();

            var app = this;

            var handleAjaxSucc = function(data) {
                console.log(data);
                if ( !data.isSuccess ) {
                    //handleError(data);
                    return;
                }
                alert('ruleId:'+data.msg.ruleId);
            }

            RobotAjaxReq({
                action: "learnPageRule",
                message: {
                    baseURL: url,
                    titleArea: title,
                    authorArea: author,
                    publishTimeArea: time,
                    contentArea: content,
                    category: ''
                }
            }, handleAjaxSucc);

        },
        openLink: function(url) {
            $("#pageUrlInput").val(url);
            $("#linkPageFrame").attr("src", url);
        }
    }

    exports.RoboTrainerApp = RoboTrainerApp;

})(window);

var roboTrainer = null;
$(function(){
    roboTrainer = new RoboTrainerApp();
});
