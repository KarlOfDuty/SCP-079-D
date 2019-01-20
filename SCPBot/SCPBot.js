"use strict";

// Config loading
console.log("Config loading...");
const fs = require("fs");
const YAML = require("yaml");
const file = fs.readFileSync("./config.yml", "utf8");
const { token, verbose, prefix, welcomeChannel } = YAML.parse(file);
console.log("Config loaded.");

// Setting up Discord client
var connectedToDiscord = false;
const Discord = require("discord.js");
const discordClient = new Discord.Client({ autoReconnect: true });

discordClient.on("ready", () =>
{
    console.log("Connected to Discord.");
    connectedToDiscord = true;
    discordClient.user.setActivity(prefix + "scp and " + prefix + "tale",
        {
            type: "LISTENING"
        });
});

// Create an event listener for new guild members
discordClient.on("guildMemberAdd", member =>
{
    if (welcomeChannel === "") return;

    var channel = discordClient.channels.get(welcomeChannel);
    if (!channel)
    {
        console.error("ERROR: Welcome channel does not exist or is not visible to bot.");
        return;
    }

    // Creates the embed with the welcome message
    const embed = {
        "description": `\n**${member}, designated [SCP-${member.guild.memberCount}](http://www.scp-wiki.net/scp-${member.guild.memberCount}) has been released on the server.**\n`,
        "color": 0x0000ff
    };

    // Console message
    if (verbose)
    {
        console.log("Sending welcome message for " + member.user.username + " who is the " + member.guild.memberCount + "th member.");
    }

    // Discord message
    channel.send({ embed });
});

const urlExists = require('url-exists');
const request = require("request");
const cheerio = require("cheerio");

discordClient.on("message", (message) =>
{
    //Abort if message does not start with the prefix, if the sender is a bot, if the message is not from the right channel or if it does not contain any letters
    if (!message.content.startsWith(prefix) || message.author.bot || welcomeChannel !== message.channel.id || message.content.length <= prefix.length)
    {
        return;
    }

    //Cut message into base command and arguments
    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === "scp")
    {
        if (args.length < 1)
        {
            const embed = {
                "description": `\n**Invalid arguments.**\n`,
                "color": 0xff0000
            };
            message.channel.send({ embed });
            return;
        }

        urlExists("http://www.scp-wiki.net/scp-" + args.join("-"), function (err, exists)
        {
            if (exists)
            {
                const embed = {
                    "description": `\n**Foundation database entry found: [SCP-${args.join("-")}](http://www.scp-wiki.net/scp-${args.join("-")})**\n`,
                    "color": 0x00ff00
                };
                message.channel.send({ embed });
            }
            else
            {
                const embed = {
                    "description": `\n**That SCP does not exist.**\n`,
                    "color": 0xff0000
                };
                message.channel.send({ embed });
            }
        });
    }
    else if (command === "tale")
    {
        if (args.length < 1)
        {
            const embed = {
                "description": `\n**Invalid arguments.**\n`,
                "color": 0xff0000
            };
            message.channel.send({ embed });
            return;
        }

        urlExists("http://www.scp-wiki.net/" + args.join("-"), function (err, exists)
        {
            if (exists)
            {
                request(
                    {
                        uri: "http://www.scp-wiki.net/" + args.join("-")
                    },

                    function (error, response, body)
                    {
                        var $ = cheerio.load(body);
                        var title = $("#page-title", "#main-content").text();
                        if (!title)
                        {
                            title = "[TITLE REDACTED]";
                        }
                        const embed = {
                            "description": `\n**Foundation incident report found: [${title}](http://www.scp-wiki.net/${args.join("-")})**\n`,
                            "color": 0x00ff00
                        };
                        message.channel.send({ embed });
                    }
                );
            }
            else
            {
                const embed = {
                    "description": `\n**That tale does not exist.**\n`,
                    "color": 0xff0000
                };
                message.channel.send({ embed });
            }
        });
    }
});

// Connects to discord
discordClient.login(token);

// Runs when the server shuts down
var shuttingDown = false;
function shutdown()
{
    if (!shuttingDown)
    {
        shuttingDown = true;
        if (connectedToDiscord)
        {
            console.log("Signing out of Discord...");
            discordClient.destroy();
        }
        console.log("Shutting down...");
    }
}
process.on("exit", () => shutdown());
process.on("SIGINT", () => shutdown());
process.on("SIGUSR1", () => shutdown());
process.on("SIGUSR2", () => shutdown());
process.on("SIGHUP", () => shutdown());