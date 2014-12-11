(function() {
  var MergeController, Metrics, Path, Settings, app, express, http, logger, port, rclient, redis, redisConf, shutdownCleanly, signal, _i, _len, _ref, _ref1, _ref2, _ref3, _ref4;

  express = require('express');

  http = require("http");

  Settings = require('settings-sharelatex');

  logger = require('logger-sharelatex');

  logger.initialize("merge");

  redis = require('redis');

  MergeController = require("./app/js/MergeController");

  redisConf = Settings.redis.web;

  rclient = redis.createClient(redisConf.port, redisConf.host);

  rclient.auth(redisConf.password);

  Path = require("path");

  Metrics = require("metrics-sharelatex");

  Metrics.initialize("merge");

  app = express();

  app.configure(function() {
    app.use(Metrics.http.monitor(logger));
    app.use(express.bodyParser());
    return app.use(app.router);
  });


  /*
  rclient.subscribe("pending-updates")
  rclient.on "message", (channel, doc_key) ->
  	[project_id, doc_id] = Keys.splitProjectIdAndDocId(doc_key)
  	if !Settings.shuttingDown
  		UpdateManager.processOutstandingUpdatesWithLock project_id, doc_id, (error) ->
  			logger.error err: error, project_id: project_id, doc_id: doc_id, "error processing update" if error?
  	else
  		logger.log project_id: project_id, doc_id: doc_id, "ignoring incoming update"
   */

  app.get('/status', function(req, res) {
    if (Settings.shuttingDown) {
      return res.send(503);
    } else {
      return res.send('merger is alive');
    }
  });

  shutdownCleanly = function(signal) {
    return function() {
      logger.log({
        signal: signal
      }, "received interrupt, cleaning up");
      Settings.shuttingDown = true;
      return setTimeout(function() {
        logger.log({
          signal: signal
        }, "shutting down");
        return process.exit();
      }, 10000);
    };
  };

  port = ((_ref = Settings.internal) != null ? (_ref1 = _ref.merger) != null ? _ref1.port : void 0 : void 0) || ((_ref2 = Settings.apis) != null ? (_ref3 = _ref2.merger) != null ? _ref3.port : void 0 : void 0) || 3042;

  app.post('/mergeTest', MergeController.merge);

  app.get('/mergeTest', function(req, res) {
    return res.send("<html>\n	<head><title>Merge Test</title></head>\n	<body>\n		<form action=\"http://127.0.0.1:" + port + "/mergeTest\" method=\"POST\">\n			<label for=\"mine\">Mine:</label><br>\n			<textarea id=\"mine\" name=\"mine\" rows=\"5\" cols=\"50\"></textarea>\n			<br><br>\n			<label for=\"origin\">Origin:</label><br>\n			<textarea id=\"origin\" name=\"origin\" rows=\"5\" cols=\"50\"></textarea>\n			<br><br>\n			<label for=\"origin\">Yours:</label><br>\n			<textarea id=\"yours\" name=\"yours\" rows=\"5\" cols=\"50\"></textarea>\n			<br><br>\n			<input type=\"submit\">\n		</form>\n	</body>\n</html>");
  });

  app.listen(port, "localhost", function() {
    return logger.log("merge-sharelatex server listening on port " + port);
  });

  _ref4 = ['SIGINT', 'SIGHUP', 'SIGQUIT', 'SIGUSR1', 'SIGUSR2', 'SIGTERM', 'SIGABRT'];
  for (_i = 0, _len = _ref4.length; _i < _len; _i++) {
    signal = _ref4[_i];
    process.on(signal, shutdownCleanly(signal));
  }

}).call(this);
