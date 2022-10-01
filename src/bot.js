require("dotenv").config();
const Discord = require("discord.js");
const { Client, WebhookClient } = require("discord.js");
const command = require("./command");
const ytdl = require("ytdl-core");
const { YTSearcher } = require("ytsearcher");
const queue = new Map();

const searcher = new YTSearcher({
  key: "AIzaSyAhvLottGirD7PNhmEdcp1UDeIMyVI2zN8",
  revealed: true,
});
const client = new Client({
  partials: ["MESSAGE", "CHANNEL", "REACTION"], //({ partials: ["MESSAGE", "CHANNEL", "REACTION" ]})
});

const webhookClient = new WebhookClient(
  process.env.WEBHOOK_ID,
  process.env.WEBHOOK_TOKEN
);

const PREFIX = "--";

client.on("ready", () => {
  console.log(`${client.user.tag} has logged in.`);
  command(client, "formula quadratic", (message) => {
    message.channel.send("https://i.ibb.co/HVWV6k2/download.png");
  });

  command(client, "formula ideal gas", (message) => {
    message.channel.send("https://i.ibb.co/m8ypNrX/download-1.png");
  });

  command(client, "formula help", (message) => {
    message.channel.send(
      "Please type the formula you want to see.\nEx '--jee formula quadratic'.\nIf you want formulas to be added, contact Conquestor#2983"
    );
  });

  command(client, ["hi", "hello", "yo", "Yo", "Hello", "Hi", ""], (message) => {
    message.channel.send("Yo bro!");
  });

  //list servers deleting messages
  command(client, "servers", (message) => {
    client.guilds.cache.forEach((guild) => {
      message.channel.send(
        `${guild.name} has a total of ${guild.memberCount} members`
      );
    });
  });

  command(client, ["cc", "clearchannel"], (message) => {
    if (message.member.hasPermission("MANAGE_CHANNELS")) {
      message.channel.messages.fetch().then((results) => {
        message.channel.bulkDelete(results);
      });
    }
  });
});

