const { MessageFlags } = require("discord.js");
const handleVerify = require("../../functions/handleVerify.js");

module.exports = {
	customId: "button_verify_approve",
	async execute(interaction, bot, client) {
		handleVerify.execute(interaction);
	},
};
