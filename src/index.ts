import dotenv from "dotenv";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { fetchDailyPrecipInches } from "./services/synopticPrecipService";
import { fetchSweTimeseries } from "./services/synopticSnowService";
import { fetchDailyTimeseries } from "./services/synopticTimeseriesService";
import {
  weatherDataToRow,
  formatNumber,
  formatString,
} from "./utils/formatters";
import { writeToSheet } from "./utils/googleSheets";

dayjs.extend(utc);
dotenv.config();

async function run() {
  const targetDay = dayjs.utc().subtract(1, "day");
  const startUtc = targetDay.startOf("day").format("YYYYMMDDHHmm");
  const endUtc = targetDay.endOf("day").format("YYYYMMDDHHmm");
  const dateStr = targetDay.format("YYYY-MM-DD");

  console.log(`\n📅 Fetching data for: ${dateStr} (UTC)\n`);

  // Fetch KS52 data
  const metData = await fetchDailyTimeseries("KS52", startUtc, endUtc);
  const metPrecip = await fetchDailyPrecipInches("KS52", startUtc, endUtc);

  // Fetch HRPW1 data
  const snotelPrecip = await fetchDailyPrecipInches("HRPW1", startUtc, endUtc);
  const snotelSwe = await fetchSweTimeseries("HRPW1", startUtc, endUtc);

  // Prepare KS52 row data
  const ks52RowData = {
    station: metData?.station,
    temperature: metData?.temperature,
    highTemp: metData?.highTemp,
    lowTemp: metData?.lowTemp,
    windSpeed: metData?.windSpeed,
    windGust: metData?.windGust,
    windDirection: metData?.windDirection,
    precipitationInches: metPrecip?.inches,
    sweDeltaInches: undefined, // KS52 doesn't report SWE
  };

  // Prepare HRPW1 row data
  const hrpw1RowData = {
    station: "HRPW1",
    temperature: undefined, // SNOTEL doesn't report temp
    highTemp: undefined,
    lowTemp: undefined,
    windSpeed: undefined, // SNOTEL doesn't report wind
    windGust: undefined,
    windDirection: undefined,
    precipitationInches: snotelPrecip?.inches,
    sweDeltaInches: snotelSwe?.deltaInches,
  };

  // Convert to spreadsheet rows
  const ks52Row = weatherDataToRow(
    dateStr,
    ks52RowData,
    metData ? "" : "Station offline or no data"
  );
  const hrpw1Row = weatherDataToRow(dateStr, hrpw1RowData, "");

  // Display formatted output
  console.log("=== KS52 (Methow Valley) ===");
  console.log(
    "   Temperature (last):",
    formatNumber(metData?.temperature, 1),
    "°F"
  );
  console.log("   High:", formatNumber(metData?.highTemp, 1), "°F");
  console.log("   Low:", formatNumber(metData?.lowTemp, 1), "°F");
  console.log("   Avg Wind:", formatNumber(metData?.windSpeed, 1), "mph");
  console.log("   Peak Wind:", formatNumber(metData?.windGust, 1), "mph");
  console.log("   Wind Dir:", formatString(metData?.windDirection));
  console.log("   Precipitation:", formatNumber(metPrecip?.inches, 2), "in");

  console.log("\n=== HRPW1 (Harts Pass SNOTEL) ===");
  console.log("   Precipitation:", formatNumber(snotelPrecip?.inches, 2), "in");
  console.log("   SWE Change:", formatNumber(snotelSwe?.deltaInches, 2), "in");

  console.log("\n=== Spreadsheet Rows (Ready for Google Sheets) ===");
  console.log("KS52:", ks52Row);
  console.log("HRPW1:", hrpw1Row);

  // Write to Google Sheets
  console.log("\n📊 Writing to Google Sheets...");
  await writeToSheet([ks52Row, hrpw1Row]);
  console.log("\n✅ Done!");
}

run().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});
