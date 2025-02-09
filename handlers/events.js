const { readdirSync } = require("fs");
const path = require("path");
const { logger } = bot;

module.exports = async (bot, client, reload) => {
	let missingEvents = false;
	const eventsPath = path.join(__dirname, "../events"); 

	readdirSync(eventsPath).forEach((file) => {
		if (!file.endsWith(".js")) return;

		try {
			if (reload) delete require.cache[require.resolve(`../events/${file}`)];
			let event = require(`../events/${file}`);

			if (event.name) {
				client.events.set(event.name, event);
			} else {
				logger.warn(`[Handler] Events: File '${file}' is missing a name property.`);
				missingEvents = true;
			}
		} catch (err) {
			logger.error(`[Handler] Events: Failed to load '${file}':`, err);
		}
	});

	if (!missingEvents) {
		logger.info("[Handler] Events: Initialized");
	}

	client._events = {};
	client.events.forEach((event) => {
		try {
			event.initEvent(client, bot);
		} catch (err) {
			logger.error(err);
		}
	});
};
