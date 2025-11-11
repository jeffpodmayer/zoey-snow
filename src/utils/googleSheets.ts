import { google } from "googleapis";
import { JWT } from "google-auth-library";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

/**
 * Authenticates with Google Sheets API using service account credentials
 */
export async function authenticate(): Promise<JWT> {
  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

  if (!credentialsPath) {
    throw new Error("GOOGLE_APPLICATION_CREDENTIALS not set in .env");
  }

  // Import credentials directly
  const credentials = require(`../../${credentialsPath}`);

  const client = new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: SCOPES,
  });

  await client.authorize();
  return client;
}

/**
 * Gets or creates headers in the sheet
 */
export async function ensureHeaders(auth: JWT, spreadsheetId: string) {
  const sheets = google.sheets({ version: "v4", auth });

  // Check if headers exist
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "A1:K1", // First row, columns A-K
  });

  const existingHeaders = response.data.values?.[0];

  // If headers don't exist, create them
  if (!existingHeaders || existingHeaders.length === 0) {
    const headers = [
      "Date",
      "Station",
      "Current Temperature",
      "24-Hour High Temperature",
      "24-Hour Low Temperature",
      "Average Wind Speed",
      "Peak Wind Speed",
      "Wind Direction (Cardinal)",
      "Precipitation (midnight-midnight)",
      "SWE Change (midnight-midnight)",
      "Notes",
    ];

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: "A1:K1",
      valueInputOption: "RAW",
      requestBody: {
        values: [headers],
      },
    });

    console.log("✅ Created headers in spreadsheet");
  }
}

/**
 * Appends rows to the sheet
 */
export async function appendRows(
  auth: JWT,
  spreadsheetId: string,
  rows: string[][]
) {
  const sheets = google.sheets({ version: "v4", auth });

  const response = await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: "A:K", // Append to columns A-K
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: rows,
    },
  });

  const updatedRows = response.data.updates?.updatedRows || 0;
  console.log(`✅ Appended ${updatedRows} row(s) to spreadsheet`);
}

/**
 * Main function to write weather data to Google Sheets
 */
export async function writeToSheet(rows: string[][]) {
  const spreadsheetId = process.env.SHEET_ID;

  if (!spreadsheetId) {
    throw new Error("SHEET_ID not set in .env");
  }

  try {
    const auth = await authenticate();
    await ensureHeaders(auth, spreadsheetId);
    await appendRows(auth, spreadsheetId, rows);
  } catch (error) {
    console.error("❌ Error writing to Google Sheets:", error);
    throw error;
  }
}
