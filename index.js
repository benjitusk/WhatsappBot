// IMPORTS:
const fs = require('fs');
const mime = require('mime');
const axios = require('axios');
const mysql = require('mysql');
const { Bot, Poll_Manager } = require('./Utils.js');
const CronJob = require('cron').CronJob;
const parse = require('parse-duration');
const removedInfo = require('./Extras.js');
const prettyMilliseconds = require('pretty-ms');

new CronJob('0 30 6,9,13,19 * * 0-5', async () => {
  console.log("updating description");
  let text = await generateWFDDescription();
  try {
    let chat = await bot.client.getChatById(redacted.WHATS_FOR_DINNER_ID);
    chat.setDescription(text);
  } catch (err) {
    console.error("There was an error setting the description. This is likely due to puppeteer not being fully initialized.");
  }
}, null, true);

new CronJob("0 45 8,12,18 * * 0-5", async () => {
  let breakfast = getMeal("breakfast");
  let lunch = getMeal("lunch");
  let dinner = getMeal("dinner");
  let quote = await getQuote();
  let text = breakfast + "\n" + lunch + "\n" + dinner +
    "\n\n" + quote +
    "\n\n```This is an automated, scheduled message. Bot commands are temporarily enabled on this chat.```";
  try {
    let chat = await bot.client.getChatById(redacted.WHATS_FOR_DINNER_ID);
    chat.sendMessage(text);
  } catch (err) {
    console.error("There was an error sending the message:\n" + err);
  }
}, null, true);

/* TODO:
 * Repopulate thee database with full chat history authenticated as BENJI
 */

// GLOBALS:
Object.defineProperty(String.prototype, 'capitalize', {
  value: function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
  },
  enumerable: false
});
let bot = new Bot(); //60 * 1000 * 30);
const redacted = new removedInfo();
var con = mysql.createConnection(redacted.DB_AUTH);
let pollManager = new Poll_Manager(bot, con);
con.connect(err => {
  if (err) throw err;
  console.log("Connected!");
});
let timeout;


// FUNCTIONS:

async function getQuote(ignoreQueue = false) {
  if (bot.database.requestedQuotes.length > 0 && !ignoreQueue) {
    let quote = bot.database.requestedQuotes.shift();
    bot.writeChangesToFile();
    return quote.quote + " - " + quote.author;

  } else {
    let response = await axios.get("https://zenquotes.io/api/random");
    return `${response.data[0].q} - ${response.data[0].a}`;
  }
}

function getMeal(meal) {
  let sentance = meal.capitalize();
  let day = new Date();
  let dayIndex = day.getDay();
  switch (meal) {
    case "breakfast":
      if ((day.getHours() == 9 && day.getMinutes() >= 30) || (day.getHours() > 9)) {
        // get dinner for the next day
        dayIndex++;
        if (dayIndex >= 7) dayIndex -= 7;
        // and change the response sentance
        sentance = "Breakfast for tomorrow morning is";
      } else sentance += " for today is";
      break;
    case "lunch":
      if ((day.getHours() == 13 && day.getMinutes() >= 15) || (day.getHours() > 13)) {
        // get dinner for the next day
        dayIndex++;
        if (dayIndex >= 7) dayIndex -= 7;
        // and change the response sentance
        sentance = "Lunch for tomorrow afternoon is";
      } else sentance += " for today is";
      break;
    case "dinner":
      if ((dayIndex < 6 && ((day.getHours() == 19 && day.getMinutes() >= 30) ||
        day.getHours() > 19)) || (dayIndex >= 6 && day.getHours() > 22)) {
        // get dinner for the next day
        dayIndex++;
        if (dayIndex >= 7) dayIndex -= 7;
        // and change the response sentance
        sentance = "Dinner for tomorrow night is";
      } else sentance += " for tonight is";
      break;
  }
  let dayName = bot.database.week[dayIndex];
  // Get the dinner for that day
  let food = bot.database[meal].rotation[dayName];
  // If there are multiple dinners for that night
  if (typeof food == "object") {
    // Then there is a rotation of dinner. Get the dinner for the current week.
    food = food[bot.database.alternateWeek ? 1 : 0];
  }
  //                                                    [         random number btw 80 and 96         ]
  return `${sentance} ${food}. [Certainty: ${Math.floor(Math.random() * (96 - 80) + 80)}%]`;
}

function includes(str, arr) {
  if (typeof arr == "string") arr = [arr];
  return (arr.some(v => str.includes(v)));
}

