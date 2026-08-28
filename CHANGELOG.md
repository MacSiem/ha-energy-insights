# Changelog

All notable changes to **HA Energy Insights** are documented here.

## [1.0.2] - 2026-08-28

### Security and reliability
- Removed runtime loading of Chart.js from jsDelivr; charts now render locally with dependency-free HTML/CSS.
- Escaped configuration, error, entity, and Home Assistant runtime values after string coercion.
- Guarded the custom-element registration and aligned the in-card version surfaces at `1.0.2`.

## [1.0.0] - 2026-03-24

### Added
- Initial HACS-ready release
- 4-tab dashboard: Overview, Today (hourly), Weekly (7-day), Monthly (30-day)
- Configurable energy cost per kWh with currency display
- Automatic sensor discovery (`unit_of_measurement: kWh | Wh | W`)
- Top 5 energy-consuming devices with usage bars
- Weekly trend badge comparing current vs previous week
- Smart text recommendations based on consumption patterns
- Chart.js bar charts for all time periods (loaded from CDN)
- Loading state and graceful error handling
- Refresh button to manually re-fetch data
- Dark-theme friendly with HA CSS variable support
