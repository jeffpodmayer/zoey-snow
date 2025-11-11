import { WeatherData } from "../types";

const TIMESERIES_API_URL =
  "https://api.synopticdata.com/v2/stations/timeseries";

const cToF = (c: number) => (c * 9) / 5 + 32;
const msToMph = (mps: number) => mps * 2.237;

interface TimeseriesResponse {
  STATION?: Array<{
    STID: string;
    NAME: string;
    OBSERVATIONS?: {
      air_temp_set_1?: number[];
      wind_speed_set_1?: number[];
      wind_direction_set_1?: number[];
      date_time?: string[];
    };
  }>;
  SUMMARY: {
    RESPONSE_CODE: number;
    RESPONSE_MESSAGE?: string;
  };
}

export async function fetchDailyTimeseries(
  stationId: string,
  startUtc: string,
  endUtc: string
): Promise<WeatherData | null> {
  if (!process.env.SYNOPTIC_TOKEN) throw new Error("SYNOPTIC_TOKEN missing");

  const url = new URL(TIMESERIES_API_URL);
  url.searchParams.append("stid", stationId);
  url.searchParams.append("token", process.env.SYNOPTIC_TOKEN);
  url.searchParams.append("vars", "air_temp,wind_speed,wind_direction");
  url.searchParams.append("start", startUtc);
  url.searchParams.append("end", endUtc);

  try {
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`Synoptic timeseries HTTP ${res.status}`);

    const json = (await res.json()) as TimeseriesResponse;

    const station = json.STATION?.[0];

    if (!station?.OBSERVATIONS) return null;

    const obs = station.OBSERVATIONS;
    const temps = obs.air_temp_set_1 || [];
    const windSpeeds = obs.wind_speed_set_1 || [];
    const windDirs = obs.wind_direction_set_1 || [];

    // Calculate aggregates
    const currentTemp = temps.length > 0 ? temps[temps.length - 1] : undefined;
    const highTemp = temps.length > 0 ? Math.max(...temps) : undefined;
    const lowTemp = temps.length > 0 ? Math.min(...temps) : undefined;

    const avgWindSpeed =
      windSpeeds.length > 0
        ? windSpeeds.reduce((a, b) => a + b, 0) / windSpeeds.length
        : undefined;

    const peakWindSpeed =
      windSpeeds.length > 0 ? Math.max(...windSpeeds) : undefined;

    const lastWindDir =
      windDirs.length > 0 ? windDirs[windDirs.length - 1] : undefined;

    return {
      station: station.NAME || station.STID,
      temperature: currentTemp !== undefined ? cToF(currentTemp) : undefined,
      highTemp: highTemp !== undefined ? cToF(highTemp) : undefined,
      lowTemp: lowTemp !== undefined ? cToF(lowTemp) : undefined,
      windSpeed: avgWindSpeed !== undefined ? msToMph(avgWindSpeed) : undefined,
      windGust:
        peakWindSpeed !== undefined ? msToMph(peakWindSpeed) : undefined,
      windDirectionDegrees: lastWindDir,
      windDirection:
        lastWindDir !== undefined ? degreesToCardinal(lastWindDir) : undefined,
    };
  } catch (error) {
    console.error(`Error fetching timeseries for ${stationId}:`, error);
    return null;
  }
}

function degreesToCardinal(degrees: number): string {
  const directions = [
    "N",
    "NNE",
    "NE",
    "ENE",
    "E",
    "ESE",
    "SE",
    "SSE",
    "S",
    "SSW",
    "SW",
    "WSW",
    "W",
    "WNW",
    "NW",
    "NNW",
  ];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}