client.on("message", async (message) => {
  if (message.content === "--avatar") {
    message.reply(message.author.displayAvatarURL());
  }
  const serverQueue = queue.get(message.guild.id);
  if (message.author.bot) return;
  if (message.content.startsWith(PREFIX)) {
    const [CMD_NAME, ...args] = message.content
      .trim()
      .substring(PREFIX.length)
      .split(/\s+/);
    if (CMD_NAME === "kick") {
      if (!message.member.hasPermission("KICK_MEMBERS"))
        return message.reply("You do not have permissions to use this command");
      const user = message.mentions.users.first();
      if (user) {
        const member = message.guild.member(user);
        if (member) {
          member
            .kick("Optional reason that will display in the audit logs")
            .then(() => {
              message.reply(`Successfully kicked ${user.tag}`);
            })
            .catch((err) => {
              message.reply("I was unable to kick the member, contact the admin for further assistance");
              console.error(err);
            });
        } else {
          message.reply("That user isn't in this guild!");
        }
      } else {
        message.reply("You didn't mention the user to kick!");
      }
    } else if (CMD_NAME === "ban") {
      if (!message.member.hasPermission("BAN_MEMBERS"))
        return message.reply("You do not have permissions to use this command");
      const user = message.mentions.users.first();
      if (user) {
        const member = message.guild.member(user);
        if (member) {
          member
            .ban("Optional reason that will display in the audit logs")
            .then(() => {
              message.reply(`Successfully banned ${user.tag}`);
            })
            .catch((err) => {
              message.reply("I was unable to ban the member");
              console.error(err);
            });
        } else {
          message.reply("That user isn't in this guild!");
        }
      } else {
        message.reply("You didn't mention the user to ban");
      }
    } else if (CMD_NAME === "announce") {
      const msg = args.join(" ");
      webhookClient.send(msg);
    }

    if (CMD_NAME === "mute") {
      if (!message.member.hasPermission("MUTE_MEMBERS"))
        return message.reply("You do not have permissions to use this command");
      const Member =
        message.mentions.members.first() ||
        message.guild.members.cache.get(args[0]);
      if (!Member) return message.reply("Please mention a valid user");
      const role = message.guild.roles.cache.find(
        (role) => role.name.toLowerCase() === "mutes"
      );
      if (!role) {
        try {
          message.channel.send(
            "Missing requirements for mute.\nBut I am making it wait"
          );

          let muteRole = message.guild.roles.create({
            data: {
              name: "mutes",
              permissions: [],
            },
          });
          message.guild.channels.cache
            .filter((c) => c.type === "text")
            .forEach(async (channel, id) => {
              await channel.createOverwrite(muteRole, {
                SEND_MESSAGES: false,
                ADD_REACTIONS: false,
              });
            });
          message.channel.send("Made the requirements");
        } catch (error) {
          console.log(error);
        }
      }
      let role2 = message.guild.roles.cache.find(
        (r) => r.name.toLocaleLowerCase() === "mutes"
      );
      if (Member.roles.cache.has(role2.id))
        return message.channel.send(
          `${Member.displayName} has already been muted `
        );
      Member.roles.add(role2);
      message.channel.send(`${Member.displayName} has been muted `);
    }

    if (CMD_NAME === "unmute") {
      if (!message.member.hasPermission("MUTE_MEMBERS"))
        return message.reply("You do not have permissions to use this command");
      const Member =
        message.mentions.members.first() ||
        message.guild.members.cache.get(args[0]);
      if (!Member) return message.reply("Please mention a valid user");

      const role = message.guild.roles.cache.find(
        (r) => r.name.toLocaleLowerCase() === "mutes"
      );
      Member.roles.remove(role);
      message.channel.send(`${Member.displayName} has been unmuted `);
    }

    if (CMD_NAME === "tmute") {
      if (!message.member.hasPermission("MUTE_MEMBERS"))
        return message.reply("You do not have permissions to use this command");
      const Member =
        message.mentions.members.first() ||
        message.guild.members.cache.get(args[0]);
      const time = args[1];
      if (!Member) return message.reply("Please mention a valid user");
      if (!time)
        return message.reply("Please enter a valid time to mute this user");
      const role = message.guild.roles.cache.find(
        (role) => role.name.toLowerCase() === "mutes"
      );
      if (!role) {
        try {
          message.channel.send(
            "Missing requirements for mute.\nBut I am making it wait"
          );

          let muteRole = message.guild.roles.create({
            data: {
              name: "mutes",
              permissions: [],
            },
          });
          message.guild.channels.cache
            .filter((c) => c.type === "text")
            .forEach(async (channel, id) => {
              await channel.createOverwrite(muteRole, {
                SEND_MESSAGES: false,
                ADD_REACTIONS: false,
              });
            });
          message.channel.send(
            "Made the requirements\n Now run the command again"
          );
        } catch (error) {
          console.log(error);
        }
      }
      let role2 = message.guild.roles.cache.find(
        (r) => r.name.toLocaleLowerCase() === "mutes"
      );
      if (Member.roles.cache.has(role2.id))
        return message.channel.send(
          `${Member.displayName} has already been muted `
        );
      Member.roles.add(role2);
      message.channel.send(`${Member.displayName} has been muted for ${time}`);

      setTimeout(async () => {
        await Member.roles.remove(role2);
        message.channel.send(`${Member.displayName} is now unmuted`);
      }, ms(time));
    }

    //music feature
    switch (CMD_NAME) {
      case "play":
        execute(message, serverQueue);
        break;
      case "stop":
        stop(message, serverQueue);
        break;
      case "skip":
        skip(message, serverQueue);
        break;
    }
    async function execute(message, serverQueue) {
      let vc = message.member.voice.channel;
      if (!vc) {
        return message.channel.send("Please join a voice chat first");
      } else {
        let result = await searcher.search(args.join(" "), { type: "video" });
        const songInfo = await ytdl.getInfo(result.first.url);

        let song = {
          title: songInfo.videoDetails.title,
          url: songInfo.videoDetails.video_url,
        };

        if (!serverQueue) {
          const queueConstructor = {
            txtChannel: message.channel,
            vChannel: vc,
            connection: null,
            songs: [],
            volume: 10,
            playing: true,
          };
          queue.set(message.guild.id, queueConstructor);

          queueConstructor.songs.push(song);

          try {
            let connection = await vc.join();
            queueConstructor.connection = connection;
            play(message.guild, queueConstructor.songs[0]);
          } catch (err) {
            console.error(err);
            queue.delete(message.guild.id);
            return message.channel.send(`Unable to join the voice chat ${err}`);
          }
        } else {
          serverQueue.songs.push(song);
          return message.channel.send(`The song has been added ${song.url}`);
        }
      }
    }
    function play(guild, song) {
      const serverQueue = queue.get(guild.id);
      if (!song) {
        serverQueue.vChannel.leave();
        queue.delete(guild.id);
        return;
      }
      const dispatcher = serverQueue.connection
        .play(ytdl(song.url))
        .on("finish", () => {
          serverQueue.songs.shift();
          play(guild, serverQueue.songs[0]);
        });
      serverQueue.txtChannel.send(`Now playing ${serverQueue.songs[0].url}`);
    }
    function stop(message, serverQueue) {
      if (!message.member.voice.channel)
        return message.channel.send("You need to join the voice chat first!");
      serverQueue.songs = [];
      serverQueue.connection.dispatcher.end();
    }
    function skip(message, serverQueue) {
      if (!message.member.voice.channel)
        return message.channel.send("You need to join the voice chat first");
      if (!serverQueue)
        return message.channel.send("There is nothing to skip!");
      serverQueue.connection.dispatcher.end();
    }
  }
});

client.on("messageReactionAdd", (reaction, user) => {
  const { name } = reaction.emoji;
  const member = reaction.message.guild.members.cache.get(user.id);
  if (reaction.message.id === "814751661171015721") {
    switch (name) {
      case "🟠":
        member.roles.add("814774605381763082");
        break;
      case "🔵":
        member.roles.add("814716208670572565");
        break;
      case "🔴":
        member.roles.add("814716303281356830");
        break;
      case "🟣":
        member.roles.add("814716355962077194");
        break;
      case "🟢":
        member.roles.add("814716396490719242");
        break;
    }
  }
});

client.on("messageReactionRemove", (reaction, user) => {
  const { name } = reaction.emoji;
  const member = reaction.message.guild.members.cache.get(user.id);
  if (reaction.message.id === "814751661171015721") {
    switch (name) {
      case "🟠":
        member.roles.remove("814774605381763082");
        break;
      case "🔵":
        member.roles.remove("814716208670572565");
        break;
      case "🔴":
        member.roles.remove("814716303281356830");
        break;
      case "🟣":
        member.roles.remove("814716355962077194");
        break;
      case "🟢":
        member.roles.remove("814716396490719242");
        break;
    }
  }
});

client.login(process.env.DISCORDJS_BOT_TOKEN);
