# TiNy CLI [![Titanium](https://tidev.io/img/tilogo.png)](https://titaniumsdk.com)

TiNy is a modern CLI wrapper for [Titanium SDK](https://titaniumsdk.com) that allows you to build iOS and Android apps using fewer keystrokes. It has built-in recipes for common build configurations, and allows you to compose and save your own custom recipes.

**Version 5.0.0** is fully modernized for 2025 with enhanced security, Node.js 18+ support, modern dependencies, and focuses exclusively on current mobile platforms (iOS & Android).

## Quick Start [![npm](http://img.shields.io/npm/v/tn.png)](https://www.npmjs.org/package/tn)

1. Install [TiNy](http://npmjs.org/package/tn) via [NPM](http://npmjs.org):

   ```bash
   npm install -g tn
   ```

   **Requirements:**
   - Node.js 18+ (Titanium CLI requires Node.js 20.18.1+)
   - Titanium CLI installed: `npm install -g titanium`
   - Titanium SDK: `ti sdk install latest`
   - iOS Simulator (for iOS development)
   - Android SDK and emulators (for Android development)

2. If for some reason uninstalling the 2.x hook failed, use the TiNY CLI to do so:

   ```
   tn uninstall
   ```

3. Generate recipes for all connected simulators, emulators and devices:

   ```
   tn generate
   ```

4. Build a project using generated device recipes:

   ```
   tn iphone-16-pro
   tn pixel-8-pro-api-34 --another-recipe
   ```

   - TiNy is a CLI wrapper that executes `ti build` commands
   - The first recipe after `tn` does not need to start with `--`
   - Multiple recipes can be combined in a single command
   - All commands default to `build` operation

5. Compose a custom recipes mixing others (`--ah`) and an option value (`%s`):

   ```
   tn save ci \
   -b \
   --pp-uuid 37304C9F-B2E0-490A-9800-0448A33BECE9 \
   --distribution-name "Jeff Haynie (E8978765FC)" \
   --ah \
   --installr --installr-release-notes %s
   ```

6. Ship it:

   ```
   tn ci "a great update"
   ```

## Recipes

A recipe is simply a flag or option that stands for a group of other arguments, which may in turn include other recipes. There are built-in recipes, but you can also add your own or override built-ins.

- List all recipes: `tn list`

Colors will show you which recipes are built-in, user and user-overrides.

### Option recipes

Most recipes are flags, but a receipe can also be an option. If a recipe is followed by an argument value, TiNy assumes the recipe to be an option and replace any occurences of `%s` in the recipe with the value. See step 4 of the Quick Start for an example.

### Built-in recipes

TiNy includes comprehensive built-in recipes for modern mobile development. All recipes support the current Titanium SDK platforms and device types.

**Recipe Usage:**

- Recipes are command-line flags that expand to full Titanium CLI arguments
- When used as the first argument, recipes don't need the `--` prefix
- Recipes can be combined and chained for complex build configurations

| name              | recipe                                                 |
| ----------------- | ------------------------------------------------------ |
| android           | --platform android                                     |
| ios               | --platform ios                                         |
| ipad              | --device-family ipad                                   |
| iphone            | --device-family iphone                                 |
| ip                | --iphone                                               |
| universal         | --device-family universal                              |
| uni               | --universal                                            |
| watch             | --ios --launch-watch-app                               |
| mac               | --platform ios --target macos                          |
| catalyst          | --mac                                                  |
| appstore          | --ios --target dist-appstore                           |
| as                | --appstore                                             |
| macstore          | --ios --target dist-macappstore                        |
| playstore         | --android --target dist-playstore                      |
| play              | --playstore                                            |
| ps                | --playstore                                            |
| adhoc             | --ios --target dist-adhoc                              |
| ah                | --adhoc                                                |
| emulator          | --target emulator                                      |
| emu               | --emulator                                             |
| simulator         | --target simulator                                     |
| sim               | --simulator                                            |
| device            | --target device                                        |
| ioses             | --ios --device --device-id all                         |
| droid             | --android --device                                     |
| desktop           | -output-dir ~/Desktop                                  |
| ip18              | --sim-version 18.6 --sim-type iphone                   |
| ip26              | --sim-version 26.1 --sim-type iphone                   |
| ipad18            | --sim-version 18.6 --sim-type ipad                     |
| ipad26            | --sim-version 26.1 --sim-type ipad                     |
| key-password      | --key-password %s --key-password %s --platform android |
| android-sdk       | --android-sdk %s --platform android                    |
| avd-abi           | --avd-abi %s --platform android                        |
| keystore          | --keystore %s --platform android                       |
| alias             | --alias %s --platform android                          |
| store-password    | --store-password %s --platform android                 |
| device-family     | --device-family %s --platform ios                      |
| ios-version       | --ios-version %s --platform ios                        |
| pp-uuid           | --pp-uuid %s --platform ios                            |
| distribution-name | --distribution-name %s --platform ios                  |
| sim-version       | --sim-version %s --target simulator --platform ios     |
| keychain          | --keychain %s --platform ios                           |
| developer-name    | --developer-name %s --target device --platform ios     |
| sim-type          | --sim-type %s --target simulator --platform ios        |

### Custom recipes

The user recipes are stored in `~/.tn.json` and override built-in recipes sharing the same name. Use the TiNy CLI to edit them:

```
tn save ios --target android # overrides the built-in ios-recipe
tn rename ios confusing      # restores the built-in ios-recipe
tn remove confusing          # deletes the confusing custom recipe
tn reset                     # deletes the ~/.tn.json file
```

##### Generating Device/Emulator/Simulator recipes

You can generate user recipes for all connected devices, emulators and simulators by running `tn generate`. This will automatically create new recipes like:

```
  iphone-16-pro: --platform ios --target simulator --device-id 846AD047-0AE2-4778-A4B0-C28206B9BDBB
  iphone-16-pro-max: --platform ios --target simulator --device-id 44AB80FA-A529-47F9-9C53-05DA319D7C6D
  ipad-air-13-inch-m3: --platform ios --target simulator --device-id CE9F76E4-FF32-4E99-9005-71F69BDE01C1
  pixel-8-pro-api-34: --platform android --target emulator --device-id "Pixel 8 Pro API 34"
```

#### Project recipes

Project recipes override both user and built-in recipes. The are stored in the current working directory in a file called `tn.json`. To edit this file instead of the global user file add `project` before the `save`, `rename`, `remove` and `reset` commands:

```
tn project save ios --target android # overrides the built-in (and custom) ios-recipe
tn project rename ios confusing      # restores the built-in (or custom) ios-recipe
tn project remove confusing          # deletes the confusing custom recipe
tn project reset                     # deletes the tn.json file
```

##### Command recipes

Any recipe can be used as a command as well. Like the Quick Start shows you can do `tn ipad` instead of `tn --ipad`. If the first argument is a valid recipe name TiNy will turn it into a flag/option and continue as normal.

### Verbose mode

Enable verbose mode to see exactly how TiNy processes your recipes:

```bash
tn ios --verbose
tn iphone-16-pro --distribution-name "My Company" --verbose
```

Verbose mode shows:

- Recipe expansion step-by-step
- Duplicate option resolution
- Final command that will be executed
- Interactive prompts to save, execute, or exit

## Common Usage Examples

### iOS Development

```bash
# Build for iOS simulator
tn ios
tn iphone-16-pro

# Build for App Store distribution
tn appstore --distribution-name "Your Company"

# Build with specific provisioning profile
tn ios --pp-uuid "37304C9F-B2E0-490A-9800-0448A33BECE9"
```

### Android Development

```bash
# Build for Android emulator
tn android
tn pixel-8-pro-api-34

# Build for Play Store distribution
tn playstore --keystore path/to/keystore --alias myalias

# Build with specific Android SDK
tn android --android-sdk /path/to/android/sdk
```

### Custom Workflows

```bash
# Create and use custom recipes
tn save my-debug --ios --simulator --device-family universal
tn my-debug

# Project-specific recipes
tn project save release --playstore --keystore ./android/release.keystore
tn release
```

## Other features

### Resolving aliases

TiNy will convert abbreviations (`-T`) to their full names (`--target`). It needs to this for the next feature.

### Resolving duplicates

TiNy will resolve any duplicate options and flags in order of appearance.

## Features

### Modern Architecture (v5.0.0)

- **Node.js 18+ Support**: Fully compatible with modern Node.js versions
- **Enhanced Security**: Updated all dependencies to latest secure versions
- **Modern Dependencies**: Uses lodash, chalk, @inquirer/prompts for better performance
- **Code Quality**: ESLint 8, Prettier formatting, comprehensive testing setup

### Device Management

- **Automatic Discovery**: `tn generate` detects all connected iOS simulators and Android emulators
- **Current Devices**: Supports iPhone 16 series, iPad Air M3, iPad Pro M4, latest Android emulators
- **Real Device Support**: Works with physical iOS and Android devices

### Recipe System

- **Built-in Recipes**: 50+ pre-configured recipes for common build scenarios
- **Custom Recipes**: Save, edit, and share your own recipe configurations
- **Project Recipes**: Per-project recipe files for team collaboration
- **Recipe Chaining**: Combine multiple recipes in a single command

### Developer Experience

- **Interactive Prompts**: Modern CLI prompts for recipe management and execution
- **Verbose Mode**: Detailed output showing recipe expansion and build process
- **Safety Features**: Protection against accidental configuration deletion
- **Modern CLI**: Uses Titanium SDK CLI (`ti`) exclusively

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for detailed version history and breaking changes.

## Bugs

When you find issues, please [report](https://github.com/jasonkneen/tn/issues) them. Be sure to include:

- Complete command output
- Your environment details (Node.js version, OS, Titanium SDK version)
- Steps to reproduce the issue

Check existing issues first to avoid duplicates.

## License

<pre>
Copyright (c) 2016-2021, Jason Kneen.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
</pre>
