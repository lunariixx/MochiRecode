const { MessageFlags, EmbedBuilder } = require("discord.js");
const path = require("path");
const Database = require("better-sqlite3");
const { config } = bot;

const dbPath = path.join(__dirname, "../../db/database.sqlite");
const db = new Database(dbPath);

module.exports = {
	customId: "button_verify",
	async execute(interaction, bot, client) {
		const { user } = interaction;
		const userId = user.id;

		const result = db.prepare("SELECT verification FROM users WHERE id = ?").get(userId);

		console.log(result);

		if (!result || Number(result.verification) === 1) {
			const alreadySubmittedEmbed = new EmbedBuilder()
				.setTitle("Error | Duplicate Submission")
				.setDescription("You already have a pending verification request. Please wait for it to be processed.")
				.setColor(config.embeds.colors.error)
				.setTimestamp();

			return interaction.reply({ embeds: [alreadySubmittedEmbed], flags: MessageFlags.Ephemeral });
		}

		db.prepare("INSERT INTO users (id, verification) VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET verification = excluded.verification").run(
			userId,
			0
		);

		const modal = client.modals.get("modal_verify");
		await modal.execute(interaction);
	},
};
