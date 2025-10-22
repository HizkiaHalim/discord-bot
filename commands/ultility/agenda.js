const {  SlashCommandBuilder,EmbedBuilder } = require('discord.js');
const { google } = require('googleapis');
const path = require('path');

const credential = path.join(__dirname, '../../credential.json');

async function getAgenda(date, interaction){
    const auth = new google.auth.GoogleAuth({
      keyFile: credential,
      scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
    });

    const calendar = google.calendar({ version: 'v3', auth });

    const [day, month, year] = date.split("-");

    const inputDate = date ? new Date(`${year}-${month}-${day}`) : new Date();

    const startOfDay = new Date(inputDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(inputDate.setHours(23, 59, 59, 999));

    const res = await calendar.events.list({
        calendarId: 'primary',
        timeMin: startOfDay.toISOString(),
        timeMax: endOfDay.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
    });

    const events = res.data.items;

    if (!events || events.length === 0) {
        await interaction.reply(`Yay! No events found for ${date || 'today'}. Libur kah?`);
        return;
    }

    const embed = new EmbedBuilder()
                .setTitle(`Events for ${date || new Date().toISOString().split('T')[0]}`)
                .setColor(0x00AE86)
                .setTimestamp();

    for (const event of events) {
        const start = event.start.dateTime || event.start.date;
        embed.addFields({
            name: event.summary || '(No title)',
            value: `${new Date(start).toLocaleString()}${event.location ? `\n📍 ${event.location}` : ''}`,
        });
    }

    await interaction.reply({ embeds: [embed] });
}

module.exports = {
    data : new SlashCommandBuilder()
    .setName('agenda')
    .setDescription('Get events on calendar')
    .addStringOption(option =>
        option
        .setName('date')
        .setDescription('Show events on a specific day (Date format : dd-mm-yyyy)')
    ),
    async execute (interaction) {
        const date = interaction.options.getString('date');

        const dateRegex = /^\d{2}-\d{2}-\d{4}$/;

        if (!dateRegex.test(date)) {
            await interaction.editReply('Invalid date format! Please use dd-mm-yyyy (e.g. 25-10-2022)! Can\'t you read?');
            return;
        }

        await getAgenda(date, interaction);
    }
};