import { Bot, InlineKeyboard, webhookCallback } from "grammy";
import { chunk } from "lodash";
import express from "express";
import { applyTextEffect, Variant } from "./textEffects";

import type { Variant as TextEffectVariant } from "./textEffects";

// Create a bot using the Telegram token
const bot = new Bot(process.env.TELEGRAM_TOKEN || "");

// Handle the /yo command to greet the user
bot.command("check", (ctx) => ctx.reply(`Yo ${ctx.from?.username}`));

// Handle the /about command
const aboutUrlKeyboard = new InlineKeyboard().url(
  "Бот для перевірки наявності електропостачання за адресою В 16"
);

// Suggest commands in the menu
bot.api.setMyCommands([
  { command: "check", description: "Перевірка наявності світла" },
]);

// Handle all other messages and the /start command
const introductionMessage = `Привіт! Цей телеграм бот допоможе вам дізнатися статус щодо наявності світла за адресою В 16.

<b>Команди</b>
/check - Перевірити чи є світло`;

const replyWithIntro = (ctx: any) =>
  ctx.reply(introductionMessage, {
    reply_markup: aboutUrlKeyboard,
    parse_mode: "HTML",
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
