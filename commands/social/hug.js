const { SlashCommandBuilder } = require("discord.js");
const { config } = bot;
const fs = require("fs");
const Database = require("better-sqlite3");
const db = new Database("./db/database.sqlite");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("hug")
    .setDescription("Give someone a hug!"),
  
  isSupporter: false, 
  PrefsHide: false, 

  async execute(interaction) {
    const userPrefs = db.prepare("SELECT hug FROM prefs WHERE user_id = ?").get(interaction.user.id);

    if (!userPrefs || userPrefs.hug === 0) {
      return interaction.reply({ content: "This command is disabled in your preferences. Use `/prefs` to enable it.", ephemeral: true });
    }

    const socialData = JSON.parse(fs.readFileSync("./config/socials.json", "utf-8"));
    const hugResponses = socialData.hug || ["*hugs*"];

    const randomHug = hugResponses[Math.floor(Math.random() * hugResponses.length)];
    
    await interaction.reply(randomHug);
  }
};
