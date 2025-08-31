const chalk = require('chalk'),
  _ = require('lodash');

const levels = {
  info: {
    color: chalk.white,
  },
  trace: {
    color: chalk.gray,
  },
  debug: {
    color: chalk.blue,
    level: 'log',
  },
  error: {
    color: chalk.red,
  },
  warn: {
    color: chalk.yellow,
  },
  ok: {
    color: chalk.green,
    level: 'info',
  },
};

_.each(levels, function (settings, label) {
  exports[label] = function (msg) {
    console[settings.level || label](
      settings.color('[' + label.toUpperCase() + ']') +
        (label.length !== 5 ? new Array(6 - label.length).join(' ') : '') +
        ' ' +
        msg
    );
  };
});
