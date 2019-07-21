# SCP-079-D [![Release](https://img.shields.io/github/release/KarlofDuty/SCP-079-D.svg)](https://github.com/KarlOfDuty/SCP-079-D/releases) [![Downloads](https://img.shields.io/github/downloads/KarlOfDuty/SCP-079-D/total.svg)](https://github.com/KarlOfDuty/SCP-079-D/releases) [![Discord Server](https://img.shields.io/discord/430468637183442945.svg?label=discord)](https://discord.gg/C5qMvkj)  [![Patreon](https://img.shields.io/badge/patreon-donate-orange.svg)](https://patreon.com/karlofduty)

### Has two functions: 

* Sends a custom welcome message to players joining the server designating them as specific SCPs depending on the server member count. (Would be unreliable on servers with more than 4000 members and not work at all on servers with more than 5000 members due to those SCPs not existing yet)


* Adds the scp and tale commands which link to a specific scp or tale.

## Installation:

1. Install Node.

2. Extract release zip.

3. Rename `default_config.yml` to `config.yml`

4. Run bot using `node SCPBot.js` in the extracted folder.

## Config:

```yaml
# The bot token from https://discordapp.com/developers/
token: "bot-token-here"

# Log more messages to the console, useful for debugging
verbose: false

# Prefix for discord commands
prefix: "+"

# The channel for the bot to post welcome messages in, empty to disable
welcomeChannel: "channel-id-here"
```
