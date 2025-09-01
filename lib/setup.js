#!/usr/bin/env node

const path = require('path');
const { spawn } = require('child_process');

const logger = require('./logger'),
  recipes = require('./recipes');

exports.uninstall = uninstall;
exports.generate = generate;

const PATH = path.resolve(__dirname, '..', 'hooks');

function uninstall() {
  logger.info('Uninstalling the old 2.x Titanium CLI hook..\n');

  spawn('ti', ['config', 'paths.hooks', '--remove', PATH], {
    stdio: 'inherit',
  });
}

function generate() {
  logger.info('Looking up connected devices, emulators and simulators..');

  const tiProcess = spawn('ti', ['info', '-o', 'json'], { stdio: ['inherit', 'pipe', 'pipe'] });
  let stdout = '';
  let stderr = '';

  tiProcess.stdout.on('data', (data) => {
    stdout += data;
  });

  tiProcess.stderr.on('data', (data) => {
    stderr += data;
  });

  tiProcess.on('close', (code) => {
    if (code !== 0) {
      logger.error('Failed to read Titanium info: ' + JSON.stringify([code, stderr]));
    } else {
      console.log();

      const config = JSON.parse(stdout);

      if (config.android) {
        if (config.android.emulators && config.android.emulators.length > 0) {
          config.android.emulators.forEach(function forEach(dev) {
            const name = dev.name
              .toLowerCase()
              .replace(/\.+/g, '')
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/-$/, '');
            const recipe = ['--android', '--emulator', '--device-id', dev.name];

            if (!recipes.has(name) || !arraysIdentical(recipes.get(name), recipe)) {
              recipes.save(name, recipe);
            }
          });
        }

        if (config.android.devices && config.android.devices.length > 0) {
          config.android.devices.forEach(function forEach(dev) {
            const name = dev.name
              .toLowerCase()
              .replace(/\.+/g, '')
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/-$/, '');
            const recipe = ['--android', '--device', '--device-id', dev.id];

            if (!recipes.has(name) || !arraysIdentical(recipes.get(name), recipe)) {
              recipes.save(name, recipe);
            }
          });
        }
      }

      if (config.ios) {
        if (config.ios.devices && config.ios.devices.length > 0) {
          config.ios.devices.forEach(function forEach(dev) {
            if (dev.udid === 'itunes') {
              return;
            }

            const name = dev.name
              .toLowerCase()
              .replace(/[()]/g, '')
              .replace(/[^a-z0-9]+/g, '-');

            const recipe = ['--ios', '--device', '--device-id', dev.udid];

            if (!recipes.has(name) || !arraysIdentical(recipes.get(name), recipe)) {
              recipes.save(name, recipe);
            }
          });
        }

        if (config.ios.simulators) {
          let version;
          const versions = [];

          // Ti 5.0 has a ios and watch object
          const iosSims = config.ios.simulators.ios
            ? config.ios.simulators.ios
            : config.ios.simulators;

          for (version in iosSims) {
            versions.push(version);
          }

          // we want newest versoon first
          versions.sort();
          versions.reverse();

          versions.forEach(function forEach(version) {
            iosSims[version].forEach(function forEach(dev) {
              let name = dev.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/-$/, '');
              const recipe = ['--ios', '--simulator', '--device-id', dev.udid];

              if (recipes.has(name) && versions[0] !== version) {
                name = name + '-ios' + version.replace(/\./, '');
              }

              if (!recipes.has(name) || !arraysIdentical(recipes.get(name), recipe)) {
                recipes.save(name, recipe);
              }
            });
          });
        }
      }

      logger.info('Done');
    }
  });
}

function arraysIdentical(a, b) {
  let i = a.length;

  if (i !== b.length) {
    return false;
  }

  while (i--) {
    if (a[i] !== b[i]) {
      return false;
    }
  }

  return true;
}
