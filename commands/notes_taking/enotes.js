// Import dotenv
require('dotenv').config();

const {  SlashCommandBuilder } = require('discord.js');
const { google } = require('googleapis');
const path = require('path');

const { SPREADSHEET_ID } = process.env;

const credential = path.join(__dirname, '../../credential.json');
let totalPriceThisMonth = 0

// Google Sheet Insert
async function appendToSheet(productName, price) {
  const auth = new google.auth.GoogleAuth({
    keyFile: credential,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });

  const Day = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Mingu'];
  const Month = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Des'];

  const fullSheetData = await sheets.spreadsheets.get({
    SPREADSHEET_ID
  });
    
  const targetSheet = Month[new Date().getMonth()]+"-"+new Date().getFullYear();
  const currentSheet = fullSheetData.data.sheets.map(sheet => sheet.properties.title);


  if (!currentSheet.includes(targetSheet.toString())) {
    console.log('Creating New Sheet');

    addSheetResponse = await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
            requests: [
                {
                    addSheet: {
                        properties: {
                        title: targetSheet,
                        },
                    },
                },
            ],
        },
    });

    const sheetId = addSheetResponse.data.replies[0].addSheet.properties.sheetId;

    await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
            requests: [
                {
                    repeatCell: {
                        range: {
                            sheetId,
                            startColumnIndex: 2,
                            endColumnIndex: 3,
                        },
                        cell: {
                            userEnteredFormat: {
                                numberFormat: {
                                type: 'CURRENCY',
                                pattern: '"Rp"#,##0.00',
                                },
                            },
                        },
                        fields: 'userEnteredFormat.numberFormat',
                    },
                },
                {
                    updateDimensionProperties: {
                        range: {
                            sheetId,
                            dimension: 'COLUMNS',
                            startIndex: 0,
                            endIndex: 1, 
                        },
                        properties: {
                            pixelSize: 150,
                        },
                        fields: 'pixelSize',
                    }
                },
                {
                    updateDimensionProperties: {
                        range: {
                            sheetId,
                            dimension: 'COLUMNS',
                            startIndex: 1,
                            endIndex: 2, 
                        },
                        properties: {
                            pixelSize: 350,
                        },
                        fields: 'pixelSize',
                    }
                }
            ],
        },
    });
  }
  else {
    const getAllSheetData = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${targetSheet}!B:B`,
    });

    const values = getAllSheetData.data.values || [];

    let totalRowIndex = values.findIndex(row => row[0] && row[0].toLowerCase() === 'total');

    if (totalRowIndex !== -1) {
        const rowNumber = totalRowIndex + 1;
        await sheets.spreadsheets.values.clear({
            spreadsheetId,
            range: `${targetSheet}!A${rowNumber}:C${rowNumber}`,
        });

        console.log(`Removed old "Total" row at row ${rowNumber}`);
    }
  }

  const range = targetSheet+'!A:B';

  const currentDate = Day[new Date().getDay() - 1] + ", " + new Date().getDate() + "-" + Month[new Date().getMonth()] + "-" + new Date().getFullYear();

  const values = [[currentDate, productName, price]];

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range,
    valueInputOption: 'USER_ENTERED',
    resource: { values },
  });

  console.log("Process Add Complete!");

  const countRow = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${targetSheet}!A:A`,
  });

  const totalRows = countRow.data.values ? countRow.data.values.length : 0;

  const sumRow = totalRows + 1;
  const sumFormula = `=SUM(C1:C${totalRows})`;

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${targetSheet}!C${sumRow}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[sumFormula]],
    },
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${targetSheet}!B${sumRow}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [['Total']],
    },
  });

  const sumResult = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${targetSheet}!C${sumRow}`,
  });

  totalPriceThisMonth = sumResult.data.values;
}

module.exports = {
    data : new SlashCommandBuilder()
    .setName('enotes')
    .setDescription('Take notes and write it on Google Sheet')
    .addStringOption(option =>
        option
        .setName('product_name')
        .setDescription('What is it?')
        .setRequired(true)
    )
    .addIntegerOption(option =>
        option
        .setName('price')
        .setDescription('多少💴？')
        .setRequired(true)
    ),
    async execute (interaction) {
        const productName = interaction.options.getString('product_name');
        const price = interaction.options.getInteger('price');

        await interaction.deferReply();

        await appendToSheet(productName, price);
        await interaction.editReply(`Added to Google Sheet: "${productName}" with price Rp.${price}.... 
This Month You Already Spent : ${totalPriceThisMonth}!
Jangan boros mas!`);
    }
};