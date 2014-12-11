(function() {
  var MergeController, Merger;

  Merger = require('./Merger');

  module.exports = MergeController = {
    merge: function(req, res, next) {
      var mineLines, originLines, yoursLines, _ref, _ref1, _ref2;
      if (next == null) {
        next = function(error) {};
      }
      if ((req != null ? (_ref = req.body) != null ? _ref.mine : void 0 : void 0) == null) {
        return next("MergeController.merge: missing 'mine' POST data");
      }
      if ((req != null ? (_ref1 = req.body) != null ? _ref1.origin : void 0 : void 0) == null) {
        return next("MergeController.merge: missing 'origin' POST data");
      }
      if ((req != null ? (_ref2 = req.body) != null ? _ref2.yours : void 0 : void 0) == null) {
        return next("MergeController.merge: missing 'yours' POST data");
      }
      mineLines = req.body.mine.split('\r\n');
      originLines = req.body.origin.split('\r\n');
      yoursLines = req.body.yours.split('\r\n');
      return Merger.merge(req.body.mine, req.body.origin, req.body.yours, function(error, result, conflicts) {
        var msg;
        if (error != null) {
          return next(error);
        } else {
          msg = "Mine:<br> " + (req.body.mine.replace('\r\n', '<br>')) + " <br><br> Origin:<br> " + (req.body.origin.replace('\r\n', '<br>')) + " <br><br> Yours:<br> " + (req.body.yours.replace('\r\n', '<br>')) + " <br><br> Merged:<br> " + (result.replace('\r\n', '<br>'));
          if (conflicts) {
            msg += '<br><br>Conflicts have been detected. <br> Some data may have been lost.';
          }
          return res.send(msg);
        }
      });
    }
  };

}).call(this);
