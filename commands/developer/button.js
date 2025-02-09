const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("button")
        .setDescription("Sends a button for testing"),
    async execute(interaction) {
        const button = new ButtonBuilder()
            .setCustomId("button_test")
            .setLabel("Click Me!")
            .setStyle(ButtonStyle.Primary);
        
        const row = new ActionRowBuilder().addComponents(button);
        
        await interaction.reply({ content: "Press the button below:", components: [row] });
    },
};
