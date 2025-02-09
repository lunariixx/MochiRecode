const { readdirSync } = require("fs");

module.exports = async (bot, client) => {
	let { logger } = bot;
	const buttonsPath = "./components/buttons/";

	client.buttons = new Map();

	const buttonFiles = readdirSync(buttonsPath).filter((f) => f.endsWith(".js"));

	for (let file of buttonFiles) {
		try {
			let button = require(`.${buttonsPath}${file}`);

			if (button.customId && button.execute) {
				client.buttons.set(button.customId, button);
			} else {
				logger.warn(`[Handler] Buttons: '${file}' is missing customId or execute property.`);
			}
		} catch (err) {
			logger.error(`[Handler] Buttons: Failed to load '${file}':`, err);
		}
	}

	logger.info("[Handler] Button interactions: Initialized.");
};
