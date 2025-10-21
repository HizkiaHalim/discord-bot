// Import dotenv
require('dotenv').config();

const {  SlashCommandBuilder } = require('discord.js');
const { google } = require('googleapis');
const path = require('path');

const credential = path.join(__dirname, '../../credential.json');
let totalPriceThisMonth = 0

const { DOCS_ID, WORK_DOCS_ID } = process.env;

// Google Docs Insert
async function appendToDocs(topic, notes) {
  const auth = new google.auth.GoogleAuth({
    keyFile: credential,
    scopes: ['https://www.googleapis.com/auth/documents'],
  });
  const docs = google.docs({ version: 'v1', auth });
    
  const Day = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Mingu'];
  const Month = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Des'];

  let fullDocs;

  fullDocs = await docs.documents.get({
    documentId : topic == 'Work' ? WORK_DOCS_ID : DOCS_ID,
    includeTabsContent : true
  });

  // Search for target tab
  const targetTab = fullDocs.data.tabs.find(t => t.tabProperties.title === topic);
  const tabId = targetTab.tabProperties.tabId;

  // Search for last index
  const content = targetTab.documentTab.body.content;
  const lastElement = content[content.length - 1];
  const endIndex = lastElement.endIndex - 1;

  console.log("Document Connected");

  // Today's date
  const currentDate = Day[new Date().getDay() - 1] + ", " + new Date().getDate() + "-" + Month[new Date().getMonth()] + "-" + new Date().getFullYear();
  
  // New line + date
  const notesText = `\n${notes} (${currentDate})`


  await docs.documents.batchUpdate({
    documentId: topic == 'Work' ? WORK_DOCS_ID : DOCS_ID,
    requestBody: {
            requests: [
            {
                insertText: {
                    location: { 
                        tabId: tabId,
                        index: endIndex
                    },
                    text: notesText,
                }
            },
            {
                createParagraphBullets: {
                    range: {
                        tabId: tabId,
                        "startIndex": endIndex,
                        "endIndex": endIndex + notesText.length
                    },
                    bulletPreset: "BULLET_CHECKBOX"
                }
            }
            ],
    },
  });

  console.log("Writing complete!");
}

module.exports = {
    data : new SlashCommandBuilder()
    .setName('dnotes')
    .setDescription('Take notes and write it on Google Docs')
    .addStringOption(option =>
        option
        .setName('topic')
        .setDescription('What topic?')
        .setRequired(true)
        .addChoices(
          { name: 'Work_Related', value: 'Work' },
          { name: 'Personal_To_Do', value: 'Personal' },
          { name: 'Wishlist', value: 'Wishlist' },
          { name: 'Quick_Notes', value: 'Quick_Notes' },
          { name: 'Others', value: 'Others' },
        )
    )
    .addStringOption(option =>
        option
        .setName('notes')
        .setDescription('What do you want to note?')
        .setRequired(true)
    ),
    async execute (interaction) {
        const topic = interaction.options.getString('topic');
        const notes = interaction.options.getString('notes');

        await interaction.deferReply();

        await appendToDocs(topic, notes);
        await interaction.editReply(`Added to Google Docs on tab : "${topic}"....`);
    }
};