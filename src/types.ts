export interface WeatherData {
  station: string;
  temperature?: number; // °F
  highTemp?: number; // °F (24h high)
  lowTemp?: number; // °F (24h low)
  windSpeed?: number; // mph
  windGust?: number; // mph
  windDirection?: string; // Cardinal (N, NE, …)
  windDirectionDegrees?: number; // Degrees (0–360)
}

export interface ObservationValue {
  value: number;
  date_time: string;
}

export interface SynopticStation {
  STID: string;
  NAME: string;
  OBSERVATIONS: {
    air_temp_value_1?: ObservationValue;
    air_temp_high_24_hour_value_1?: ObservationValue;
    air_temp_low_24_hour_value_1?: ObservationValue;
    wind_speed_value_1?: ObservationValue;
    wind_gust_value_1?: ObservationValue;
    wind_direction_value_1?: ObservationValue;
    wind_cardinal_direction_value_1d?: ObservationValue;
    [key: string]: ObservationValue | undefined;
  };
}

export interface SynopticApiResponse {
  STATION?: SynopticStation[];
  SUMMARY: {
    RESPONSE_CODE: number;
    RESPONSE_MESSAGE?: string;
  };
}
