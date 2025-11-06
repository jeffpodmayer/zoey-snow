import { SynopticApiResponse, SynopticStation, WeatherData } from "../types";

const API_URL = "https://api.synopticdata.com/v2/stations/latest";

const cToF = (c: number) => (c * 9) / 5 + 32;
const msToMph = (mps: number) => mps * 2.237;

export async function fetchSynopticStation(
  stationId: string
): Promise<WeatherData | null> {
  if (!process.env.SYNOPTIC_TOKEN) {
    throw new Error("SYNOPTIC_TOKEN missing in environment");
  }

  const url = `${API_URL}?stid=${stationId}&token=${process.env.SYNOPTIC_TOKEN}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Synoptic API HTTP ${res.status}`);

    const json = (await res.json()) as SynopticApiResponse;
    const station = json.STATION?.[0];

    return station ? formatStation(station) : null;
  } catch (error) {
    console.error(`Error fetching ${stationId}:`, error);
    return null;
  }
}

function formatStation(station: SynopticStation): WeatherData {
  const obs = station.OBSERVATIONS;
  const toValue = (entry: { value: number } | undefined) => entry?.value;

  const temperature = toValue(obs.air_temp_value_1);
  const highTemp = toValue(obs.air_temp_high_24_hour_value_1);
  const lowTemp = toValue(obs.air_temp_low_24_hour_value_1);
  const windSpeed = toValue(obs.wind_speed_value_1);
  const windGust = toValue(obs.wind_gust_value_1);
  const windDirCardinal = obs.wind_cardinal_direction_value_1d?.value;
  const windDirDegrees = toValue(obs.wind_direction_value_1);

  return {
    station: station.NAME || station.STID,
    temperature: temperature !== undefined ? cToF(temperature) : undefined,
    highTemp: highTemp !== undefined ? cToF(highTemp) : undefined,
    lowTemp: lowTemp !== undefined ? cToF(lowTemp) : undefined,
    windSpeed: windSpeed !== undefined ? msToMph(windSpeed) : undefined,
    windGust: windGust !== undefined ? msToMph(windGust) : undefined,
    windDirection:
      typeof windDirCardinal === "string" ? windDirCardinal : undefined,
    windDirectionDegrees: windDirDegrees,
  };
}
