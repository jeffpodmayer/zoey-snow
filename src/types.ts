export interface WeatherData {
  station: string;
  temperature?: number; // °F
  highTemp?: number; // °F (24h high)
  lowTemp?: number; // °F (24h low)
  windSpeed?: number; // mph
  windGust?: number; // mph
  windGustTimestamp?: string; // ISO timestamp (UTC)
  windDirection?: string; // Cardinal (N, NE, …)
  windDirectionDegrees?: number; // Degrees (0–360)
  precipitationMm?: number; // total precip (mm) for the day window
  precipitationInches?: number; // total precip (inches)
  precipStart?: string; // ISO start time (UTC)
  precipEnd?: string; // ISO end time (UTC)
  sweMm?: number; // Snow Water Equivalent (mm)
  sweInches?: number; // Snow Water Equivalent (inches)
  sweStart?: string; // SWE window start (UTC ISO)
  sweEnd?: string; // SWE window end (UTC ISO)
}

export interface ObservationValue {
  value: number;
  date_time: string;
}

export interface SynopticStation {
  STID: string;
  NAME: string;
  OBSERVATIONS: {
    air_temp_value_1?: ObservationValue; // Current air temperature (°C) from Synoptic
    air_temp_high_24_hour_value_1?: ObservationValue; // Highest air temp in last 24 hours (°C)
    air_temp_low_24_hour_value_1?: ObservationValue; // Lowest air temp in last 24 hours (°C)
    wind_speed_value_1?: ObservationValue; // Latest instantaneous wind speed (m/s) — TODO: replace with averaged speed over 24hrs?
    wind_gust_value_1?: ObservationValue; // Latest peak wind gust (m/s) --> Should this be for the last 24 hours?
    wind_direction_value_1?: ObservationValue; // Wind direction as degrees (0–360)
    wind_cardinal_direction_value_1d?: ObservationValue; // Wind direction as cardinal string (“N”, “NW”, etc.)
    [key: string]: ObservationValue | undefined; // Allow additional Synoptic observation fields
  };
}

export interface SynopticApiResponse {
  STATION?: SynopticStation[];
  SUMMARY: {
    RESPONSE_CODE: number;
    RESPONSE_MESSAGE?: string;
  };
}

export interface SynopticPrecipResponse {
  STATION?: Array<{
    STID: string;
    OBSERVATIONS?: {
      total_precip_value_1?: number;
      ob_start_time_1?: string;
      ob_end_time_1?: string;
      count_1?: number;
      precipitation?: Array<{
        total?: number;
        first_report?: string;
        last_report?: string;
        count?: number;
        interval?: number;
        accum_hours?: number;
        report_type?: string;
      }>;
    };
  }>;
  SUMMARY: {
    RESPONSE_CODE: number;
    RESPONSE_MESSAGE?: string;
  };
}

export interface SynopticSweTimeseriesResponse {
  STATION?: Array<{
    STID: string;
    NAME: string;
    OBSERVATIONS?: {
      snow_water_equiv_set_1?: number[];
      precip_accum_set_1?: number[];
      air_temp_set_1?: number[];
      peak_wind_speed_set_1?: number[];
      date_time?: string[];
    };
  }>;
  SUMMARY: {
    RESPONSE_CODE: number;
    RESPONSE_MESSAGE?: string;
  };
}
