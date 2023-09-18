const express = require('express');
const { google } = require('googleapis');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');

dotenv.config();

const apiKey = process.env.API_KEY;
const spreadsheetId = process.env.SPREADSHEET_ID;

const sheets = google.sheets({ version: 'v4', auth: apiKey });

const app = express();

async function fetchSpreadsheetData() {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'A10:D355',
    });

    const values = response.data.values;

    const productData = {};

    values.forEach((row) => {
      const productName = row[0];

      if (
        productName &&
        productName !== 'Apple Watch aço ou com pulseiras especiais só orçar pelo WhatsApp.' &&
        productName !== 'Apple Watchs series 7 GPS + CEL, de aço ou titanium chama no WhatsApp que orçamos' &&
        productName !== 'Se precisar de outra configuração personalizada só chamar no WhatsApp'
      ) {
        const productInfo = {
          "ID": uuidv4(),
          "Pronta Entrega": row[1],
          "Encomenda 1": row[2],
          "Encomenda 2": row[3],
        };

        if (!productData[productName]) {
          productData[productName] = [];
        }

        productData[productName].push(productInfo);
      }
    });

    return productData;
  } catch (error) {
    console.error('Error fetching Google Spreadsheet data:', error);
    throw error;
  }
}

app.get('/', async (req, res) => {
  try {
    const productData = await fetchSpreadsheetData();

    res.json(productData);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching data.' });
  }
});

const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
