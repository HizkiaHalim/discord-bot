const {  SlashCommandBuilder } = require('discord.js');

module.exports = {
    data : new SlashCommandBuilder()
    .setName('dnotes')
    .setDescription('Take notes and write it on Google Docs')
    .addStringOption(option =>
        option
        .setName('notes')
        .setDescription('What do you want to note?')
        .setRequired(true)
    ),
    async execute (interaction) {
        const text = interaction.options.getString('notes');
        await interaction.reply(`taking notes ${text}`);
    }
};