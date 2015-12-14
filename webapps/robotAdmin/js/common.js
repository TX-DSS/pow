var Class = {
    create : function() {
        return function() {
            this.initialize.apply(this, arguments);
        }
    }
}

var Extend = function(destination, source) {
    for ( var property in source) {
        destination[property] = source[property];
    }
}

var Bind = function(object, fun) {
    return function() {
        return fun.apply(object, arguments);
    }
}

var BindAsEventListener = function(object, fun) {
    return function(event) {
        return fun.call(object, (event || window.event));
    }
}

function addEventHandler(oTarget, sEventType, fnHandler) {
    if (oTarget.addEventListener) {
        oTarget.addEventListener(sEventType, fnHandler, false);
    } else if (oTarget.attachEvent) {
        oTarget.attachEvent("on" + sEventType, fnHandler);
    } else {
        oTarget["on" + sEventType] = fnHandler;
    }
};

function removeEventHandler(oTarget, sEventType, fnHandler) {
    if (oTarget.removeEventListener) {
        oTarget.removeEventListener(sEventType, fnHandler, false);
    } else if (oTarget.detachEvent) {
        oTarget.detachEvent("on" + sEventType, fnHandler);
    } else { 
        oTarget["on" + sEventType] = null;
    }
};

function getElementLeft(element){
    var actualLeft = element.offsetLeft;
    var current = element.offsetParent;
    while (!!current){
        actualLeft += current.offsetLeft;
        current = current.offsetParent;
    }
    return actualLeft;
}

function getElementTop(element){
    var actualTop = element.offsetTop;
    var current = element.offsetParent;
    while (!!current){
        actualTop += current.offsetTop;
        current = current.offsetParent;
    }
    return actualTop;
}

Document.prototype.createElementByHtml = function(html) {
    var div = document.createElement("div");
    if(typeof html == "string")
        div.innerHTML = html;
    if ( 1==div.childNodes.length )
        return div.childNodes[0];
    else
        return div.childNodes;
};

Element.prototype.getChildElementByTagName = function(name) {
    var elementList = [];
    var childs = this.childNodes;
    for ( var i=0; i<childs.length; i++ ) {
        if ( name == childs[i].nodeName ) {
            elementList.push(childs[i]);
        }
    }
    return elementList;
};

var WorkFlowMapConst = {
    SVG_NS: "http://www.w3.org/2000/svg",
    XLINK_NS: "http://www.w3.org/1999/xlink",
    DEFAULT_WIDTH: 800,
    DEFAULT_HEIGHT: 600,
    DEFAULT_ICON_WIDTH: 68,
    DEFAULT_ICON_HEIGHT: 68,
    ZOOM_STEP: 0.25,
    ZOOM_MAX: 2,
    ZOOM_MIN: 0.5,
    MAP_PADDING: 50,
    ACTIONMODE_HAND: "hand",
    ACTIONMODE_POINTER: "pointer",
    ACTIONMODE_LINKER: "linker",
    LINKERSTATE_FIRSTNODE: "1",
    LINKERSTATE_SECONDNODE: "2",
    PATHPOINT_TYPE_START: "S",
    PATHPOINT_TYPE_END: "E",
    PATHPOINT_TYPE_BEND: "B",
    PATHPOINT_TYPE_ADD: "A",
    KEY_DELETE: 46,
    KEY_SPACE: 32,
    OPTYPE_RENAME: "rename",
    OPTYPE_SETTING: "setting",
    OPTYPE_ROUTESETTING: "routeSetting",
    OPTYPE_DELETE: "delete",
    SETTINGLIST_NODE: ["property", "advanced", "related", "assign", "complete", "split", "join"],
    SETTINGLIST_MAP: ["advanced", "related"],
    TXT_PARSER_ERROR: "该文件无法解析，请检查文件正确性",
    DEFAULT_PROCESS_XMLCONTENT: '<Activities><BeginActivity name="Start" title="开始" type="1" isAbnormal="0" costTime="0" canObtainTime="0" timeLengthToEnd="0" assignStrategy="0" completeStrategy="0" splitStrategy="5" joinStrategy="5" obtainType="2" legalExecutorType="0"><Icon x="10" y="10" width="68" height="68"/><PostRoutes/></BeginActivity><EndActivity name="End" title="结束" type="2" isAbnormal="0" costTime="0" canObtainTime="0" timeLengthToEnd="0" assignStrategy="0" completeStrategy="0" splitStrategy="5" joinStrategy="5" obtainType="2" legalExecutorType="0"><Icon x="500" y="500" width="68" height="68"/><PreRoutes/></EndActivity></Activities>',
    IMAGE_SVG_BG: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZCAMAAADzN3VRAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAAZQTFRF////zMzMOOqqgwAAAB1JREFUeNpiYEACjAy4wKgMugwjLjAaOuTJAAQYAEC/ADJx9zt4AAAAAElFTkSuQmCC"
}

var isIE = (document.all) ? true : false;

