(function() {
  var Merger, diff_match_patch, dmp;

  diff_match_patch = require("../lib/diff_match_patch").diff_match_patch;

  dmp = new diff_match_patch();

  module.exports = Merger = {

    /*
    	Arguments are text blocks.
    	callback's merged argument will be a text block containing the merged text.
    	callback's conflicts is a boolean that is set to true when some part of the merging failed.
     */
    merge: function(mine, origin, yours, callback) {
      var b, conf, result, success, _i, _len, _ref;
      if (callback == null) {
        callback = function(error, merged, conflicts) {};
      }
      _ref = dmp.patch_apply(dmp.patch_make(origin, yours), mine), result = _ref[0], success = _ref[1];
      conf = false;
      if (success != null) {
        for (_i = 0, _len = success.length; _i < _len; _i++) {
          b = success[_i];
          if (!b) {
            conf = true;
            break;
          }
        }
      }
      return callback(null, result, conf);
    }
  };

}).call(this);
