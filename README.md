# hypixel-cli
hypixel-api-reborn but will CLI functionality. Updated version from the original CLI made by @StavZ, https://github.com/Hypixel-API-Reborn/cli

# Installation
`npm i https://github.com/alvannys/hypixel-cli -g`

# Usage
`hyp [command]`

# Commands
- `hyp init [options]` - Client initialization for [Hypixel-API-Reborn](https://www.npmjs.com/package/hypixel-api-reborn).

- `hyp player <player> [options]` - Gets player data.

- `hyp savekey <key>` - Saves a key to use in `hyp player`.

- `hyp removekey` - Guess what this does.

- `hyp cdir <directories...>` - Just a simple way to create directories. This one is pretty unnecessary.

# Options
- `-l` - Does not allow the overriding of a new file and automatically cancels adding a file under an existing directory (default: `false`). (command: `hyp init`)

- `-k <key>` - If you don't want to save a key using `savekey <key>`, add this option to use the specified key there. (command: `hyp player <player>`)

- `-g` - Sends an additional guild call with a player request. (command: `hyp player <player>`)

# Examples
- Initialization: `hyp init -l`

- Player: `hyp player alvanny -g -k key`
