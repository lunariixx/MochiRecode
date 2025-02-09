const { readdirSync } = require("fs");
const path = require("path");

module.exports = async (bot, client, reload) => {
    const functionsPath = path.join(__dirname, "../functions");
    const { logger } = bot;
    let missingFunctions = false;

    readdirSync(functionsPath).forEach((file) => {
        if (!file.endsWith(".js")) return;

        try {
            if (reload) delete require.cache[require.resolve(`../functions/${file}`)];
            let func = require(`../functions/${file}`);

            if (func.name) {
                client.functions.set(func.name, func);
                if (func.aliases) {
                    func.aliases.forEach((alias) => {
                        client.aliases.set(alias, func.name);
                    });
                }
            } else {
                logger.warn(`[Handler] Functions: File '${file}' is missing a name property.`);
                missingFunctions = true;
            }
        } catch (err) {
            logger.error(`[Handler] Functions: Failed to load '${file}':`, err);
        }
    });

    if (!missingFunctions) {
        logger.info("[Handler] Functions: Initialized");
    }
};
