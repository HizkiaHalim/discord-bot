const {  SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, EmbedBuilder, ButtonStyle } = require('discord.js');
const fs = require('node:fs');

async function getAllList(interaction) {
    const links = fs.readFileSync("././links.txt", "utf-8").split("\n").filter(Boolean);
        
    if (links.length === 0) {
        return interaction.reply('No links found.');
    }

    const pageSize = 5;
    let currentPage = 0;
    const totalPages = Math.ceil(links.length / pageSize);
    
    const getPage = (page) => {
        const start = page * pageSize;
        const end = start + pageSize;
        const pageLinks = links.slice(start, end);

        const formatted = pageLinks
            .map(line => {
            const [name, url] = line.split(' - ');
            return `[${name}](${url})`;
            })
            .join('\n');

        return new EmbedBuilder()
            .setColor('Blue')
            .setTitle('Link List')
            .setDescription(formatted || 'No links here.')
            .setFooter({ text: `Page ${page + 1} of ${totalPages}` });
    };

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('prev')
            .setLabel('◀️')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true),
        new ButtonBuilder()
            .setCustomId('next')
            .setLabel('▶️')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(totalPages <= 1)
    );

    
    const message = await interaction.reply({
      embeds: [getPage(currentPage)],
      components: [row],
      fetchReply: true,
    });

    const collector = message.createMessageComponentCollector({ time: 60_000 });

    collector.on('collect', async (i) => {
      if (i.user.id !== interaction.user.id) {
        return i.reply({ content: 'You can’t control this menu!', ephemeral: true });
      }

      if (i.customId === 'prev' && currentPage > 0) currentPage--;
      if (i.customId === 'next' && currentPage < totalPages - 1) currentPage++;

      const newEmbed = getPage(currentPage);
      const newRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('prev')
          .setLabel('◀️')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(currentPage === 0),
        new ButtonBuilder()
          .setCustomId('next')
          .setLabel('▶️')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(currentPage === totalPages - 1)
      );

      await i.update({ embeds: [newEmbed], components: [newRow] });
    });

    collector.on('end', async () => {
      const disabledRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('prev').setLabel('◀️').setStyle(ButtonStyle.Secondary).setDisabled(true),
        new ButtonBuilder().setCustomId('next').setLabel('▶️').setStyle(ButtonStyle.Secondary).setDisabled(true)
      );
      await message.edit({ components: [disabledRow] });
    });
}

module.exports = {
    data : new SlashCommandBuilder()
    .setName('links')
    .setDescription('Show all links that have been registered.'),

    async execute (interaction) {        
        await getAllList(interaction);
    }
};