module.exports = {
  name: "filterLinks",
  async execute(message) {
    try {
      const urlBlocklist = new Set(await require("../config/urlBlocklist.json")); 

      const content = message.content.toLowerCase();
      const urlPattern = /(?:https?:\/\/)?([a-zA-Z0-9.-]+\.[a-zA-Z]{2,6})(?:\/[^\s]*)?/g;

      const foundUrls = content.match(urlPattern);

      if (foundUrls) {
        console.time('URL Lookup Time');

        const containsBlacklistedUrl = foundUrls.some((url) => {
          try {
            const parsedUrl = new URL(url.startsWith('http') ? url : `http://${url}`);
            return urlBlocklist.has(parsedUrl.hostname); 
          } catch (error) {
            return false;
          }
        });

        if (containsBlacklistedUrl) {
          await message.delete();
          message.channel.send(`<@${message.author.id}>, that URL is blacklisted!`).then((warningMessage) => {
            setTimeout(() => {
              warningMessage.delete().catch(console.error);
            }, 3000);
          });
        }
      }
    } catch (error) {
      console.error("[ERROR] URL Blacklister:", err.stackor);
    }
  },
};