var WorkflowMap = Class.create();
WorkflowMap.prototype = {
    initialize: function(id, options) {
        this.objId = id;
        this.ProcessNodes = {};
        this.ProcessPaths = {};
        this.CurFocusObject = null;
        this.DragTimer = null;
        this.MapStack = [];
        this.WorkflowMapIcons = {
            "BeginActivity": "./img/play.png",
            "EndActivity": "./img/stop.png",
            "ManualActivity_Manual": "./img/people.png",
            "ManualActivity_Robot": "./img/settings.png",
            "DummyActivity": "./img/database-inactive.png",
            "Process_Sub": "./img/blocks.png"
        };

        this.SetOptions(options);

        // 初始化XML文档对象
        this.XMLDoc = document.implementation.createDocument("", "Process", null);
        this.XMLTopNode = this.GenXMLNode();
        this.XMLNode = this.XMLTopNode;

        // 初始化DOM
        this.MapTitle = this.GenTitleNode();
        this.DomNode = this.GenDomNode(id);
        this.options.containerDiv.appendChild(this.MapTitle);
        this.options.containerDiv.appendChild(this.DomNode);
        this.updateMapTitle();

        // 增加开始和结束节点
        this.addProcessNode("Start", {x:10, y:10, title:"开始", name:"Start", nodeType:"BeginActivity"});
        this.addProcessNode("End", {x:500, y:500, title:"结束", name:"End", nodeType:"EndActivity"});

        this.AreaTop = getElementTop(this.DomNode.parentNode)+this.MapTitle.offsetHeight;
        this.AreaLeft = getElementLeft(this.DomNode.parentNode);

        // this.options.width = this.DomNode.parentNode.clientWidth;
        // this.options.height = this.DomNode.parentNode.clientHeight;
        // this.options.viewBox = "0 0 "+this.options.width+" "+this.options.height;
        this.resize();
        this.refreshView();
        this.ActionMode = this.options.actionMode;

        this._onPickingFirstNode = BindAsEventListener(this, this.OnPickingFirstNode);
        this._onPickingSecondNode = BindAsEventListener(this, this.OnPickingSecondNode);
        this._handleMousemove = BindAsEventListener(this, this.HandleMousemove);
        addEventHandler(this.DomNode, "mousedown", BindAsEventListener(this, this.HandleMousedown));
        addEventHandler(this.DomNode, "mouseup", BindAsEventListener(this, this.HandleMouseup));
        //addEventHandler(document, "mousemove", this._handleMousemove);
        addEventHandler(this.DomNode, "click", BindAsEventListener(this, this.HandleClick));
        addEventHandler(this.DomNode, "dblclick", BindAsEventListener(this, this.HandleDblclick));
        addEventHandler(this.MapTitle, "click", BindAsEventListener(this, this.HandleMapTitleClick));

        addEventHandler(window, "keydown", BindAsEventListener(this, this.HandleKeydown));
        addEventHandler(window, "keyup", BindAsEventListener(this, this.HandleKeyup));
        addEventHandler(window, "resize", BindAsEventListener(this, this.resize));
        // 初始化文件加载对象
        if ( typeof FileReader != "undefined" ) {
            this.FileReader = new FileReader();
            this.FileReader.onload = BindAsEventListener(this, this.FileReaderOnload);
            addEventHandler(this.DomNode, "drop", BindAsEventListener(this, this.HandleDropFile));
            addEventHandler(this.DomNode, "dragenter", BindAsEventListener(this, this.HandleDropFile));
            addEventHandler(this.DomNode, "dragover", BindAsEventListener(this, this.HandleDropFile));
        }
        addEventHandler(this.DomNode, "mousewheel", BindAsEventListener(this, this.HandleMousewheel));
        //addEventHandler(this.FileReader, "onload", BindAsEventListener(this, this.FileReaderOnload));

        document.oncontextmenu=function(event) {
            event.preventDefault ? event.preventDefault() : event.returnValue=false;
        }
    },
    GenTitleNode: function() {
        var node = document.createElement("div");
        node.setAttribute("class", "mapTitle");

        return node;
    },
    updateMapTitle: function() {
        this.MapTitle.innerHTML = "";
        var ul = document.createElement("ul");
        var li0 = document.createElement("li");
        li0.setAttribute("subIndex", "0");
        li0.appendChild(document.createTextNode(this.getTopTitle()));
        ul.appendChild(li0);
        for ( var i in this.MapStack ) {
            var li = document.createElement("li");
            li.setAttribute("subIndex", parseInt(i)+1);
            li.appendChild(document.createTextNode(this.MapStack[i].title));
            ul.appendChild(li);
        }
        this.MapTitle.appendChild(ul);
    },
    GenDomNode: function(id) {
        //var node = document.getElementById(id);
        var node = document.createElementNS(WorkFlowMapConst.SVG_NS, "svg");
        node.setAttribute("id", this.objId);
        node.setAttribute("style", 'background-image: url("'+WorkFlowMapConst.IMAGE_SVG_BG+'")');
        node.appendChild(this.options.arrowDefine);

        return node;
    },
    GenXMLNode: function() {
        if ( !!this.options.xmlNode ) {
            return this.options.xmlNode;
        }
        // 创建缺省节点
        var xmlDoc = document.implementation.createDocument("", "Process", null);
        var xn = xmlDoc.documentElement;
        var attrList = this.getDefaultAttrsByNodeType(this.options.nodeType);
        for ( var name in attrList ) {
            if ( null == attrList[name] )
                continue;
            xn.setAttribute(name, attrList[name]);
        }
        xn.setAttribute("name", this.options.name);
        xn.setAttribute("title", this.options.title);

        // 生成Activities节点
        var n1 = xmlDoc.createElement("Activities");
        xn.appendChild(n1);

        return xn;
    },
    SetOptions: function(options) {
        this.options = {
            FlowRules: COS_Flow_Rules,
            xmlNode: null,
            name: "新建的工作流",
            title: "新建的工作流",
            nodeType: "Process_Root",
            width: 800,
            height: 600,
            viewBox: "0 0 800 600",
            zoom: 1,
            actionMode: "pointer" // pointer选择拖动模式;linker连接模式
        };
        Extend(this.options, options || {});
    },
    getAttribute: function(name) {
        // 特殊逻辑-获取相关数据属性
        var attr = "";
        if ( name.indexOf("tranRefDataTitle") > -1 ) {
            var refNode = this.XMLNode.getChildElementByTagName("TranRefData")[0];
            if ( !!refNode ) 
                attr = refNode.getAttribute(name);
        } else {
            attr = this.XMLNode.getAttribute(name);
        }

        return !!attr?attr:"";
    },
    setAttribute: function(name, value) {
        if ( null == value ) {
            return;
        }
        // 特殊逻辑-设置相关数据属性
        if ( name.indexOf("tranRefDataTitle") > -1 ) {
            var refNode = this.XMLNode.getChildElementByTagName("TranRefData")[0];
            if ( !refNode ) {
                refNode = this.XMLDoc.createElement("TranRefData");
                this.XMLNode.appendChild(refNode);
            }
            refNode.setAttribute(name, value);
        } else {
            this.XMLNode.setAttribute(name, value);
        }
    },
    resize: function() {
        this.options.width = this.DomNode.parentNode.clientWidth;
        this.options.height = this.DomNode.parentNode.clientHeight-this.MapTitle.offsetHeight;
        var box = this.options.viewBox.split(" ");
        box[2] = this.options.width/this.options.zoom;
        box[3] = this.options.height/this.options.zoom;
        this.options.viewBox = box.join(" ");
        this.refreshView();
    },
    refreshView: function() {
        this.DomNode.setAttribute("width", this.options.width);
        this.DomNode.setAttribute("height", this.options.height);
        this.DomNode.setAttribute("viewBox", this.options.viewBox);
    },
    HandleDropFile: function(oEvent) {
        oEvent.preventDefault ? oEvent.preventDefault() : oEvent.returnValue=false;

        if ( event.type == "drop" ) {
            var files = event.dataTransfer.files;
            if ( files.length>0 ) {
                this.FileReader.readAsText(files[0], "GBK");
            }
        }
    },
    FileReaderOnload: function() {
        try {            
            this.loadProcessFromText(this.FileReader.result);
        }
        catch (e) {
            alert(WorkFlowMapConst.TXT_PARSER_ERROR);
            //this.clearMap();
        }
    },
    clearMap: function() {
        for ( var id in this.ProcessNodes ) {
            this.ProcessNodes[id].destruct();
        }
    },
    zoomIn: function(v) {
        if ( this.options.zoom < WorkFlowMapConst.ZOOM_MAX ) {
            this.zoomTo(this.options.zoom+WorkFlowMapConst.ZOOM_STEP, v);
        }
    },
    zoomOut: function(v) {
        if ( this.options.zoom > WorkFlowMapConst.ZOOM_MIN ) {
            this.zoomTo(this.options.zoom-WorkFlowMapConst.ZOOM_STEP, v);
        }
    },
    zoomTo: function(z2, v) {
        v = !!v ? v : this.viewVector2MapVector(new Vector2(this.options.width/2, this.options.height/2));
        var z1 = this.options.zoom;
        this.options.zoom = z2;
        //var box = this.options.viewBox.split(" ");
        var o1 = this.getMapOffsetVector();
        var oZoom = o1.add(v).subtract(v.multiply(z1).divide(z2)).parseInt();
        //console.log(oZoom);
        var viewWidth = Math.round(this.options.width/z2);
        var viewHeight = Math.round(this.options.height/z2);
        this.options.viewBox = ""+oZoom.x+" "+oZoom.y+" "+viewWidth+" "+viewHeight;
        this.refreshView();
    },
    setMapOffset: function(v) {
        var b = this.options.viewBox.split(" ");
        b[0] = ""+v.x;
        b[1] = ""+v.y;
        this.options.viewBox = b.join(" ");
        this.refreshView();
    },
    loadProcessFromURL: function(url) {
        // 发送XMLHttpRequest

        //var xmldom = document.implementation.createDocument("", "Process", null);
        //this.FileReader.readAsText(url, "GBK");
        //xmldom.async = false;
        //xmldom.load(url);
        //loadProcessFromText(xmldom);
    },
    LoadXMLNode2Map: function(node) {
        this.clearMap();
        this.XMLNode = node;
        var activities = this.XMLNode.getChildElementByTagName("Activities")[0];
        // for ( var i=0; i<this.XMLNode.childNodes.length; i++ ) {
        //     if ( this.XMLNode.childNodes[i].nodeName == "Activities" )
        //         activities = this.XMLNode.childNodes[i];
        // }
        if ( !!activities ) {
            var childs = activities.childNodes;
            var min_x = 0;
            var min_y = 0;
            var max_x = this.options.width;
            var max_y = this.options.height;
            var postRoutes = {};
            var preRoutes = {};
            var joinStrategy = {};
            var splitStrategy = {};
            for ( var i=0; i<childs.length; i++ ) {
                if ( childs[i].nodeName == "#text" )
                    continue;
                //console.log(childs[i].attributes);
                var icon = childs[i].getElementsByTagName("Icon")[0];
                var x = parseInt(icon.getAttribute("x"));
                var y = parseInt(icon.getAttribute("y"));
                min_x = x<min_x ? x : min_x;
                min_y = y<min_y ? y : min_y;
                var xf = x+parseInt(icon.getAttribute("width"));
                var yf = y+parseInt(icon.getAttribute("height"));
                max_x = xf>max_x ? xf : max_x;
                max_y = yf>max_y ? yf : max_y;
                var name = childs[i].getAttribute("name");
                joinStrategy[name] = childs[i].getAttribute("joinStrategy");
                splitStrategy[name] = childs[i].getAttribute("splitStrategy");
                var title = childs[i].getAttribute("title");
                var nodeType = this.queryNodeType(childs[i]);
                this.addProcessNode("Node_"+name, {x:x, y:y, title:title, nodeType:nodeType, xmlNode:childs[i]}, false);

                for ( var n=0; n<childs[i].childNodes.length; n++ ) {
                    if ( childs[i].childNodes[n].nodeName == "PostRoutes" ) {
                        postRoutes[name] = childs[i].childNodes[n].getElementsByTagName("PostRoute");
                        break;
                    }
                }
                for ( var n=0; n<childs[i].childNodes.length; n++ ) {
                    if ( childs[i].childNodes[n].nodeName == "PreRoutes" ) {
                        preRoutes[name] = childs[i].childNodes[n].getElementsByTagName("PreRoute");
                        break;
                    }
                }
            }

            this.setMapOffset(new Vector2(min_x-WorkFlowMapConst.MAP_PADDING, min_y-WorkFlowMapConst.MAP_PADDING));

            for ( var name in postRoutes ) {
                var routes = postRoutes[name];
                for ( var i=0; i<routes.length; i++ ) {
                    var routeActivity = routes[i].getElementsByTagName("RouteActivity")[0];
                    var toName = routeActivity.getAttribute("activityName");
                    var label = routeActivity.getAttribute("displayLabel");
                    var bps = routes[i].getElementsByTagName("Bendpoint");
                    var bendPoints = "";
                    if ( bps.length > 0 ) {
                        for ( var n=0; n<bps.length; n++ ) {
                            bendPoints += bps[n].getAttribute("x") + " " + bps[n].getAttribute("y") + ",";
                        }
                        bendPoints = bendPoints.substr(0, bendPoints.length-1);
                    }

                    var prs = preRoutes[toName];
                    for ( var p=0; p<prs.length; p++ ) {
                        var ra = prs[p].getElementsByTagName("RouteActivity")[0];
                        if ( ra.getAttribute("activityName") == name ) {
                            this.addProcessPath("Path_"+name+"_"+toName, {displayLabel:label, fromNode:"Node_"+name, toNode:"Node_"+toName, markerStart:"url(#Arrow_Start_"+splitStrategy[name]+")", markerEnd:"url(#Arrow_End_"+joinStrategy[toName]+")", bendPoints:bendPoints, xmlNode:routes[i], xmlPreNode:prs[p]}, false); 
                            break;
                        }
                    }
                }
            }
        }
    },
    LoadSubProcess: function(obj) {
        this.LoadXMLNode2Map(obj.XMLNode);
        var mapInfo = {
            title: obj.getNodeTitle(),
            xmlNode: obj.XMLNode
        }
        this.MapStack.push(mapInfo);
        this.updateMapTitle();
    },
    loadProcessFromText: function(text) {
        var parser = new DOMParser();
        var xmldoc = parser.parseFromString(text, "text/xml");
        var errors = xmldoc.getElementsByTagName("parsererror");
        if ( errors.length>0 ) {
            throw new Error("Parsing error");
        }

        this.MapStack = [];
        this.XMLDoc = xmldoc;
        
        var node = xmldoc.documentElement;
        this.XMLTopNode = node;
        
        this.LoadXMLNode2Map(node);
    },
    getTopTitle: function() {
        return this.XMLTopNode.getAttribute("title");
    },
    serializeXML2String: function() {
        var serializer = new XMLSerializer();
        var xml = serializer.serializeToString(this.XMLTopNode);
        console.log(xml);
    },
    queryNodeType: function(node) {
        var type = node.getAttribute("type");
        var subType = node.getAttribute("subType");
        for ( var nodeType in this.options.FlowRules.TypeDefine ) {
            if ( type==this.options.FlowRules.TypeDefine[nodeType]["type"] && subType==this.options.FlowRules.TypeDefine[nodeType]["subType"] ) {
                return nodeType;
            }
        }
        throw new Error("No this node type: "+type+","+subType);
    },
    getDefaultAttrsByNodeType: function(nodeType) {
        var attrList = this.options.FlowRules.DefaultAttributes.ActivityAttrs;
        var typeAttrs = this.options.FlowRules.TypeDefine[nodeType];
        for ( var name in typeAttrs ) {
            attrList[name] = typeAttrs[name];
        }
        return attrList;
    },
    getFlowRules: function() {
        return this.options.FlowRules;
    },
    genSettingContent: function(obj, type) {
        var ul =  document.createElement("ul");
        ul.setAttribute("class", "inputList")
        var list = this.getFlowRules().SettingInputLists[type].inputList;
        var pros = this.getFlowRules().AttrsInputProperty;
        for ( var i in list ) {
            var pro = pros[list[i]];
            var inputCtrl = new InputControl(list[i]+'_'+obj.objId, pro, obj.getAttribute(list[i]))
            ul.appendChild(inputCtrl.getDomNode());
        }
        return ul;
    },
    FileReaderOnprogress: function() {

    },
    FileReaderOnerror: function() {

    },
    HandleKeydown: function(oEvent) {
        if ( !!this.disableHotKeyFlag )
            return;
        switch (oEvent.keyCode)
        {
        case WorkFlowMapConst.KEY_SPACE:
            if ( this.ActionMode != WorkFlowMapConst.ACTIONMODE_HAND )
                this.PreActionMode = this.ActionMode;
                this.setActionMode(WorkFlowMapConst.ACTIONMODE_HAND);
            break;
        }
    },
    HandleKeyup: function(oEvent) {
        if ( !!this.disableHotKeyFlag )
            return;
        switch (oEvent.keyCode)
        {
        case WorkFlowMapConst.KEY_DELETE:
            if ( !!this.CurFocusObject ) {
                this.CurFocusObject.destruct();
                this.CurFocusObject = null;
            }
            break;
        case WorkFlowMapConst.KEY_SPACE:
            if ( !!this.PreActionMode )
                this.setActionMode(this.PreActionMode);
            break;
        }
    },
    HandleMousewheel: function(oEvent) {
        var v = this.clientPoint2ViewPoint(new Vector2(oEvent.clientX, oEvent.clientY));
        if ( oEvent.wheelDelta > 0 ) {
            this.zoomIn(v);
        } else {
            this.zoomOut(v);
        }
    },
    HandleMousedown: function(oEvent) {
        var target = oEvent.target || oEvent.srcElement;
        //console.log(target);
        this.removeMenu();
        switch (this.ActionMode)
        {
        case WorkFlowMapConst.ACTIONMODE_POINTER:
            var preFocusObj = this.CurFocusObject;
            if ( !!target.getAttribute("nodeId") ) {
                //this.DomNode.appendChild(target);
                this.CurFocusObject = this.ProcessNodes[target.getAttribute("nodeId")];
                if ( 2!=oEvent.button ) {
                    this.DragTimer = setTimeout(BindAsEventListener(this, function(){
                        this.CurFocusObject.StartDrag(oEvent);
                    }), 300);
                }
            }
            if ( !!target.getAttribute("pathId") ) {
                this.CurFocusObject = this.ProcessPaths[target.getAttribute("pathId")];
            }

            if ( target.nodeName == "svg" ) {
                this.CurFocusObject = this;
            }

            if ( preFocusObj != this.CurFocusObject ) {
                if ( !!preFocusObj )
                    preFocusObj.blur();
                this.CurFocusObject.focus();
            }
            break;
        case WorkFlowMapConst.ACTIONMODE_LINKER:
            break;
        case WorkFlowMapConst.ACTIONMODE_HAND:
            this._v = this.getMapOffsetVector();
            this._px = oEvent.clientX;
            this._py = oEvent.clientY;
            addEventHandler(document, "mousemove", this._handleMousemove);
            break;
        default:
        }
    },
    HandleMousemove: function(oEvent) {
        switch (this.ActionMode)
        {
        case WorkFlowMapConst.ACTIONMODE_LINKER:
            if ( this.LinkerState == WorkFlowMapConst.LINKERSTATE_SECONDNODE ) {

            }
            break;
        case WorkFlowMapConst.ACTIONMODE_HAND:
            var v = this._v.subtract(this.viewVector2MapVector(new Vector2(oEvent.clientX-this._px, oEvent.clientY-this._py)));
            this.setMapOffset(v);
            break;
        }
    },
    HandleMouseup: function(oEvent) {
        clearTimeout(this.DragTimer);
        var target = oEvent.target || oEvent.srcElement;
        //console.log(target);
        switch (this.ActionMode)
        {
        case WorkFlowMapConst.ACTIONMODE_POINTER:
            if ( 2==oEvent.button ) {
                //console.log(this.CurFocusObject);
                this.MenuObj = this.CurFocusObject.showContextMenu(oEvent);
            }
            break;
        case WorkFlowMapConst.ACTIONMODE_HAND:
            removeEventHandler(document, "mousemove", this._handleMousemove);
            break;
        }
    },
    OnPickingFirstNode: function(oEvent) {
        var target = oEvent.target || oEvent.srcElement;
        if ( !target.getAttribute("nodeId") ) {
            this.DomNode.setAttribute("class", "notAllowedCursor");
            this.PickFlag = false;
        } else {
            this.DomNode.setAttribute("class", "");
            this.PickFlag = true;
        }
    },
    OnPickingSecondNode: function(oEvent) {
        var target = oEvent.target || oEvent.srcElement;
        if ( !target.getAttribute("nodeId") || target === this.Linker_FirstNode ) {
            this.DomNode.setAttribute("class", "notAllowedCursor");
            this.PickFlag = false;
        } else {
            this.DomNode.setAttribute("class", "");
            this.PickFlag = true;
        }
    },
    HandleClick: function(oEvent) {
        var target = oEvent.target || oEvent.srcElement;
        //console.log(target);
        switch (this.ActionMode)
        {
        case WorkFlowMapConst.ACTIONMODE_POINTER:
            var preFocusObj = this.CurFocusObject;
            if ( !!target.getAttribute("nodeId") ) {
                this.CurFocusObject = this.ProcessNodes[target.getAttribute("nodeId")];
            }
            if ( !!target.getAttribute("pathId") ) {
                this.CurFocusObject = this.ProcessPaths[target.getAttribute("pathId")];
            }
            if ( preFocusObj != this.CurFocusObject ) {
                if ( !!preFocusObj )
                    preFocusObj.blur();
                this.CurFocusObject.focus();
            }
            break;
        case WorkFlowMapConst.ACTIONMODE_LINKER:
            if ( this.LinkerState == WorkFlowMapConst.LINKERSTATE_FIRSTNODE ) {
                if ( this.PickFlag ) {
                    this.Linker_FirstNode = target;
                    removeEventHandler(this.DomNode, "mousemove", this._onPickingFirstNode);
                    this.PickFlag = false;
                    // 创建动态连线Path

                    addEventHandler(this.DomNode, "mousemove", this._onPickingSecondNode);
                    this.LinkerState = WorkFlowMapConst.LINKERSTATE_SECONDNODE;                    
                }
            } else if ( this.LinkerState == WorkFlowMapConst.LINKERSTATE_SECONDNODE ) {
                if ( this.PickFlag ) {
                    this.Linker_SecondNode = target;
                    removeEventHandler(this.DomNode, "mousemove", this._onPickingSecondNode);
                    var linkerFirstObj = this.ProcessNodes[this.Linker_FirstNode.getAttribute("nodeId")];
                    var linkerSecondObj = this.ProcessNodes[this.Linker_SecondNode.getAttribute("nodeId")];
                    // 清除动态连线Path

                    this.addProcessPath("processPath_" + new Date().getTime(), {
                        fromNode:this.Linker_FirstNode.getAttribute("nodeId"),
                        toNode:this.Linker_SecondNode.getAttribute("nodeId"),
                        markerStart:"url(#Arrow_Start_"+linkerFirstObj.getAttribute("splitStrategy")+")",
                        markerEnd:"url(#Arrow_End_"+linkerSecondObj.getAttribute("joinStrategy")+")"
                    });
                    this.setActionMode(WorkFlowMapConst.ACTIONMODE_LINKER);
                }
            }
            break;
        default:
        }
    },
    HandleDblclick: function(e) {
        var target = e.target || e.srcElement;

        switch (this.ActionMode)
        {
        case WorkFlowMapConst.ACTIONMODE_POINTER:
            var preFocusObj = this.CurFocusObject;
            if ( !!target.getAttribute("nodeId") ) {
                var obj = this.ProcessNodes[target.getAttribute("nodeId")];
                if ( obj.getNodeType()=="Process_Sub" ) {
                    this.LoadSubProcess(obj);
                }
            }
            break;
        }
    },
    HandleMapTitleClick: function(e) {
        var target = e.target;
        var si = target.getAttribute("subIndex");
        if ( !!si ) {
            var curIndex = this.MapStack.length;
            var num = curIndex-parseInt(si);
            for ( var i=0; i<num; i++ ) {
                this.MapStack.pop();
            }
            var map = this.MapStack[this.MapStack.length-1];
            if (!!map)
                this.LoadXMLNode2Map(map.xmlNode);
            else
                this.LoadXMLNode2Map(this.XMLTopNode);
            this.updateMapTitle();
        }
    },
    removeMenu: function() {
        if ( !!this.MenuObj ) {
            if ( !!this.MenuObj.DomNode )
                this.MenuObj.destruct();
            this.MenuObj = null;
        }
    },
    showContextMenu: function(e) {
        return new ContextMenu({
            x:e.clientX,
            y:e.clientY,
            menuList: {
                "setting": "设置"
            },
            targetObj: this,
            callback: "contextMenuCallback"
        });
    },
    contextMenuCallback: function(type) {
        switch (type)
        {
        case WorkFlowMapConst.OPTYPE_SETTING:
            var tabs = {};
            var rules = this.getFlowRules().SettingInputLists;
            for ( var i in WorkFlowMapConst.SETTINGLIST_MAP ) {
                var name = WorkFlowMapConst.SETTINGLIST_MAP[i];
                tabs[rules[name].title] = this.genSettingContent(this, name);
            }
            var domNode = new TabsControl("settingsContent", {tabs:tabs}).DomNode;
            this.LinkedModalDialog = new ModalDialog(type+"_"+this.objId, {target:this, type:type, title:"设置", width:"500px", contentDomNode:domNode});
            this.disableHotKey(true);
            break;
        }
    },
    focus: function() {
    },
    blur: function() {
    },
    setActionMode: function(mode) {
        removeEventHandler(this.DomNode, "mousemove", this._onPickingFirstNode);
        removeEventHandler(this.DomNode, "mousemove", this._onPickingSecondNode);
        this.DomNode.setAttribute("class", "");
        switch (mode)
        {
        case WorkFlowMapConst.ACTIONMODE_POINTER:
            this.ActionMode = mode;
            break;
        case WorkFlowMapConst.ACTIONMODE_LINKER:
            this.ActionMode = mode;
            this.LinkerState = WorkFlowMapConst.LINKERSTATE_FIRSTNODE;
            this.Linker_FirstNode = null;
            this.Linker_SecondNode = null;
            this.PickFlag = false;
            addEventHandler(this.DomNode, "mousemove", this._onPickingFirstNode);
            break;
        case WorkFlowMapConst.ACTIONMODE_HAND:
            this.ActionMode = mode;
            this.DomNode.setAttribute("class", "handCursor");
            break;
        }
    },
    addProcessNode: function(id, options, flag) {
        var nodeObj = new ProcessNode(id, this, options);

        if ( false !== flag ) {
            // 增加XML节点
            var activities = null;
            for ( var i=0; i<this.XMLNode.childNodes.length; i++ ) {
                if ( this.XMLNode.childNodes[i].nodeName == "Activities" ) {
                    activities = this.XMLNode.childNodes[i];
                    break;
                }
            }
            activities.appendChild(nodeObj.XMLNode);
        }

        this.ProcessNodes[id] = nodeObj;
        if ( !!this.CurFocusObject )
            this.CurFocusObject.blur();
        this.CurFocusObject = this.ProcessNodes[id];
        this.CurFocusObject.focus();
    },
    addProcessPath: function(id, options, flag) {
        var pathObj = new ProcessPath(id, this, options);

        if ( false !== flag ) {
            // 增加PostRoute节点
            var postRoutes = null;
            for ( var i=0; i<pathObj.FromNode.XMLNode.childNodes.length; i++ ) {
                if ( pathObj.FromNode.XMLNode.childNodes[i].nodeName == "PostRoutes" ) {
                    postRoutes = pathObj.FromNode.XMLNode.childNodes[i];
                    break;
                }
            }
            postRoutes.appendChild(pathObj.XMLNode);

            // 增加PreRoute节点
            var preRoutes = null;
            for ( var i=0; i<pathObj.ToNode.XMLNode.childNodes.length; i++ ) {
                if ( pathObj.ToNode.XMLNode.childNodes[i].nodeName == "PreRoutes" ) {
                    preRoutes = pathObj.ToNode.XMLNode.childNodes[i];
                    break;
                }
            }
            preRoutes.appendChild(pathObj.XMLPreNode);
        }

        this.ProcessPaths[id] = pathObj;
    },
    removeProcessNode: function(id) {
        if ( !!this.ProcessNodes[id] ) {
            // 清除XML节点
            //var n = this.ProcessNodes[id].XMLNode;
            //n.parentNode.removeChild(n);

            delete this.ProcessNodes[id];
        }
    },
    removeProcessPath: function(id) {
        if ( !!this.ProcessPaths[id] ) {
            // 清除XML节点
            //var n = this.ProcessPaths[id].XMLNode;
            //var pn = this.ProcessPaths[id].XMLPreNode;
            //n.parentNode.removeChild(n);
            //pn.parentNode.removeChild(pn);

            delete this.ProcessPaths[id];
        }
    },
    getProcessNodeObj: function(id) {
        return this.ProcessNodes[id];
    },
    getProcessPathObj: function(id) {
        return this.ProcessPaths[id];
    },
    isInMapArea: function(x, y) {
        if ( x > this.AreaLeft && x < this.AreaLeft+parseInt(this.DomNode.getAttribute("width"))
            && y > this.AreaTop && y < this.AreaTop+parseInt(this.DomNode.getAttribute("height")) ) {
            return true;
        } else {
            return false;
        }
    },
    getMapOffsetVector: function() {
        var b = this.options.viewBox.split(" ");
        return new Vector2(b[0], b[1]);
    },
    clientPoint2ViewPoint: function(v) {
        var x = v.x - this.AreaLeft;
        var y = v.y - this.AreaTop;
        return new Vector2(x, y);
    },
    clientPoint2MapPoint: function(v) {
        var fixer = this.getMapOffsetVector();
        return this.viewVector2MapVector(this.clientPoint2ViewPoint(v)).add(fixer);
    },
    viewVector2MapVector: function(v) {
        var fv = v.divide(this.options.zoom);
        return fv;
    },
    disableHotKey: function(flag) {
        this.disableHotKeyFlag = flag;
    },
    onModalDialogOK: function() {
        if (!!this.LinkedModalDialog) {
            switch (this.LinkedModalDialog.getType())
            {
            case WorkFlowMapConst.OPTYPE_RENAME:
                this.setNodeTitle(this.LinkedModalDialog.getInputValue("title_"+this.objId));
                break;
            case WorkFlowMapConst.OPTYPE_SETTING:
                var attrs = this.getFlowRules().DefaultAttributes.ActivityAttrs;
                for ( var name in attrs ) {
                    this.setAttribute(name, this.LinkedModalDialog.getInputValue(name+"_"+this.objId));
                }
                // 相关设置属性
                var refAttrs = this.getFlowRules().DefaultAttributes.TranRefDataAttrs;
                for ( var name in refAttrs ) {
                    this.setAttribute(name, this.LinkedModalDialog.getInputValue(name+"_"+this.objId));
                }
                break;
            }
            this.LinkedModalDialog.destruct();
            this.LinkedModalDialog = null;
            this.disableHotKey(false);
        }
    },
    onModalDialogCancel: function() {
        if (!!this.LinkedModalDialog) {
            this.LinkedModalDialog.destruct();
            this.LinkedModalDialog = null;
            this.disableHotKey(false);
        }
    }
}

