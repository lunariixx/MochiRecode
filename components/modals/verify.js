const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, MessageFlags } = require('discord.js');

module.exports = {
	data: {
		customId: 'modal_verify',
	},
	async execute(interaction) {
		const modal = new ModalBuilder()
			.setCustomId('modal_verify')
			.setTitle('Verification');

		const fields = [
			{
				customId: 'rules',
				label: 'Do you agree to the rules?',
				style: TextInputStyle.Short,
				required: true,
				maxLength: 3,
				minLength: 1,
				placeholder: 'Yes or No',
			},
			{
				customId: 'name',
				label: 'Preferred Name',
				style: TextInputStyle.Short,
				required: false,
				maxLength: 20,
				minLength: 1,
				placeholder: 'Enter a name or nickname you prefer to go by.',
			},
			{
				customId: 'age',
				label: 'How old are you?',
				style: TextInputStyle.Short,
				required: true,
				maxLength: 3,
				minLength: 1,
				placeholder: 'Please enter your age in numeric form.',
			},
			{
				customId: 'join_location',
				label: 'How did you find this server?',
				style: TextInputStyle.Paragraph,
				required: true,
				maxLength: 50,
				minLength: 1,
				placeholder: "How did you find this server? Include inviter's username if applicable.",
			},
			{
				customId: 'user_info',
				label: 'Tell us about yourself!',
				style: TextInputStyle.Paragraph,
				required: false,
				maxLength: 300,
				minLength: 1,
				placeholder: 'Share your interests, hobbies, or details about your OC.',
			},
		];

		const components = fields.map(field => {
			const input = new TextInputBuilder()
				.setCustomId(field.customId)
				.setLabel(field.label)
				.setStyle(field.style)
				.setRequired(field.required)
				.setMaxLength(field.maxLength)
				.setMinLength(field.minLength)
				.setPlaceholder(field.placeholder);

			return new ActionRowBuilder().addComponents(input);
		});

		modal.addComponents(...components);

		if (!interaction.isModalSubmit()) {
			await interaction.showModal(modal);
		}
	},
};
