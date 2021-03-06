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
    channel.send({ embed }).catch((err) =>
    {
        console.warn("Error occured sending welcome message: " + err);
    });
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
        if (verbose)
        {
            console.log("Parsing SCP command...");
        }

        if (args.length < 1)
        {
            const embed = {
                "description": `\n**Invalid arguments.**\n`,
                "color": 0xff0000
            };
            message.channel.send({ embed }).catch((err) =>
            {
                console.warn("Error occured sending scp response (invalid args): " + err);
            });
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
                message.channel.send({ embed }).catch((err) =>
                {
                    console.warn("Error occured sending scp response: " + err);
                });
            }
            else
            {
                const embed = {
                    "description": `\n**That SCP does not exist.**\n`,
                    "color": 0xff0000
                };
                message.channel.send({ embed }).catch((err) =>
                {
                    console.warn("Error occured sending scp response (does not exist): " + err);
                });
            }
        });
    }
    else if (command === "tale")
    {
        if (verbose)
        {
            console.log("Parsing tale command...");
        }
        if (args.length < 1)
        {
            const embed = {
                "description": `\n**Invalid arguments.**\n`,
                "color": 0xff0000
            };
            message.channel.send({ embed }).catch((err) =>
            {
                console.warn("Error occured sending tale response (invalid arguments): " + err);
            });
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
                        if (error)
                        {
                            console.log("HTML parsing/loading error: " + error);
                        }

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

                        message.channel.send({ embed }).catch((err) =>
                        {
                            console.warn("Error occured sending tale response: " + err);
                        });
                    }
                );
            }
            else
            {
                const embed = {
                    "description": `\n**That tale does not exist.**\n(You have to use the name of the article as it appears in the url, spaces are fine instead of dashes though.)\n`,
                    "color": 0xff0000
                };
                message.channel.send({ embed }).catch((err) =>
                {
                    console.warn("Error occured sending tale response (does not exist): " + err);
                });
            }
        });
    }
});


discordClient.on("error", (e) =>
{
    if (e.message === "getaddrinfo ENOTFOUND gateway.discord.gg gateway.discord.gg:443")
    {
        connectedToDiscord = false;
        console.error("Discord connection broken, retrying...");
    }
    else
    {
        console.error(e.message);
    }
});

discordClient.on("warn", (e) =>
{
    if (verbose)
    {
        console.warn(e.message);
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