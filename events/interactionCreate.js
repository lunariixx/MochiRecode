const { Events, MessageFlags } = require("discord.js");
const { logger } = bot;

module.exports = {
	name: "interactionCreate",
	async initEvent(client, bot) {

		client.on(Events.InteractionCreate, async (interaction) => {
			logger.debug(`User ${interaction.user.tag} used interaction: ${interaction.customId || interaction.commandName}`);

			try {
				if (interaction.isButton()) {
					await handleButton(interaction, client, bot);
				} else if (interaction.isModalSubmit()) {
					await handleModal(interaction, client, bot);
				} else if (interaction.isAnySelectMenu()) {
					await handleSelectMenu(interaction, client, bot);
				} else if (interaction.isCommand()) {
					await handleCommand(interaction, client, bot);
				} else {
					logger.warn(`[Event] Unknown interaction type: ${interaction.customId}`);
				}
			} catch (err) {
				logger.error(`[Event] Interaction error:`, err);
				await interaction.reply({ content: "An error occurred while processing your interaction.", flags: MessageFlags.Ephemeral });
			}
		});
	},
};

async function handleButton(interaction, client, bot) {
	const handler = client.buttons.get(interaction.customId);
	if (!handler) {
		bot.logger.warn(`[Event] Unknown button interaction: ${interaction.customId}`);
		return interaction.reply({ content: "Unknown button action.", flags: MessageFlags.Ephemeral });
	}

	checkPerms(handler, interaction, bot);
	await handler.execute(interaction, bot, client);
}

async function handleModal(interaction, client, bot) {
	const handler = client.modals.get(interaction.customId);
	if (!handler) {
		bot.logger.warn(`[Event] Unknown modal interaction: ${interaction.customId}`);
		return interaction.reply({ content: "Unknown modal action.", flags: MessageFlags.Ephemeral });
	}

	await handler.execute(interaction, bot, client);
}

async function handleSelectMenu(interaction, client, bot) {
	const handler = client.menus.get(interaction.customId);
	if (!handler) {
		bot.logger.warn(`[Event] Unknown select menu interaction: ${interaction.customId}`);
		return interaction.reply({ content: "Unknown menu action.", flags: MessageFlags.Ephemeral });
	}

	await handler.execute(interaction, bot, client);
}

async function handleCommand(interaction, client, bot) {
	const handler = client.commands.get(interaction.commandName);
	if (!handler) return;

	//try {
		await handler.execute(interaction, bot);
	//} catch (err) {
	//	bot.logger.error(`[Event] Error executing command '${interaction.commandName}':`, err);
	//	await interaction.reply({ content: "There was an error while executing this command!", flags: MessageFlags.Ephemeral });
	//}
}

function checkPerms(handler, interaction, bot) {
	if (handler.ownerOnly && !bot.config.owners.includes(interaction.user.id)) {
		throw new Error("This interaction requires the `BOT_OWNER` permission!");
	}
	if (handler.devOnly && !bot.config.developers.includes(interaction.user.id)) {
		throw new Error("This interaction requires the `BOT_DEVELOPER` permission!");
	}
	if (interaction.member && handler.permissions) {
		const userPermLevel = getPermissionLevel(interaction.member);
		if (userPermLevel > handler.permissions) {
			throw new Error(`This interaction requires \`${getPermissionName(handler.permissions)}\` permission(s)!`);
		}
	}
}
