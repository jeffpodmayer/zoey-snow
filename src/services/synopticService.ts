import { SynopticApiResponse, SynopticStation, WeatherData } from "../types";

const SYNOPTIC_API_BASE_URL = "https://api.synopticdata.com/v2/stations/latest";

/**
 * Convert Celsius to Fahrenheit
 */
function celsiusToFahrenheit(celsius: number): number {
  return (celsius * 9) / 5 + 32;
}

/**
 * Convert m/s to mph
 */
function msToMph(mps: number): number {
  return mps * 2.237;
}

/**
 * Fetch weather data from Synoptic API
 */
export async function fetchSynopticStation(
  stationId: string
): Promise<WeatherData | null> {
  try {
    const url = `${SYNOPTIC_API_BASE_URL}?stid=${stationId}&token=${
      process.env.SYNOPTIC_TOKEN || ""
    }`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = (await response.json()) as SynopticApiResponse;

    return parseResponse(data.STATION?.[0] as SynopticStation);
  } catch (error) {
    console.error(`Error fetching ${stationId}:`, error);
    return null;
  }
}

function parseResponse(station: SynopticStation): WeatherData {
  const obs = station.OBSERVATIONS;

  const temp = obs.air_temp_value_1?.value;
  const windSpeed = obs.wind_speed_value_1?.value;
  const windGust = obs.wind_gust_value_1?.value;
  const windDir =
    obs.wind_cardinal_direction_value_1d?.value ||
    obs.wind_direction_value_1?.value;

  return {
    station: station.NAME || station.STID,
    temperature: temp !== undefined ? celsiusToFahrenheit(temp) : undefined,
    windSpeed: windSpeed !== undefined ? msToMph(windSpeed) : undefined,
    windGust: windGust !== undefined ? msToMph(windGust) : undefined,
    windDirection:
      typeof windDir === "string"
        ? windDir
        : windDir !== undefined
        ? formatDirection(windDir)
        : undefined,
  };
}

function formatDirection(degrees: number): string {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(degrees / 45) % 8];
}
