const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");
const db = new Database("./db/database.sqlite");
const { config } = bot;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("preferences")
    .setDescription("View your preferences.")
    .addUserOption(option =>
      option.setName("user")
        .setDescription("View another user's preferences")
        .setRequired(false)
    ),

  async execute(interaction) {
    const targetUser = interaction.options.getUser("user") || interaction.user;

    // Fetch user preferences from the database
    const userPrefs = db.prepare("SELECT * FROM prefs WHERE user_id = ?").get(targetUser.id);

    // If no preferences exist, set default values
    if (!userPrefs) {
      db.prepare("INSERT INTO prefs (user_id) VALUES (?)").run(targetUser.id);
      return interaction.reply({ content: "User has no preferences set. Using defaults.", ephemeral: true });
    }

    const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));
    let socialCommands = [];
    let supporterCommands = [];

    for (const file of commandFiles) {
      const command = require(`../commands/${file}`);

      if (!userPrefs[command.data.name]) continue; // Skip disabled commands

      const status = userPrefs[command.data.name] ? "✅ On" : "❌ Off";
      const commandEntry = `${status} - \`/${command.data.name}\``;

      if (command.isSupporter) {
        supporterCommands.push(commandEntry);
      } else {
        socialCommands.push(commandEntry);
      }
    }

    const embed = new EmbedBuilder()
      .setTitle(`${targetUser.username}'s Preferences`)
      .setColor(config.embeds.colors.default)
      .addFields(
        { name: "📢 Social", value: socialCommands.length > 0 ? socialCommands.join("\n") : "None", inline: false },
        { name: "💎 Supporter", value: supporterCommands.length > 0 ? supporterCommands.join("\n") : "None", inline: false }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
