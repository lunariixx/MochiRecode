const { Events, EmbedBuilder } = require("discord.js");
const updateStatus = require("../functions/updateStatus.js");
const blocklistUpdate = require("../functions/blocklistUpdate.js");

module.exports = {
	name: "ready",
	async initEvent(client, bot) {
		client.once(Events.ClientReady, () => runAll(bot));
	},
};

async function runAll(bot) {
	const { client, config, logger } = bot;

	logger.info(`[Client] Bot initialized as ${client.user.tag}`);

	await updateStatus.execute(client);

	setInterval(() => {
		updateStatus.execute(client);
	}, 60000);

	setTimeout(() => {
		blocklistUpdate.execute();

		setInterval(() => {
			blocklistUpdate.execute();
		}, 86400000);
	}, 2000);

	const botLogChannel = client.channels.cache.get(config.guild.main.logging.bot);
	if (botLogChannel) {
		botLogChannel.send({
			embeds: [
				new EmbedBuilder()
					.setTitle("Bot Ready")
					.setDescription(
						`**Events:** \`${client.events?.size || 0}\`\n` +
							`**Commands:** \`${client.commands?.size || 0}\`\n` +
							`**Modals:** \`${client.modals?.size || 0}\`\n` +
							`**Buttons:** \`${client.buttons?.size || 0}\`\n` +
							`**Menus:** \`${client.menus?.size || 0}\`\n` +
							`**Functions:** \`${client.functions?.size || 0}\``
					)
					.setColor(config.embeds.colors.default),
			],
		});
	}
}