var ProcessNode = Class.create();
ProcessNode.prototype = {
    initialize: function(id, wfObj, options) {
        this.objId = id;
        this.parentObj = wfObj;
        this.SVGContainer = wfObj.DomNode;
        this._fD = BindAsEventListener(this, this.DuringDrag);
        this._fE = Bind(this, this.EndDrag);

        this.FromPaths = {};
        this.ToPaths = {};

        this.SetOptions(options);
        if ( !this.options.iconUrl ) {
            this.options.iconUrl = this.parentObj.WorkflowMapIcons[this.options.nodeType];
        }

        this.DomNode = this.GenDomNode(id);
        this.XMLNode = this.GenXMLNode();
        this.SVGContainer.appendChild(this.DomNode);
        this.setPosition(this.options.x, this.options.y)
        this.width = this.options.width;
        this.height = this.options.height;

        //addEventHandler(this._Handle, "mousedown", BindAsEventListener(this, this.StartDrag));
    },
    destruct: function() {
        for ( var id in this.FromPaths ) {
            this.FromPaths[id].destruct();
        }
        for ( var id in this.ToPaths ) {
            this.ToPaths[id].destruct();
        }
        this.SVGContainer.removeChild(this.DomNode);
        this.parentObj.removeProcessNode(this.objId);
    },
    SetOptions: function(options) {
        this.options = {
            x: 0,
            y: 0,
            height: "48",
            width: "48",
            nodeType: "ManualActivity_Manual",
            name: "",
            title: "组件",
            iconUrl: ""
        };
        Extend(this.options, options || {});
    },
    GenDomNode: function(id) {
        var dn = document.createElementNS("http://www.w3.org/2000/svg", "g");
        dn.setAttribute("id", id);
        dn.setAttribute("nodeType", this.options.nodeType);
        //dn.setAttribute("x", this.options.x);
        //dn.setAttribute("y", this.options.y);

        var image = document.createElementNS("http://www.w3.org/2000/svg", "image");
        image.setAttribute("nodeId", id);
        image.setAttribute("class", "draggableNode");
        image.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", this.options.iconUrl);
        //image.setAttribute("x", this.options.x);
        //image.setAttribute("y", this.options.y);
        image.setAttribute("height", this.options.height);
        image.setAttribute("width", this.options.width);

        var text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("nodeId", id);
        text.setAttribute("class", "draggableNode");
        //text.setAttribute("x", this.options.x);
        //text.setAttribute("y", this.options.y);
        text.appendChild(document.createTextNode(this.options.title));
        text.setAttribute("style", "fill:#303030;font-weight:bold;font-size:10pt;");
        this.TextNode = text;
        //var textWidth = this.TextNode.offsetWidth || this.TextNode.scrollWidth;
        //alert(textWidth);

        var rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("nodeId", id);
        rect.setAttribute("class", "draggableNode");
        //rect.setAttribute("x", this.options.x);
        //rect.setAttribute("y", this.options.y);
        rect.setAttribute("rx", 3);
        rect.setAttribute("ry", 3);
        //rect.setAttribute("width", 40);
        rect.setAttribute("height", 20);
        rect.setAttribute("fill", "#ffffff");
        rect.setAttribute("stroke", "#606060");
        rect.setAttribute("stroke-width", "1");
        rect.setAttribute("opacity", "0.75");
        this.TextBgNode = rect;

        dn.appendChild(image);
        dn.appendChild(rect);
        dn.appendChild(text);

        this.ImageNode = image;
        this.TextNode = text;
        this.TextBgNode = rect;

        return dn;
    },
    GenXMLNode: function() {
        if ( !!this.options.xmlNode ) {
            return this.options.xmlNode;
        }

        // 创建缺省节点
        var xn = this.parentObj.XMLDoc.createElement(this.options.nodeType.split("_")[0]);
        var attrList = this.parentObj.getDefaultAttrsByNodeType(this.options.nodeType);
        for ( var name in attrList ) {
            if ( null == attrList[name] )
                continue;
            xn.setAttribute(name, attrList[name]);
        }
        xn.setAttribute("name", this.options.name);
        xn.setAttribute("title", this.options.title);

        // 生成Icon节点
        var n1 = this.parentObj.XMLDoc.createElement("Icon");
        n1.setAttribute("x", this.options.x);
        n1.setAttribute("y", this.options.y);
        n1.setAttribute("width", WorkFlowMapConst.DEFAULT_ICON_WIDTH);
        n1.setAttribute("height", WorkFlowMapConst.DEFAULT_ICON_HEIGHT);
        xn.appendChild(n1);

        // 生成流程缺省Activities
        if ( "Process_Sub" == this.options.nodeType ) {
            var parser = new DOMParser();
            var xmldoc = parser.parseFromString(WorkFlowMapConst.DEFAULT_PROCESS_XMLCONTENT, "text/xml");
            xn.appendChild(xmldoc.documentElement);
        }

        // 生成TranRefData节点
        // var n2 = document.createElement("TranRefData");
        // for ( var name in this.options.TranRefData ) {
        //     if ( null != this.options.TranRefData[i] ) {
        //         n2.setAttribute(name, this.options.TranRefData[i]);
        //     }
        // }
        // if ( n2.attributes.length > 0 ) {
        //     xn.appendChild(n2);
        // }

        // 生成PostRoutes节点
        if ( "EndActivity" != this.options.nodeType ) {
            var n3 = this.parentObj.XMLDoc.createElement("PostRoutes");
            xn.appendChild(n3);  
        }

        // 生成PreRoutes节点
        if ( "BeginActivity" != this.options.nodeType ) {
            var n4 = this.parentObj.XMLDoc.createElement("PreRoutes");
            xn.appendChild(n4);
        }

        return xn;
    },
    StartDrag: function(oEvent) {
        this._x = parseInt(this.DomNode.getAttribute("x"));
        this._y = parseInt(this.DomNode.getAttribute("y"));
        this._px = oEvent.clientX;
        this._py = oEvent.clientY;
        addEventHandler(document, "mousemove", this._fD);
        addEventHandler(document, "mouseup", this._fE);

        this.moveNode = this.DomNode.cloneNode(true);
        this.moveNode.setAttribute("id", this.DomNode.getAttribute("id") + "_move");
        this.moveNode.setAttribute("style", "opacity:0.75");
        //this.SVGContainer.insertBefore(this.moveNode, this.DomNode);
        this.SVGContainer.appendChild(this.moveNode);

        //this.SVGContainer.appendChild(this.DomNode);
        //if(isIE){
        //    addEventHandler(this._Handle, "losecapture", this._fE);
        //}else{
        //    addEventHandler(window, "blur", this._fE);
        //    oEvent.preventDefault();
        //}
    },
    DuringDrag: function(oEvent) {
        //var dx = oEvent.clientX + document.documentElement.scrollLeft
        // - this._mxContainer.offsetLeft - this.width/2;
        //var dy = oEvent.clientY + document.documentElement.scrollTop
        // - this._mxContainer.offsetTop - this.height/2;
        var map_v = this.parentObj.viewVector2MapVector(new Vector2(oEvent.clientX-this._px, oEvent.clientY-this._py));
        // var dx = this._x + oEvent.clientX - this._px;
        // var dy = this._y + oEvent.clientY - this._py;
        var dx = this._x + map_v.x;
        var dy = this._y + map_v.y;
        // dx = Math.max(dx, 0);
        // dx = Math.min(dx, this.SVGContainer.clientWidth - this.width);
        // dy = Math.max(dy, 0);
        // dy = Math.min(dy, this.SVGContainer.clientHeight - this.height);

        //this.moveNode.setAttribute("x", dx);
        //this.moveNode.setAttribute("y", dy);
        this.setPosition(dx, dy, this.moveNode);
        //this.DomNode.x.baseVal.value = oEvent.clientX - this.DomNode.parentNode.parentNode.offsetLeft;
    },
    EndDrag: function() {
        removeEventHandler(document, "mousemove", this._fD);
        removeEventHandler(document, "mouseup", this._fE);
        //this.DomNode.setAttribute("x", this.moveNode.getAttribute("x"));
        //this.DomNode.setAttribute("y", this.moveNode.getAttribute("y"));
        this.setPosition(parseInt(this.moveNode.getAttribute("x")), parseInt(this.moveNode.getAttribute("y")));
        this.SVGContainer.removeChild(document.getElementById(this.DomNode.getAttribute("id") + "_move"));
        //if(isIE){
        //    removeEventHandler(this._Handle, "losecapture", this._fE);
        //}else{
        //    removeEventHandler(window, "blur", this._fE);
        //}
        for ( var i in this.ToPaths ) {
            this.ToPaths[i].drawPath();
        }
        for ( var i in this.FromPaths ) {
            this.FromPaths[i].drawPath();
        }
    },
    setPosition: function(x, y, node) {
        var target = !!node ? node : this.DomNode;
        target.setAttribute("x", x);
        target.setAttribute("y", y);

        target.childNodes[0].setAttribute("x", x);
        target.childNodes[0].setAttribute("y", y);

        var textWidth = target.childNodes[2].offsetWidth || target.childNodes[2].scrollWidth;
        //var textWidth = this.TextNode.getBBox().width;
        var textX = x+(parseInt(target.childNodes[0].getAttribute("width"))-textWidth)/2;
        var textY = y+parseInt(target.childNodes[0].getAttribute("height"));
        target.childNodes[2].setAttribute("x", textX);
        target.childNodes[2].setAttribute("y", textY);

        target.childNodes[1].setAttribute("x", textX-5);
        target.childNodes[1].setAttribute("y", textY-15);
        target.childNodes[1].setAttribute("width", !!target.childNodes[2].textContent?(textWidth+10):0);

        var icon = this.XMLNode.getElementsByTagName("Icon")[0];
        icon.setAttribute("x", x);
        icon.setAttribute("y", y);
    },
    getPosition: function() {
        var x = parseInt(this.ImageNode.getAttribute("x"));
        var y = parseInt(this.ImageNode.getAttribute("y"));
        return new Vector2(x, y);
    },
    focus: function() {
        this.parentObj.DomNode.appendChild(this.DomNode);
        this.TextNode.setAttribute("style", "fill:#FFFFFF;font-weight:bold;font-size:10pt;");
        this.TextBgNode.setAttribute("fill", "#000000");
        this.TextBgNode.setAttribute("stroke", "#000000");
        //console.log(this.DomNode.getBBox());
    },
    blur: function() {
        this.TextNode.setAttribute("style", "fill:#303030;font-weight:bold;font-size:10pt;");
        this.TextBgNode.setAttribute("fill", "#FFFFFF");
        this.TextBgNode.setAttribute("stroke", "#606060");
    },
    getWidth: function() {
        return this.ImageNode.getAttribute("width");
    },
    getHeight: function() {
        return this.ImageNode.getAttribute("height");
    },
    getCenterPoint: function() {
        var x = parseInt(this.ImageNode.getAttribute("x")) + parseInt(this.ImageNode.getAttribute("width"))/2;
        var y = parseInt(this.ImageNode.getAttribute("y")) + parseInt(this.ImageNode.getAttribute("height"))/2;
        return new Vector2(x, y);
    },
    addFromPath: function(id, obj) {
        this.FromPaths[id] = obj;
    },
    addToPath: function(id, obj) {
        this.ToPaths[id] = obj;
    },
    removeFromPath: function(id) {
        delete this.FromPaths[id];
    },
    removeToPath: function(id) {
        delete this.ToPaths[id];
    },
    getNodeTitle: function() {
        return this.TextNode.textContent;
    },
    setNodeTitle: function(title) {
        this.TextNode.textContent = title;
        this.setPosition(parseInt(this.DomNode.getAttribute("x")), parseInt(this.DomNode.getAttribute("y")));
        this.XMLNode.setAttribute("title", title);
    },
    showContextMenu: function(e) {
        return new ContextMenu({
            x:e.clientX,
            y:e.clientY,
            menuList: {
                "rename": "重命名",
                "setting": "设置",
                "sepLine": "",
                "delete": "删除"
            },
            targetObj: this,
            callback: "contextMenuCallback"
        });
    },
    contextMenuCallback: function(type) {
        switch (type)
        {
        case WorkFlowMapConst.OPTYPE_RENAME:
            var html = '<ul class="inputList"><li><input id="title_'+this.objId+'" type="text" value="'+this.getNodeTitle()+'" /></li></ul>';
            this.LinkedModalDialog = new ModalDialog(type+"_"+this.objId, {target:this, type:type, title:"重命名", width:"240px", contentHTML:html});
            this.parentObj.disableHotKey(true);
            break;
        case WorkFlowMapConst.OPTYPE_SETTING:
            var tabs = {};
            var rules = this.parentObj.getFlowRules().SettingInputLists;
            for ( var i in WorkFlowMapConst.SETTINGLIST_NODE ) {
                var name = WorkFlowMapConst.SETTINGLIST_NODE[i]
                tabs[rules[name].title] = this.parentObj.genSettingContent(this, name);
            }
            var domNode = new TabsControl("settingsContent", {tabs:tabs}).DomNode;
            this.LinkedModalDialog = new ModalDialog(type+"_"+this.objId, {target:this, type:type, title:"设置", width:"500px", contentDomNode:domNode});
            this.parentObj.disableHotKey(true);
            break;
        case WorkFlowMapConst.OPTYPE_DELETE:
            this.destruct();
            break;
        }
    },
    getAttribute: function(name) {
        // 特殊逻辑-获取相关数据属性
        var attr = "";
        if ( name.indexOf("tranRefDataTitle") > -1 ) {
            var refNode = this.XMLNode.getChildElementByTagName("TranRefData")[0];
            if ( !!refNode ) 
                attr = refNode.getAttribute(name);
        } else {
            attr = this.XMLNode.getAttribute(name);
        }

        return !!attr?attr:"";
    },
    setAttribute: function(name, value) {
        if ( null == value ) {
            return;
        }
        // 特殊逻辑-设置相关数据属性
        if ( name.indexOf("tranRefDataTitle") > -1 ) {
            var refNode = this.XMLNode.getChildElementByTagName("TranRefData")[0];
            if ( !refNode ) {
                refNode = this.parentObj.XMLDoc.createElement("TranRefData");
                this.XMLNode.appendChild(refNode);
            }
            refNode.setAttribute(name, value);
        } else {
            this.XMLNode.setAttribute(name, value);
        }
    },
    getNodeType: function() {
        return this.options.nodeType;
    },
    onModalDialogOK: function() {
        if (!!this.LinkedModalDialog) {
            switch (this.LinkedModalDialog.getType())
            {
            case WorkFlowMapConst.OPTYPE_RENAME:
                this.setNodeTitle(this.LinkedModalDialog.getInputValue("title_"+this.objId));
                break;
            case WorkFlowMapConst.OPTYPE_SETTING:
                // this.setAttribute("name", this.LinkedModalDialog.getInputValue("name_"+this.objId));
                // this.setAttribute("code", this.LinkedModalDialog.getInputValue("code_"+this.objId));
                // this.setAttribute("description", this.LinkedModalDialog.getInputValue("description_"+this.objId));
                var attrs = this.parentObj.getFlowRules().DefaultAttributes.ActivityAttrs;
                for ( var name in attrs ) {
                    var val = this.LinkedModalDialog.getInputValue(name+"_"+this.objId);
                    this.setAttribute(name, val);
                    // 合并策略
                    if ("joinStrategy"==name) {
                        for ( var index in this.ToPaths ) {
                            this.ToPaths[index].setEndArrow("Arrow_End_"+val);
                        }
                    }
                    // 分支策略
                    if ("splitStrategy"==name) {
                        for ( var index in this.FromPaths ) {
                            this.FromPaths[index].setStartArrow("Arrow_Start_"+val);
                        }
                    }
                }
                // 相关设置属性
                var refAttrs = this.parentObj.getFlowRules().DefaultAttributes.TranRefDataAttrs;
                for ( var name in refAttrs ) {
                    this.setAttribute(name, this.LinkedModalDialog.getInputValue(name+"_"+this.objId));
                }
                break;
            }
            this.LinkedModalDialog.destruct();
            this.LinkedModalDialog = null;
            this.parentObj.disableHotKey(false);
        }
    },
    onModalDialogCancel: function() {
        if (!!this.LinkedModalDialog) {
            this.LinkedModalDialog.destruct();
            this.LinkedModalDialog = null;
            this.parentObj.disableHotKey(false);
        }
    }
}

