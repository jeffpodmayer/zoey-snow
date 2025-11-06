import { SynopticPrecipResponse } from "../types";

const PRECIP_API_URL = "https://api.synopticdata.com/v2/stations/precipitation";
const MM_TO_IN = 0.0393701;

export async function fetchDailyPrecipInches(
  stationId: string,
  startUtc: string,
  endUtc: string
): Promise<{ mm: number; inches: number; start: string; end: string } | null> {
  if (!process.env.SYNOPTIC_TOKEN) throw new Error("SYNOPTIC_TOKEN missing");

  const url = new URL(PRECIP_API_URL);
  url.searchParams.append("stid", stationId);
  url.searchParams.append("token", process.env.SYNOPTIC_TOKEN);
  url.searchParams.append("start", startUtc); // format: YYYYMMDDTHHmm (UTC)
  url.searchParams.append("end", endUtc);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Synoptic precip HTTP ${res.status}`);

  const json = (await res.json()) as SynopticPrecipResponse;
  const station = json.STATION?.[0];
  const obs = station?.OBSERVATIONS;

  const totalMm = obs?.total_precip_value_1 ?? obs?.precipitation?.[0]?.total;

  const obStart = obs?.ob_start_time_1 ?? obs?.precipitation?.[0]?.first_report;

  const obEnd = obs?.ob_end_time_1 ?? obs?.precipitation?.[0]?.last_report;

  if (totalMm === undefined || totalMm === null) {
    // no data reported for this window; return null so caller knows station doesn’t report precip
    return null;
  }

  return {
    mm: totalMm,
    inches: totalMm * MM_TO_IN,
    start: obStart ?? startUtc,
    end: obEnd ?? endUtc,
  };
}
