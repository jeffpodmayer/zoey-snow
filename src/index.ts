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

  // Fetch KS52 data (Methow Valley AWOS)
  const metData = await fetchDailyTimeseries("KS52", startUtc, endUtc);
  const metPrecip = await fetchDailyPrecipInches("KS52", startUtc, endUtc);

  // Fetch WAP55 data (Washington Pass AWOS)
  const wapData = await fetchDailyTimeseries("WAP55", startUtc, endUtc);
  const wapPrecip = await fetchDailyPrecipInches("WAP55", startUtc, endUtc);

  // Fetch HRPW1 data (Harts Pass SNOTEL)
  const hrpData = await fetchDailyTimeseries("HRPW1", startUtc, endUtc);
  const hrpPrecip = await fetchDailyPrecipInches("HRPW1", startUtc, endUtc);
  const hrpSwe = await fetchSweTimeseries("HRPW1", startUtc, endUtc);

  // Fetch RAIW1 data (Rainy Pass SNOTEL)
  const raiData = await fetchDailyTimeseries("RAIW1", startUtc, endUtc);
  const raiPrecip = await fetchDailyPrecipInches("RAIW1", startUtc, endUtc);
  const raiSwe = await fetchSweTimeseries("RAIW1", startUtc, endUtc);

  // Fetch SWSW1 data (Swamp Creek SNOTEL)
  const swsData = await fetchDailyTimeseries("SWSW1", startUtc, endUtc);
  const swsPrecip = await fetchDailyPrecipInches("SWSW1", startUtc, endUtc);
  const swsSwe = await fetchSweTimeseries("SWSW1", startUtc, endUtc);

  // Prepare KS52 row data
  const ks52RowData = {
    station: "Methow Valley (AWOS)",
    temperature: metData?.temperature,
    highTemp: metData?.highTemp,
    lowTemp: metData?.lowTemp,
    windSpeed: metData?.windSpeed,
    windGust: metData?.windGust,
    windDirection: metData?.windDirection,
    precipitationInches: metPrecip?.inches,
    sweDeltaInches: undefined,
  };

  // Prepare WAP55 row data
  const wap55RowData = {
    station: "Washington Pass (AWOS)",
    temperature: wapData?.temperature,
    highTemp: wapData?.highTemp,
    lowTemp: wapData?.lowTemp,
    windSpeed: wapData?.windSpeed,
    windGust: wapData?.windGust,
    windDirection: wapData?.windDirection,
    precipitationInches: wapPrecip?.inches,
    sweDeltaInches: undefined,
  };

  // Prepare HRPW1 row data
  const hrpw1RowData = {
    station: "Harts Pass (SNOTEL)",
    temperature: hrpData?.temperature,
    highTemp: hrpData?.highTemp,
    lowTemp: hrpData?.lowTemp,
    windSpeed: hrpData?.windSpeed, // might be undefined if no wind sensor
    windGust: hrpData?.windGust, // might be undefined
    windDirection: hrpData?.windDirection, // might be undefined
    precipitationInches: hrpPrecip?.inches,
    sweDeltaInches: hrpSwe?.deltaInches,
  };

  // Prepare RAIW1 row data
  const raiw1RowData = {
    station: "Rainy Pass (SNOTEL)",
    temperature: raiData?.temperature,
    highTemp: raiData?.highTemp,
    lowTemp: raiData?.lowTemp,
    windSpeed: raiData?.windSpeed,
    windGust: raiData?.windGust,
    windDirection: raiData?.windDirection,
    precipitationInches: raiPrecip?.inches,
    sweDeltaInches: raiSwe?.deltaInches,
  };

  // Prepare SWSW1 row data
  const swsw1RowData = {
    station: "Swamp Creek (SNOTEL)",
    temperature: swsData?.temperature,
    highTemp: swsData?.highTemp,
    lowTemp: swsData?.lowTemp,
    windSpeed: swsData?.windSpeed,
    windGust: swsData?.windGust,
    windDirection: swsData?.windDirection,
    precipitationInches: swsPrecip?.inches,
    sweDeltaInches: swsSwe?.deltaInches,
  };

  // Convert to spreadsheet rows
  const ks52Row = weatherDataToRow(
    dateStr,
    ks52RowData,
    metData ? "" : "Station offline or no data"
  );
  const wap55Row = weatherDataToRow(
    dateStr,
    wap55RowData,
    wapData ? "" : "Station offline or no data"
  );
  const hrpw1Row = weatherDataToRow(dateStr, hrpw1RowData, "");
  const raiw1Row = weatherDataToRow(dateStr, raiw1RowData, "");
  const swsw1Row = weatherDataToRow(dateStr, swsw1RowData, "");

  // Write to Google Sheets
  console.log("\n📊 Writing to Google Sheets...");
  await writeToSheet([ks52Row, wap55Row, hrpw1Row, raiw1Row, swsw1Row]);
  console.log("\n✅ Done!");
}

run().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});