var ProcessPath = Class.create();
ProcessPath.prototype = {
    initialize: function(id, wfObj, options) {
        this.objId = id;
        this.parentObj = wfObj;
        this.SVGContainer = wfObj.DomNode;

        this.SetOptions(options);

        this.FromNode = wfObj.getProcessNodeObj(this.options.fromNode);
        this.ToNode = wfObj.getProcessNodeObj(this.options.toNode);
        this.bendPoints = this.options.bendPoints;

        this.DomNode = this.GenDomNode(id);
        this.XMLNode = this.GenPostRoute();
        this.XMLPreNode = this.GenPreRoute();
        this.SVGContainer.appendChild(this.DomNode);
        this.refreshPath();

        this._handleMousedown = BindAsEventListener(this, this.HandleMousedown);
        this._handleMousemove = BindAsEventListener(this, this.HandleMousemove);
        this._handleMouseup = BindAsEventListener(this, this.HandleMouseup);

        this.FromNode.addFromPath(id, this);
        this.ToNode.addToPath(id, this);
    },
    destruct: function() {
        this.cancelEdit();
        this.FromNode.removeFromPath(this.objId);
        this.ToNode.removeToPath(this.objId);
        this.SVGContainer.removeChild(this.DomNode);
        this.parentObj.removeProcessPath(this.objId);
    },
    SetOptions: function(options) {
        this.options = {//默认值
            fromNode: "",
            toNode: "",
            bendPoints: "",
            strokeColor: "#606060",
            strokeWidth: "2",
            markerStart: "url(#Arrow_Start_5)",
            markerEnd: "url(#Arrow_End_5)",
            displayLabel: ""
        };
        Extend(this.options, options || {});
    },
    GenPostRoute: function() {
        if ( !!this.options.xmlNode ) {
            return this.options.xmlNode;
        }
        var rn = this.parentObj.XMLDoc.createElement("PostRoute");
        var attrList = this.parentObj.getFlowRules().DefaultAttributes.RouteAttrs;
        for ( var name in attrList ) {
            if ( null != attrList[name] )
                rn.setAttribute(name, attrList[name]);
        }

        var routeActivities = this.parentObj.XMLDoc.createElement("RouteActivities");
        
        var routeActivity = this.parentObj.XMLDoc.createElement("RouteActivity");
        routeActivity.setAttribute("activityName", this.ToNode.XMLNode.getAttribute("name"));
        routeActivity.setAttribute("displayLabel", this.options.displayLabel);
        
        var bendpoints = this.parentObj.XMLDoc.createElement("Bendpoints");
        
        routeActivity.appendChild(bendpoints);
        routeActivities.appendChild(routeActivity);
        rn.appendChild(routeActivities);

        return rn;
    },
    GenPreRoute: function() {
        if ( !!this.options.xmlPreNode ) {
            return this.options.xmlPreNode;
        }

        var rn = this.parentObj.XMLDoc.createElement("PreRoute");
        // var attrList = this.parentObj.getFlowRules().DefaultAttributes.RouteAttrs;
        // for ( var name in attrList ) {
        //     rn.setAttribute(name, attrList[name]);
        // }

        var routeActivities = this.parentObj.XMLDoc.createElement("RouteActivities");
        
        var routeActivity = this.parentObj.XMLDoc.createElement("RouteActivity");
        routeActivity.setAttribute("activityName", this.FromNode.XMLNode.getAttribute("name"));
        //routeActivity.setAttribute("displayLabel", this.options.displayLabel);
        
        var bendpoints = this.parentObj.XMLDoc.createElement("Bendpoints");
        
        routeActivity.appendChild(bendpoints);
        routeActivities.appendChild(routeActivity);
        rn.appendChild(routeActivities);

        return rn;
    },
    GenDomNode: function(id) {
        var dn = document.createElementNS("http://www.w3.org/2000/svg", "g");
        dn.setAttribute("id", id);

        var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        var v_fn = this.FromNode.getCenterPoint();
        var v_tn = this.ToNode.getCenterPoint();
        this.v_fromPoint = v_fn;
        this.v_toPoint = v_tn;
        path.setAttribute("pathId", id);
        path.setAttribute("d", this.GenAttribute_d());
        path.setAttribute("stroke", this.options.strokeColor);
        path.setAttribute("stroke-width", this.options.strokeWidth);
        path.setAttribute("fill", "none");
        path.setAttribute("marker-start", this.options.markerStart);
        path.setAttribute("marker-end", this.options.markerEnd);
        this.PathNode = path;

        var text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("pathId", id);
        text.appendChild(document.createTextNode(this.options.displayLabel));
        text.setAttribute("style", "fill:#303030;font-weight:bold;font-size:10pt;");
        this.TextNode = text;

        var rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("pathId", id);
        //rect.setAttribute("width", 40);
        rect.setAttribute("height", 20);
        rect.setAttribute("fill", "#ffffff");
        this.TextBgNode = rect;

        dn.appendChild(path);
        dn.appendChild(rect);
        dn.appendChild(text);
        return dn;
    },
    HandleMousedown: function(oEvent) {
        if ( 0 != oEvent.button )
            return;
        var target = oEvent.target || oEvent.srcElement;
        var type = target.getAttribute("type");
        //console.log(type);
        if ( !!type ) {
            this._px = oEvent.clientX;
            this._py = oEvent.clientY;
            this.TargetNodeType = type;
            switch(type) {
            case WorkFlowMapConst.PATHPOINT_TYPE_BEND:
                this._bp = this.getBendPoints()[parseInt(target.getAttribute("index"))-1];
                //this._nx = parseInt(target.getAttribute("x"));
                //this._ny = parseInt(target.getAttribute("y"));
                this.MovePointNode = target;
                break;
            case WorkFlowMapConst.PATHPOINT_TYPE_ADD:
                var bp_x = parseInt(target.getAttribute("px"));
                var bp_y = parseInt(target.getAttribute("py"));
                this.addBendPoint(bp_x, bp_y, parseInt(target.getAttribute("index")));
                this._bp = new Vector2(bp_x, bp_y);
                break;
            }

            this.EditorNode.setAttribute("opacity", "0");
            addEventHandler(document, "mousemove", this._handleMousemove);
            addEventHandler(document, "mouseup", this._handleMouseup);
        }
        
    },
    HandleMousemove: function(oEvent) {
        if ( !!this.TargetNodeType ) {
            var av = this.parentObj.viewVector2MapVector(new Vector2(oEvent.clientX-this._px, oEvent.clientY-this._py));
            switch(this.TargetNodeType) {
            case WorkFlowMapConst.PATHPOINT_TYPE_BEND:
                var v_oa = new Vector2(av.x+this._bp.x, av.y+this._bp.y);
                var i = parseInt(this.MovePointNode.getAttribute("index"))-1;
                var v_ob = (0==i) ? this.getStartPoint() : this.getBendPoints()[i-1];
                var v_oc = (i+1<this.getBendPoints().length) ? this.getBendPoints()[i+1] : this.getEndPoint();
                var v_bc = v_oc.subtract(v_ob);
                var v_ba = v_oa.subtract(v_ob);
                var v_ac = v_oc.subtract(v_oa);
                var cosa = v_ba.dot(v_bc) / (v_ba.length() * v_bc.length());
                var a = Math.acos(cosa);
                var cosb = v_bc.dot(v_ac) / (v_bc.length() * v_ac.length());
                var b = Math.acos(cosb);

                var v_oa_fixed = v_oa;
                this.RemoveBendPointFlag = false;
                if ( a<Math.PI/2 && b<Math.PI/2 ) {
                    var k = Math.tan(b)/(Math.tan(a)+Math.tan(b));
                    var v_fixer = v_bc.multiply(k).subtract(v_ba);
                    if ( v_fixer.length() < 10 ) {
                        v_oa_fixed = v_oa.add(v_fixer);
                        this.RemoveBendPointFlag = true;
                    }
                }

                var index = parseInt(this.MovePointNode.getAttribute("index"));
                this.setBendPoint(v_oa_fixed.x, v_oa_fixed.y, index);
                
                break;
            }
        }
    },
    HandleMouseup: function(oEvent) {
        if ( !!this.TargetNodeType ) {
            var av = this.parentObj.viewVector2MapVector(new Vector2(oEvent.clientX-this._px, oEvent.clientY-this._py));
            switch(this.TargetNodeType) {
            case WorkFlowMapConst.PATHPOINT_TYPE_BEND:
                var index = parseInt(this.MovePointNode.getAttribute("index"));
                if ( !this.RemoveBendPointFlag ) {
                    this.setBendPoint(this._bp.x+av.x, this._bp.y+av.y, index);
                } else {
                    this.removeBendPoint(index);
                }
                break;
            }
            removeEventHandler(document, "mousemove", this._handleMousemove);
            removeEventHandler(document, "mouseup", this._handleMouseup);
            this.cancelEdit();
            this.editPath();
        }
    },
    addBendPoint: function(x, y, index) {
        var p = [];
        if ( "" != this.bendPoints ) {
            p = this.bendPoints.split(/\s*[,]\s*/);
        }
        p.splice(index-1, 0, x+" "+y);
        this.bendPoints = p.join();
        this.refreshPath();
    },
    removeBendPoint: function(index) {
        if ( "" == this.bendPoints ) return;
        var p = this.bendPoints.split(/\s*[,]\s*/);
        p.splice(index-1, 1);
        this.bendPoints = p.join();
        this.refreshPath();
    },
    setBendPoint: function(x, y, index) {
        var p = this.bendPoints.split(/\s*[,]\s*/);
        p[index-1] = "" + x + " " + y;
        this.bendPoints = p.join();
        this.refreshPath();
    },
    updateXMLBendPoints: function() {
        var ra = this.XMLNode.getElementsByTagName("RouteActivity")[0];
        while ( ra.firstChild ) {
            ra.removeChild(ra.firstChild);
        }
        var bps = this.getBendPoints();
        var bpsNode = this.parentObj.XMLDoc.createElement("Bendpoints");
        for ( var i in bps ) {
            var bpNode = this.parentObj.XMLDoc.createElement("Bendpoint");
            bpNode.setAttribute("x", Math.round(bps[i].x));
            bpNode.setAttribute("y", Math.round(bps[i].y));
            bpsNode.appendChild(bpNode);
        }
        ra.appendChild(bpsNode);
    },
    refreshPath: function() {
        this.PathNode.setAttribute("d", this.GenAttribute_d());
        if (isIE) {
            this.SVGContainer.appendChild(this.DomNode);
            if (!!this.EditorNode)
                this.SVGContainer.appendChild(this.EditorNode);
        }

        var bps = this.getBendPoints();
        var p1 = bps.length<2 ? this.getStartPoint() : bps[parseInt(bps.length/2)-1];
        var p2 = bps.length<1 ? this.getEndPoint() : bps[parseInt(bps.length/2)];
        var pc = p1.add(p2).divide(2);

        //var textWidth = this.TextNode.offsetWidth || this.TextNode.scrollWidth;
        var textWidth = this.TextNode.getBBox().width;
        var textX = pc.x-textWidth/2;
        var textY = pc.y;
        this.TextNode.setAttribute("x", textX);
        this.TextNode.setAttribute("y", textY);

        this.TextBgNode.setAttribute("x", textX-5);
        this.TextBgNode.setAttribute("y", textY-15);
        this.TextBgNode.setAttribute("width", !!this.TextNode.textContent?(textWidth+10):0);

        // 更新XML的BendPoints节点
        this.updateXMLBendPoints();
    },
    GenAttribute_d: function() {
        var d = "";
        if ( "" != this.bendPoints ) {
            var d_bp = "";
            var bpArray = this.bendPoints.split(",");
            for ( var i = 0; i < bpArray.length; i++ ) {
                d_bp += " L " + bpArray[i];
                var p = bpArray[i].split(" ");
                bpArray[i] = new Vector2(p[0], p[1]);
            }
            var v_fp_fixed = this.v_fromPoint.add(new Vector2(bpArray[0].x-this.v_fromPoint.x, bpArray[0].y-this.v_fromPoint.y).normalize().multiply(this.FromNode.getWidth()).parseInt());
            var v_tp_fixed = this.v_toPoint.add(new Vector2(bpArray[bpArray.length-1].x-this.v_toPoint.x, bpArray[bpArray.length-1].y-this.v_toPoint.y).normalize().multiply(this.ToNode.getWidth()).parseInt());
            d += "M " + v_fp_fixed.x + " " + v_fp_fixed.y + d_bp + " L " + v_tp_fixed.x + " " + v_tp_fixed.y;
        } else {
            var v_fixer = new Vector2(this.v_toPoint.x-this.v_fromPoint.x, this.v_toPoint.y-this.v_fromPoint.y).normalize().multiply(this.ToNode.getWidth()).parseInt();
            var v_fp_fixed = this.v_fromPoint.add(v_fixer);
            var v_tp_fixed = this.v_toPoint.subtract(v_fixer);
            d += "M " + v_fp_fixed.x + " " + v_fp_fixed.y;
            d += " L " + v_tp_fixed.x + " " + v_tp_fixed.y;
        }
        return d;
    },
    GenPointDragNode: function(vp, type, index) {
        var dragNode = document.createElementNS(WorkFlowMapConst.SVG_NS, "rect");
        dragNode.setAttribute("pathId", this.objId);
        dragNode.setAttribute("type", type);
        if ( !!index )
            dragNode.setAttribute("index", index);

        var l = (type==WorkFlowMapConst.PATHPOINT_TYPE_ADD) ? 5 : 7;
        dragNode.setAttribute("x", vp.x-l/2);
        dragNode.setAttribute("y", vp.y-l/2);
        dragNode.setAttribute("px", vp.x);
        dragNode.setAttribute("py", vp.y);
        dragNode.setAttribute("width", l);
        dragNode.setAttribute("height", l);
        dragNode.setAttribute("fill", "#000000");
        dragNode.setAttribute("stroke", "#ffffff");
        dragNode.setAttribute("stroke-width", 2);

        return dragNode;
    },
    getStartPoint: function() {
        var p = this.PathNode.getAttribute("d").split(/\s*[a-zA-Z]\s*/)[1].split(" ");
        return new Vector2(p[0], p[1]);
    },
    getEndPoint: function() {
        var p = this.PathNode.getAttribute("d").split(/\s*[a-zA-Z]\s*/);
        p = p[p.length-1].split(" ");
        return new Vector2(p[0], p[1]);
    },
    getBendPoints: function() {
        var bps = [];
        if (!!this.bendPoints) {
            var p = this.bendPoints.split(/\s*[,]\s*/);
            for ( var index in p ) {
                var temp = p[index].split(" ");
                bps.push(new Vector2(temp[0], temp[1]));
            }
        }
        return bps;
    },
    focus: function() {
        this.editPath();
    },
    blur: function() {
        this.cancelEdit();
    },
    editPath: function() {
        var dn = document.createElementNS(WorkFlowMapConst.SVG_NS, "g");
        dn.setAttribute("id", "pathEditor_" + this.objId);

        dn.appendChild(this.GenPointDragNode(this.getStartPoint(), WorkFlowMapConst.PATHPOINT_TYPE_START));
        var bps = this.getBendPoints();
        if ( 0 == bps.length ) {
            dn.appendChild(this.GenPointDragNode(this.getStartPoint().add(this.getEndPoint()).divide(2), WorkFlowMapConst.PATHPOINT_TYPE_ADD, 1));
        } else {
            dn.appendChild(this.GenPointDragNode(this.getStartPoint().add(bps[0]).divide(2), WorkFlowMapConst.PATHPOINT_TYPE_ADD, 1));
            for ( var i=0; i < bps.length; i++ ) {
                dn.appendChild(this.GenPointDragNode(bps[i], WorkFlowMapConst.PATHPOINT_TYPE_BEND, i+1));
                if ( i+1 < bps.length ) {
                    dn.appendChild(this.GenPointDragNode(bps[i].add(bps[i+1]).divide(2), WorkFlowMapConst.PATHPOINT_TYPE_ADD, i+2));
                } else {
                    dn.appendChild(this.GenPointDragNode(bps[i].add(this.getEndPoint()).divide(2), WorkFlowMapConst.PATHPOINT_TYPE_ADD, i+2));
                }
            }
        }
        dn.appendChild(this.GenPointDragNode(this.getEndPoint(), WorkFlowMapConst.PATHPOINT_TYPE_END));
        this.EditorNode = dn;
        this.parentObj.DomNode.appendChild(this.EditorNode);

        addEventHandler(this.EditorNode, "mousedown", this._handleMousedown);
    },
    cancelEdit: function() {
        if ( !!this.EditorNode ) {
            removeEventHandler(this.EditorNode, "mousedown", this._handleMousedown);
            this.parentObj.DomNode.removeChild(this.EditorNode);
            this.EditorNode = null;
        }
    },
    drawPath: function() {

        if ( this.FromNode.getCenterPoint().equals(this.ToNode.getCenterPoint()) ) {
            var fixedPoint = this.ToNode.getPosition().add(new Vector2(1, 1));
            this.ToNode.setPosition(fixedPoint.x, fixedPoint.y);
        }
        var v_fn = this.FromNode.getCenterPoint();
        var v_tn = this.ToNode.getCenterPoint();
            
        if ( v_fn.equals(this.v_fromPoint) && v_tn.equals(this.v_toPoint) )
            return;

        if ( "" != this.bendPoints ) {
            // 计算新的折点
            var newBendPoints = this.bendPoints;
            if ( !v_tn.equals(this.v_toPoint) ) {
                var bps = "";
                var bpArray = newBendPoints.split(",");
                for ( var i = 0; i < bpArray.length; i++ ) {
                    var p = bpArray[i].split(" ");
                    var v_c1 = new Vector2(p[0], p[1]).subtract(this.v_fromPoint);
                    var v_a = this.v_toPoint.subtract(this.v_fromPoint);
                    var v_b = v_tn.subtract(this.v_fromPoint);
                    var v_c2 = this.calcBendPoint(v_a, v_b, v_c1);
                    v_c2 = v_c2.add(this.v_fromPoint);
                    bps += "" + v_c2.x + " " + v_c2.y + ",";
                }
                newBendPoints = bps.substr(0, bps.length-1);
            }
            if ( !v_fn.equals(this.v_fromPoint) ) {
                var bps = "";
                var bpArray = newBendPoints.split(",");
                for ( var i = 0; i < bpArray.length; i++ ) {
                    var p = bpArray[i].split(" ");
                    var v_c1 = new Vector2(p[0], p[1]).subtract(v_tn);
                    var v_a = this.v_fromPoint.subtract(v_tn);
                    var v_b = v_fn.subtract(v_tn);
                    var v_c2 = this.calcBendPoint(v_a, v_b, v_c1);
                    v_c2 = v_c2.add(v_tn);
                    bps += "" + v_c2.x + " " + v_c2.y + ",";
                }
                newBendPoints = bps.substr(0, bps.length-1);
            }
            this.bendPoints = newBendPoints;
        }
        
        this.v_fromPoint = v_fn;
        this.v_toPoint = v_tn;

        //dn.setAttribute("d", this.GenAttribute_d());
        //if (isIE) this.SVGContainer.appendChild(dn);
        this.refreshPath();
    },
    calcBendPoint: function(v_a, v_b, v_c1) {
        var cosa = v_a.dot(v_b) / (v_a.length() * v_b.length());
        var a = (v_a.cross(v_b)>0) ? (2*Math.PI-Math.acos(cosa)) : Math.acos(cosa);

        var v_c2 = new Vector2(v_c1.x*Math.cos(a) + v_c1.y*Math.sin(a), (-1)*v_c1.x*Math.sin(a) + v_c1.y*Math.cos(a));
        v_c2 = v_c2.multiply(v_b.length()/v_a.length());

        return v_c2;
    },
    getPathLabel: function() {
        return this.TextNode.textContent;
    },
    setPathLabel: function(label) {
        this.TextNode.textContent = label;
        this.XMLNode.getElementsByTagName("RouteActivity")[0].setAttribute("displayLabel", label);
        this.refreshPath();
    },
    setEndArrow: function(id) {
        this.DomNode.firstChild.setAttribute("marker-end", "url(#"+id+")");
        //this.refreshPath();
    },
    setStartArrow: function(id) {
        this.DomNode.firstChild.setAttribute("marker-start", "url(#"+id+")");
        //this.refreshPath();
    },
    getAttribute: function(name) {
        // 特殊逻辑-获取路由表达式
        var attr = "";
        if ( "conditionExpression"==name ) {
            var expNode = this.XMLNode.getChildElementByTagName("Expression")[0];
            if ( !!expNode ) 
                attr = expNode.getAttribute(name);
        } else {
            attr = this.XMLNode.getAttribute(name);
        }

        return !!attr?attr:"";
    },
    setAttribute: function(name, value) {
        if ( null == value ) {
            return;
        }
        // 特殊逻辑-设置路由表达式
        if ( "conditionExpression"==name ) {
            var expNode = this.XMLNode.getChildElementByTagName("Expression")[0];
            if ( !expNode ) {
                expNode = this.parentObj.XMLDoc.createElement("Expression");
                this.XMLNode.appendChild(expNode);
            }
            expNode.setAttribute(name, value);
        } else {
            this.XMLNode.setAttribute(name, value);
        }
    },
    showContextMenu: function(e) {
        return new ContextMenu({
            x:e.clientX,
            y:e.clientY,
            menuList: {
                "rename": "重命名",
                "routeSetting": "后向路由设置",
                "sepLine": "",
                "delete": "删除"
            },
            targetObj: this,
            callback: "contextMenuCallback"
        });
    },
    contextMenuCallback: function(type) {
        switch (type)
        {
        case WorkFlowMapConst.OPTYPE_RENAME:
            var html = '<ul class="inputList"><li><input id="label_'+this.objId+'" type="text" value="'+this.getPathLabel()+'" /></li></ul>';
            this.LinkedModalDialog = new ModalDialog(type+"_"+this.objId, {target:this, type:type, title:"重命名", width:"240px", contentHTML:html});
            this.parentObj.disableHotKey(true);
            break;
        case WorkFlowMapConst.OPTYPE_ROUTESETTING:
            var ul =  document.createElement("ul");
            ul.setAttribute("class", "inputList")
            var list = this.parentObj.getFlowRules().SettingInputLists["routeInfo"].inputList;
            var pros = this.parentObj.getFlowRules().AttrsInputProperty;
            for ( var i in list ) {
                var pro = pros[list[i]];
                var inputCtrl = new InputControl(list[i]+'_'+this.objId, pro, this.getAttribute(list[i]))
                ul.appendChild(inputCtrl.getDomNode());
            }

            var domNode = document.createElement("div");
            domNode.appendChild(ul);

            this.LinkedModalDialog = new ModalDialog(type+"_"+this.objId, {target:this, type:type, title:"后向路由设置", width:"400px", contentDomNode:domNode});
            this.parentObj.disableHotKey(true);
            break;
        case WorkFlowMapConst.OPTYPE_DELETE:
            this.destruct();
            break;
        }
    },
    onModalDialogOK: function() {
        if (!!this.LinkedModalDialog) {
            switch (this.LinkedModalDialog.getType())
            {
            case WorkFlowMapConst.OPTYPE_RENAME:
                this.setPathLabel(this.LinkedModalDialog.getInputValue("label_"+this.objId));
                break;
            case WorkFlowMapConst.OPTYPE_ROUTESETTING:
                var attrs = this.parentObj.getFlowRules().DefaultAttributes.RouteAttrs;
                for ( var name in attrs ) {
                    this.setAttribute(name, this.LinkedModalDialog.getInputValue(name+"_"+this.objId));
                }
                // 路由表达式
                var expAttrs = this.parentObj.getFlowRules().DefaultAttributes.ExpressionAttrs;
                for ( var name in expAttrs ) {
                    this.setAttribute(name, this.LinkedModalDialog.getInputValue(name+"_"+this.objId));
                }
                break;
            }
            this.LinkedModalDialog.destruct();
            this.LinkedModalDialog = null;
            this.parentObj.disableHotKey(false);
        }
    },
    onModalDialogCancel: function() {
        if (!!this.LinkedModalDialog) {
            this.LinkedModalDialog.destruct();
            this.LinkedModalDialog = null;
            this.parentObj.disableHotKey(false);
        }
    }
}

