express = require('express')
http = require("http")
Settings = require('settings-sharelatex')
logger = require('logger-sharelatex')
logger.initialize("merge")
redis = require('redis')
#Errors = require "./app/js/Errors"
MergeController = require "./app/js/MergeController"

redisConf = Settings.redis.web
rclient = redis.createClient(redisConf.port, redisConf.host)
rclient.auth(redisConf.password)

Path = require "path"
Metrics = require "metrics-sharelatex"
Metrics.initialize("merge")
#Metrics.mongodb.monitor(Path.resolve(__dirname + "/node_modules/mongojs/node_modules/mongodb"), logger)

app = express()
app.configure ->
	app.use(Metrics.http.monitor(logger));
	app.use express.bodyParser()
	app.use app.router
###
rclient.subscribe("pending-updates")
rclient.on "message", (channel, doc_key) ->
	[project_id, doc_id] = Keys.splitProjectIdAndDocId(doc_key)
	if !Settings.shuttingDown
		UpdateManager.processOutstandingUpdatesWithLock project_id, doc_id, (error) ->
			logger.error err: error, project_id: project_id, doc_id: doc_id, "error processing update" if error?
	else
		logger.log project_id: project_id, doc_id: doc_id, "ignoring incoming update"
###

app.get '/status', (req, res)->
	if Settings.shuttingDown
		res.send 503 # Service unavailable
	else
		res.send('merger is alive')

shutdownCleanly = (signal) ->
	return () ->
		logger.log signal: signal, "received interrupt, cleaning up"
		Settings.shuttingDown = true
		setTimeout () ->
			logger.log signal: signal, "shutting down"
			process.exit()
		, 10000

port = Settings.internal?.merger?.port or Settings.apis?.merger?.port or 3042

# for testing
app.post '/mergeTest', MergeController.merge
app.get	'/mergeTest', (req, res) ->
	res.send	"""
				<html>
					<head><title>Merge Test</title></head>
					<body>
						<form action="http://127.0.0.1:#{port}/mergeTest" method="POST">
							<label for="mine">Mine:</label><br>
							<textarea id="mine" name="mine" rows="5" cols="50"></textarea>
							<br><br>
							<label for="origin">Origin:</label><br>
							<textarea id="origin" name="origin" rows="5" cols="50"></textarea>
							<br><br>
							<label for="origin">Yours:</label><br>
							<textarea id="yours" name="yours" rows="5" cols="50"></textarea>
							<br><br>
							<input type="submit">
						</form>
					</body>
				</html>
			"""


app.listen port, "localhost", ->
	logger.log("merge-sharelatex server listening on port #{port}")

for signal in ['SIGINT', 'SIGHUP', 'SIGQUIT', 'SIGUSR1', 'SIGUSR2', 'SIGTERM', 'SIGABRT']
	process.on signal, shutdownCleanly(signal)
