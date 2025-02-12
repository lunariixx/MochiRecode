const { Client, Collection } = require("discord.js");
const config = require("./config/main.js");
const logger = require("./utils/logger.js");
const { db } = require("./handlers/db.js"); 
const client = new Client({ intents: 131071 });

var { messagePrefix } = config;
let bot = { client, messagePrefix, config, logger };

global.bot = bot;

client.events = new Collection();
client.commands = new Collection();
client.modals = new Collection();
client.menus = new Collection();
client.buttons = new Collection();
client.functions = new Collection();

client.loadEvents = (bot, client, reload) => require("./handlers/events")(bot, client, reload);
client.loadCommands = (bot, client, reload) => require(`./handlers/commands`)(bot, client, reload);
client.loadModals = (bot, client, reload) => require(`./handlers/modals`)(bot, client, reload);
client.loadButtons = (bot, client, reload) => require(`./handlers/buttons`)(bot, client, reload);
//client.loadMenus = (bot, client, reload) => require(`./handlers/menus`)(bot, client, reload);
client.loadFunctions = (bot, client, reload) => require(`./handlers/functions`)(bot, client, reload);

client.loadEvents(bot, client, false);
client.loadCommands(bot, client, false);
client.loadModals(bot, client, false);
client.loadButtons(bot, client, false);
//client.loadMenus(bot, client, false);
client.loadFunctions(bot, client, false);

client.login(config.token);