var WorkflowToolbar = Class.create();
WorkflowToolbar.prototype = {
    initialize: function(id, wfObj, options) {
        this.DomNode = document.getElementById(id);
        this.BindWorflowObj = wfObj;

        this.SetOptions(options);
        for ( var name in this.options.moduleTools ) {
            if ( !this.options.moduleTools[name].icon ) {
                this.options.moduleTools[name].icon = this.BindWorflowObj.WorkflowMapIcons[name];
            }
        }

        //this.DomNode.setAttribute("width", this.options.width);
        //this.DomNode.setAttribute("height", this.options.height);

        var ul = document.createElement("ul");
        for ( var name in this.options.actionTools ) {
            var li = document.createElement("li");
            var img = document.createElement("img");
            img.setAttribute("id", "tool_" + name);
            img.setAttribute("toolType", "action");
            img.setAttribute("src", this.options.actionTools[name].icon);
            img.setAttribute("title", this.options.actionTools[name].title);
            img.setAttribute("width", this.options.iconWidth);
            img.setAttribute("height", this.options.iconHeight);
            li.appendChild(img);
            ul.appendChild(li);
        }
        for ( var name in this.options.moduleTools ) {
            var li = document.createElement("li");
            var img = document.createElement("img");
            img.setAttribute("id", "tool_" + name);
            img.setAttribute("toolType", "module");
            img.setAttribute("moduleType", name);
            img.setAttribute("src", this.options.moduleTools[name].icon);
            img.setAttribute("title", this.options.moduleTools[name].title);
            img.setAttribute("width", this.options.iconWidth);
            img.setAttribute("height", this.options.iconHeight);
            li.appendChild(img);
            ul.appendChild(li);
        }
        this.DomNode.appendChild(ul);

        this.setActionMode(this.options.defaultActionMode);
 
        addEventHandler(this.DomNode, "mousedown", BindAsEventListener(this, this.HandleMousedown));
        //addEventHandler(document, "mousemove", BindAsEventListener(this, this.HandleMousemove));
        //addEventHandler(this.DomNode, "mouseup", BindAsEventListener(this, this.HandleMouseup));
        addEventHandler(this.DomNode, "click", BindAsEventListener(this, this.HandleClick));
    },
    SetOptions: function(options) {
        this.options = {//默认值
            iconWidth: "36",
            iconHeight: "36",
            defaultActionMode: WorkFlowMapConst.ACTIONMODE_POINTER,
            actionTools: {
                "hand": {
                    title: "拖拽工具",
                    icon: "./img/hand.png"
                },
                "pointer": {
                    title: "选择工具",
                    icon: "./img/cursor.png"
                },
                "linker": {
                    title: "路由工具",
                    icon: "./img/merge.png"
                }
            },
            moduleTools: {
                "ManualActivity_Manual": {
                    title: "人工处理动作",
                    icon: ""
                },
                "ManualActivity_Robot": {
                    title: "机器人处理动作",
                    icon: ""
                },
                "Process_Sub": {
                    title: "子流程",
                    icon: ""
                },
                "DummyActivity": {
                    title: "虚动作",
                    icon: ""
                }
            }
        };
        Extend(this.options, options || {});
    },
    HandleMousedown: function(oEvent) {
        var target = oEvent.target || oEvent.srcElement;
        //this.downPoint = new Vector2(oEvent.clientX, oEvent.clientY);
        if ( target.getAttribute("toolType") == "module" ) {
            this._px = oEvent.clientX;
            this._py = oEvent.clientY;
            this._fD = BindAsEventListener(this, this.DuringDragModule);
            this._fE = BindAsEventListener(this, this.EndDragModule);
            addEventHandler(document, "mousemove", this._fD);
            addEventHandler(document, "mouseup", this._fE);

            this.dragModule = target.cloneNode(true);
            this.dragModule.setAttribute("id", target.getAttribute("id") + "_move");
            this.dragModule.setAttribute("style", "opacity:0.75;position:absolute;z-index:999");
            this._targetX = target.offsetLeft+this.DomNode.offsetLeft;
            this._targetY = target.offsetTop+this.DomNode.offsetTop;
            this.dragModule.style.left = this._targetX + "px";
            this.dragModule.style.top = this._targetY + "px";
            document.body.appendChild(this.dragModule);
        }
    },
    DuringDragModule: function(oEvent) {
        var target = oEvent.target || oEvent.srcElement;
        var dx = this._targetX + oEvent.clientX - this._px;
        var dy = this._targetY + oEvent.clientY - this._py;

        this.dragModule.style.left = dx + "px";
        this.dragModule.style.top = dy + "px";

        if ( !this.BindWorflowObj.isInMapArea(oEvent.clientX, oEvent.clientY) ) {
            document.body.setAttribute("class", "notAllowedCursor");
            //document.body.style.cursor = "not-allowed";
            this.droppableFlag = false;
        } else {
            document.body.setAttribute("class", "");
            //document.body.style.cursor = "default";
            this.droppableFlag = true;
            this._dropX = dx;
            this._dropY = dy; 
        }
    },
    EndDragModule: function(oEvent) {
        removeEventHandler(document, "mousemove", this._fD);
        removeEventHandler(document, "mouseup", this._fE);
        if ( this.droppableFlag ) {
            var mp = this.BindWorflowObj.clientPoint2MapPoint(new Vector2(this._dropX, this._dropY));
            var name = new Date().getTime();
            this.BindWorflowObj.addProcessNode("processNode_" + name, {x:mp.x, y:mp.y, nodeType:this.dragModule.getAttribute("moduleType"), name:name});
            this.droppableFlag = false;
        }
        document.body.removeChild(this.dragModule);
        document.body.setAttribute("class", "");
    },
    HandleMouseup: function(oEvent) {
        console.log(oEvent);
    },
    HandleClick: function(oEvent) {
        var target = oEvent.target || oEvent.srcElement;
        //console.log(target);
        if ( target.getAttribute("toolType") == "action" ) {
            this.setActionMode(target.id.split("_")[1]);
        }
    },
    setActionMode: function(mode) {
        if ( !!document.getElementById("tool_" + this.ActionMode) ) {
            document.getElementById("tool_" + this.ActionMode).parentNode.setAttribute("class", "");
        }
        this.ActionMode = mode;
        document.getElementById("tool_" + this.ActionMode).parentNode.setAttribute("class", "selected");
        this.BindWorflowObj.setActionMode(mode);
    }
}

