const { readdirSync } = require("fs");
const { REST, Routes } = require("discord.js");

module.exports = async (bot, client, reload) => {
	let { config, logger } = bot;
	const rest = new REST({ version: "10" }).setToken(config.token);

	let slashCommands = [];
	const commandsPath = "./commands/";

	client.commands = new Map();

	readdirSync(commandsPath).forEach((dir) => {
		const commands = readdirSync(`${commandsPath}${dir}/`).filter((f) => f.endsWith(".js"));

		for (let file of commands) {
			try {
				if (reload) delete require.cache[require.resolve(`../commands/${dir}/${file}`)];
				let command = require(`../commands/${dir}/${file}`);

				if (command.data && command.execute) {
					slashCommands.push(command.data.toJSON());
					client.commands.set(command.data.name, command);
				} else {
					logger.warn(`[Handler] Commands: '${file}' is missing data or execute property.`);
				}
			} catch (err) {
				logger.error(`[Handler] Commands: Failed to load '${file}':`, err);
			}
		}
	});

	if (slashCommands.length === 0) {
		logger.warn("[Handler] No valid slash commands found.");
		return;
	}
	try {
		client.once("ready", async () => {
			await rest.put(Routes.applicationCommands(config.client_id), { body: slashCommands });
			logger.info("[Handler] Successfully registered global commands.");
		});
	} catch (err) {
		logger.error("[Handler] Failed to register global commands:", err.response?.data || err);
	}

	logger.info("[Handler] Slash Commands: Initialized.");
};
