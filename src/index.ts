import dotenv from "dotenv";
import { fetchSynopticStation } from "./services/synopticService";

dotenv.config();

async function run() {
  if (!process.env.SYNOPTIC_TOKEN) {
    console.error("❌ SYNOPTIC_TOKEN not found in .env file");
    process.exit(1);
  }

  console.log("Weather Tracker - Starting...");

  const stationId = "KS52";
  const weatherData = await fetchSynopticStation(stationId);

  if (!weatherData) {
    console.error("❌ Failed to fetch weather data.");
    process.exit(1);
  }

  console.log("✅ Successfully fetched weather data:");
  console.log("   Station:", weatherData.station);
  console.log(
    "   Current Temperature:",
    weatherData.temperature?.toFixed(1) ?? "N/A",
    "°F"
  );
  console.log(
    "   24-Hour High Temperature:",
    weatherData.highTemp?.toFixed(1) ?? "N/A",
    "°F"
  );
  console.log(
    "   24-Hour Low Temperature:",
    weatherData.lowTemp?.toFixed(1) ?? "N/A",
    "°F"
  );
  console.log(
    "   Average Wind Speed:",
    weatherData.windSpeed?.toFixed(1) ?? "N/A",
    "mph"
  );
  console.log(
    "   Peak Wind Gust:",
    weatherData.windGust?.toFixed(1) ?? "N/A",
    "mph"
  );
  console.log(
    "   Wind Direction (Cardinal):",
    weatherData.windDirection ?? "N/A"
  );
}

run().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
