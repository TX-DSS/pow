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
            this.AppHeaderDom = $("#appHeader");
            this.AppLeftDom = $("#appLeft");

            this.AppLeftDom.bind("click", Bind(this, this.HandleAppLeftClick));
            this.AppLeftDom.bind("dblclick", Bind(this, this.HandleAppLeftDblclick));

            $("#analyseAndAddBtn").bind("click", Bind(this, this.AnalyseAndAddLinkList));
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
            var li = (target.getAttribute("role")=="link")?target:null;
            if (null==li) return;
            var url =  li.getAttribute("linkurl");
            this.openLink(url);
        },
        AnalyseAndAddLinkList: function() {
            var url = $("#pageUrlInput").val();
            var tar = $("#targetLinkArea").val();

            var app = this;

            var handleAjaxSucc = function(data) {
                console.log(data);

                if ( !data.isSuccess ) {
                    //handleError(data);
                    return;
                }

                app.addLinkList(data.msg.linkList);
            }

            $.ajax({
                method: "POST",
                url: "http://robot.pow.com:3000",
                data: {
                    opt: "analyseLinkArea",
                    msg: {
                        siteURL: url,
                        targetArea: tar
                    }
                }
            }).done(handleAjaxSucc);
        },
        addLinkList: function(list) {
            console.log(list);

        },
        openLink: function(url) {
            $("#pageUrlInput").val(url);
            $("#linkPageFrame").attr("src", url);
        }
    }

    exports.RoboTrainerApp = RoboTrainerApp;

})(window);

var robotTrainer = null;
$(function(){
    robotTrainer = new RoboTrainerApp();
});