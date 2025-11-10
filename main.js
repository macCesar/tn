const kitchen = require('./lib/kitchen');

exports.parse = function (args) {
  const tray = kitchen.cook(args);

  return tray ? tray.dinner : args;
};
