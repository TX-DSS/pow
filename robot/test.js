var page = require('webpage').create();
var url = 'https://www.baidu.com';
// page.onResourceRequested = function(request) {
//   console.log('Request ' + JSON.stringify(request, undefined, 4));
// };
// page.onResourceReceived = function(response) {
//   console.log('Receive ' + JSON.stringify(response, undefined, 4));
// };

function printArgs() {
    var i, ilen;
    for (i = 0, ilen = arguments.length; i < ilen; ++i) {
        console.log("    arguments[" + i + "] = " + JSON.stringify(arguments[i]));
    }
    console.log("");
}

page.onUrlChanged = function() {
    //page.render('example.png');
    console.log("page.onUrlChanged");
    printArgs.apply(this, arguments);
}
page.open(url, function(status) {
    // var title = page.evaluate(function() {
    //   return document.title;
    // });
    // console.log('Page title is ' + title);
    // phantom.exit();
    console.log("Status: " + status);
    // if(status === "success") {
    //   page.render('example.png');
    // }
    //phantom.exit();
    //page.includeJs("http://code.jquery.com/jquery-2.1.1.min.js", function() {
        // page.evaluate(function() {
        //     $("#kw").val('12345');
        //     console.log($("#kw").val());
        //     $("#su").click();
        // });
        //phantom.exit()
    //});
});

setTimeout(function() {
    page.evaluate(function() {
        document.getElementById('kw').value = '12345';
        document.getElementById('su').click();
        // $("#kw").val('12345');
        // console.log($("#kw").val());
        //$("#su").click();
    });
}, 5000);


setTimeout(function() {
   page.render('example.png');
}, 8000);
