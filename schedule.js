var schedule = require('node-schedule');

var j = schedule.scheduleJob('10 * * * * *', function(){
    console.log(new Date());
});