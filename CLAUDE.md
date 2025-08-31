# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TiNy is a CLI wrapper for Titanium SDK build commands that provides "recipe" shortcuts to reduce keystrokes. It's a Node.js CLI tool that processes arguments and transforms them into full Titanium CLI (`ti`) commands. The project focuses exclusively on modern Titanium SDK development under TiDev, Inc.

## Common Commands

- **Install globally**: `npm install -g tn --unsafe-perm`
- **Run TiNy**: `tn <recipe>` (e.g., `tn iphone-6`)
- **Generate device recipes**: `tn generate`
- **List all recipes**: `tn list`
- **Save custom recipe**: `tn save <name> <args>`
- **Test locally**: `npm link` (for development)

## Architecture

### Core Components

- **`bin/cli.js`**: Main CLI entry point that handles command parsing and execution
- **`main.js`**: Exports the main `parse()` function for programmatic use
- **`lib/kitchen.js`**: Core recipe processing engine that "cooks" arguments
- **`lib/recipes.js`**: Recipe management (load, save, list recipes from multiple sources)
- **`lib/setup.js`**: Handles device/simulator recipe generation and 2.x hook removal
- **`lib/utils.js`**: Utility functions for argument processing
- **`lib/config.js`**: Configuration management
- **`lib/logger.js`**: Logging utilities

### Recipe System

Recipes are stored in three locations (in order of precedence):

1. **System recipes**: `tn.json` (built-in recipes)
2. **User recipes**: `~/.tn.json` (global user recipes)
3. **Project recipes**: `./tn.json` (project-specific recipes)

Recipes can be:

- Simple flag mappings: `"ios": ["--platform", "ios"]`
- Parametric with `%s` placeholders: `"keystore": ["--keystore", "%s", "--platform", "android"]`

### Key Dependencies

- **`appc-compat`**: Handles Titanium CLI (`ti`) execution
- **`fields`**: Interactive CLI prompts and confirmation dialogs
- **`underscore`**: Utility functions for array/object manipulation
- **`colors`**: Terminal color output
- **`update-notifier`**: Check for package updates

### Processing Flow

1. Parse command line arguments in `cli.js`
2. Pass to `kitchen.cook()` for recipe processing
3. Transform arguments using recipe definitions
4. Execute via `appc-compat.ti()` with processed arguments using Titanium CLI (`ti`)

## Development Notes

- The project uses JSHint for linting (see `.jshintrc`)
- No test framework is configured
- Uses CommonJS modules (`require`/`exports`)
- Supports Node.js >=0.8
- Main binary is executable via `./bin/cli.js`
