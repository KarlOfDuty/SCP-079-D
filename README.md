# SCP-079-D

### Has two functions: 

* Sends a custom welcome message to players joining the server designating them as specific SCPs depending on the server member count. (Would be unreliable on servers with more than 4000 members and not work at all on servers with more than 5000 members due to those SCPs not existing yet)


* Adds the scp and tale commands which link to a specific scp or tale.

## Installation:

1. Install Node.

2. Extract release zip.

3. Run bot using `node SCPBot.js` in the extracted folder.

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
