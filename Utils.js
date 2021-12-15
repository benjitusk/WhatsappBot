const fs = require('fs');
const {
  Client,
  Buttons
} = require('whatsapp-web.js');
const CronJob = require('cron').CronJob;
const qrcode = require('qrcode-terminal');
const SESSION_FILE_PATH = '../whatsapp/sessions/bot.json';
const prettyMilliseconds = require('pretty-ms');
require('dotenv').config();

class Bot {
  constructor(timeout = undefined) {
    this.FAKE_DATABASE = process.env.PRODUCTION ? '/home/dinnerBot/whatsapp.json' : "../dinnerSite/whatsapp.json";
    this.database = JSON.parse(fs.readFileSync(this.FAKE_DATABASE)) || {};
    new CronJob('0 0 0 * * 5', () => {
      this.database.alternateWeek = !this.database.alternateWeek;
    }, null, true);
    this.maximumLifetime = timeout; // 30 minutes
    if (timeout) setTimeout(() => {
      console.log(`Restarting process becuase we exceeded the maximum lifetime of ${this.maximumLifetime / 600} minutes`);
      process.exit(0);
    }, this.maximumLifetime);
    // this.database = JSON.parse(fs.readFileSync('whatsapp.json')) || {};
    let sessionData;
    if (fs.existsSync(SESSION_FILE_PATH)) {
      sessionData = require(SESSION_FILE_PATH);
    }
    this.client = new Client({
      session: sessionData
    });

    // this.client EVENTS:
    this.client.on('qr', qr => {
      qrcode.generate(qr, {
        small: true
      });
    });
    this.client.on('authenticated', session => {
      console.log("Successfully Authenticated");
      // Save session values to the file upon successful auth
      sessionData = session;
      fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), (err) => {
        if (err) {
          console.error(err);
        }
      });
    });
    this.client.on('auth_failure', err => {
      console.warn(`Authentication FAILED with this message:\n${err}`);
      console.warn("Restarting in hopes of better fortune...");
      process.exit(0);
    });
    this.client.on('ready', _ => {
      console.log('Client is ready!');
      this.client.setStatus(`Last updated at ${Date()}`);
      this.checkTasks();
      setInterval(_ => {
        this.checkTasks();
      }, 5 * 1000);
    });
  }

  start() {
    return this.client.initialize();
  }
  generateStats(database) {
    return `Stats have been queried ${database.dinner.statsCount} times.
"What's for dinner?" has been asked ${database.dinner.count} times, the most recent of which being ${prettyMilliseconds(Date.now() - database.dinner.lastMention, { secondsDecimalDigits: 0 })} ago.

The word "schnitzel" was mentioned ${database.schnitzelCount} times.
The words "stir fry" were mentioned ${database.stirfryCount} times.
The word "goulash" was mentioned ${database.goulashCount} times.
14 people lost their AirPods  so far.`;
  }

  newTask(action, user, chat, dueDate) {
    let task = {
      "action": action,
      "user": user,
      "chatID": chat.id._serialized,
      "dueDate": dueDate
    };
    console.log(`Adding the following task to the database: ${JSON.stringify(task, null, 2)}`);
    this.database.futureTasks.push(task);
    this.writeChangesToFile();
  }

  newQuote(quote) {
    this.database.requestedQuotes.push(quote);
    this.writeChangesToFile();
  }

  async checkTasks() {
    let now = Date.now();
    for (let taskIndex in this.database.futureTasks) {
      let task = this.database.futureTasks[taskIndex];
      if (task.dueDate <= now) {
        let chat = await this.client.getChatById(task.chatID);
        switch (task.action) {
          case "addUser":
            chat.addParticipants([task.user]);
            break;
          case "unmuteChat":
            chat.setMessagesAdminsOnly(false);
            break;
          case "unblockUser":
            this.database.blacklist.splice(this.database.blacklist.indexOf(task.user), 1);
        }
        this.database.futureTasks.splice(this.database.futureTasks.indexOf(task), 1);
        this.writeChangesToFile();
      }
    }
  }

  writeChangesToFile() {
    fs.writeFileSync(this.FAKE_DATABASE, JSON.stringify(this.database, null, 2));
  }

}

// The class for polls
/**
 * This is the class for polls.
 * Use this object to more easily manage active
 * and unactive polls.
 */
class Poll {

  // The constructor for the poll class
  /**
   * 
   * @param {string} pollID 
   * @param {WAWebJS.Chat} chat 
   * @param {string} type 
   * @param {string} topic 
   */
  constructor(pollID, chat, type, topic) {
    this.pollID = pollID;
    this.chat = chat;
    this.type = type;
    this.topic = topic;
    this.date = Date.now();
    this.expires = this.date + (1000 * 60 * 60 * 2); // 2 hours
    this.body = `Please select a rating for the ${this.topic} that was served for ${this.type}.\n\nRemember, pushing a button will send a message with that text to the chat.`;
    this.title = `${this.type} poll:`;
    this.footer = "If you wish to vote privately, please *privately reply* to this message with the text '!vote'";
    this.buttons = new Buttons(this.body, [
      { id: `${this.pollID}:good`, body: "👍" },
      { id: `${this.pollID}:meh`, body: "😐" },
      { id: `${this.pollID}:bad`, body: "👎" },
    ], this.title, this.footer);
  }

  /**
   * Function to handle responses to the poll,
   * and to update the database accordingly.
   * @param {WAWebJS.Message} result
   */
  handleResult(result) {
    // Get the relevant data from the message. This includes the user, the pollID, and the selectedButtonId.
    let buttonId = result.selectedButtonId;
    let pollID = buttonId.split(":")[0];
    let poll = this.polls[pollID];
    if (!poll) return;
    if (poll.voterIDs.includes(result.sender))
      return result.chat.sendMessage("You have already voted on this poll. Subsequent votes will be discarded.");
    let selectedButton = buttonId.split(":")[1];

    // Add the vote to this.polls
    poll.results[selectedButton]++;
    poll.voterIDs.push(result.sender);
    this.bot.database.polls = this.polls;
    this.bot.writeChangesToFile();
  }

}

module.exports = { Bot, Poll };