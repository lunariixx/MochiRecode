const { Events } = require("discord.js");
const formatLinks = require("../functions/formatLinks.js"); 
const filterLinks = require("../functions/filterLinks.js"); 

module.exports = {
    name: "messageCreate",
    async initEvent(client, bot) {
        client.on(Events.MessageCreate, async (message) => {
            if (message.author.bot) return;

            await filterLinks.execute(message);
            await formatLinks.execute(message);
        });
    }
};
