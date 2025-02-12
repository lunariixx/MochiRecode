const { readdirSync } = require("fs");

module.exports = async (bot, client) => {
    let { logger } = bot;
    const modalsPath = "./components/modals/";

    client.modals = new Map();

    const modalFiles = readdirSync(modalsPath).filter((f) => f.endsWith(".js"));

    for (let file of modalFiles) {
        try {
            let modal = require(`.${modalsPath}${file}`);

            if (modal.data?.customId && typeof modal.execute === "function") {
                client.modals.set(modal.data.customId, modal);
            } else {
                logger.warn(`[Handler] Modals: '${file}' is missing data.customId or execute property.`);
            }            
        } catch (err) {
            logger.error({ err }, `[Handler] Modals: Failed to load '${file}':`, err.stack);
        }
    }

    logger.info("[Handler] Modal interactions: Initialized.");
};