function updateDescription(chat, newContent) {
  newContent = newContent.substr(newContent.lastIndexOf("!about") + 7);
  let oldDescription = chat.description;
  let index = oldDescription.lastIndexOf("Automatic updates:");
  let firstHalfOfDescription = (index != -1) ? oldDescription.substr(0, index) : chat.description;
  let fullMsg = firstHalfOfDescription + "Automatic updates:\n" + newContent;
  chat.setDescription(fullMsg);
}

async function generateWFDDescription() {
  let breakfast = getMeal("breakfast");
  let lunch = getMeal("lunch");
  let dinner = getMeal("dinner");
  let quote = await getQuote();
  let text = breakfast + "\n" + lunch + "\n" + dinner + "\n\n" + quote;// + "\n========\n" + foodRotation;
  return text;
}

function getFullMealRotation() {
  let foodRotation = "";
  for (let day of bot.database.week) {
    for (let meal of ["breakfast", "lunch", "dinner"]) {
      foodRotation += `${day} ${meal}:`;
      if (typeof bot.database[meal].rotation[day] == "object") {
        for (let i = 0; i < bot.database[meal].rotation[day].length; i++) {
          foodRotation += ` ${bot.database[meal].rotation[day][i]}`;
          if (i != bot.database[meal].rotation[day].length - 1) foodRotation += " OR";
          else foodRotation += "\n";
        }
      } else {
        foodRotation += ` ${bot.database[meal].rotation[day]}\n`;
      }
    }
    foodRotation += "\n";
  }
  return foodRotation;
}

async function logMessage(msg) {
  if (msg.type == "location") msg.body = "<LOCATION>";
  let mentions = "";
  let ext = null;
  // if (msg.hasMedia) {
  //   let media = await msg.downloadMedia();
  //   media.toFilePath(`/home/dinnerBot/static/media/${msg.mediaKey}`);
  //   ext = "." + mime.getExtension(media.mimetype);
  // }
  for (let id of msg.mentionedIds) mentions += (id + "|");
  let dbValues = {
    sender: msg.sender,
    sent_at: msg.timestamp,
    body: msg.originalBody,
    messageID: msg.id._serialized,
    type: msg.type,
    has_media: msg.hasMedia,
    mediaID: msg.mediaKey || null,
    mentionedIds: mentions,
    chat_name: msg.chat.name,
    pushname: msg.contactOfSender.pushname,
    is_group: msg.chat.isGroup,
    chatID: msg.id.remote,
    media_ext: ext,
  };
  con.query("INSERT INTO messages SET ?", dbValues, err => {
    if (err) console.log(err.message);
  });
  // contactDisplayName
  // console.log(`contactOfSender.name: ${msg.contactOfSender.name}`);
  // console.log(`contactChat.name: ${msg.contactChat.name}`);
  chatValues = {
    chatID: msg.id.remote,
    chat_name: msg.chat.name,
    last_at: msg.timestamp,
    last_body: msg.originalBody,
    last_sender: msg.sender,
    last_pushname: msg.contactOfSender.pushname,
    last_type: msg.type,
    lastID: msg.id._serialized,
    is_group: msg.chat.isGroup,
    contact_display_name: msg.contactOfSender.displayName,
    last_media_ext: ext,
  };
  con.query("INSERT INTO chats SET ? ON DUPLICATE KEY UPDATE ?", [chatValues, chatValues], err => {
    if (err) console.log(err.message);
  });
}

function isFromAdmin(msg) {
  if (bot.database.admins.includes(msg.sender)) return true;
  else if (msg.chat.isGroup)
    for (let participant of msg.chat.participants)
      if (participant.id._serialized == msg.sender)
        return participant.isAdmin;
  return msg.fromMe;
}


