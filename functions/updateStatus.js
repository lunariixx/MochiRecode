const { logger, config } = bot;
const { ActivityType } = require("discord.js")

module.exports = {
	name: "updateStatus",
	async execute(client) {
		const guildId = config.guild.main.id;

		const guild = client.guilds.cache.get(guildId) || await client.guilds.fetch(guildId);
		if (!guild) {
			logger.warn(`Guild ${guildId} not found!`);
			return;
		}

		try {
			const members = await guild.members.fetch();
			const memberCount = members.filter((member) => !member.user.bot).size;
			client.user.setActivity(`over ${memberCount} members`, { type: ActivityType.Watching });
		} catch (err) {
			logger.error(`[Function] updateStatus: Failed to fetch members:`, err);
		}
	},
};