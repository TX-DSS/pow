(function(exports){
    var Class = {
        create : function() {
            return function() {
                this.initialize.apply(this, arguments);
            }
        }
    }

    var Bind = function(tar, func) {
        return function() {
            func.apply(tar, arguments);
        }
    }

    var GuidepostEditor = Class.create();
    GuidepostEditor.prototype = {
        initialize: function(options) {
            this.SetOptions(options);
            this.Container = $('#'+this.options.domId)[0];
            this.GPData = [];
            if ( !!this.Container ) {
                this.AddBtn = $('<button type="button" class="btn btn-default" opt="add">Add</button>');
                this.AddBtn.appendTo(this.Container);
                this.setData(this.options.data);

                $(this.Container).bind('click', Bind(this, this.HandleClick));
            }
        },
        SetOptions: function(options) {
            this.options = {
                domId: '',
                mode: 'edit',
                data: []
            };
            $.extend(this.options, options || {});
        },
        setData: function(dat) {
            if ( !this.Container ) return;
            $('.guidepostRow', this.Container).detach();
            this.GPData = [];

            if ( !!dat && dat.length>0 ) {
                for ( var i=0,l=dat.length; i<l; i++ ) {
                    this.AddRow(dat[i]);
                }
            }  
        },
        getData: function(argument) {
            return this.GPData;
        },
        AddRow: function(opt) {
            if ( undefined === opt ) {
                opt = {
                    key: '',
                    text: ''
                }
            }
            this.AddBtn.before('<div class="guidepostRow" rowindex="'+this.GPData.length+'"><div class="input-group"><span class="input-group-addon">'+opt.key+'</span><input type="text" class="form-control" placeholder="" value="'+opt.text+'" readonly><span class="input-group-btn"><button class="btn btn-default" type="button" opt="edit">Edit</button><button class="btn btn-danger" type="button" opt="del">Del</button></span></div><div class="panel panel-default hide"><div class="panel-body"><div class="input-group input-group-sm"><span class="input-group-addon">key</span><input type="text" name="key" class="form-control" placeholder="" value="'+opt.key+'"></div><div class="input-group input-group-sm"><span class="input-group-addon">text</span><input type="text" name="text" class="form-control" placeholder="" value="'+opt.text+'"></div></div></div></div>');
            this.GPData.push(opt);
        },
        SavaRow: function(row) {
            var index = row.attr('rowindex');
            var key = $('input[name="key"]', row).val();
            var text = $('input[name="text"]', row).val();
            this.GPData[index] = {
                key: key,
                text: text
            }

            $('>div.input-group>span.input-group-addon', row).html(key);
            $('>div.input-group>input', row).val(text);

            $('.panel', row).addClass('hide');
            var btnSave = $('button[opt="save"]', row);
            btnSave.html('Edit');
            btnSave.attr('opt', 'edit');
        },
        EditRow: function(row) {
            $('.panel', row).removeClass('hide');
            var btnEdit = $('button[opt="edit"]', row);
            btnEdit.html('Save');
            btnEdit.attr('opt', 'save');
        },
        DelRow: function(row) {
            var index = row.attr('rowindex');
            row.detach();
            this.GPData.splice(index, 1);
        },
        HandleClick: function(e) {
            if ( 'BUTTON' === e.target.nodeName ) {
                var opt = $(e.target).attr('opt');
                var row = $(e.target).parent().parent().parent();
                switch (opt) {
                    case 'edit':
                        this.EditRow(row);
                        break;
                    case 'save':
                        this.SavaRow(row);
                        break;
                    case 'add':
                        this.AddRow();
                        break;
                    case 'del':
                        this.DelRow(row);
                        break;
                    default:
                }
            }
        }
    }

    var SpotEditor = Class.create();
    SpotEditor.prototype = {
        initialize: function(options) {
            this.SetOptions(options);
            this.Container = $('#'+this.options.domId)[0];
            this.guidepostEditor = new GuidepostEditor({
                domId: 'inputGuidepost',
                data: []
            });
        },
        SetOptions: function(options) {
            this.options = {
                domId: '',
                mode: 'edit',
                spotTypeOpts: {
                    "A0100": {
                        name: "新闻资讯",
                        defaultGP: [
                            {
                                key: "",
                                text: "赞"
                            }
                        ]
                    },
                    "A0200": "知识技巧",
                    "A0300": "观点言论",
                    "A0400": "故事短文",
                    "A0500": "你问我答"
                },
                data: []
            };
            $.extend(this.options, options || {});
        },
        initSpotInfo: function() {
            this.spotInfo = {};
            $('#inputNo').val('');
            $('#inputType').val('A0100');
            $('#inputSummary').val('');
            $('#inputDescription').val('');
            this.guidepostEditor.setData([]);
        },
        setSpotInfo: function(info) {
            this.spotInfo = info;
            $('#inputNo').val(info.spotId);
            $('#inputType').val(info.spotType);
            $('#inputSummary').val(info.summary);
            $('#inputDescription').val(info.description);
            this.guidepostEditor.setData(info.guidepost);
        },
        getSpotInfo: function() {
            var info = {
                spotId: $('#inputNo').val(),
                spotType: $('#inputType').val(),
                summary: $('#inputSummary').val(),
                description: $('#inputDescription').val(),
                guidepost: this.guidepostEditor.getData()
            }
            return $.extend(this.spotInfo, info);
        },
        setEditMode: function(mode) {

        }
    }

    exports.SpotEditor = SpotEditor;

})(window);

$(function(){
    var editor = new SpotEditor({
        domId: 'spotEditorContainer'
    });

    function createSpot() {
        var spotData = editor.getSpotInfo();
        console.log(spotData);
        $.ajax({
            method: "POST",
            url: "http://api.pow.com:3000/spot/create",
            data: spotData
        }).done(function(msg) {
            console.log(msg);

            if ( !msg.isSuccess ) return;

            $('#queryNo').val(msg.result.spotId);
            $('#querySpotBtn').click();
            alert("Created");
        });
    }

    function modifySpot() {
        var spotData = editor.getSpotInfo();
        console.log(spotData);
        $.ajax({
            method: "POST",
            url: "http://api.pow.com:3000/spot/update",
            data: spotData
        }).done(function(msg) {
            console.log(msg);
            
            if ( !msg.isSuccess ) return;

            $('#queryNo').val(msg.result.spotId);
            $('#querySpotBtn').click();
            alert("Modified");
        });

    }

    function deleteSpot() {
        
    }

    function querySpot() {
        var id = $('#queryNo').val();
        if ( !id ) return;
        $.ajax({
            method: "GET",
            url: "http://api.pow.com:3000/spot/"+id
        }).done(function(msg) {
            console.log(msg);

            if ( !msg.isSuccess ) return;

            var rest = msg.result;
            if ( !!rest && rest.length == 1 ) {
                $('#createSpot').attr('disabled', 'disabled');
                editor.setSpotInfo(rest[0]);
            } else {
                alert('No Data');
            }
        });

    }

    function initSpot() {
        editor.initSpotInfo();
    }

    $('#querySpotBtn').bind('click', querySpot);
    $('#newSpotBtn').bind('click', initSpot);
    $('#createSpotBtn').bind('click', createSpot);
    $('#modifySpotBtn').bind('click', modifySpot);
    $('#deleteSpotBtn').bind('click', deleteSpot);

});