bot.client.on('message_create', async msg => {
  // if (msg.fromMe) return;
  if (msg.fromMe && includes(msg.body, "\u200B")) return; // if mesage contains invisible HAIR SPACE char, return because it's automated
  if (["e2e_notification", "call_log"].includes(msg.type)) return; // Don't bother with calls or end2end alerts
  msg.chat = await msg.getChat();
  msg.contactOfSender = await msg.getContact();
  msg.contactChat = await msg.contactOfSender.getChat();
  msg.contactOfSender.displayName = msg.fromMe ?
    "YTS Bot" :
    msg.contactOfSender.name || msg.contactOfSender.pushname || msg.contactChat.name;
  msg.originalBody = msg.body;
  msg.body = msg.body.toLowerCase();
  msg.sender = msg.author || msg.from;
  if (msg.mediaKey) msg.mediaKey = msg.mediaKey.replace(/\//g, "");
  let replyText = "";
  let replyMentions = [];

  if (msg.type == "buttons_response") {
    pollManager.handleResult(msg);
  }

  logMessage(msg);
  msg.chat.sendSeen();
  if (msg.body == "!on" && isFromAdmin(msg)) {
    bot.database.enabled = true;
    msg.reply("Automatic replies are now enabled.");
  }
  if (msg.body == "!off" && isFromAdmin(msg)) {
    bot.database.enabled = false;
    msg.reply("Automatic replies are now disabled.");
  }

  if (bot.database.blacklist.includes(msg.sender)) return;
  if (msg.chat.isGroup) {
    if ([redacted.TEST_CHAT_ID, redacted.BOT_MAIN_CHAT, redacted.SHRAGA_GROUP_CHAT_ID, redacted.WHATS_FOR_DINNER_ID].includes(msg.chat.id._serialized)) {
      if (bot.database.beta && msg.chat.id._serialized != redacted.TEST_CHAT_ID) return;
      if (includes(msg.body, "@madrichim")) {
        for (let madrich of bot.database.madrichim) {
          const madrichContact = await bot.client.getContactById(madrich);
          replyMentions.push(madrichContact);
          replyText += `@${madrichContact.number} `;
        }
      } else if (includes(msg.body, "@madrich")) {
        let day = new Date();
        let dayIndex = day.getDay();
        // Since madrichim rotate at 11pm, increment the day if after 11pm
        if (day.getHours() == 23) dayIndex++;
        let madrichID = bot.database.madrichRotation[dayIndex];
        let madrichContact = await bot.client.getContactById(madrichID);
        replyMentions.push(madrichContact);
        replyText += `The current madrich on duty is @${madrichContact.number}`;
      } else if (msg.body == '@everyone' && bot.database.enabled && isFromAdmin(msg)) {
        let text = "";
        let mentions = [];

        for (let participant of msg.chat.participants) {
          const contact = await bot.client.getContactById(participant.id._serialized);
          mentions.push(contact);
          text += `@${participant.id.user} `;
        }
        msg.chat.sendMessage(text, {
          mentions
        });
      } else if (msg.body == "!update") {
        let breakfast = getMeal("breakfast");
        let lunch = getMeal("lunch");
        let dinner = getMeal("dinner");
        msg.chat.setDescription(breakfast + "\n" + lunch + "\n" + dinner);
      } else if (msg.body.split(" ").includes("wfd") && bot.database.enabled) {
        bot.database.dinner.count++;
        replyText += getMeal("dinner");
      } else if (msg.body.split(" ").includes("wfl") && bot.database.enabled) {
        bot.database.lunch.count++;
        replyText += getMeal("lunch");
      } else if (msg.body.split(" ").includes("wfb") && bot.database.enabled) {
        bot.database.breakfast.count++;
        replyText += getMeal("breakfast");
      } else if (msg.body == "!quote" && bot.database.enabled) {
        msg.reply(await getQuote());
        return;
      }

      if (msg.body == "!stats") {
        msg.reply("Sorry, but to reduce spam on the chat, I will only reply with stats if you PM me.", msg.contactOfSender.id._serialized);
      }

      if (includes(msg.body, "!mute") && isFromAdmin(msg)) {
        let muteTime = msg.body.substr(msg.body.lastIndexOf("!mute") + 6);
        if (muteTime == "") {
          msg.chat.setMessagesAdminsOnly(true);
          return;
        }
        let muteSeconds = parse(muteTime);
        if (muteSeconds == null) {
          msg.reply(`Sorry, but \`\`\`${muteTime}\`\`\` is not a valid time unit.`, msg.contactOfSender.id._serialized);
          return;
        }
        msg.chat.setMessagesAdminsOnly(true);
        msg.reply(`This chat will be unmuted in ${prettyMilliseconds(muteSeconds, { secondsDecimalDigits: 0 })}`);
        if (timeout != undefined) clearTimeout(timeout);
        timeout = setTimeout(_ => {
          msg.chat.setMessagesAdminsOnly(false);
        }, muteSeconds);
      }

      if (includes(msg.body, "!unmute") && isFromAdmin(msg)) {
        let unmuteTime = msg.body.substr(msg.body.lastIndexOf("!unmute") + 8);
        let unmuteSeconds = parse(unmuteTime) || 0;
        clearTimeout(timeout);
        timeout = setTimeout(_ => {
          msg.chat.setMessagesAdminsOnly(false);
        }, unmuteSeconds);
        if (unmuteSeconds > 0) msg.reply(`This chat will be unmuted in ${prettyMilliseconds(unmuteSeconds, { secondsDecimalDigits: 0 })}`);
      }

      if (includes(msg.body, "!kick") && isFromAdmin(msg)) {
        if (msg.mentionedIds.includes(bot.client.info.wid) || msg.mentionedIds.includes(bot.database.owner))
          return;
        for (let userID of msg.mentionedIds)
          msg.chat.removeParticipants([userID]);
        let stripped = msg.body;
        while (stripped.includes("@")) stripped = stripped.substr(0, stripped.indexOf("@")) + stripped.substr(stripped.indexOf(" ", stripped.indexOf("@")) + 1);
        let kickTime = stripped.substr(stripped.lastIndexOf("!kick") + 6);
        let kickSeconds = parse(kickTime);
        if (kickSeconds) {
          for (let userID of msg.mentionedIds) {
            bot.newTask("addUser", userID, msg.chat, Date.now() + kickSeconds);
          }
        }
      }

      if (includes(msg.body, "!ignore") && isFromAdmin(msg)) {
        if (msg.mentionedIds.includes(bot.client.info.wid) || msg.mentionedIds.includes(bot.database.owner))
          return;
        let stripped = msg.body;
        while (stripped.includes("@")) stripped = stripped.substr(0, stripped.indexOf("@")) + stripped.substr(stripped.indexOf(" ", stripped.indexOf("@")) + 1);
        let ignoreTime = stripped.substr(stripped.lastIndexOf("!ignore") + 8);
        let ignoreSeconds = parse(ignoreTime);
        if (ignoreTime == "indefinate") ignoreSeconds = false;
        replyText += `Messages from the above number/s will be ignored ${ignoreSeconds ? "for " + ignoreTime : "indefinitly"}.`;
        for (let userID of msg.mentionedIds) {
          if (userID != bot.client.info.wid) bot.database.blacklist.push(userID);
          if (ignoreSeconds) bot.newTask("unblockUser", userID, msg.chat, Date.now() + ignoreSeconds);
        }
        msg.reply(replyText);
        return;
      }


      if (includes(msg.body, ["dinner", "wfd"])) {
        // if (Math.floor(Math.random() * 10) == 0) replyText += "Nope.";
        // // 10% chance of <No, screw you>
        // else if (Math.floor(Math.random() * 4) == 0) {
        //   // 25% chance of pinging Binny
        //   for (let participant of msg.chat.participants) {
        //     if (participant.id._serialized == redacted.BINNY_F) {
        //       const contact = await bot.client.getContactById(participant.id._serialized);
        //       replyMentions.push(contact);
        //       break;
        //     }
        //   }
        //
        //   replyText += "@" + redacted.BINNY_F_UNSERIALIZED;
        // }
        bot.database.dinner.count++;
        bot.database.dinner.lastMention = Date.now();
      }
      if (includes(msg.body, ["stir-fry", "stirfry", "stir fry"])) {
        bot.database.stirfryCount++;
      }
      if (includes(msg.body, 'schnitzel')) {
        bot.database.schnitzelCount++;
      }
      if (includes(msg.body, "goulash")) {
        bot.database.goulashCount++;
      }
      bot.writeChangesToFile();

      if (bot.database.enabled && replyText != "") msg.reply(replyText + `\n\n${await getQuote()}`, null, {
        mentions: replyMentions
      });
    }
  } else {
    if (msg.body.startsWith("!dinner") && isFromAdmin(msg)) {
      let message = msg.originalBody.substring(8);
      bot.client.sendMessage(redacted.WHATS_FOR_DINNER_ID, message);
      return;
    } else if (msg.body.startsWith("!test") && isFromAdmin(msg)) {
      let message = msg.originalBody.substring(6);
      bot.client.sendMessage(redacted.TEST_CHAT_ID, message);
      return;
    } else if (msg.body.startsWith("!shraga") && isFromAdmin(msg)) {
      let message = msg.originalBody.substring(8);
      bot.client.sendMessage(redacted.SHRAGA_GROUP_CHAT_ID, message);
      return;
    } else if (msg.body.startsWith("!nextquote") && isFromAdmin(msg)) {
      let text = msg.originalBody.substr(11);
      let splitIndex = text.lastIndexOf(" - ");
      if (splitIndex < 0) return msg.reply("Sorry, but I couldn't find the author of that quote. The correct syntax is ```quote``` - ```author```.");
      let quote = text.substr(0, splitIndex);
      let author = text.substr(splitIndex + 3);
      bot.newQuote({
        quote,
        author
      });
      msg.reply(`"${quote}", said by "${author}", has been added to the quote queue.`);
    } else if (msg.body.startsWith("!ignore") && isFromAdmin(msg)) {
      bot.database.blacklist.push(msg.chat.id._serialized);
      let stripped = msg.body;
      while (stripped.includes("@")) stripped = stripped.substr(0, stripped.indexOf("@")) + stripped.substr(stripped.indexOf(" ", stripped.indexOf("@")) + 1);
      let ignoreTime = stripped.substr(stripped.lastIndexOf("!ignore") + 8);
      let ignoreSeconds = parse(ignoreTime);
      let replyText = "Messages from this number will be ignored ";
      if (ignoreSeconds) {
        replyText += `for ${ignoreTime}.`;
        bot.newTask("unblockUser", msg.chat.id._serialized, msg.chat, Date.now() + ignoreSeconds);
      } else replyText += "indefinitly.";
      chat.sendMessage(replyText);


    } else if (msg.body.startsWith("poll results")) {
      // get the index of the end of "poll results"
      let pollID = msg.originalBody.substr(13);
      let poll = bot.database.polls[pollID];
      if (!poll) {
        let polls = "";
        for (const [name] of Object.entries(bot.database.polls)) polls += `${name}\n`;
        return msg.reply(`Sorry, but I couldn't find a poll with the ID "${pollID}". Here's a list of all the polls I know about:\n\n\`\`\`${polls}\`\`\``);
      }

      let replyText = `${pollID} results:\n\n`;
      for (const [name, voteCount] of Object.entries(poll.results)) {
        replyText += `${name}: ${voteCount}\n`;
      }

      msg.reply(replyText);
    } else if (msg.body.startsWith("!poll") && isFromAdmin(msg)) {
      // Message schema:
      /**
       * !poll
       * id: <pollID>
       * type: <pollType>
       * topic: <pollTopic>
       * [test: <true/false>]
       */
      let rawOptions = msg.originalBody.substring(6);
      let options = {};
      for (let option of rawOptions.split("\n")) {
        let splitIndex = option.indexOf(":");
        if (splitIndex < 0) continue;
        let key = option.substr(0, splitIndex);
        let value = option.substr(splitIndex + 2);
        options[key] = value;
      }
      if (!(options.id || options.type || options.topic)) return msg.reply("Sorry, but you are missing some parameters. The correct syntax is ```!poll```\n```id: <pollID>```\n```type: <pollType>```\n```topic: <pollTopic>```\n```[test: <true/false>]```\n\n_Pro tip: A test poll privately sends you a preview of the poll, so you can test it out before sending it to the group._");
      msg.reply(`Sending a poll with the following options:\n\n${JSON.stringify(options, null, 2)}`);
      let chat = options.test ? bot.client.getChatById(redacted.TEST_CHAT_ID) : msg.chat;
      pollManager.publish(options.id, chat, options.type, options.topic, options.test);
    }
    switch (msg.body) {
      case "wfb":
        msg.reply(getMeal("breakfast"));
        break;
      case "wfl":
        msg.reply(getMeal("lunch"));
        break;
      case "wfd":
        msg.reply(getMeal("dinner"));
        break;
      case "!quote":
        msg.reply(await getQuote());
        break;
      case '!restart':
        if (isFromAdmin(msg)) {
          await msg.reply("You got it, Boss! Restarting now...");
          console.log("Restarting due to command");
          process.exit(0);
        }
        break;
      case '!reload':
        if (isFromAdmin(msg)) {
          bot.database = JSON.parse(fs.readFileSync(bot.FAKE_DATABASE)) || {};
          msg.reply("Database reloaded");
        }
        break;
      case '!dump':
        msg.reply("```" + JSON.stringify(bot.database, null, 2) + "```");
        break;
      case '!stats':
        bot.database.dinner.statsCount++;
        msg.reply(bot.generateStats(bot.database));
        break;
      case '!help':
        msg.reply(redacted.HELP);
        break;
      case '!todo':
        msg.reply(redacted.TODO_LIST);
        break;
      case '!info':
        let info = bot.client.info;
        msg.reply(`*Connection info*
    User name: ${info.pushname}
    My number: ${info.wid.user}
    Platform: ${info.platform}
    WhatsApp version: ${info.phone.wa_version}`);
        break;
      default:
        // msg.reply("Sorry, but I do not understand what you are trying to tell me. If you want to sign up for the washing machine, send me a message that contains just the word `in`. Please do not send `in` multiple times. Thank you.")
        break;
    }
  }
});

// CLIENT START:
bot.start();