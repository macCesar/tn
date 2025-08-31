'use strict';

const _ = require('lodash');
const { select, input } = require('@inquirer/prompts');

const config = require('./config'),
  recipes = require('./recipes'),
  logger = require('./logger'),
  utils = require('./utils'),
  chalk = require('chalk');

exports.cook = cook;
exports.confirm = confirm;

function cook(ingr, opts) {
  let pan, i;
  const tray = {};

  opts || (opts = {});

  // no ingredients, no cooking
  if (!_.isArray(ingr) || ingr.length === 0) {
    return;
  }

  // skip help, version and --skip
  if (_.intersection(ingr, ['-h', '--help', '-v', '--version']).length > 0) {
    return;
  }

  // don't change original object
  pan = _.clone(ingr);

  // --verbose
  if ((i = pan.indexOf('--verbose')) !== -1) {
    // remove
    pan.splice(i, 1);

    // set flag
    config.verbose = true;

    // save remainder as original recipe
    tray.recipe = _.clone(pan);
  }

  // first ingredient is a command recipe
  if (pan[0].substr(0, 1) !== '-' && recipes.has(pan[0])) {
    pan[0] = '--' + pan[0];
  }

  function heat(args, doNotOverheat, prefix) {
    let i, arg, matches, name, value, recipe, before, after;

    i = 0;

    // loop until end
    while (i < args.length) {
      arg = args[i];

      matches = arg.match(/^--([a-z0-9-]+)$/);

      if (matches) {
        name = matches[1];

        if (name && recipes.has(name)) {
          // prevent infinite loop
          if (doNotOverheat && _.contains(doNotOverheat, name)) {
            // config.verbose && logger.debug('Skipped ' + chalk.cyan(name) + chalk.white(' recursive recipe'));
          } else {
            // find if next arg is value
            value = args[i + 1] && args[i + 1].substr(0, 1) !== '-' ? args[i + 1] : null;

            config.verbose &&
              logger.debug(
                prefix +
                  'Cooking ' +
                  chalk.cyan(name) +
                  chalk.white(' recipe') +
                  (value ? ' with ' + chalk.cyan(value) : '') +
                  ' ..'
              );

            // replace recipe name (and value) with the args of the recipe
            recipe = recipes.get(name, value);
            recipe = heat(recipe, _.union(doNotOverheat || [], [name]), prefix + '  ');

            before = args.slice(0, i);
            after = args.slice(i + (value ? 2 : 1));

            args = before.concat(recipe, after);

            config.verbose &&
              logger.debug(
                prefix +
                  chalk.white('.. into: ') +
                  chalk.yellow(utils.join(before)) +
                  ' ' +
                  chalk.cyan(utils.join(recipe)) +
                  ' ' +
                  chalk.yellow(utils.join(after))
              );

            // hop over the heated recipe
            i += recipe.length - 1;
          }
        }
      }

      i++;
    }

    return args;
  }

  pan = heat(pan, null, '');

  pan = decorate(pan);

  tray.dinner = pan;

  return tray;
}

async function confirm(tray, eat) {
  try {
    const choice = await select({
      message: 'What would you like me to do?',
      choices: [
        {
          name: 'Execute: ' + chalk.yellow('ti ') + chalk.yellow(utils.join(tray.dinner)),
          value: 'execute',
        },
        {
          name: 'Save as recipe: ' + chalk.yellow(utils.join(tray.recipe)),
          value: 'save',
        },
        {
          name: 'Exit',
          value: 'exit',
        },
      ],
      default: 'execute',
    });

    if (choice === 'execute') {
      eat();
    } else if (choice === 'save') {
      try {
        const recipeName = await input({
          message: 'What do you want to name it?',
          validate: function (value) {
            if (/^([a-z0-9]+(?:-[a-z0-9]+)*)$/i.test(value)) {
              return true;
            }
            return 'Error: format as: my-Recipe';
          },
        });

        console.log();
        recipes.save(recipeName, tray.recipe);
        process.exit();
      } catch (saveErr) {
        console.log();
        console.error(chalk.red('' + saveErr));
        process.exit();
      }
    } else {
      process.exit();
    }
  } catch (err) {
    console.log();
    console.error(chalk.red('' + err));
    process.exit();
  }
}

function decorate(pan) {
  let platform, i, arg, matches, shrt, lng, j, l, dupe;

  // assume build
  if (pan[0][0] === '-') {
    pan.unshift('build');
  }

  // read the (last) platform
  if ((i = pan.lastIndexOf('--platform')) !== -1 || (i = pan.lastIndexOf('-p')) !== -1) {
    platform = pan[i + 1];
  }

  for (i = 0; i < pan.length; i++) {
    arg = pan[i];

    if (arg.substr(0, 1) === '-') {
      matches = arg.match(/^-([a-z])$/i);

      // resolve aliases
      if (matches) {
        shrt = matches[1];

        if (config.aliases.shared[shrt]) {
          lng = config.aliases.shared[shrt];
        } else if (config[platform] && config[platform][shrt]) {
          lng = config[platform][shrt];
        } else {
          lng = null;
        }

        if (lng) {
          pan[i] = '--' + lng;

          config.verbose &&
            logger.debug(
              'Resolved ' +
                chalk.cyan(shrt) +
                chalk.white(' option alias: ') +
                chalk.yellow('ti ') +
                chalk.yellow(utils.join(pan))
            );
        }
      }

      // remove earlier duplicates
      for (j = 0; j < i; j++) {
        if (pan[j] === pan[i]) {
          l = pan[j + 1] && pan[j + 1].substr(0, 1) !== '-' ? 2 : 1;

          dupe = pan.slice(j, j + l);

          // remove duplicate option (+ value) and rebase i
          i = i - pan.splice(j, l).length;

          config.verbose &&
            logger.debug(
              'Removed ' +
                chalk.cyan(utils.join(dupe)) +
                chalk.white(' duplicate: ') +
                chalk.yellow('ti ') +
                chalk.yellow(utils.join(pan))
            );
        }
      }
    }
  }

  return pan;
}
