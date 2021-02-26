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
      "Please type the formula you want to see.\nEx '--jee formula quadratic'.\nIf you want formulas to be added then contact Conquestor#2983"
    );
  });

  command(client, ["hi", "hello", "yo", "Yo", "Hello", "Hi"], (message) => {
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
    if (message.member.hasPermission("ADMINISTRATOR")) {
      message.channel.messages.fetch().then((results) => {
        message.channel.bulkDelete(results);
      });
    }
  });
});

client.on("message", async (message) => {
  const serverQueue = queue.get(message.guild.id);
  if (message.author.bot) return;
  if (message.content.startsWith(PREFIX)) {
    const [CMD_NAME, ...args] = message.content
      .trim()
      .substring(PREFIX.length)
      .split(/\s+/);
    if (CMD_NAME === "kick") {
      if (!message.member.hasPermission("KICK_MEMBERS"))
        return message.reply("You do not have permissions to use that command");
      if (args.length === 0) return message.reply("Please provide an ID");
      const member = message.guild.members.cache.get(args[0]);
      if (member) {
        member
          .kick()
          .then((member) => message.channel.send(`${member} was kicked.`))
          .catch((err) => message.channel.send("I cannot kick that user :("));
      } else {
        message.channel.send("That member was not found");
      }
    } else if (CMD_NAME === "ban") {
      if (!message.member.hasPermission("BAN_MEMBERS"))
        return message.reply("You do not have permissions to use that command");
      if (args.length === 0) return message.reply("Please provide an ID");
      try {
        const user = await message.guild.members.ban(args[0]);
        message.channel.send("User was banned successfully");
      } catch (err) {
        console.log(err);
        message.channel.send(
          "An error occured. Either I do not have permissions or the user was not found"
        );
      }
    } else if (CMD_NAME === "announce") {
      const msg = args.join(" ");
      webhookClient.send(msg);
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

// client.on("messageReactionAdd", async (reaction, user) => {
//   if (reaction.message.partial) await reaction.message.fetch();
//   if (reaction.partial) await reaction.fetch();
//   if (user.client) return;
//   if (!reaction.message.guild) return;
//   if (reaction.message.id === "814803034352779285") {
//     if (reaction.emoji.name === "🟠") {
//       await reaction.message.guild.members.cache
//         .get(user.id)
//         .roles.add("814774605381763082");
//       user.send("You have obtained a role!");
//     }
//   }
// });

// client.on("messageReactionRemove", async (reaction, user) => {
//   if (reaction.message.partial) await reaction.message.fetch();
//   if (reaction.partial) await reaction.fetch();
//   if (user.client) return;
//   if (!reaction.message.guild) return;
//   if (reaction.message.id === "814803034352779285") {
//     if (reaction.emoji.name === "🟠") {
//       await reaction.message.guild.members.cache
//         .get(user.id)
//         .roles.remove("814774605381763082");
//       user.send("One of your roles has been removed!");
//     }
//   }
// });

client.login(process.env.DISCORDJS_BOT_TOKEN);
