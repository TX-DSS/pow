$(function(){
    $("#workCalendar").zabuto_calendar({
        language: 'zh',
        cell_border: true,
        today: true,
        show_days: true,
        weekstartson: 0,
        action: function () {
            return myDateFunction(this.id, false);
        },
        action_nav: function () {
            return myNavFunction(this.id);
        }
    });

    $('#tblAppendGrid').appendGrid({
        //caption: 'My CD Collections',
        initRows: 1,
        columns: [
            { name: 'workitem', display: '事项', type: 'text', ctrlAttr: { maxlength: 100 }, ctrlCss: { width: '100%'} },
            { name: 'type', display: '类型', type: 'select', ctrlOptions: { 0: '', 1: '开发', 2: '测试'}, ctrlCss: { width: '100%'} },
            { name: 'cmpltPer', display: '完成度', type: 'select', ctrlOptions: { 0: '10%', 1: '50%', 2: '100%'}, ctrlCss: { width: '100%'} }
        ]
    });
    // $('#tblAppendGrid').appendGrid('load', [
    //     { 'Album': 'Dearest', 'Artist': 'Theresa Fu', 'Year': '2009', 'Origin': 1, 'Poster': true, 'Price': 168.9, 'RecordId': 123 },
    //     { 'Album': 'To be Free', 'Artist': 'Arashi', 'Year': '2010', 'Origin': 3, 'Poster': true, 'Price': 152.6, 'RecordId': 125 },
    //     { 'Album': 'Count On Me', 'Artist': 'Show Luo', 'Year': '2012', 'Origin': 2, 'Poster': false, 'Price': 306.8, 'RecordId': 127 },
    //     { 'Album': 'Wonder Party', 'Artist': 'Wonder Girls', 'Year': '2012', 'Origin': 4, 'Poster': true, 'Price': 108.6, 'RecordId': 129 },
    //     { 'Album': 'Reflection', 'Artist': 'Kelly Chen', 'Year': '2013', 'Origin': 1, 'Poster': false, 'Price': 138.2, 'RecordId': 131 }
    // ]);
})

function myDateFunction(id, fromModal) {
    if (fromModal) {
        $("#" + id + "_modal").modal("hide");
    }
    var date = $("#" + id).data("date");
    var hasEvent = $("#" + id).data("hasEvent");
    console.log(date);
    if (hasEvent && !fromModal) {
        return false;
    }
    return true;
}

function myNavFunction(id) {
    $("#date-popover").hide();
    var nav = $("#" + id).data("navigation");
    var to = $("#" + id).data("to");
    console.log('nav ' + nav + ' to: ' + to.month + '/' + to.year);
}
