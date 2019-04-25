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

    var channel = discordClient.channels.get("549635507869581313");
    channel.fetchMessages({ limit: 1 }).then(messages =>
    {
        scpCommand(messages.first(), "012");
    }).catch(console.error);
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

function scpCommand(message, scp)
{
    urlExists("http://www.scp-wiki.net/scp-" + scp, function (err, exists)
    {
        if (exists)
        {
            request(
                {
                    uri: "http://www.scp-wiki.net/scp-" + scp
                },

                function (error, response, body)
                {
                    if (error)
                    {
                        console.log("HTML parsing/loading error: " + error);
                    }

                    var $ = cheerio.load(body);
                    var imageURL = $("img", "#page-content").first().attr("src");

                    if (!imageURL)
                    {
                        imageURL = "";
                    }

                    var objectClass = $(":contains(Object Class:)", "#page-content").first().text().replace("Object Class: ", "");

                    if (!objectClass)
                    {
                        objectClass = "[UNKNOWN]";
                    }

                    const embed = {
                        "description": `\n**[SCP-${scp}](http://www.scp-wiki.net/scp-${scp})**\n`,
                        "color": 0x00ff00,
                        "image": {
                            "url": imageURL
                        },
                        "fields": [
                            {
                                "name": "Object class:",
                                "value": objectClass
                            },
                            {
                                "name": "Special Containment Procedures:",
                                "value": "No physical interaction with SCP-106 is allowed at any time. All physical interaction must be approved by no less than a two-thirds vote from O5-Command. Any such interaction must be undertaken in AR-II maximum security sites, after a general non-essential staff evacuation. All staff (Research, Security, Class D, etc.) are to remain at least sixty meters away from the containment cell at all times, except in the event of breach events."
                            },
                            {
                                "name": "Description:",
                                "value": "SCP-106 appears to be an elderly humanoid, with a general appearance of advanced decomposition. This appearance may vary, but the “rotting” quality is observed in all forms. SCP-106 is not exceptionally agile, and will remain motionless for days at a time, waiting for prey. SCP-106 is also capable of scaling any vertical surface and can remain suspended upside down indefinitely. When attacking, SCP-106 will attempt to incapacitate prey by damaging major organs, muscle groups, or tendons, then pull disabled prey into its pocket dimension. SCP-106 appears to prefer human prey items in the 10-25 years of age bracket."
                            }
                        ]
                    };

                    message.channel.send({ embed }).catch((err) =>
                    {
                        console.warn("Error occured sending scp response: " + err);
                    });
                }
            );
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

        scpCommand(message, args.join("-"));
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