const fs = require('fs');
const {
  Client
} = require('whatsapp-web.js');
const CronJob = require('cron').CronJob;
const qrcode = require('qrcode-terminal');
const SESSION_FILE_PATH = './sessions/bot.json';
const prettyMilliseconds = require('pretty-ms');
require('dotenv').config();

class Bot {
  constructor(timeout = undefined) {
    this.FAKE_DATABASE = process.env.PRODUCTION ? '/home/dinnerBot/whatsapp.json' : "../dinnerBot/whatsapp.json";
    this.database = JSON.parse(fs.readFileSync(this.FAKE_DATABASE)) || {};
    new CronJob('0 0 0 * * 5', () => {
      this.database.alternateWeek = !this.database.alternateWeek;
    }, null, true);
    this.maximumLifetime = timeout; // 30 minutes
    if (timeout) setTimeout(() => {
      console.log(`Restarting process becuase we exceeded the maximum lifetime of ${this.maximumLifetime/600} minutes`);
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
    this.client.initialize();
  }
  generateStats(database) {
    return `Stats have been queried ${database.dinner.statsCount} times.
"What's for dinner?" has been asked ${database.dinner.count} times, the most recent of which being ${prettyMilliseconds(Date.now() - database.dinner.lastMention, {secondsDecimalDigits: 0})} ago.

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

module.exports = Bot;