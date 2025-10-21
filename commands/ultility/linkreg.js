const {  SlashCommandBuilder } = require('discord.js');
const fs = require('node:fs');

async function addNewLink(name, link) {
    const line = `${name} - ${link}\n`;

    fs.appendFileSync("././links.txt", line);
}

module.exports = {
    data : new SlashCommandBuilder()
    .setName('linkreg')
    .setDescription('Register new link to the list')
    .addStringOption(option =>
        option
        .setName('name')
        .setDescription('What do you want to call this link?')
        .setRequired(true)
    )
    .addStringOption(option =>
        option
        .setName('link')
        .setDescription('Da link')
        .setRequired(true)
    ),
    async execute (interaction) {
        const name = interaction.options.getString('name');
        const link = interaction.options.getString('link');

        if (!link.startsWith("http")) {
            return interaction.reply({
                content: "Please enter a valid URL starting with `http://` or `https://`.",
                ephemeral: true,
            });
        }

        await interaction.deferReply();

        await addNewLink(name, link);
        await interaction.editReply(`Added to list link: ${name} - ${link}`);
    }
};