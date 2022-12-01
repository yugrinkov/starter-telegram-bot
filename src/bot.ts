import { Bot, InlineKeyboard, webhookCallback } from "grammy";
import express from "express";
const { MongoClient } = require('mongodb');

const formatDate = function (date: any, timeZone: any) {
  const format_options = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    timeZone,
    timeZoneName: 'short'
  }
  return new Intl.DateTimeFormat('ua-UA', format_options as any).format(date);
}

// Create a bot using the Telegram token
const bot = new Bot(process.env.TELEGRAM_TOKEN || "");

// Handle the /yo command to greet the user
bot.command("check", async(ctx) => {
  const uri = "mongodb+srv://nextjs:SMp92YTGrYtBlGpl@cluster0.lyklx.mongodb.net?retryWrites=true&w=majority";
  const client = new MongoClient(uri);
  await client.connect();
  const lastRecords = await client.db("electricity").collection("logs").find().sort({_id: -1}).limit(1).toArray();
  const currentTime = formatDate(new Date(lastRecords[0]._id), 'Europe/Kiev');
  const message = lastRecords[0].online ? `${currentTime} \n \u{2705} Cвітло є!` : `${currentTime} \n \u{274C} Світла немає` 
  return ctx.reply(message) 
});

// Suggest commands in the menu
bot.api.setMyCommands([
  { command: "check", description: "Перевірка наявності світла" },
]);

// Handle all other messages and the /start command
const introductionMessage = `\u{1F4A1} Привіт! Цей телеграм бот допоможе вам дізнатися статус щодо наявності світла за адресою В 16.

<b>Команди</b>
/check - Перевірити чи є світло \u{2753}`;

const replyWithIntro = (ctx: any) =>
  ctx.reply(introductionMessage, {
    parse_mode: "HTML"
  });

bot.command("start", replyWithIntro);
bot.on("message", replyWithIntro);

// Start the server
if (process.env.NODE_ENV === "production") {
  // Use Webhooks for the production server
  const app = express();
  app.use(express.json());
  app.use(webhookCallback(bot, "express"));

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Bot listening on port ${PORT}`);
  });
} else {
  // Use Long Polling for development
  bot.start();
}