var ContextMenu = Class.create();
ContextMenu.prototype = {
    initialize: function(options) {
        //this.targetObj = obj;
        this.SetOptions(options);

        this.DomNode = this.GenDomNode();
        document.body.appendChild(this.DomNode);

        addEventHandler(this.DomNode, "click", BindAsEventListener(this, this.HandleClick));
    },
    destruct: function() {
        if ( !!this.DomNode ) {
            document.body.removeChild(this.DomNode);
            this.DomNode = null;
        }
    },
    SetOptions: function(options) {
        this.options = {//默认值
            x: 0,
            y: 0,
            menuList: null,
            targetObj: null,
            callback: null
        };
        Extend(this.options, options || {});
    },
    HandleClick: function(oEvent) {
        var target = oEvent.target || oEvent.srcElement;
        var opType = target.getAttribute("opType");
        if ( !!opType ) {
            this.options.targetObj[this.options.callback](opType);
            // switch (target.getAttribute("opType"))
            // {
            // case WorkFlowMapConst.OPTYPE_DELETE:
            //     this.TargetObj.destruct();
            //     break;
            // case WorkFlowMapConst.OPTYPE_RENAME:
            //     this.TargetObj.callModalDialog(WorkFlowMapConst.OPTYPE_RENAME);
            //     break;
            // case WorkFlowMapConst.OPTYPE_SETTING:
            //     this.TargetObj.callModalDialog(WorkFlowMapConst.OPTYPE_SETTING);
            //     break;
            // }
            this.destruct();
        }
    },
    GenDomNode: function() {
        var dn = document.createElement("div");
        var ul = document.createElement("ul");
        for ( var type in this.options.menuList ) {
            var li = document.createElement("li");
            if ( "sepLine" != type ) {
                li.appendChild(document.createTextNode(this.options.menuList[type]));
                li.setAttribute("opType", type);
            } else {
                li.setAttribute("class", type);
            }
            ul.appendChild(li);
        }
        dn.appendChild(ul);
        dn.setAttribute("class", "contextMenu");
        dn.setAttribute("style", "left:"+this.options.x+"px;top:"+this.options.y+"px");

        return dn;
    }
}

