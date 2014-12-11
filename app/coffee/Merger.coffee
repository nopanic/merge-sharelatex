diff_match_patch = require("../lib/diff_match_patch").diff_match_patch
dmp = new diff_match_patch()

module.exports = Merger =
	###
	Arguments are text blocks.
	callback's merged argument will be a text block containing the merged text.
	callback's conflicts is a boolean that is set to true when some part of the merging failed.
	###
	merge: (mine, origin, yours, callback = (error, merged, conflicts) ->) ->
		[result, success] = dmp.patch_apply dmp.patch_make(origin, yours), mine
		conf = false
		if success?
			for b in success
				unless b
					conf = true
					break

		callback(null, result, conf)
