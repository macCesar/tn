const _ = require('lodash');

exports.join = join;

function join(args) {
  let joined = '';

  _.each(args, function (arg) {
    // has space
    if (arg.indexOf(' ') !== -1) {
      joined += ' "' + arg + '"';
    } else {
      joined += ' ' + arg;
    }
  });

  joined = joined.substr(1);

  return joined;
}
