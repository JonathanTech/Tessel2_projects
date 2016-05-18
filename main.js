(function () {
  "use strict";
  var nts = require('node-task-scheduler');
  var http = require('http');
  var dispatcher = require('httpdispatcher');
  var tessel = require('tessel')
  var stocks = require('./stocks.js')


  init();

  function startScheduler() {
    var scheduler = nts.init({
                               tasksDir: __dirname + '/tasks'
                             });

    global.scheduler = scheduler;

    scheduler.start(function (taskNames) {
      console.log("Previous tasks loaded:");
      (taskNames || []).forEach(function (taskName) {
        console.log(taskName);
      });
    });
  }

  function setupDispatcher() {
    dispatcher.setStatic('tasks');
  }

  function setupFirstTask(){
    var everyWeekday = '* * 17 * * 1-5';
    var every60Seconds = '20 * * * * *'
    global.scheduler.addTask('stocks', { path:__dirname + '/stocks.js'}, function(args, callback){
      console.log("Task running");
      var stocks = require(args.path)
      stocks.getStockValueForToday(function () {
        console.log("Task callback???");
        callback()
      })
    }, every60Seconds);

  }

  function handleRequest(request, response) {
    try {
      console.log(request.url);
      dispatcher.dispatch(request, response);
    } catch (err) {
      console.log(err);
    }
  }

  function init() {
    setupDispatcher()
    startServer()
  }

  function startServer() {
    const PORT = 80;

    var server = http.createServer(handleRequest);

    server.listen(PORT, function () {
      console.log("Server listening on: http://localhost:%s", PORT);
      startScheduler()
      setupFirstTask()
    });
  }
})()