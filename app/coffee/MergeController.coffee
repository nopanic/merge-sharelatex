Merger = require './Merger'

module.exports = MergeController =
	merge: (req, res, next = (error) ->) ->
		if not req?.body?.mine?
			return next "MergeController.merge: missing 'mine' POST data"

		if not req?.body?.origin?
			return next "MergeController.merge: missing 'origin' POST data"

		if not req?.body?.yours?
			return next "MergeController.merge: missing 'yours' POST data"

		mineLines = req.body.mine.split('\r\n')
		originLines = req.body.origin.split('\r\n')
		yoursLines = req.body.yours.split('\r\n')

		Merger.merge(
			req.body.mine
			req.body.origin
			req.body.yours
			(error, result, conflicts) ->
				if error?
					return next error
				else
					msg =	"
							Mine:<br>
							#{req.body.mine.replace '\r\n', '<br>'}
							<br><br>

							Origin:<br>
							#{req.body.origin.replace '\r\n', '<br>'}
							<br><br>

							Yours:<br>
							#{req.body.yours.replace '\r\n', '<br>'}
							<br><br>

							Merged:<br>
							#{result.replace '\r\n', '<br>'}
							"
					

					if conflicts
						msg +=	'<br><br>Conflicts have been detected.
								 <br> Some data may have been lost.'

					res.send msg
		)
