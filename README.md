# Weather Trend Tracker – Data Guide

Each day (from midnight to midnight, UTC time) we gather weather readings from the Methow Valley area and add them as a row in the sheet. Below is what each column means.

| Column                                | What it shows                                                                                                                                                                                                   |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Date**                              | The day the readings apply to (we collect data once per day)                                                                                                                                                    |
| **Station**                           | The name or ID of the weather station                                                                                                                                                                           |
| **Current Temperature**               | The last temperature reading from the previous UTC day (taken at 23:55 UTC)                                                                                                                                     |
| **24‑Hour High Temperature**          | The highest temperature recorded during the previous UTC day (00:00–23:59)                                                                                                                                      |
| **24‑Hour Low Temperature**           | The lowest temperature recorded during the previous UTC day (00:00–23:59)                                                                                                                                       |
| **Average Wind Speed**                | The average of all wind speed readings taken during the previous UTC day (typically measured every 20 minutes)                                                                                                  |
| **Peak Wind Speed**                   | The highest instantaneous wind speed recorded during the previous UTC day (note: this is peak sustained wind, not a true "gust" which would be a 3-second average)                                              |
| **Wind Direction (Cardinal)**         | The last wind direction reading from the previous UTC day (North, South, etc.)                                                                                                                                  |
| **Precipitation (midnight‑midnight)** | Total precipitation (rain/snow water equivalent) that fell during the previous UTC day, measured in inches                                                                                                      |
| **SWE Change (midnight‑midnight)**    | How much the snowpack's Snow Water Equivalent changed during the previous UTC day (positive = snow accumulation, negative = melt/settling), measured in inches. Only available from SNOTEL stations like HRPW1. |
| **Notes**                             | Extra comments (for example, if a station was offline or data was unavailable)\*                                                                                                                                |

\* Some stations do not report every value; when that happens the cell is left blank and we may add a note explaining it. For example:

- METAR/AWOS stations (like KS52) provide temperature, wind, and precipitation but **not** SWE data
- SNOTEL stations (like HRPW1) provide precipitation and SWE but typically **not** wind data

**Data Collection Window:** All measurements are collected for the previous UTC day (00:00 to 23:59 UTC). For example, a script run on November 6th collects data from November 5th, 00:00:00 UTC through November 5th, 23:59:59 UTC.
