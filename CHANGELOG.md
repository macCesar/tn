# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [5.3.0] - 2026-03-01

### Added

- `tn list` now groups recipes into 8 labeled categories: iPhone Simulators, iPad Simulators, Android Emulators, iOS Devices, Android Devices, Distribution, Aliases, and General. Within each group, built-in recipes appear before user recipes. The General group is visually sub-clustered by platform (Apple/iOS, Android, parametric, misc) using blank lines.
- `tn generate` shows `[INFO] All recipes are up to date.` when no new recipes are found.

### Fixed

- `tn generate` no longer creates duplicate `-iosXXX` recipes on repeated runs. Two bugs caused it: the same UDID reported under multiple iOS versions by `ti info`, and simulators that only appear under an older iOS version gaining a new suffix on every subsequent run even when their UDID was unchanged.

### Changed

- `tn generate` output is compact: only newly saved recipes are printed, not every device `ti info` finds.
- README recipe tables restructured to match the grouped `tn list` output. Aliases now have their own section. All parametric recipes include descriptions.

## [5.2.0] - 2026-02-05

### Added

- **Mac App Store Distribution**: Added built-in recipe for building Mac Catalyst apps for Mac App Store
  - `macstore`: Build for Mac App Store (`--ios --target dist-macappstore`)
  - Requires **Titanium SDK 13.1.1.GA**+ with Mac App Store distribution support (officially included)
  - Creates `.xcarchive` ready for upload via Xcode Organizer
  - Automatically detects installed Mac App Store Distribution certificates
  - No interactive prompts required when certificates are properly configured

### Usage Examples

```bash
# Build for Mac App Store distribution
tn macstore

# Combine with other recipes
tn macstore --verbose
```

### Compatibility

This release complements the Mac Catalyst support introduced in v5.1.0 and requires the official Mac App Store distribution target (`dist-macappstore`) that was added to Titanium SDK 13.1.1.GA.

## [5.1.0] - 2025-01-10

### Added

- **macOS Support**: Added built-in recipes for building iOS apps for macOS using Mac Catalyst
  - `mac`: Build for macOS (`--platform ios --target macos`)
  - `catalyst`: Alias for `--mac`
  - Requires Titanium SDK 13.1.0+ with macOS build support
  - Works on Apple Silicon Macs running macOS apps via Catalyst

### Usage Examples

```bash
# Build for macOS using Mac Catalyst
tn mac

# Using the catalyst alias
tn catalyst

# Combine with other recipes
tn mac --verbose
```

## [5.0.0] - 2025-08-31

### 🚀 Major Updates

#### Modernized Dependencies

- **SECURITY:** Replaced vulnerable `colors@1.4.0` with secure `chalk@4.1.2`
- **BREAKING:** Updated `fields@0.1.24` to modern `@inquirer/prompts@7.8.4`
- **BREAKING:** Removed legacy Appcelerator CLI support - uses Titanium CLI (`ti`) exclusively
- **FEATURE:** Updated `update-notifier@0.6.0` to `7.3.1` with modern API
- **COMPATIBILITY:** Updated Node.js engine requirement from `>=0.8` to `>=18`

#### Platform Cleanup

- **BREAKING:** Removed support for discontinued platforms:
  - BlackBerry (discontinued by Titanium SDK years ago)
  - Tizen (no longer supported)
  - MobileWeb (legacy platform)
  - Windows (not currently supported)
- **FEATURE:** Updated iOS simulator versions:
  - Removed obsolete iOS 6.1 and 7.1 recipes
  - Added modern iOS 17.0 and 18.0 recipes (`ip15`, `ip16`, `ipad15`, `ipad16`)

#### Code Quality Improvements

- **REFACTOR:** Replaced `colors` String prototype pollution with clean `chalk` API
- **SECURITY:** Eliminated all security vulnerabilities (0 vulnerabilities after update)
- **PERFORMANCE:** Removed unnecessary compatibility layers for cleaner code
- **MAINTAINABILITY:** Updated all color usage to modern `chalk.color()` syntax

### Added

- Modern interactive prompts with proper TTY detection
- Comprehensive error handling for async operations
- Better update notifications with configurable intervals
- Support for modern iOS versions (17.0, 18.0)

### Changed

- **BREAKING:** Prompt interface now uses arrow keys and modern selection
- **BREAKING:** Removed all BlackBerry, Tizen, MobileWeb, and Windows recipes
- Improved verbose mode with better visual feedback
- Enhanced error messages with proper coloring
- Updated copyright year to 2025
- Streamlined CLI output and help text

### Removed

- **BREAKING:** All deprecated platform support (BlackBerry, Tizen, etc.)
- **BREAKING:** Legacy iOS 6.1 and 7.1 simulator recipes
- Vulnerable `colors` package dependency
- Obsolete `fields` package dependency
- Platform aliases for discontinued platforms

### Fixed

- Compatibility issues with Node.js v22+
- Interactive prompts not working in modern terminals
- Security vulnerabilities in dependencies
- Update notifications not displaying properly
- Verbose mode crashing on newer Node.js versions

### Security

- **CRITICAL:** Eliminated malicious `colors` package (sabotaged by maintainer)
- Updated all dependencies to secure versions
- Removed potential prototype pollution vectors
- Fixed TTY-related security issues

## [4.2.1] - Previous Release

- Fixes issue generating certain simulators with special characters in their names

## [4.2.0] - Previous Release

- Adds --prefer-appc and --prefer-ti to override automatic detection to use appc or ti CLI

## [4.0.0] - Previous Release

- Removed the need to use `tn r` or `tn b` thanks to [appc-compat](https://npmjs.com/appc-compat)

## [3.0.0] - Previous Release

- Reverted TiNy from hook back to wrapper, supporting both `ti build` and `appc run`

## Migration Guide for v5.0.0

### For Users

- **Node.js Requirement:** Upgrade to Node.js 18+ (recommended: Node.js 22+)
- **Discontinued Platforms:** Remove any usage of BlackBerry, Tizen, MobileWeb, or Windows recipes
- **iOS Versions:** Update recipes using `ip6`/`ip7` to modern `ip15`/`ip16` equivalents

### For Developers

- **Colors API:** Replace `'text'.red` with `chalk.red('text')`
- **Prompts:** The new prompt system uses modern async/await patterns
- **Platform Support:** Only iOS and Android platforms are now supported

### Breaking Changes

1. **Node.js 18+ Required:** The CLI no longer supports older Node.js versions
2. **Discontinued Platforms Removed:** BlackBerry, Tizen, MobileWeb recipes no longer exist
3. **Modern Prompts:** Interactive mode uses different keybindings (arrow keys vs numbers)
4. **Secure Dependencies:** Replaced `colors` with `chalk` - custom color extensions won't work

## Recommended Future Improvements

The following improvements are recommended for future versions:

1. **Replace `underscore` with `lodash`** - Modern, better-maintained utility library
2. **Add TypeScript support** - Better developer experience and type safety
3. **Implement automated testing** - Jest or Mocha for comprehensive test coverage
4. **Add ESLint/Prettier** - Consistent code formatting and linting
5. **Setup GitHub Actions** - Automated CI/CD pipeline for releases
6. **Add JSDoc documentation** - Better code documentation
7. **Implement semantic release** - Automated versioning and changelog generation

---

For more details on each change, see the commit history and pull requests in the [GitHub repository](https://github.com/jasonkneen/tn).
