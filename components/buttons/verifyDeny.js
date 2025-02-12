const { MessageFlags, EmbedBuilder } = require("discord.js");
const handleVerify = require("../../functions/handleVerify.js");

module.exports = {
	customId: "button_verify_deny",
	async execute(interaction, bot, client) {
		handleVerify.execute(interaction);
	},
};
