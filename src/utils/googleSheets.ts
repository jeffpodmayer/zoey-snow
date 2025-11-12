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
      "Current Temperature (°F)",
      "24-Hour High Temperature (°F)",
      "24-Hour Low Temperature (°F)",
      "Average Wind Speed (mph)",
      "Peak Wind Speed (mph)",
      "Wind Direction (Cardinal)",
      "Precipitation (in)",
      "SWE Change (in)",
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
/**
 * Appends rows to the sheet and returns the starting row number
 */
export async function appendRows(
  auth: JWT,
  spreadsheetId: string,
  rows: string[][]
): Promise<number> {
  const sheets = google.sheets({ version: "v4", auth });

  // Get current row count before appending
  const currentRowCount = await getRowCount(auth, spreadsheetId);
  const startRow = currentRowCount + 1;

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

  return startRow;
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
    const startRow = await appendRows(auth, spreadsheetId, rows);
    await applyAlternatingDayColors(auth, spreadsheetId, startRow, rows.length);
  } catch (error) {
    console.error("❌ Error writing to Google Sheets:", error);
    throw error;
  }
}

/**
 * Gets the current number of rows in the sheet
 */
async function getRowCount(auth: JWT, spreadsheetId: string): Promise<number> {
  const sheets = google.sheets({ version: "v4", auth });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "A:A", // Just check column A
  });

  return response.data.values?.length || 1; // At least header row
}

/**
 * Applies alternating gray background to groups of 6 rows
 * Every other day (6 rows) gets a light gray background
 */
async function applyAlternatingDayColors(
  auth: JWT,
  spreadsheetId: string,
  startRow: number,
  numRows: number
) {
  const sheets = google.sheets({ version: "v4", auth });

  // Determine if this day should be gray
  // Days starting at row 2, 14, 26, 38... are white (day 0, 2, 4...)
  // Days starting at row 8, 20, 32, 44... are gray (day 1, 3, 5...)
  const dayNumber = Math.floor((startRow - 2) / 6);
  const shouldBeGray = dayNumber % 2 === 1;

  // Determine color: gray or white
  const backgroundColor = shouldBeGray
    ? { red: 0.95, green: 0.95, blue: 0.95 } // Light gray
    : { red: 1.0, green: 1.0, blue: 1.0 }; // White

  // Apply the background color
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          repeatCell: {
            range: {
              sheetId: 0, // First sheet
              startRowIndex: startRow - 1, // 0-indexed
              endRowIndex: startRow - 1 + numRows,
              startColumnIndex: 0, // Column A
              endColumnIndex: 11, // Column K
            },
            cell: {
              userEnteredFormat: {
                backgroundColor: backgroundColor,
              },
            },
            fields: "userEnteredFormat.backgroundColor",
          },
        },
      ],
    },
  });

  const colorName = shouldBeGray ? "gray" : "white";
  console.log(
    `✅ Applied ${colorName} background to rows ${startRow}-${
      startRow + numRows - 1
    }`
  );
}
