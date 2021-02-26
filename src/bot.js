require("dotenv").config();
const Discord = require("discord.js");
const { Client, WebhookClient } = require("discord.js");
const command = require("./command");

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
      console.log(args);
      const msg = args.join(" ");
      console.log(msg);
      webhookClient.send(msg);
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
