import { WeatherData } from "../types";

/**
 * Formats a number value for spreadsheet output.
 * Returns the formatted number or "-" if undefined.
 */
export function formatNumber(
  value: number | undefined,
  decimals: number = 1
): string {
  return value !== undefined ? value.toFixed(decimals) : "-";
}

/**
 * Formats a string value for spreadsheet output.
 * Returns the string or "-" if undefined/empty.
 */
export function formatString(value: string | undefined): string {
  return value && value.trim() !== "" ? value : "-";
}

/**
 * Converts WeatherData to a spreadsheet row with "-" for missing values.
 *
 * Column order:
 * 1. Date
 * 2. Station
 * 3. Current Temperature
 * 4. 24-Hour High Temperature
 * 5. 24-Hour Low Temperature
 * 6. Average Wind Speed
 * 7. Peak Wind Speed
 * 8. Wind Direction (Cardinal)
 * 9. Precipitation (midnight-midnight)
 * 10. SWE Change (midnight-midnight)
 * 11. Notes
 */
export function weatherDataToRow(
  date: string,
  data: {
    station?: string;
    temperature?: number;
    highTemp?: number;
    lowTemp?: number;
    windSpeed?: number;
    windGust?: number;
    windDirection?: string;
    precipitationInches?: number;
    sweDeltaInches?: number;
  },
  notes: string = ""
): string[] {
  return [
    date, // Date
    formatString(data.station), // Station
    formatNumber(data.temperature, 1), // Current Temperature
    formatNumber(data.highTemp, 1), // 24-Hour High
    formatNumber(data.lowTemp, 1), // 24-Hour Low
    formatNumber(data.windSpeed, 1), // Average Wind Speed
    formatNumber(data.windGust, 1), // Peak Wind Speed
    formatString(data.windDirection), // Wind Direction
    formatNumber(data.precipitationInches, 2), // Precipitation
    formatNumber(data.sweDeltaInches, 2), // SWE Change
    notes, // Notes
  ];
}
