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
            this.TrainBtn = $("#trainBtn");

            this.AppLeftDom.bind("click", Bind(this, this.HandleAppLeftClick));
            this.AppLeftDom.bind("dblclick", Bind(this, this.HandleAppLeftDblclick));

            this.TrainBtn.bind("click", Bind(this, this.addSiteByInput));
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
        addLinkList: function(list) {
            var siteUrl = $("#siteForTrain").val();
            if ( !siteUrl ) return;

            $.ajax({
                method: "POST",
                url: "http://admin.pow.com:3000/func",
                data: {
                    opt: "analyseSite",
                    siteUrl: siteUrl
                }
            }).done(function(msg) {
                console.log(msg);

                if ( !msg.isSuccess ) {
                    handleError(msg);
                    return;
                }

            });

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