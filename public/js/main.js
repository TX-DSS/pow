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

var guidepostEditor = Class.create();
GuidepostEditor.prototype = {
    initialize: function(options) {
        this.SetOptions(options);

    },
    SetOptions: function(options) {
        this.options = {
            domId: '',
            mode: 'edit',
            data: [{
                key: 'A',
                text: '' 
            }, {
                key: 'B',
                text: '' 
            }]
        };
        $.extend(this.options, options || {});
    },
    loadData: function(dat) {
        if ( !this.options.domId ) return;
        $('#'+this.options.domId).empty();
        
    }
}
