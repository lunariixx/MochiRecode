const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { performance } = require('perf_hooks');
let { config } = bot;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Get the bot's latency."),
  async execute(interaction) {
    const startTime = performance.now();
    await interaction.deferReply();

    let botPing = Math.round(performance.now() - startTime);
    if (botPing === -1) botPing = 'NaN';

    let apiPing = interaction.client.ws.ping;
    if (apiPing === -1) apiPing = 'NaN';

    const embed = new EmbedBuilder()
      .setTitle('Pong!')
      .setColor(config.embeds.colors.default) 
      .addFields(
        { name: 'Bot Latency', value: `\`${botPing}\`ms` },
        { name: 'API Latency', value: `\`${apiPing}\`ms` }
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
