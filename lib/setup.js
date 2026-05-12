#!/usr/bin/env node

const path = require('path');
const { spawn } = require('child_process');

const { confirm } = require('@inquirer/prompts');

const logger = require('./logger'),
  recipes = require('./recipes'),
  utils = require('./utils'),
  chalk = require('chalk');

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

  tiProcess.on('close', async (code) => {
    if (code !== 0) {
      logger.error('Failed to read Titanium info: ' + JSON.stringify([code, stderr]));
    } else {
      console.log();

      const config = JSON.parse(stdout);
      const saved = [];
      const savedIds = new Set();
      const activeIosUdids = new Set();
      const activeAndroidIds = new Set();

      if (config.android) {
        if (config.android.emulators && config.android.emulators.length > 0) {
          config.android.emulators.forEach(function forEach(dev) {
            const name = dev.name
              .toLowerCase()
              .replace(/\.+/g, '')
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/-$/, '');
            const emulatorId = dev.id || dev.name;
            const recipe = ['--android', '--emulator', '--device-id', emulatorId];

            activeAndroidIds.add(emulatorId);

            if (!recipes.has(name) || !arraysIdentical(recipes.get(name), recipe)) {
              saved.push(recipes.save(name, recipe, 'user', true));
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
              saved.push(recipes.save(name, recipe, 'user', true));
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
              saved.push(recipes.save(name, recipe, 'user', true));
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
              if (savedIds.has(dev.udid)) return;

              let name = dev.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/-$/, '');
              const recipe = ['--ios', '--simulator', '--device-id', dev.udid];

              activeIosUdids.add(dev.udid);

              if (recipes.has(name) && versions[0] !== version) {
                const existing = recipes.get(name);
                const existingId = existing[existing.indexOf('--device-id') + 1];
                if (existingId !== dev.udid) {
                  name = name + '-ios' + version.replace(/\./, '');
                }
              }

              if (!recipes.has(name) || !arraysIdentical(recipes.get(name), recipe)) {
                saved.push(recipes.save(name, recipe, 'user', true));
              }
              savedIds.add(dev.udid);
            });
          });
        }
      }

      if (saved.length === 0) {
        logger.info('All recipes are up to date.');
      } else {
        saved.forEach(({ recipe, args, clr }) => {
          console.log('  ' + recipe + ': ' + chalk[clr](utils.join(args)));
        });
        console.log();
      }

      const simctlUdids = await getActiveIosUdidsFromSimctl();
      const orphans = recipes.listOrphans(simctlUdids || activeIosUdids, activeAndroidIds);

      if (orphans.length > 0) {
        logger.info(
          'Found ' + orphans.length + ' orphaned recipes (simulator or emulator no longer installed):'
        );
        orphans.forEach((name) => {
          console.log('  ' + chalk.red(name));
        });
        console.log();

        const shouldRemove = await confirm({
          message: 'Remove these orphaned recipes?',
          default: false,
        });

        if (shouldRemove) {
          orphans.forEach((name) => recipes.remove(name, 'user', true));
          logger.info('Removed ' + orphans.length + ' orphaned recipes.');
        } else {
          logger.info('Keeping orphaned recipes. Run again to clean up later.');
        }
        console.log();
      }

      logger.info('Done');
    }
  });
}

// ti info reports iOS simulators whose runtime was uninstalled (ghost sims) as if
// they still existed. simctl exposes an `isAvailable` flag that ioslib explicitly
// ignores ("cannot be trusted") but which today reflects reality on modern Xcode.
// We use it as the source of truth for "active" UDIDs when computing orphans.
// Returns null on any failure so the caller can fall back to the ti info set.
function getActiveIosUdidsFromSimctl() {
  return new Promise((resolve) => {
    const proc = spawn('xcrun', ['simctl', 'list', 'devices', '--json'], {
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    let out = '';
    proc.stdout.on('data', (data) => {
      out += data;
    });
    proc.on('error', () => resolve(null));
    proc.on('close', (code) => {
      if (code !== 0) return resolve(null);
      try {
        const data = JSON.parse(out);
        const udids = new Set();
        Object.values(data.devices || {}).forEach((devs) => {
          devs.forEach((dev) => {
            if (dev.isAvailable === true && dev.udid) udids.add(dev.udid);
          });
        });
        resolve(udids);
      } catch (e) {
        resolve(null);
      }
    });
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
