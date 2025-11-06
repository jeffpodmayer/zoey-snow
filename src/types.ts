export interface WeatherData {
  station: string;
  temperature?: number;
  windSpeed?: number;
  windGust?: number;
  windDirection?: string;
}

export interface ObservationValue {
  value: number;
  date_time: string;
}

export interface SynopticStation {
  ID?: string;
  STID: string;
  NAME: string;
  ELEVATION?: string;
  STATUS?: string;
  OBSERVATIONS: {
    air_temp_value_1?: ObservationValue;
    air_temp_high_24_hour_value_1?: ObservationValue;
    air_temp_low_24_hour_value_1?: ObservationValue;
    wind_speed_value_1?: ObservationValue;
    wind_gust_value_1?: ObservationValue;
    wind_direction_value_1?: ObservationValue;
    wind_cardinal_direction_value_1d?: ObservationValue; // Already in cardinal format!
    [key: string]: ObservationValue | undefined; // Allow other fields
  };
}

export interface SynopticApiResponse {
  STATION?: SynopticStation[];
  SUMMARY: {
    NUMBER_OF_OBJECTS?: number;
    RESPONSE_CODE: number; // 1 = success, 2+ = error
    RESPONSE_MESSAGE?: string;
    RESPONSE_TIME?: number;
    VERSION?: string;
  };
}
