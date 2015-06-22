
exports.home = function(req, res){
    res.render('admin/home');
};

exports.spot = function(req, res){
    res.render('admin/spot', { 
        sid: ""
    } );
};