var ModalDialog = Class.create();
ModalDialog.prototype = {
    initialize: function(id, options) {
        this.objId = id;
        this.SetOptions(options);
        if ( "default"==this.options.buttons ) {
            this.options.buttons = {};
            this.options.buttons["完成"] = this.options.target.onModalDialogOK;
            this.options.buttons["取消"] = this.options.target.onModalDialogCancel;
        }

        this.TargetObj = this.options.target;
        this.DomNode = this.GenDomNode();
        document.body.appendChild(this.DomNode);
    },
    destruct: function() {
        if ( !!this.DomNode ) {
            document.body.removeChild(this.DomNode);
            this.DomNode = null;
        }
    },
    SetOptions: function(options) {
        this.options = {//默认值
            target: window,
            type: null,
            width: "300px",
            height: "auto",
            title: "对话框",
            contentHTML: "",
            contentDomNode: null,
            buttons: "default"
        };
        Extend(this.options, options || {});
    },
    GenDomNode: function() {
        var dn = document.createElement("div");
        dn.setAttribute("id", this.objId);
        dn.setAttribute("class", "modalDialog");
        var bg = document.createElement("div");
        bg.setAttribute("class", "modalBackground");
        dn.appendChild(bg);

        var box = document.createElement("div");
        box.setAttribute("class", "dialogBox");
        box.setAttribute("style", "width:"+this.options.width+";height:"+this.options.height+";margin-left:-"+ parseInt(this.options.width)/2 +"px;margin-top:-200px")
        var title = document.createElement("div");
        title.setAttribute("class", "title");
        title.appendChild(document.createTextNode(this.options.title));
        var content = this.options.contentDomNode;
        if ( null == content ) {
            content = document.createElement("div");
            content.innerHTML = this.options.contentHTML;
        }
        content.setAttribute("class", "content");
        var bottom = document.createElement("div");
        bottom.setAttribute("class", "bottom");
        for ( var name in this.options.buttons ) {
            var btn = document.createElement("div");
            btn.setAttribute("class", "btn");
            btn.innerText = name;
            addEventHandler(btn, "click", BindAsEventListener(this.TargetObj, this.options.buttons[name]));
            bottom.appendChild(btn);
        }
        box.appendChild(title);
        box.appendChild(content);
        box.appendChild(bottom);

        dn.appendChild(box);

        return dn;
    },
    getType: function() {
        return this.options.type;
    },
    getInputValue: function(id) {
        var input = document.getElementById(id);
        if ( !!input ) {
            if ("checkbox"==input.type) {
                if (true==input.checked)
                    return "1";
                else
                    return "0";
            } else {
                return input.value; 
            }
        } else{
            return null;
        }
    }
}

