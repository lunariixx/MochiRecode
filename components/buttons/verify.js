const { MessageFlags } = require("discord.js");

module.exports = {
	customId: "button_verify",
	async execute(interaction, bot, client) {
		await interaction.reply({ content: "not done", flags: MessageFlags.Ephemeral });
	},
};
