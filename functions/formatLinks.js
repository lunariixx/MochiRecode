module.exports = {
    name: "formatLinks",
    async execute(message) {
        const urlRegex = /(https?:\/\/(?:www\.)?(x\.com|twitter.com|reddit\.com|instagram\.com|tiktok\.com)\/[^\s]+)/gi;
        let modified = false;

        const formattedMessage = message.content.replace(urlRegex, (url) => {
            modified = true;
            return url
                .replace(/^https?:\/\/x\.com/, "https://fxtwitter.com")
                .replace(/^https?:\/\/twitter\.com/, "https://fxtwitter.com")
                .replace(/^https?:\/\/(www\.)?reddit\.com/, "https://rxddit.com")
                .replace(/^https?:\/\/(www\.)?instagram\.com/, "https://ddinstagram.com")
                .replace(/^https?:\/\/(www\.)?tiktok\.com/, "https://tfxktok.com");
        });

        if (modified) {
            await message.suppressEmbeds(true);
            await message.reply(`${formattedMessage}`);
        }
    }
};
