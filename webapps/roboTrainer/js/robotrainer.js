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
            $("#appLeft>ul").empty();
            for ( var key in this.siteMap ) {
                var site = this.siteMap[key];
                var linksHTML = '';
                $(site.linkList).each(function(ind, obj) {
                    linksHTML += ' <li role="link" linkurl="'+obj.link+'"><i class="xmlFile"></i>'+obj.title+'</li>';
                });
                $('<li><div role="site" linkurl="'+site.siteURL+'"><i class="unfolder"></i>'+key+'</div><ul>'+linksHTML+'</ul></li>').appendTo($("#appLeft>ul"));
            }
        },
        AnalyseAndAddSite: function() {
            var url = $("#pageUrlInput").val();
            var tar = $("#targetLinkArea").val();
            var isGBK = $("#isGBKCharset").is(":checked");

            var app = this;

            var handleAjaxSucc = function(data) {
                console.log(data);
                if ( !data.isSuccess ) {
                    //handleError(data);
                    return;
                }
                app.addSite(data.msg);
            }

            $.ajax({
                method: "POST",
                url: "http://robot.pow.com:3000",
                data: {
                    opt: "analyseLinkArea",
                    msg: {
                        siteURL: url,
                        targetArea: tar,
                        isGBKCharset: isGBK
                    }
                }
            }).done(handleAjaxSucc);
        },
        addSite: function(msg) {
            console.log(msg);
            this.siteMap[msg.siteURL+' '+msg.targetArea] = msg;
            this.UpdateLinklist();
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
