const { EmbedBuilder, MessageFlags, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require("discord.js");
const Database = require("better-sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "../db/database.sqlite");
const db = new Database(dbPath);
const { config, logger } = bot;

module.exports = {
	name: "handleVerify",
	async execute(interaction) {
		if (interaction.isModalSubmit?.() && interaction.customId === "modal_verify") {
			return handleSubmit(interaction);
		}
		if (interaction.isButton?.()) {
			if (interaction.customId === "button_verify_approve") {
				return handleDecision(interaction, "approve");
			} else if (interaction.customId === "button_verify_deny") {
				return handleDecision(interaction, "deny");
			}
		}
	},
};

async function handleSubmit(interaction) {
	const userId = interaction.user.id;
	const rules = interaction.fields.getTextInputValue("rules");
	const name = interaction.fields.getTextInputValue("name") || "N/A";
	const age = interaction.fields.getTextInputValue("age");
	const joinLocation = interaction.fields.getTextInputValue("join_location") || "N/A";
	const userInfo = interaction.fields.getTextInputValue("user_info") || "N/A";

	const errorMessages = [];
	if (!rules || !["yes", "no", "Yes", "No"].includes(rules)) {
		errorMessages.push('Please answer "Do you agree to the rules?" with "Yes" or "No".');
	}
	if (!age || isNaN(age) || age <= 0 || age > 999) {
		errorMessages.push("Please enter a valid age (numeric form, between 1 and 999).");
	}

	if (errorMessages.length > 0) {
		return interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setTitle("Error | Submission Invalid")
					.setDescription(errorMessages.join("\n"))
					.setColor(config.embeds.colors.error)
					.setTimestamp(),
			],
			flags: MessageFlags.Ephemeral,
		});
	}

	db.prepare("INSERT INTO users (id, verification) VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET verification = excluded.verification").run(
		userId,
		1
	);

	const logEmbed = new EmbedBuilder()
		.setAuthor({ name: `${interaction.user.displayName} (${interaction.user.username})`, iconURL: interaction.user.displayAvatarURL() })
		.setThumbnail(interaction.user.displayAvatarURL())
		.setTitle("Verification Submitted")
		.addFields(
			{ name: "Rules Agreement", value: rules },
			{ name: "Preferred Name", value: name },
			{ name: "Age", value: age },
			{ name: "Invite Origin", value: joinLocation },
			{ name: "User Information", value: userInfo },
			{ name: "Creation Date", value: `<t:${Math.floor(interaction.user.createdTimestamp / 1000)}:f>` }
		)
		.setColor(config.embeds.colors.default)
		.setTimestamp()
		.setFooter({ text: `User ID: ${interaction.user.id}` });

	const approve = new ButtonBuilder().setCustomId("button_verify_approve").setLabel("Approve").setStyle(ButtonStyle.Success);
	const deny = new ButtonBuilder().setCustomId("button_verify_deny").setLabel("Deny").setStyle(ButtonStyle.Danger);
	const avatar = new ButtonBuilder().setLabel("Avatar").setStyle(ButtonStyle.Link).setURL(interaction.user.displayAvatarURL());
	const tools = new ActionRowBuilder().addComponents(approve, deny, avatar);

	await interaction.reply({
		embeds: [
			new EmbedBuilder()
				.setTitle("Verification Success")
				.setDescription("Your verification submission has been successfully sent.")
				.setColor(config.embeds.colors.success)
				.setTimestamp(),
		],
		flags: MessageFlags.Ephemeral,
	});

	const logChannel = interaction.guild.channels.cache.get(config.guild.main.logging.verification);
	if (logChannel) {
		await logChannel.send({ embeds: [logEmbed], components: [tools] });
	}
}

async function handleDecision(interaction, action) {
	const reviewer = interaction.user.id;
	const footerText = interaction.message.embeds[0]?.footer?.text;
	const userIdMatch = footerText?.match(/User ID:\s*(\d+)/);
	const userId = userIdMatch ? userIdMatch[1] : null;

	if (!userId) {
		return interaction.reply({ content: "Failed to identify the user from the verification submission.", flags: MessageFlags.Ephemeral });
	}

	if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
		return interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setTitle("Error | Permission Denied")
					.setDescription("You do not have the required permissions to execute this command.")
					.addFields({ name: "Missing Permissions", value: "`MANAGE_ROLES`" })
					.setColor(config.embeds.colors.error)
					.setTimestamp(),
			],
			flags: MessageFlags.Ephemeral,
		});
	}

	try {
		db.prepare("UPDATE users SET verification = 0 WHERE id = ?").run(userId);
	} catch (err) {
		logger.error(`Failed to update verification status for ${userId}: ${err.message}`);
	}

	if (action === "approve" || action === "manual") {
		try {
			const member = await interaction.guild.members.fetch(userId);
			await member.roles.add(config.guild.main.roles.verified);
			logger.debug(`Successfully assigned role to <@${userId}>`);
		} catch (error) {
			logger.error(`Failed to assign role(s) to <@${userId}>: ${error.message}`);
		}
	}

	const logChannel = interaction.guild.channels.cache.get(config.guild.main.logging.verification);
	if (logChannel) {
		try {
			await logChannel.send({
				embeds: [
					new EmbedBuilder()
						.setTitle(action === "approve" ? "Verification Approved" : "Verification Denied")
						.setColor(action === "approve" ? config.embeds.colors.success : config.embeds.colors.error)
						.addFields({ name: "User", value: `<@${userId}>`, inline: true }, { name: "Reviewer", value: `<@${reviewer}>`, inline: true })
						.setTimestamp(),
				],
			});
		} catch (error) {
			logger.error(`Failed to send log message for user ${userId}: ${error.message}`);
		}
	}

    const approve = new ButtonBuilder().setCustomId("button_verify_approve").setLabel("Approve").setStyle(ButtonStyle.Success).setDisabled(true);
	const deny = new ButtonBuilder().setCustomId("button_verify_deny").setLabel("Deny").setStyle(ButtonStyle.Danger).setDisabled(true);
	const avatar = new ButtonBuilder().setLabel("Avatar").setStyle(ButtonStyle.Link).setURL(interaction.message.embeds[0]?.thumbnail?.url || interaction.user.displayAvatarURL());
	const tools = new ActionRowBuilder().addComponents(approve, deny, avatar);

	await interaction.update({ components: [tools] });
}
