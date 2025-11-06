import { SynopticSweTimeseriesResponse } from "../types";

const TIMESERIES_API_URL =
  "https://api.synopticdata.com/v2/stations/timeseries";
const MM_TO_IN = 0.0393701;

/**
 * Fetch SWE readings for a specific UTC window and return start, end, and delta.
 */
export async function fetchSweTimeseries(
  stationId: string,
  startUtc: string,
  endUtc: string
): Promise<{
  startMm: number;
  endMm: number;
  deltaMm: number;
  deltaInches: number;
  timestamps: string[];
} | null> {
  if (!process.env.SYNOPTIC_TOKEN) throw new Error("SYNOPTIC_TOKEN missing");

  const url = new URL(TIMESERIES_API_URL);
  url.searchParams.append("stid", stationId);
  url.searchParams.append("token", process.env.SYNOPTIC_TOKEN);
  url.searchParams.append("vars", "snow_water_equiv");
  url.searchParams.append("start", startUtc);
  url.searchParams.append("end", endUtc);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Synoptic SWE timeseries HTTP ${res.status}`);

  const json = (await res.json()) as SynopticSweTimeseriesResponse;
  const station = json.STATION?.[0];
  const obs = station?.OBSERVATIONS;

  if (!obs?.snow_water_equiv_set_1 || obs.snow_water_equiv_set_1.length === 0) {
    return null; // no SWE reports in this window
  }

  const values = obs?.snow_water_equiv_set_1;
  const timestamps = obs?.date_time ?? [];
  if (!values || values.length === 0) return null;

  const firstMm = values[0];
  const lastMm = values[values.length - 1];
  const deltaMm = lastMm - firstMm;
  const deltaIn = deltaMm * MM_TO_IN;

  return {
    startMm: firstMm,
    endMm: lastMm,
    deltaMm,
    deltaInches: deltaIn,
    timestamps,
  };
}
