import dotenv from "dotenv";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { fetchDailyPrecipInches } from "./services/synopticPrecipService";
import { fetchSweTimeseries } from "./services/synopticSnowService";
import { fetchDailyTimeseries } from "./services/synopticTimeseriesService";

dayjs.extend(utc);

const targetDay = dayjs.utc().subtract(1, "day");
const startUtc = targetDay.startOf("day").format("YYYYMMDDHHmm"); // e.g., 202501050000
const endUtc = targetDay.endOf("day").format("YYYYMMDDHHmm"); // 202501052359

dotenv.config();

async function run() {
  const targetDay = dayjs.utc().subtract(1, "day");
  const startUtc = targetDay.startOf("day").format("YYYYMMDDHHmm");
  const endUtc = targetDay.endOf("day").format("YYYYMMDDHHmm");

  console.log(`Fetching data for: ${targetDay.format("YYYY-MM-DD")} (UTC)\n`);

  // Fetch all data from timeseries
  const metData = await fetchDailyTimeseries("KS52", startUtc, endUtc);
  const metPrecip = await fetchDailyPrecipInches("KS52", startUtc, endUtc);

  const snotelPrecip = await fetchDailyPrecipInches("HRPW1", startUtc, endUtc);
  const snotelSwe = await fetchSweTimeseries("HRPW1", startUtc, endUtc);

  console.log("=== KS52 (Methow Valley) ===");
  if (metData) {
    console.log(
      "   Temperature (last):",
      metData.temperature?.toFixed(1) ?? "N/A",
      "°F"
    );
    console.log("   High:", metData.highTemp?.toFixed(1) ?? "N/A", "°F");
    console.log("   Low:", metData.lowTemp?.toFixed(1) ?? "N/A", "°F");
    console.log("   Avg Wind:", metData.windSpeed?.toFixed(1) ?? "N/A", "mph");
    console.log("   Peak Wind:", metData.windGust?.toFixed(1) ?? "N/A", "mph");
    console.log("   Wind Dir:", metData.windDirection ?? "N/A");
  }
  if (metPrecip) {
    console.log("   Precipitation:", `${metPrecip.inches.toFixed(2)} in`);
  }

  console.log("\n=== HRPW1 (Harts Pass SNOTEL) ===");
  if (snotelPrecip) {
    console.log("   Precipitation:", `${snotelPrecip.inches.toFixed(2)} in`);
  }
  if (snotelSwe) {
    console.log("   SWE Change:", `${snotelSwe.deltaInches.toFixed(2)} in`);
  }
}

run().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
