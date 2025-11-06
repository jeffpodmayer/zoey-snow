# Weather Trend Tracker - Planning & Implementation Guide

## Project Overview

Build a Node.js + TypeScript project that automatically fetches daily weather data from multiple APIs (Synoptic, SNOTEL, NWAC) and appends it into a Google Sheet to track weather and snow trends in the Methow Valley region for avalanche forecasting.

**Strategy**: Start with minimal prototype (one API, console output), then iteratively add Google Sheets, more stations, error handling, and automation.

---

## Quick Reference

### Data Sources

| API          | Endpoint                                  | Stations                                                                                              | Auth   |
| ------------ | ----------------------------------------- | ----------------------------------------------------------------------------------------------------- | ------ |
| **Synoptic** | `api.synopticdata.com/v2/stations/latest` | Methow Valley (`ks52-methow-valley-8893`), Washington Pass Upper (`wap67-washington-pass-upper-4109`) | Token  |
| **SNOTEL**   | To be researched                          | Rainy Pass (`711:wa:SNTL`), Harts Pass (`515:wa:SNTL`)                                                | Public |
| **NWAC**     | To be discovered                          | Washington Pass                                                                                       | TBD    |

### Data Schema

Each row: `Date | Station | Hi Temp | Lo Temp | Wind Speed | Gust | Wind Direction | Precip? | Snow Stake | Avy Danger | Notes`

### Tech Stack

Node.js 18+ | TypeScript | Zod | Google Sheets API | GitHub Actions | dotenv

---

## Implementation Phases

### Phase 0: Minimal Prototype (START HERE)

**Goal**: Get one API endpoint working end-to-end with console output

- [x] **Setup**

  - [x] Initialize Node.js project (`npm init`)
  - [x] Install TypeScript, ts-node, dotenv
  - [x] Create folder structure (`src/`, `src/services/`)
  - [x] Create `.gitignore` (exclude `.env`, `credentials.json`, `node_modules/`)
  - [x] Create `.env.example` template

- [ ] **Synoptic API - Single Station**

  - [ ] Implement fetch for Methow Valley station
  - [ ] Parse response, extract key fields
  - [ ] Log results to console
  - [ ] Add basic error handling

- [ ] **Validate**
  - [ ] Test with real API token
  - [x] Verify TypeScript compilation
  - [ ] Confirm data format matches expectations

**Success**: Can run `npm run fetch` and see weather data in console

---

### Phase 1: Google Sheets Integration

**Prerequisites**: Phase 0 complete

- [ ] **Google Setup**

  - [ ] Create Google Cloud Project, enable Sheets API
  - [ ] Create service account, download JSON credentials
  - [ ] Share Google Sheet with service account email (Editor role)
  - [ ] Install `googleapis` package

- [ ] **Implementation**

  - [ ] Implement authentication
  - [ ] Create sheet with headers (if needed)
  - [ ] Implement row appending
  - [ ] Add error handling

- [ ] **Test**
  - [ ] Append Methow Valley data to sheet
  - [ ] Verify data format and headers

**Success**: Data from Methow Valley appears correctly in Google Sheet

---

### Phase 2: Expand to Multiple Stations

**Prerequisites**: Phase 1 complete

- [ ] Add Washington Pass Upper station (Synoptic)
- [ ] Update service to handle multiple stations
- [ ] Test both stations append correctly

**Success**: Both Synoptic stations writing to sheet

---

### Phase 3: Add Additional APIs

**Prerequisites**: Phase 2 complete

- [ ] **SNOTEL Service**

  - [ ] Research endpoint format
  - [ ] Implement for Rainy Pass & Harts Pass
  - [ ] Map to WeatherRecord format
  - [ ] Integrate into main script

- [ ] **NWAC Service**
  - [ ] Discover API endpoint
  - [ ] Implement for Washington Pass
  - [ ] Extract avalanche danger rating
  - [ ] Integrate into main script

**Success**: All APIs fetching and writing to sheet

---

### Phase 4: Data Normalization & Validation

**Prerequisites**: Phase 3 complete

- [ ] Create unified `WeatherRecord` interface & Zod schema
- [ ] Build normalization functions for each API
- [ ] Standardize units (temp→°F, wind→mph, snow→inches)
- [ ] Add validation (temp: -100-150°F, wind: 0-200mph, snow: 0-500in)
- [ ] Handle missing/optional fields gracefully

**Success**: All data normalized and validated before writing

---

### Phase 5: Error Handling & Robustness

**Prerequisites**: Phase 4 complete

- [ ] Enhanced error messages (API, station, timestamp)
- [ ] Retry logic (2-3 attempts, exponential backoff)
- [ ] Partial failure handling (continue on error, mark in Notes)
- [ ] Structured logging (INFO/WARN/ERROR with timestamps)
- [ ] Handle rate limits, timeouts, malformed responses

**Success**: System handles errors gracefully and continues processing

---

### Phase 6: Polish & Automation

**Prerequisites**: Phase 5 complete

- [ ] **Scripts**: Add `npm run fetch-data`, `npm run build`, `npm run dev`
- [ ] **Documentation**: Comprehensive README with setup instructions
- [ ] **GitHub Actions**: Create workflow (cron: `0 6,18 * * *`, twice daily)
- [ ] **Testing**: End-to-end with all stations, error scenarios
- [ ] **TypeScript**: Enable strict mode, add ESLint/Prettier (optional)

**Success**: Fully automated system running twice daily via GitHub Actions

---

## Setup & Configuration

### Prerequisites Checklist

- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm 9+ installed (`npm --version`)
- [ ] Git repository initialized
- [ ] Google Cloud account access
- [ ] Synoptic API token obtained

### Google Sheets Service Account Setup

1. [ ] Go to [Google Cloud Console](https://console.cloud.google.com/)
2. [ ] Create project → Enable Google Sheets API
3. [ ] Credentials → Create Service Account
4. [ ] Download JSON key → Save as `credentials.json` (root directory)
5. [ ] Share Google Sheet with service account email (from JSON `client_email`) → Editor role
6. [ ] Verify permissions work

### Environment Variables

Create `.env` file:

```env
SYNOPTIC_TOKEN=your_token_here
SHEET_ID=your_google_sheet_id
GOOGLE_APPLICATION_CREDENTIALS=./credentials.json
```

### Git Configuration

`.gitignore` should include:

```
node_modules/
.env
credentials.json
*.log
.DS_Store
dist/
```

**Never commit** `.env` or `credentials.json`!

---

## Data Standards & Decisions

### Data Collection

- **One row per station per day**: Each station gets separate row
- **Twice daily runs**: 6 AM and 6 PM UTC (configurable)
- **Date format**: UTC date of script execution (YYYY-MM-DD)
- **Duplicate handling**: Optional check (can add later)

### Units & Validation

- **Units**: Temp (°F), Wind (mph), Snow (inches), Direction (cardinal/degrees)
- **Validation ranges**: Temp (-100-150°F), Wind (0-200mph), Snow (0-500in)
- **Invalid data**: Use "N/A" or empty string, log warning, note in Notes column

### Error Handling

- **Partial failures**: Continue processing other stations
- **Error format in Notes**: `"Error: [API] - [Station] - [Error Message]"`
- **Retry**: 2-3 attempts with exponential backoff for transient failures
- **Logging**: Structured logs with timestamps `[YYYY-MM-DD HH:MM:SS] [LEVEL] [API/Station] Message`

### Google Sheets

- **Auto-create**: Sheet created with headers if doesn't exist
- **Headers**: Frozen first row
- **Append mode**: Always append (never overwrite)
- **Formatting**: Date (YYYY-MM-DD), Numbers with units in header

### GitHub Actions

- **Schedule**: `0 6,18 * * *` (6 AM and 6 PM UTC)
- **Manual trigger**: `workflow_dispatch` for testing
- **Secrets**: `SYNOPTIC_TOKEN`, `SHEET_ID`, `GOOGLE_CREDENTIALS` (base64-encoded JSON)

### API Response Mapping

- **Synoptic**: `air_temp_value_1`, `wind_speed_value_1`, `wind_gust_value_1`, `wind_direction_value_1`
- **SNOTEL**: Daily min/max temp, precipitation, snow depth (TMAX, TMIN, PREC, SNWD)
- **NWAC**: Avalanche danger rating
- **Missing data**: Empty string or "N/A"

---

## Deployment Checklist

### Prerequisites

- [ ] Google Sheets service account created & credentials downloaded
- [ ] Google Sheet created & shared with service account (Editor)
- [ ] Synoptic API token obtained
- [ ] Node.js 18+ verified

### Configuration

- [ ] `.env` file created with all variables
- [ ] `.env.example` created (template)
- [ ] `.gitignore` configured
- [ ] `credentials.json` in project root (not committed)
- [ ] GitHub Secrets configured (if using Actions)

### Testing & Validation

- [ ] First manual run successful
- [ ] Data appears correctly in sheet
- [ ] All stations fetching successfully
- [ ] Error handling works
- [ ] GitHub Actions workflow tested
- [ ] Cron schedule verified

---

## Troubleshooting

| Issue                    | Solution                                                                     |
| ------------------------ | ---------------------------------------------------------------------------- |
| "Cannot find module"     | Run `npm install`                                                            |
| Google Sheets auth fails | Verify `credentials.json` exists, service account has Editor access to sheet |
| API 401/403 errors       | Check API token is valid, not expired                                        |
| TypeScript errors        | Run `npm run build`, check `tsconfig.json`                                   |
| Data not in sheet        | Verify sheet ID, service account permissions, check console for errors       |
| GitHub Actions fails     | Check Secrets configured, verify workflow logs, test locally                 |

---

## API Research Notes

### SNOTEL

- **Endpoint**: Research needed (likely `wcc.sc.egov.usda.gov/reportGenerator/view_json/customSingleStationReport/daily/{stationId}`)
- **Elements**: TMAX, TMIN, PREC, SNWD (snow depth)
- **Rate limits**: Typically public, check for limits

### NWAC

- **Endpoint**: To be discovered during implementation
- **Data**: Avalanche danger rating for Washington Pass
- **Alternative**: May need to scrape data portal or contact NWAC

### Rate Limits

- **Google Sheets API**: 300 requests/min per project, 60 requests/min per user
- **Synoptic**: Research and document during implementation
- **Strategy**: Implement exponential backoff on 429 errors, add delays if needed

---

## Future Enhancements

- Data deduplication (check if today's data exists)
- Historical data backfill
- Alert system for high avalanche danger
- Data visualization dashboard
- Export to CSV/JSON
- Schema version tracking

---

## Notes

- **Dates**: UTC format (YYYY-MM-DD) for consistency
- **Timezone**: Use UTC for all operations, convert to local in display if needed
- **Backup**: Google Sheets version history (use for recovery)
- **Security**: Never commit credentials, rotate keys if exposed, use GitHub Secrets
- **Monitoring**: GitHub Actions email notifications (default), add custom alerts later if needed