var TabsControl = Class.create();
TabsControl.prototype = {
    initialize: function(id, options) {
        this.objId = id;
        this.TabNum = 0;
        this.DisplayTab = 0;
        this.TabList = [];
        
        this.SetOptions(options);

        this.DomNode = this.GenDomNode();
        for ( var title in this.options.tabs ) {
            this.addTab(title, this.options.tabs[title]);
        }
    },
    SetOptions: function(options) {
        this.options = {
            type: "0", // "0":tab竖排 "1":tab横排
            tabs: {}
        };
        Extend(this.options, options || {});
    },
    GenDomNode: function() {
        var dn = document.createElement("div");
        dn.setAttribute("id", this.objId);

        var tabMenu = document.createElement("div");
        this.options.type=="1" ? tabMenu.setAttribute("class", "topTab") : tabMenu.setAttribute("class", "leftTab");

        this.TabMenuNode = document.createElement("ul")
        tabMenu.appendChild(this.TabMenuNode);

        addEventHandler(tabMenu, "click", BindAsEventListener(this, this.onClickTabMenu));
        dn.appendChild(tabMenu);
        return dn;
    },
    onClickTabMenu: function(e) {
        var target = e.target || e.srcElement;
        var i = parseInt(target.getAttribute("tabIndex"));
        if ( !!i && i!=this.displayTab ) {
            this.setDisplayTab(i);
        }
    },
    addTab: function(title, tab) {
        var li = document.createElement("li");
        li.appendChild(document.createTextNode(title));
        li.setAttribute("tabIndex", this.TabNum+1);
        this.TabMenuNode.appendChild(li);

        var content = document.createElement("div");
        content.setAttribute("id", this.objId+"_"+(this.TabNum+1));
        content.setAttribute("class", "tabContent");
        content.setAttribute("style", "display:none");
        if ( typeof tab == "String" )
            content.innerHTML = tab;
        else {
            content.appendChild(tab);
        }

        this.DomNode.appendChild(content);

        this.TabList[this.TabNum] = content;
        this.TabNum++;

        if ( 1==this.TabNum )
            this.setDisplayTab(1);
    },
    setDisplayTab: function(index) {
        var menus = this.TabMenuNode.getElementsByTagName("li");
        if ( this.DisplayTab>0 ) {
            menus[this.DisplayTab-1].setAttribute("class", "");
            this.TabList[this.DisplayTab-1].setAttribute("style", "display:none");
        }

        menus[index-1].setAttribute("class", "active");
        this.TabList[index-1].setAttribute("style", "");
        this.DisplayTab = index;
    }
}

var InputControl = Class.create();
InputControl.prototype = {
     initialize: function(id, options, value) {
        this.objId = id;
        this.value = !!value?value:"";
        
        this.SetOptions(options);

        this.DomNode = this.GenDomNode();
        addEventHandler(this.DomNode, "mousedown", BindAsEventListener(this, this.HandleMousedown));
    },
    SetOptions: function(options) {
        this.options = {
            title: "",
            type: "01",
            maxHeight: "350px",
            selectList: null
        };
        Extend(this.options, options || {});
    },
    GenDomNode: function() {
        var dn = document.createElement("li");

        dn.appendChild(document.createElementByHtml('<label>'+this.options.title+'</label>'));
        switch ( this.options.type ) {
        case "01": // 标准输入
            dn.appendChild(document.createElementByHtml('<input id="'+this.objId+'" type="text" value="'+this.value+'"/>'));
            break;
        case "02": // 多行输入
            dn.appendChild(document.createElementByHtml('<textarea id="'+this.objId+'">'+this.value+'</textarea>'));
            break;
        case "11": // 标准下拉框
            var html = '<select id="'+this.objId+'" value="'+this.value+'">';
            for ( var val in this.options.selectList ) {
                if ( val == this.value )
                    html += '<option value="'+val+'" selected>'+this.options.selectList[val]+'</option>';
                else
                    html += '<option value="'+val+'">'+this.options.selectList[val]+'</option>';
            }
            html += '</select>';
            dn.appendChild(document.createElementByHtml(html));
            break;
        case "12": // 多选下拉框
            var input = document.createElementByHtml('<input id="'+this.objId+'" type="text" ctrlType="multiSelect" class="multiSelectInput" readonly value="'+this.value+'"/>');
            this.InputNode = input;
            dn.appendChild(input);
            break;
        case "21": // 是否选框
            dn.appendChild(document.createElementByHtml('<input id="'+this.objId+'" type="checkbox" '+(this.value=="1"?'checked="checked"':'')+'"/>'));
            break;
        }
        return dn;
    },
    HandleMousedown: function(e) {
        var target = e.target || e.srcElement;
        //console.log(e);
        var ctrlType = target.getAttribute("ctrlType");
        switch(ctrlType) {
        case "multiSelect":
            //alert("多选下拉框");
            if ( !this.MultiSelectBox ) {
                this.MultiSelectBox = this.genMultiSelectBox();
                this.DomNode.appendChild(this.MultiSelectBox, this.InputNode);
                setTimeout(BindAsEventListener(this, function(){
                    this.MultiSelectBox.focus();
                }),100);
            } else {
                //this.DomNode.removeChild(this.MultiSelectBox);
                //this.MultiSelectBox = null;
            }
            break;
        }
    },
    genMultiSelectBox: function() {
        var div = document.createElement("div");
        div.setAttribute("tabIndex", "1");
        div.setAttribute("class", "multiSelectBox");
        div.setAttribute("for", this.objId);

        var minWidth = this.InputNode.clientWidth;
        var mLeft = this.InputNode.offsetLeft;
        div.setAttribute("style", "margin-top:-1px;left:"+mLeft+"px;min-width:"+minWidth+"px");

        var ul = document.createElement("ul");
        for (var key in this.options.selectList) {
            var h = '<li value="'+key+'">'+this.options.selectList[key]+'</li>';
            var li = document.createElementByHtml(h);
            ul.appendChild(li);
        }
        div.appendChild(ul);
        //this.SelectBox = div;
        addEventHandler(div, "click", BindAsEventListener(this, this.OnMultiSelectBoxClick));
        addEventHandler(div, "blur", BindAsEventListener(this, this.OnMultiSelectBoxBlur));
        return div;
        //this.DomNode.appendChild(div, this.InputNode);
    },
    OnMultiSelectBoxClick: function(e) {
        var target = e.target || e.srcElement;
        if ( "LI" == target.nodeName ) {
            if ( "selected" == target.getAttribute("class") ) {
                target.setAttribute("class", "");
            } else {
                target.setAttribute("class", "selected");
            }
            var list = [];
            var LIs = this.MultiSelectBox.getElementsByTagName("LI");
            for ( var i=0; i<LIs.length; i++ ) {
                if ("selected"==LIs[i].getAttribute("class")) {
                    list.push(LIs[i].innerText);
                }
            }
            this.setValue(list.join(","));
        }
    },
    OnMultiSelectBoxBlur: function(e) {
        this.DomNode.removeChild(this.MultiSelectBox);
        this.MultiSelectBox = null;
    },
    getHtml: function() {
        var div = document.createElement("div");
        div.appendChild(this.DomNode);
        return div.innerHTML;
    },
    getDomNode: function() {
        return this.DomNode;
    },
    getValue: function() {
        return this.DomNode.value;
    },
    setValue: function(val) {
        this.InputNode.value = val;
    }
}

var Vector2 = function(x, y) { this.x = parseFloat(x); this.y = parseFloat(y); };
Vector2.prototype = {
    copy: function() { return new Vector2(this.x, this.y); },
    length: function() { return Math.sqrt(this.x * this.x + this.y * this.y); },
    sqrLength: function() { return this.x * this.x + this.y * this.y; },
    normalize: function() { var inv = 1 / this.length(); return new Vector2(this.x * inv, this.y * inv); },
    negate: function() { return new Vector2(-this.x, -this.y); },
    add: function(v) { return new Vector2(this.x + v.x, this.y + v.y); },
    subtract: function(v) { return new Vector2(this.x - v.x, this.y - v.y); },
    multiply: function(f) { return new Vector2(this.x * f, this.y * f); },
    divide: function(f) { var invf = 1 / f; return new Vector2(this.x * invf, this.y * invf); },
    dot: function(v) { return this.x * v.x + this.y * v.y; },
    cross: function(v) { return this.x * v.y - this.y * v.x; },
    parseInt: function() { return new Vector2(parseInt(this.x), parseInt(this.y)); },
    equals: function(v) { return this.x == v.x && this.y == v.y }
}