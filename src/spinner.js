var sprintf = require('util').format;
var helpers = {
  // Make a console spinner.
  // Code based on code from Mocha by Visionmedia/Tj
  // https://github.com/visionmedia/mocha/blob/master/bin/_mocha
  Spinner: function(message, style, refreshTick = 70) {
    var spinnerMessage = message;
    var spinnerStyle = style;
    var pos;

    this.start = function(xOffset, yOffset) {
      var self = this;
      var spinner = spinnerStyle;
      if (xOffset && yOffset) {
        pos = [xOffset, yOffset];
      }

      if (!spinner || spinner.length === 0) {
        spinner =
          'win32' == process.platform ? ['|', '/', '-', '\\'] : ['◜', '◠', '◝', '◞', '◡', '◟'];
      }

      function play(arr, interval) {
        var len = arr.length,
          i = 0;
        interval = interval || 100;

        var drawTick = function() {
          var str = arr[i++ % len];
          var spacer = new Array(pos[0] || 0).join(' ');
          if (pos) {
            process.stdout.cursorTo(pos[0], pos[1]);
          }
          process.stdout.write('\u001b[0g' + str + '\u001b[90m' + spinnerMessage + '\u001b[0m');
        };

        self.timer = setInterval(drawTick, interval);
      }

      var frames = spinner.map(function(c) {
        return sprintf('  \u001b[96m%s ', c);
      });

      play(frames, refreshTick);
    };

    this.message = function(message) {
      spinnerMessage = message;
    };

    this.stop = function() {
      process.stdout.write('\u001b[0G\u001b[2K');
      clearInterval(this.timer);
    };

    this.isSpinning = function() {
      return !!this.timer;
    };
  },
};

module.exports = helpers;
