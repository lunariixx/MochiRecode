const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField, MessageFlags, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const rules = require('../../config/rules.json');
const information = require('../../config/information.json');
const { config } = bot;

function createEmbed(data) {
	return new EmbedBuilder()
		.setColor(config.embeds.colors.default || null)
		.setTitle(data.title || null)
		.setURL(data.url || null)
		.setAuthor(data.author || null)
		.setDescription(data.description || null)
		.setThumbnail(data.thumbnail || null)
		.addFields(...(data.fields || []))
		.setImage(data.image || null)
		.setFooter(data.footer || null);
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('embeds')
		.setDescription('Sends either the rules, verification, appeals, or information embed(s).')
		.addStringOption(option =>
			option
				.setName('type')
				.setDescription('Choose the type of embed to send.')
				.setRequired(true)
				.addChoices(
					{ name: 'Rules', value: 'rules' },
					{ name: 'Information', value: 'information' },
					{ name: 'Verification', value: 'verification' },
					{ name: 'Appeals', value: 'appeals' }
				),
		),
	permissions: [PermissionsBitField.Flags.ManageMessages],
	async execute(interaction) {
		const embedType = interaction.options.getString('type');

		if (embedType === 'rules') {
			const embeds = Object.values(rules).map(createEmbed);
			for (const embed of embeds) {
				await interaction.channel.send({ embeds: [embed] });
			}
		} else if (embedType === 'information') {
			const embeds = Object.values(information).map(createEmbed);
			for (const embed of embeds) {
				await interaction.channel.send({ embeds: [embed] });
			}
		} else if (embedType === 'verification') {
			const finalEmbed = new EmbedBuilder()
				.setTitle('Verification Process')
				.setColor(config.embeds.colors.default)
				.setDescription(
					'Welcome to our community! To gain full access, you must complete the verification process.\n\n' +
					'**How to Verify:**\n' +
					'1. Read <#1337853559017832541> and <#1337854527336091770>.\n' +
					"2. Click the **'Verify'** button below.\n" +
					'3. Answer the required questions accurately.\n' +
					'4. A staff member will review and approve your submission.\n\n' +
					'**Once verified, you will gain full access to the server.**\n' +
					'**Verification ensures a safe and friendly community experience.**'
				)
				.setFooter({ text: 'If you encounter any issues, please contact a staff member.' });

			const verifyButton = new ButtonBuilder()
				.setCustomId('button_verify')
				.setLabel('Verify')
				.setStyle('Primary');

			const row = new ActionRowBuilder().addComponents(verifyButton);

			await interaction.channel.send({ embeds: [finalEmbed], components: [row] });
		} else if (embedType === 'appeals') {
			const finalEmbed = new EmbedBuilder()
				.setTitle('Appeal a Punishment')
				.setColor(config.embeds.colors.default)
				.setDescription(
					'If you believe you were banned or muted unfairly, or if you have learned from your past actions, you may submit an appeal. Please ensure that your appeal is honest and respectful.\n\n**How to Appeal:**\n\n' +
					"1. Click the **'Appeal'** button below.\n" +
					'2. Fill out the required appeal form with accurate details.\n' +
					'3. A staff member will review your appeal and make a decision.\n\n' +
					'4. If approved, your ban or mute will be lifted automatically, and you will be notified via DM.'
				)
				.setFooter({ text: 'Important: If the bot is offline, your appeal may be delayed. Please be patient.' });

			const appealButton = new ButtonBuilder()
				.setCustomId('button_appeal')
				.setLabel('Appeal')
				.setStyle('Primary');

			const row = new ActionRowBuilder().addComponents(appealButton);

			await interaction.channel.send({ embeds: [finalEmbed], components: [row] });
		}

		await interaction.reply({
			content: 'Sending embed(s)!',
			flags: MessageFlags.Ephemeral,
		});
	},
};
