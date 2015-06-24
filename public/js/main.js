var testGuidepost = [
	{
		key: "A",
		test: "支持"
	}, {
		key: "B",
		test: "反对"
	}
]

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
        this.GPData = this.options.data;
        this.GPEditorMap = {};
        if ( !!this.Container ) {

            this.loadData(this.GPData);

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
    loadData: function(dat) {
        if ( !this.Container ) return;
        $(this.Container).empty();

        this.AddBtn = $('<button type="submit" class="btn btn-default" opt="add">Add</button>');
        this.AddBtn.appendTo(this.Container);

        this.GPData = dat;
        if ( !!dat && dat.length>0 ) {
            for ( var i=0,l=dat.length; i<l; i++ ) {
                this.AddOption(dat[i]);
            }
        }
        
    },
    AddOption: function(opt) {
        this.AddBtn.before('<div class="input-group"><span class="input-group-addon">'+opt.key+'</span><input type="text" class="form-control" placeholder="" value="'+opt.text+'" readonly><span class="input-group-btn"><button class="btn btn-default" type="button" opt="edit">Edit</button><button class="btn btn-danger" type="button" opt="del">Del</button></span></div>');

    },
    HandleClick: function(e) {
        console.log(e);
        console.log(this);
    }
}


$(function(){
    var editor = new GuidepostEditor({
        domId: 'inputGuidepost',
        data: [{
            key: 'A',
            text: '123' 
        }, {
            key: 'B',
            text: '321' 
        }]
    });
});