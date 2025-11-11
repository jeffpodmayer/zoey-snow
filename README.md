# ❄️ Zoey Snow - Weather Trend Tracker

## 📖 Overview

This Node.js + TypeScript application automatically fetches weather data from multiple sources and logs it to a Google Sheet for easy tracking and visualization. Data is collected for the **previous UTC day** (midnight to midnight) and includes temperature, wind, precipitation, and snow water equivalent (SWE) measurements from weather stations in the Methow Valley region.

## 🎯 What It Does

- **Fetches data from multiple weather stations** (KS52 Methow Valley, HRPW1 Harts Pass SNOTEL)
- **Calculates daily aggregates**: high/low temps, average wind, peak wind, total precipitation, SWE change
- **Appends new rows to Google Sheets** every time it runs
- **Handles missing data gracefully**: Shows "N/A" for unavailable measurements
- **Runs on a schedule**: Can be triggered manually or via automated workflows

## 🏗️ How It Works

1. **Calculate target date** - Gets yesterday's date in UTC (e.g., run on Nov 11 = fetch Nov 10 data)

2. **Fetch KS52 data** from Synoptic API

   - Timeseries: temperature, wind speed, wind direction
   - Precipitation: total for the day

3. **Fetch HRPW1 data** from Synoptic API

   - Precipitation: total for the day
   - SWE timeseries: calculate change (delta)

4. **Format data into spreadsheet rows**

   - KS52 row: date, station, temp, high, low, wind, gust, direction, precip, N/A, notes
   - HRPW1 row: date, station, N/A, N/A, N/A, N/A, N/A, N/A, precip, swe_change, notes

5. **Append to Google Sheet**
   - Authenticate with service account
   - Create headers (first run only)
   - Append 2 new rows

## 🚀 Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- A free Synoptic API account
- A Google Cloud project with Sheets API enabled

### Installation

1. Clone and install dependencies: `git clone <your-repo>`, then `cd zoey-snow`, then `npm install`

2. Create .env file: `cp .env.example .env`

3. Add your credentials to .env:
   - SYNOPTIC_TOKEN=your_synoptic_api_token
   - SHEET_ID=your_google_sheet_id
   - GOOGLE_APPLICATION_CREDENTIALS=./credentials.json

### Running the Script

- Manual run: `npm run fetch`
- Development mode: `npm run dev`
- Build for production: `npm run build`

## 📊 Data Guide

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
| **Notes**                             | Extra comments (for example, if a station was offline or data was unavailable)                                                                                                                                  |

Some stations do not report every value; when that happens the cell shows "N/A" and we may add a note explaining it. For example:

- METAR/AWOS stations (like KS52) provide temperature, wind, and precipitation but not SWE data
- SNOTEL stations (like HRPW1) provide precipitation and SWE but typically not wind or temperature data

**Data Collection Window:** All measurements are collected for the previous UTC day (00:00 to 23:59 UTC). For example, a script run on November 6th collects data from November 5th, 00:00:00 UTC through November 5th, 23:59:59 UTC.

## 🔐 Credentials Setup

### Synoptic API Token

1. Sign up for a free account at https://developers.synopticdata.com
2. Create a new API token from your dashboard
3. Copy the token and add it to your .env file as SYNOPTIC_TOKEN

### Google Sheets API

**Step 1: Create a Google Cloud Project**

- Go to https://console.cloud.google.com/
- Create a new project (it's free)

**Step 2: Enable Google Sheets API**

- Navigate to "APIs & Services" then "Enable APIs and Services"
- Search for "Google Sheets API" and enable it

**Step 3: Create a Service Account**

- Go to "APIs & Services" then "Credentials"
- Click "Create Credentials" then "Service Account"
- Give it a name (e.g., "weather-tracker")
- Click "Create and Continue"
- Skip optional steps and click "Done"

**Step 4: Download Credentials**

- Click on your newly created service account
- Go to the "Keys" tab
- Click "Add Key" then "Create New Key" then "JSON"
- Save the downloaded file as credentials.json in your project root

**Step 5: Share Your Google Sheet**

- Create a new Google Sheet
- Copy the Sheet ID from the URL: https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit
- Click "Share" and add the service account email (found in credentials.json as client_email)
- Give it "Editor" permissions

**Step 6: Update .env**

- Add SHEET_ID=your_sheet_id_from_url
- Add GOOGLE_APPLICATION_CREDENTIALS=./credentials.json

Note: The entire Google Cloud setup is free and doesn't require a credit card for this use case.
