const express = require('express');
const { google } = require('googleapis');

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

    const jsonData = values.map((row) => {
      return {
        "Produto": row[0],
        "Pronta Entrega": row[1],
        "Encomenda 1": row[2],
        "Encomenda 2": row[3],
        // Add more columns as needed
      };
    });

    return jsonData;
  } catch (error) {
    console.error('Error fetching Google Spreadsheet data:', error);
    throw error;
  }
}

app.get('/data', async (req, res) => {
  try {
    const jsonData = await fetchSpreadsheetData();

    res.json(jsonData);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching data.' });
  }
});

// Use the dynamic port provided by Render
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
