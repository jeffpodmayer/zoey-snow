import dotenv from "dotenv";
import { fetchSynopticStation } from "./services/synopticService";

// Load environment variables
dotenv.config();

console.log("Environment check:");
console.log("SYNOPTIC_TOKEN exists?", !!process.env.SYNOPTIC_TOKEN);
console.log(
  "All env vars:",
  Object.keys(process.env).filter((k) => k.includes("SYNOPTIC"))
);

async function main() {
  console.log("Weather Tracker - Starting...");

  const token = process.env.SYNOPTIC_TOKEN;

  if (!token) {
    console.error("❌ SYNOPTIC_TOKEN not found in .env file");
    process.exit(1);
  }

  console.log("✓ Synoptic Token: Set");

  // Methow Valley station ID (corrected)
  const stationId = "KS52";

  console.log(`\nFetching data for station: ${stationId}...\n`);

  const weatherData = await fetchSynopticStation(stationId);

  if (weatherData) {
    console.log("✅ Successfully fetched weather data:");
    console.log("   Station:", weatherData.station);
    console.log(
      "   Current Temperature:",
      weatherData.temperature?.toFixed(1) ?? "N/A",
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
    console.log("   Wind Direction:", weatherData.windDirection ?? "N/A");
  } else {
    console.log(
      "❌ Failed to fetch weather data. Check your API token and try again."
    );
    process.exit(1);
  }
}

// Run the main function
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
